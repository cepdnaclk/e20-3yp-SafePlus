const mongoose = require("mongoose");

const hourlyStatsSchema = new mongoose.Schema({
  helmetId: { type: String, required: true },
  hour: { type: Date, required: true},
  hourWindowStart: { type: Date, required: true},
  avgTemp: { type: Number, default: 0 },  
  avgHum: { type: Number, default: 0 },   
  impactCount: { type: Number, default: 0 }, 
  gasAlertCount: { type: Number, default: 0 }, 
  count: { type: Number, default: 0 },   
}, { timestamps: true });

hourlyStatsSchema.index({ helmetId: 1, hour: 1 }, { unique: true });

module.exports = mongoose.model("HourlyStatModel", hourlyStatsSchema);
