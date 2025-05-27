const express = require('express');
const router = express.Router();
const HelmetData = require('../models/sensorData'); // or HelmetData.js
//const sampleData = require('../mockData.js'); // Importing mock data
// Example route: get all sensor data for a user by time range
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Find latest 50 sensor records for the user (if stored with userId)
    const data = await HelmetData.find({ userId }).sort({ timestamp: -1 }).limit(50);

    res.json(data);
  } catch (error) {
    console.error('❌ Error fetching sensor data from MongoDB:', error);
    res.status(500).json({ error: 'Failed to fetch sensor data' });
  }
});

module.exports = router;
/*
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  console.log(`Serving mock data for user ${userId}`);
  // You could later filter based on userId if needed
  res.json(sampleData);
});*/

