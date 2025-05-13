const mongoose = require("mongoose");
const {Schema} = mongoose

const workerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nic: { type: String, required: true, unique: true },
  contact: { type: String, required: true },
  address: { type: String, required: true },
  email: {type: String, required: true },
  birth : { type: String, required : true},
  registeredDate: {
    type: String,
    default: () => new Date().toISOString().split('T')[0] 
  }
}, { timestamps: true });

const worker = mongoose.model("worker", workerSchema);
module.exports = worker;