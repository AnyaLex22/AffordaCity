require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const app = express();
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const requireAuth = require('./middleware/auth');
const authRoutes = require('./routes/authRoutes'); 
const calculationsRoutes = require('./routes/calculationsRoutes');
const Calculation = require('./models/Calculations'); 
const CityCost = require('./models/CityCost');



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

app.options('*', cors());

app.use(express.json());

//Request logger - must be BEFORE all routes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});


app.use('/api', authRoutes); //register/login
app.use('/api', calculationsRoutes);


// Connect to MongoDB
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in .env');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Login -handled in authRoutes.js

  //const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    //expiresIn: '1h'
  //});
  //res.json({ token });


// update calculations
app.put('/api/update-calculation', requireAuth, async (req, res) => {
  const { timestamp, salary } = req.body;

  if (!timestamp || !salary) {
    return res.status(400).json({ error: 'Missing timestamp or salary' });
  }

  try {
    const newSalary = parseFloat(salary);
    const monthlySalary = newSalary / 12;

    // Re-fetch calculation
    const calc = await Calculation.findOne({ userId: req.userId, timestamp });
    if (!calc) {
      return res.status(404).json({ error: 'Calculation not found' });
    }

    // Get city data
    let costData = await CityCost.findOne({city: calc.city});

    if (!costData) {
      //Fetch from RapidAPI and cache it
      try{
        const apiResponse = await axios.get(
          'https://cities-cost-of-living-and-average-prices-api.p.rapidapi.com/city',
          {
            params: {city},
            headers: {
              'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
              'X-RapidAPI-Host': 'cities-cost-of-living-and-average-prices-api.p.rapidapi.com'
            }
          }
        );
        costData = await CityCost.findOneAndUpdate(
          {city},
          {
            city,
            country: apiResponse.data.country,
            costofLivingIndex: apiResponse.data.cost_of_living_index,
            rentIndex: apiResponse.data.rent_index,
            groceriesIndex: apiResponse.data.groceries_index,
            restaurantIndex: apiResponse.data.restaurant_price_index,
          },
          {upsert: true, new: true}
        );
      } catch (apiErr) {
        console.error('RapidAPI fetch failed:', apiErr.message);
        console.error('RapidAPI status:', apiErr.response?.status);
        console.error('RapiAPI response data:', JSON.stringify(apiErr.response?.data));
        return res.status(404).json({message: 'City cost data not available'});
      }
    }

    // Recalculate
    const estimatedMonthlyRent = (cityData.rentIndex / 100) * 2000;
    const estimatedMonthlyLivingCost = (cityData.costOfLivingIndex / 100) * 3000;
    const disposableIncome = monthlySalary - estimatedMonthlyRent - estimatedMonthlyLivingCost;
    const affordability = disposableIncome > 0 ? 'Affordable' : 'Not Affordable';

    // Update database
    const result = await Calculation.updateOne(
      { userId: req.userId, timestamp },
      {
        $set: {
          salary: newSalary,
          disposableIncome,
          affordability
        }
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: 'No calculation found to update' });
    }

    res.json({ success: true });

  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


//save calc
app.post('/api/save-calculation', requireAuth, async (req, res) => {
  const { city, salary, estimatedMonthlyRent, estimatedMonthlyLivingCost, disposableIncome, affordability, timestamp } = req.body;

  const newCalc = new Calculation({
    userId: req.userId,
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
});

//delete calculations
app.delete('/api/delete-calculation', requireAuth, async (req, res) => {
  const { timestamp } = req.body;

  try {
    const deleted = await Calculation.deleteOne({ userId: req.userId, timestamp });
    if (deleted.deletedCount === 0) {
      return res.status(404).json({ message: 'Calculation not found' });
    }
    res.json({ message: 'Calculation deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete calculation' });
  }
});


// Routes
//API returns list of all countries & cities
//1. Get all countries pulled from DB (already seeded)
app.get('/api/countries', async (req, res) => {
  try {
    const countries = await CityCost.distinct('country');
    res.json(countries.sort());
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch countries' });
  }
});

//2. Get cities by country pullled from DB
app.get('/api/cities-by-country', async (req, res) => {
  const {country} = req.query;
  if (!country) return res.status(400).json({ message: 'Country is required'});

  try {
    const cities = await CityCost.distinct('city', {country});
    res.json(cities.sort());
  } catch (err) {
    res.status(500).json({message: 'Failed to fetch cities'});
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
  const {city, country, salary} = req.body;

  if (!city || !country || !salary) {
    return res.status(400).json({message: 'City, country and salary are required'});
  }

  try {
    //Check DB cache first
    const costData = await CityCost.findOne({ city, country });

    if (!costData) {
      return re.status(404).json({message: `No data found for ${city}, ${country}`});
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
    console.error('Calculate error:', err.message);
    res.status(500).json({ message: err.message });
  }
});




// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


