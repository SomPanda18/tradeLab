// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  balance: { type: Number, default: 50000 }, // Default starting balance
  xp: { type: Number, default: 0 },
  riskScore: { type: Number, default: 50 },
  portfolio: [{
    ticker: String,
    shares: Number,
    avgPrice: Number
  }],
  skillDimensions: {
    macro: { type: Number, default: 10 },
    technical: { type: Number, default: 10 },
    risk: { type: Number, default: 10 },
    sector: { type: Number, default: 10 },
    earnings: { type: Number, default: 10 }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);