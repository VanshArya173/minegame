const express        = require('express');
const router         = express.Router();
const User           = require('../models/User');
const Game           = require('../models/Game');
const authMiddleware = require('../middleware/auth');

router.get('/balance', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('balance totalDeposited totalWon totalLost gamesPlayed');
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/deposit', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });
    if (amount > 100000) return res.status(400).json({ error: 'Max deposit is $100,000' });

    const user = await User.findById(req.userId);
    user.balance        += parseFloat(amount);
    user.totalDeposited += parseFloat(amount);
    await user.save();

    res.json({ message: `$${amount} added to wallet`, balance: user.balance, totalDeposited: user.totalDeposited });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

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