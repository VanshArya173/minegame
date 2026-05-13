const express        = require('express');
const router         = express.Router();
const User           = require('../models/User');
const Game           = require('../models/Game');
const authMiddleware = require('../middleware/auth');

// Balance
router.get('/balance', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('balance totalWon totalLost gamesPlayed lastClaim');
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ✅ Daily claim — 25k every 24 hours
router.post('/claim', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const now  = new Date();

    if (user.lastClaim) {
      const hoursSince = (now - user.lastClaim) / (1000 * 60 * 60);
      if (hoursSince < 24) {
        const hoursLeft   = Math.floor(24 - hoursSince);
        const minutesLeft = Math.floor((24 - hoursSince - hoursLeft) * 60);
        return res.status(400).json({
          error: `Come back in ${hoursLeft}h ${minutesLeft}m`
        });
      }
    }

    user.balance  += 25000;
    user.lastClaim = now;
    await user.save();

    res.json({ message: 'Claimed $25,000!', balance: user.balance });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ✅ Leaderboard — top 10 by balance
router.get('/leaderboard', authMiddleware, async (req, res) => {
  try {
    const top10 = await User.find()
      .sort({ balance: -1 })
      .limit(10)
      .select('username balance');
    res.json(top10);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Game history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const games = await Game.find({ userId: req.userId })
      .sort({ createdAt: -1 }).limit(20).select('-mines');
    res.json(games);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;