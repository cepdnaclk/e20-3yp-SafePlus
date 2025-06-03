const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const helmetDataSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  id: { type: String, required: true },
  acc: { type: Number, required: true },
  gyr: { type: Number, required: true },
  temp: { type: Number, required: true },
  hum: { type: Number, required: true },
  bpm: { type: Number, required: true },
  alt: { type: Number, required: true },
  floor: { type: Number, required: true },
  loc: { lat: { type: Number }, lng: { type: Number } },
  gas: { type: Number, required: true },
  typ: { type: String, required: true },
  btn: { type: String, required: true },
  fall: {type: String, required: true },
  imp: { type: String, required: true }, 
});

const HelmetData = mongoose.model('HelmetData', helmetDataSchema);
module.exports = HelmetData;
