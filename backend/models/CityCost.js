const mongoose = require('mongoose');

const CityCostSchema = new mongoose.Schema({
    city: {type: String, required: true },
    country: {type: String, required: true },
    costOfLivingIndex: {type: Number, required: true },
    rentIndex: {type: Number, required: true },
    groceriesIndex: Number,
    restaurantIndex: Number,
    lastUpdated: {type: Date, default: Date.now }
});

module.exports = mongoose.model('CityCost', CityCostSchema);