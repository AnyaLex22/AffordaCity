const express = require('express');
const router = express.Router();
const verifyToken = require('./auth');
const Calculation = require('./server');

// GET /api/user-calculations
router.get('/user-calculations', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const calculations = await Calculation.find({ userId });
    res.json(calculations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
