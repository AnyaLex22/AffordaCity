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
const cityApi = require('./cityApi');
const { getCurrencyForCountry, convertFromUsd, convertToUsd } = require('./currency');

const RENT_USD_BASE = 2000;
const LIVING_USD_BASE = 3000;

async function resolveCityCost(city, country) {
  let cost = await CityCost.findOne({ city, country });
  if (cost) return cost;

  const fromApi = await cityApi.fetchRapidApiCityCost(city, country);
  if (fromApi) {
    return await CityCost.findOneAndUpdate(
      { city, country },
      { ...fromApi, lastUpdated: new Date() },
      { upsert: true, new: true }
    );
  }

  // Fall back to country-level estimates so worldwide cities still produce a result.
  const fb = cityApi.fallbackIndicesForCountry(country);
  return await CityCost.findOneAndUpdate(
    { city, country },
    { city, country, ...fb, lastUpdated: new Date() },
    { upsert: true, new: true }
  );
}

// `salaryLocal` is the user's annual salary in the country's local currency.
async function buildCalculation(city, country, salaryLocal) {
  const cost = await resolveCityCost(city, country);
  const currency = getCurrencyForCountry(country);

  // Convert to USD because the cost-of-living indices are USD-anchored.
  const salaryUsd = await convertToUsd(salaryLocal, currency.code);
  const monthlySalaryUsd = salaryUsd / 12;
  const rentUsd = (cost.rentIndex / 100) * RENT_USD_BASE;
  const livingUsd = (cost.costOfLivingIndex / 100) * LIVING_USD_BASE;
  const disposableUsd = monthlySalaryUsd - rentUsd - livingUsd;

  // Convert all results back to the local currency for display.
  const [monthlySalary, estimatedMonthlyRent, estimatedMonthlyLivingCost, disposableIncome] = await Promise.all([
    convertFromUsd(monthlySalaryUsd, currency.code),
    convertFromUsd(rentUsd, currency.code),
    convertFromUsd(livingUsd, currency.code),
    convertFromUsd(disposableUsd, currency.code),
  ]);

  return {
    city: cost.city,
    country: cost.country,
    monthlySalary,
    estimatedMonthlyRent,
    estimatedMonthlyLivingCost,
    disposableIncome,
    affordability: disposableIncome > 0 ? 'Affordable' : 'Not Affordable',
    currencyCode: currency.code,
    currencySymbol: currency.symbol,
  };
}



app.use(cors({
  origin: true,
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


// Connect to MongoDB (uses real MongoDB if MONGODB_URI is set, otherwise embedded in-memory)
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'dev-only-jwt-secret-change-me';
  console.warn('⚠️  JWT_SECRET not set — using insecure default for development');
}

const { connect: connectDB } = require('./db');
connectDB().catch(err => {
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
    const calc = await Calculation.findOne({ userId: req.userId, timestamp });
    if (!calc) return res.status(404).json({ error: 'Calculation not found' });

    const newSalary = parseFloat(salary);
    const recalc = await buildCalculation(calc.city, calc.country || '', newSalary);

    await Calculation.updateOne(
      { userId: req.userId, timestamp },
      {
        $set: {
          salary: newSalary,
          country: recalc.country,
          estimatedMonthlyRent: recalc.estimatedMonthlyRent,
          estimatedMonthlyLivingCost: recalc.estimatedMonthlyLivingCost,
          disposableIncome: recalc.disposableIncome,
          affordability: recalc.affordability,
          currencyCode: recalc.currencyCode,
          currencySymbol: recalc.currencySymbol,
        },
      }
    );
    res.json({ success: true, ...recalc });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


//save calc
app.post('/api/save-calculation', requireAuth, async (req, res) => {
  const {
    city, country, salary, estimatedMonthlyRent, estimatedMonthlyLivingCost,
    disposableIncome, affordability, currencyCode, currencySymbol, timestamp,
  } = req.body;

  const newCalc = new Calculation({
    userId: req.userId,
    city,
    country,
    salary,
    estimatedMonthlyRent,
    estimatedMonthlyLivingCost,
    disposableIncome,
    affordability,
    currencyCode: currencyCode || 'USD',
    currencySymbol: currencySymbol || '$',
    timestamp,
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
// Currency lookup for a country (used by the frontend salary input)
app.get('/api/currency', (req, res) => {
  const { country } = req.query;
  const currency = getCurrencyForCountry(country || '');
  res.json(currency);
});

// Worldwide list of countries (from external directory)
app.get('/api/countries', async (req, res) => {
  try {
    const countries = await cityApi.getAllCountries();
    if (countries && countries.length) return res.json(countries);
    // Fallback to whatever is in the DB if external API is unavailable
    const fromDb = await CityCost.distinct('country');
    res.json(fromDb.sort());
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch countries' });
  }
});

// Worldwide cities for a given country
app.get('/api/cities-by-country', async (req, res) => {
  const { country } = req.query;
  if (!country) return res.status(400).json({ message: 'Country is required' });
  try {
    const cities = await cityApi.getCitiesForCountry(country);
    if (cities && cities.length) return res.json(cities);
    const fromDb = await CityCost.distinct('city', { country });
    res.json(fromDb.sort());
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch cities' });
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
  const { city, country, salary } = req.body;
  if (!city || !country || !salary) {
    return res.status(400).json({ message: 'City, country and salary are required' });
  }
  try {
    const result = await buildCalculation(city, country, parseFloat(salary));
    res.json(result);
  } catch (err) {
    console.error('Calculate error:', err.message);
    res.status(500).json({ message: err.message });
  }
});




// Serve built React frontend in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '..', 'frontend', 'build');
  app.use(express.static(buildPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/fetch-')) return next();
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// Start server
const PORT = process.env.PORT || 3001;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';
app.listen(PORT, HOST, () => console.log(`Server running on http://${HOST}:${PORT}`));


