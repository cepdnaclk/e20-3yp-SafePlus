const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const helmetDataSchema = new Schema({
  temperature: { type: Number, required: true },
  humidity: { type: Number, required: true },
  acc_magnitude: { type: Number, required: true },  
  gyro_magnitude: { type: Number, required: true }, 
  heart_rate: { type: Number, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  gasvalues: { type: Number, required: true },
  button: { type: Boolean, required: true },
  impact: { type: String, required: true }, 
});

const HelmetData = mongoose.model('HelmetData', helmetDataSchema);

module.exports = HelmetData;
