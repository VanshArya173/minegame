const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  betAmount:      { type: Number, required: true },
  mineCount:      { type: Number, required: true },
  mines:          { type: [Number], default: [] },
  revealed:       { type: [Number], default: [] },
  status:         { type: String, default: 'active' },
  multiplier:     { type: Number, default: 1 },
  winAmount:      { type: Number, default: 0 },
  // ✅ FIX 2: Provably fair fields
  serverSeed:     { type: String, default: '' },   // hidden until game ends
  serverSeedHash: { type: String, default: '' },   // committed to player upfront
  clientSeed:     { type: String, default: '' },   // provided by player
  nonce:          { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Game', GameSchema);