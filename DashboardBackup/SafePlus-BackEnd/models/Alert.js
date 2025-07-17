const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  helmetId: { type: String, required: true },
  alertType: { type: String, required: true }, // e.g. "gas", "impact", etc.
  alertValue: { type: mongoose.Schema.Types.Mixed }, // can be number, string, etc.
  alertTime: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Alert", alertSchema);
