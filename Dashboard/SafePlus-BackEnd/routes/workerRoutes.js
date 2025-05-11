const express = require("express");
const router = express.Router();
const worker = require("../models/worker");


// POST /api/workers — Register new worker
router.post("/", async (req, res) => {
  const { name, nic, contact, address } = req.body;

  if (!name || !nic || !contact || !address) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const existing = await worker.findOne({ nic });
    if (existing) {
      return res.status(409).json({ error: "NIC already registered." });
    }

    const newWorker = new worker({ name, nic, contact, address });
    await newWorker.save();

    res.status(201).json({ message: "Worker registered successfully." });
  } catch (err) {
    console.error("❌ Error saving worker:", err); // Make sure this logs the real issue
    res.status(500).json({ error: "Server error.", details: err.message });
  }
  
});

module.exports = router;
