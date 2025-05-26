const express = require('express');
const router = express.Router();
const HelmetData = require('../models/sensorData'); // or HelmetData.js

// Example route: get all sensor data for a user by time range
router.get('/history', async (req, res) => {
  const { helmetId, start, end } = req.query;

  if (!start || !end || !helmetId) {
    return res.status(400).json({ message: 'Missing parameters' });
  }

  try {
    const data = await HelmetData.find({
      helmetId,
      createdAt: { $gte: new Date(start), $lte: new Date(end) },
    }).sort({ createdAt: 1 })
    .limit(20); // Limit to 20 records

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving helmet data', error: err.message });
  }
});

module.exports = router;
