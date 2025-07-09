const mongoose = require('mongoose');

const CalculationSchema = new mongoose.Schema({
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

module.exports = mongoose.model('Calculation', CalculationSchema);
