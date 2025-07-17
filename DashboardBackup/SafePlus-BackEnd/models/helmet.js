const express = require("express");
const router = express.Router();
const HelmetData = require("../models/HelmetData");

// Utility function to derive status fields
function deriveStatus(data) {
  return {
    ...data,
    bpmStatus: data.bpm > 120 ? "high" : "normal",
    gasStatus: data.gas > 300 ? "danger" : "safe",
    tempStatus: data.temp > 38 ? "danger" : "normal",
    impactStatus: data.imp !== "no" ? "warning" : "safe",
    fallStatus: data.fall === "yes" ? "detected" : "none",
    btn: data.btn === "true",
  };
}

// Example route to get latest helmet data for a worker
router.get("/helmet/:helmetId", async (req, res) => {
  try {
    const { helmetId } = req.params;

    const latestData = await HelmetData.findOne({ id: helmetId })
      .sort({ createdAt: -1 }) // assuming timestamps exist
      .lean(); // convert to plain JS object

    if (!latestData) {
      return res.status(404).json({ error: "No data found" });
    }

    const sensorDataWithStatus = deriveStatus(latestData);
    res.json(sensorDataWithStatus);
  } catch (err) {
    console.error("Error fetching helmet data:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
