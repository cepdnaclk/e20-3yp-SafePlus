const mongoose = require("mongoose");
const {Schema} = mongoose

const workerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nic: { type: String, required: true, unique: true },
  contact: { type: String, required: true },
  address: { type: String, required: true },
}, { timestamps: true });

const worker = mongoose.model("worker", workerSchema);
module.exports = worker;