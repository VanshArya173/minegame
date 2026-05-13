const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username:       { type: String, required: true, unique: true, trim: true },
  password:       { type: String, required: true },
  balance:        { type: Number, default: 0 },
  totalDeposited: { type: Number, default: 0 },
  totalWon:       { type: Number, default: 0 },
  totalLost:      { type: Number, default: 0 },
  gamesPlayed:    { type: Number, default: 0 },
  lastClaim:      { type: Date, default: null }  
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);