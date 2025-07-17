const mongoose = require("mongoose");
const {Schema} = mongoose

const UserSchema = new mongoose.Schema({
  fname: { type: String, required: true},
  name: { type: String, required: true, unique: true },
  email:{type: String, unique: true},
  password: { type: String, required: true },
  twoFASecret: { type: String },
  is2FAEnabled: { type: Boolean, default: false },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
