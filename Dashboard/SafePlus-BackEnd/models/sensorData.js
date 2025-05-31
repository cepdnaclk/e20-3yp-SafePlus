const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const helmetDataSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  id: { type: String, required: true },
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
