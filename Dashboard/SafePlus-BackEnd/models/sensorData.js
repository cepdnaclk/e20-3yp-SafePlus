const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const helmetDataSchema = new Schema({
  temperature: { type: Number, required: true },
  humidity: { type: Number, required: true },
  accel: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    z: { type: Number, required: true },
  },
  gyro: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    z: { type: Number, required: true },
  },
  heart_rate: { type: Number, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  gasvalues: { type: Number, required: true },
  button: { type: Boolean, required: true },
});

const HelmetData = mongoose.model('HelmetData', helmetDataSchema);

module.exports = HelmetData;
