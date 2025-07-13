const express = require("express");
const router = express.Router();
const Alert = require("../models/Alert");

router.get("/", async (req, res) => {
  const { helmetId, from } = req.query;
  const query = {};

  if (helmetId) query.helmetId = helmetId;
  //if (from) query.alertTime = { $gte: new Date(from) };

  console.log("Alert query:", query);  // ✅ ADD THIS

  try {
    const alerts = await Alert.find(query).sort({ alertTime: -1 });
    console.log("Found alerts:", alerts.length);  // ✅ ADD THIS
    res.json(alerts);
  } catch (err) {
    console.error("Error fetching alerts:", err);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});


module.exports = router;
