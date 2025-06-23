require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const app = express();


app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://affordacity-frontend.onrender.com',
    'https://affordacity.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://lexie:lexie222@devcluster.hiv28jk.mongodb.net/cityCostCalculator' )
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB connection error:', err));


// City Cost Model
const CityCost = mongoose.model('CityCost', new mongoose.Schema({
  city: String,
  country: String,
  costOfLivingIndex: Number,
  rentIndex: Number,
  groceriesIndex: Number,
  restaurantIndex: Number,
  lastUpdated: { type: Date, default: Date.now }
}));

//Save calculations - history
const CalculationSchema =  new mongoose.Schema({
  city: String,
  country: String,
  salary: Number,
  estimatedMonthlyRent: Number,
  estimatedMonthlyLivingCost: Number,
  disposableIncome: Number,
  affordability: String,
  timestamp: { type: Date, default: Date.now }
});

const Calculation = mongoose.model('Calculation', CalculationSchema);

// Add this before your routes in server.js
app.use((req, res, next) => {
  console.log(`Incoming ${req.method} request to ${req.path}`);
  next();
});

// Routes
//API returns list of all countries & cities
app.get('/api/all-cities', async (req, res) => {
  try {
    const response = await axios.get('https://countriesnow.space/api/v0.1/countries');
    const allCities = response.data.data.flatMap(country => 
      country.cities.map(city => ({
        city,
        country: country.country
      }))
    );
    res.json(allCities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//all cities listed in DB
app.get('/api/cities', async (req, res) => {
  try {
    const cities = await CityCost.find().sort({ city: 1 });
    const countries = [...new Set(cities.map(city => city.country))].sort();
    res.json({ cities, countries });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//manually add city data
app.post('/api/cities', async (req, res) => {
  try {
    const newCity = new CityCost({
      city: req.body.city,
      country: req.body.country,
      costOfLivingIndex: req.body.costOfLivingIndex,
      rentIndex: req.body.rentIndex,
      groceriesIndex: req.body.groceriesIndex,
      restaurantIndex: req.body.restaurantIndex
    });

    const savedCity = await newCity.save();
    res.status(201).json(savedCity);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//Save calculations - history
app.post('/api/save-calculation', async (req, res) => {
  try {
    const { city, salary, estimatedMonthlyRent,
      estimatedMonthlyLivingCost, disposableIncome, affordability, timestamp } = req.body;
    if (!city || !salary || !estimatedMonthlyRent || !estimatedMonthlyLivingCost || disposableIncome === undefined ||!affordability || !timestamp) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    const newCalc = new Calculation({
      city,
      salary,
      estimatedMonthlyRent,
      estimatedMonthlyLivingCost,
      disposableIncome,
      affordability,
      timestamp
    });
    await newCalc.save();
    res.status(201).json({ message: 'Calculation saved' });
  } catch (err) {
    console.error('Failed to save calculation::', err);
    res.status(500).json({ message: 'Server error' });
  }
});


//external data fetch
app.get('/fetch-external-data', async (req, res) => {
  try {
    const response = await axios.get('https://cities-cost-of-living-and-average-prices-api.p.rapidapi.com');
    const citiesData = response.data.map(city => ({
      city: city.name,
      country: city.country,
      costOfLivingIndex: city.indices.cost_of_living,
      rentIndex: city.indices.rent
    }));
    
    await CityCost.insertMany(citiesData);
    res.send(`${citiesData.length} cities added from external API`);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

//
app.get('/api/cost/:city', async (req, res) => {
  try {
    // Check if we have recent data in DB
    const dbData = await CityCost.findOne({
      city: req.params.city,
      lastUpdated: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    if (dbData) {
      return res.json(dbData);
    }

    // Fetch from API if no recent data
    const response = await axios.get(`https://cities-cost-of-living-and-average-prices-api.p.rapidapi.com`, {
      params: { city: req.params.city },
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'cities-cost-of-living-and-average-prices-api.p.rapidapi.com'
      }
    });

    const costData = {
      city: req.params.city,
      country: response.data.country,
      costOfLivingIndex: response.data.cost_of_living_index,
      rentIndex: response.data.rent_index,
      groceriesIndex: response.data.groceries_index,
      restaurantIndex: response.data.restaurant_price_index
    };

    // Save to DB
    await CityCost.findOneAndUpdate(
      { city: req.params.city },
      costData,
      { upsert: true, new: true }
    );

    res.json(costData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching cost data' });
  }
});

//afford cost calculator
app.post('/api/calculate', async (req, res) => {
  try {
    const { city, salary } = req.body;
    
    const costData = await CityCost.findOne({ city });
    if (!costData) {
      return res.status(404).json({ message: 'City data not found' });
    }

    // Calculations
    const monthlySalary = salary / 12;
    const estimatedMonthlyRent = (costData.rentIndex / 100) * 2000; // Approximation
    const estimatedMonthlyLivingCost = (costData.costOfLivingIndex / 100) * 3000; // Approximation
    
    const disposableIncome = monthlySalary - estimatedMonthlyRent - estimatedMonthlyLivingCost;
    const affordability = disposableIncome > 0 ? 'affordable' : 'not affordable';

    res.json({
      city: costData.city,
      country: costData.country,
      monthlySalary,
      estimatedMonthlyRent,
      estimatedMonthlyLivingCost,
      disposableIncome,
      affordability
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//history
app.get('/api/calculations', async (req, res) => {
  try {
    const history = await Calculation.find().sort({ timestamp: -1 });
    res.json(history);
  } catch (err) {
    console.error('Error fetching calculation history:', err);
    res.status(500).json({ message: 'Failed to load history' });
  }
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


