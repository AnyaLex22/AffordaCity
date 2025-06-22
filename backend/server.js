require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();

app.use(cors({
  origin: [
    'https://affordacity-frontend.onrender.com',
    'http://localhost:3000'
  ]
}));

app.use(express.json());


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cityCostCalculator' , {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
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

// Routes
// Add to server.js (temporary route)
app.get('/seed-more-cities', async (req, res) => {
  try {
    await CityCost.insertMany([
      { city: "Paris", country: "France", costOfLivingIndex: 85, rentIndex: 75 },
      { city: "Berlin", country: "Germany", costOfLivingIndex: 80, rentIndex: 70 },
      { city: "Sydney", country: "Australia", costOfLivingIndex: 92, rentIndex: 88 },
      { city: "Toronto", country: "Canada", costOfLivingIndex: 78, rentIndex: 72 },
      { city: "Dubai", country: "UAE", costOfLivingIndex: 95, rentIndex: 90 }
    ]);
    res.send('Additional cities seeded successfully');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

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

app.get('/api/cities', async (req, res) => {
  try {
    const cities = await CityCost.find().sort({ city: 1 });
    const countries = [...new Set(cities.map(city => city.country))].sort();
    res.json({ cities, countries });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/cost/:city', async (req, res) => {
  try {
    // Check if we have recent data in DB (within 7 days)
    const dbData = await CityCost.findOne({
      city: req.params.city,
      lastUpdated: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    if (dbData) {
      return res.json(dbData);
    }

    // Fetch from Numbeo API if no recent data
    const response = await axios.get(`https://numbeo.p.rapidapi.com/city_cost`, {
      params: { city: req.params.city },
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'numbeo.p.rapidapi.com'
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

// Add this after all your API routes
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.use(cors({
  origin: [
    'https://affordacity-frontend.onrender.com',
    'http://localhost:3000'
  ]
}));

// Temporary seeding route - add this before your other routes
app.get('/seed-cities', async (req, res) => {
  try {
    await CityCost.deleteMany({});
    await CityCost.insertMany([
      { city: "New York", country: "USA", costOfLivingIndex: 100, rentIndex: 95 },
      { city: "London", country: "UK", costOfLivingIndex: 90, rentIndex: 85 },
      { city: "Tokyo", country: "Japan", costOfLivingIndex: 88, rentIndex: 78 }
    ]);
    res.send('Cities seeded successfully');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

