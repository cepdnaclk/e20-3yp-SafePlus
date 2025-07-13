const express = require("express");
const router = express.Router();
const Alert = require("../models/Alert");

router.get("/", async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ alertTime: -1 }).limit(100);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

module.exports = router;
