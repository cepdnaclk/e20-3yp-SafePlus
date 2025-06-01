const express = require('express');
const router = express.Router();
const HourlyStats = require('../models/HourlyStatModel');

// Get latest hourly stats for a helmet
router.get('/:helmetId', async (req, res) => {
  const { helmetId } = req.params;
  try {
    // Get the latest hourly stat for this helmet
    const stat = await HourlyStats.findOne({ helmetId }).sort({ hourWindowStart: -1 });
    if (!stat) return res.status(404).json({ error: 'No stats found for this helmet' });
    res.json(stat);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hourly stats' });
  }
});

module.exports = router;