const express = require('express');
const router = express.Router();
const HourlyStats = require('../models/HourlyStatModel');

console.log('📦 mobileData.js loaded');

router.get('/', (req, res) => {
  res.send('✅ Base route is working');
});

router.get('/:helmetId', async (req, res) => {
  console.log('📥 Fetching hourly stats for helmet:', req.params.helmetId);
  const { helmetId } = req.params;
  console.log('Helmet ID:', helmetId);
  try {
    const stats = await HourlyStats.find({ helmetId })
      .sort({ hourWindowStart: -1 })
      .limit(20);
    if (!stats || stats.length === 0) {
      return res.status(404).json({ error: 'No stats found for this helmet' });
    }
    res.json(stats.reverse());
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch hourly stats' });
  }
});

module.exports = router;
