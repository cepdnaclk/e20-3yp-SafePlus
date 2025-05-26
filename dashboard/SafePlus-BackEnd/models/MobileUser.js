const mongoose = require("mongoose");

const mobileUserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("MobileUser", mobileUserSchema);

const helmetDataSchema = new mongoose.Schema({
  temperature: { type: Number, required: true },
  humidity: { type: Number, required: true },
  acc_magnitude: { type: Number, required: true },
  gyro_magnitude: { type: Number, required: true },
  heart_rate: { type: Number, required: true },
  location: { lat: Number, lng: Number },
  gasvalues: { type: Number, required: true },
  button: { type: Boolean, required: true },
  impact: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }  // ✅ Add this
});
module.exports = mongoose.model("HelmetData", helmetDataSchema);
