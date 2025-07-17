const mongoose = require('mongoose');

const loginActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
  ip: String,
  userAgent: String,
});

module.exports = mongoose.model('LoginActivity', loginActivitySchema);
