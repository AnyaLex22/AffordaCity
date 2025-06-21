require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
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
app.get('/api/cities', async (req, res) => {
  try {
    const cities = await CityCost.find().sort({ city: 1 });
    res.json(cities);
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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));