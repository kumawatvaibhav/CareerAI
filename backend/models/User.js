const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  location: String,
  phone: String,
  linkedin: String,
  website: String,
  bio: String,
  skills: [String],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
