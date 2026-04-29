const express        = require('express');
const router         = express.Router();
const crypto         = require('crypto');
const User           = require('../models/User');
const Game           = require('../models/Game');
const authMiddleware = require('../middleware/auth');

function placeMines(total, count) {
  const indices = Array.from({ length: total }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.slice(0, count);
}

function calcMultiplier(total, mines, revealed) {
  if (revealed === 0) return 1;
  let num = 1, den = 1;
  for (let i = 0; i < revealed; i++) {
    num *= (total - mines - i);
    den *= (total - i);
  }
  return parseFloat((0.99 / (num / den)).toFixed(4));
}

router.post('/start', authMiddleware, async (req, res) => {
  try {
    const { betAmount, mineCount, clientSeed } = req.body;
    if (!betAmount || betAmount <= 0)
      return res.status(400).json({ error: 'Invalid bet' });
    if (!mineCount || mineCount < 1 || mineCount > 24)
      return res.status(400).json({ error: 'Invalid mine count' });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.balance < betAmount)
      return res.status(400).json({ error: 'Insufficient balance' });

    await Game.updateMany({ userId: req.userId, status: 'active' }, { status: 'lost' });

    user.balance -= betAmount;
    await user.save();

    const serverSeed     = crypto.randomBytes(32).toString('hex');
    const serverSeedHash = crypto.createHash('sha256').update(serverSeed).digest('hex');

    const game = await Game.create({
      userId: req.userId, betAmount, mineCount,
      mines: placeMines(25, mineCount),
      revealed: [], status: 'active',
      serverSeed, serverSeedHash,
      clientSeed: clientSeed || 'default'
    });

    res.json({ gameId: game._id, balance: user.balance, serverSeedHash });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/reveal', authMiddleware, async (req, res) => {
  try {
    const { gameId, index } = req.body;
    if (index === undefined || index < 0 || index > 24)
      return res.status(400).json({ error: 'Invalid tile' });

    const game = await Game.findOne({ _id: gameId, userId: req.userId });
    if (!game || game.status !== 'active')
      return res.status(400).json({ error: 'No active game' });
    if (game.revealed.includes(index))
      return res.status(400).json({ error: 'Already revealed' });

    if (game.mines.includes(index)) {
      game.status = 'lost';
      await game.save();
      const user = await User.findById(req.userId);
      user.totalLost   += game.betAmount;
      user.gamesPlayed += 1;
      await user.save();
      return res.json({
        result: 'mine', mines: game.mines,
        balance: user.balance, serverSeed: game.serverSeed
      });
    }

    game.revealed.push(index);
    const multiplier = calcMultiplier(25, game.mineCount, game.revealed.length);
    game.multiplier  = multiplier;
    await game.save();

    const profit     = parseFloat((game.betAmount * multiplier - game.betAmount).toFixed(2));
    const safeLeft   = 25 - game.mineCount - game.revealed.length;
    const remaining  = 25 - game.revealed.length;
    const nextChance = remaining > 0 ? safeLeft / remaining : 0;

    if (game.revealed.length >= 25 - game.mineCount) {
      const winAmount = parseFloat((game.betAmount * multiplier).toFixed(2));
      game.status    = 'won';
      game.winAmount = winAmount;
      await game.save();
      const user = await User.findById(req.userId);
      user.balance     += winAmount;
      user.totalWon    += winAmount;
      user.gamesPlayed += 1;
      await user.save();
      return res.json({
        result: 'cashout', multiplier, winAmount, profit,
        balance: user.balance, serverSeed: game.serverSeed
      });
    }

    res.json({
      result: 'gem', revealed: game.revealed,
      multiplier, profit,
      nextChance: parseFloat(nextChance.toFixed(4))
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/cashout', authMiddleware, async (req, res) => {
  try {
    const { gameId } = req.body;
    const game = await Game.findOne({ _id: gameId, userId: req.userId });
    if (!game || game.status !== 'active')
      return res.status(400).json({ error: 'No active game' });
    if (game.revealed.length === 0)
      return res.status(400).json({ error: 'Reveal at least one tile first' });

    const multiplier = calcMultiplier(25, game.mineCount, game.revealed.length);
    const winAmount  = parseFloat((game.betAmount * multiplier).toFixed(2));
    const profit     = parseFloat((winAmount - game.betAmount).toFixed(2));

    game.status     = 'won';
    game.multiplier = multiplier;
    game.winAmount  = winAmount;
    await game.save();

    const user = await User.findById(req.userId);
    user.balance     += winAmount;
    user.totalWon    += winAmount;
    user.gamesPlayed += 1;
    await user.save();

    res.json({
      result: 'cashout', multiplier, winAmount, profit,
      balance: user.balance, serverSeed: game.serverSeed
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;