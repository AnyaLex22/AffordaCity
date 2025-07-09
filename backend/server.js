require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const app = express();
const User = require('./User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const requireAuth = require('./auth');
const authRoutes = require('./authRoutes'); // adjust path
const userCalculationsRoutes = require('./userCalcu');

app.use('/api', userCalculationsRoutes);


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
app.use('/api', authRoutes);


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://lexie:lexie222@devcluster.hiv28jk.mongodb.net/cityCostCalculator' )
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB connection error:', err));



// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', email);

  const user = await User.findOne({ email });
  if (!user) {
    console.log('User not found');
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  console.log('Stored password hash:', user.password);
  console.log('Password entered:', password);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });
  res.json({ token });
});

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

//update calculations
app.put('/api/update-calculation', requireAuth, async (req, res) => {
  const { timestamp, salary } = req.body;

  if (!timestamp || !salary) {
    return res.status(400).json({ error: 'Missing timestamp or salary' });
  }

  try {
    const result = await Calculation.updateOne(
      { userId: req.userId, timestamp },
      { $set: { salary: parseFloat(salary) } }
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

// Get user-specific history
app.get('/api/user-calculations', requireAuth, async (req, res) => {
  console.log('Fetching calculations for user ID:', req.userId); 
  try {
    const history = await Calculation.find({ userId: req.userId }).sort({ timestamp: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load user history' });
  }
});


//Save calculations - history
const CalculationSchema =  new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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




// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


