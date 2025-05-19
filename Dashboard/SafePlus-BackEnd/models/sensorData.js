const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const helmetDataSchema = new mongoose.Schema({
  id: { type: String, required: true },
  tmp: { type: Number, required: true },
  hum: { type: Number, required: true },

  acc: { type: Number, required: true },
  gyr: { type: Number, required: true },

  bpm: { type: Number, required: true },
  loc: { lat: { type: Number }, lng: { type: Number } },
  gas: { type: Number, required: true },
  btn: { type: Boolean, required: true },

  imp: { type: String, required: true }, 
});

const HelmetData = mongoose.model('HelmetData', helmetDataSchema);
module.exports = HelmetData;
