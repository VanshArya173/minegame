class MinesGame {
  constructor() {
    this.balance = 1000;
    this.betAmount = 0;
    this.mineCount = 3;
    this.board = null;
    this.active = false;
    this.totalTiles = 25;
  }

  startGame(betAmount, mineCount) {
    if (betAmount <= 0) throw new Error('Bet must be greater than 0');
    if (betAmount > this.balance) throw new Error('Insufficient balance');

    this.betAmount = betAmount;
    this.mineCount = mineCount;
    this.balance -= betAmount;
    this.board = new Board(this.totalTiles, mineCount);
    this.active = true;

    return { success: true };
  }

  revealTile(index) {
    if (!this.active) return { error: 'No active game' };

    const result = this.board.reveal(index);
    if (!result) return { error: 'Already revealed' };

    if (result === 'mine') {
      this.active = false;
      this.board.revealAll();
      return { result: 'mine', balance: this.balance, grid: this.board.getState() };
    }

    const revealed = this.board.getRevealedCount();
    const multiplier = calcMultiplier(this.totalTiles, this.mineCount, revealed);
    const profit = this.betAmount * multiplier - this.betAmount;
    const nextChance = calcNextChance(this.totalTiles, this.mineCount, revealed);

    // Auto cashout if all safe tiles revealed
    const safeTiles = this.totalTiles - this.mineCount;
    if (revealed >= safeTiles) {
      return this.cashout();
    }

    return {
      result: 'gem',
      revealed,
      multiplier,
      profit,
      nextChance,
      grid: this.board.getState()
    };
  }

  cashout() {
    if (!this.active) return { error: 'No active game' };

    const revealed = this.board.getRevealedCount();
    if (revealed === 0) return { error: 'Reveal at least one tile first' };

    const multiplier = calcMultiplier(this.totalTiles, this.mineCount, revealed);
    const winAmount = this.betAmount * multiplier;

    this.balance += winAmount;
    this.active = false;
    this.board.revealAll();

    return {
      result: 'cashout',
      multiplier,
      winAmount,
      profit: winAmount - this.betAmount,
      balance: this.balance,
      grid: this.board.getState()
    };
  }

  getMultiplier() {
    if (!this.board) return 1;
    const revealed = this.board.getRevealedCount();
    return calcMultiplier(this.totalTiles, this.mineCount, revealed);
  }

  getProfit() {
    if (!this.board) return 0;
    const revealed = this.board.getRevealedCount();
    const mult = calcMultiplier(this.totalTiles, this.mineCount, revealed);
    return this.betAmount * mult - this.betAmount;
  }
}