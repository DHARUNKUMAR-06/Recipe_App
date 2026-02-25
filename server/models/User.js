const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
  role: { type: String, default: 'user', enum: ['user', 'admin'] }
});

module.exports = mongoose.model('User', userSchema);