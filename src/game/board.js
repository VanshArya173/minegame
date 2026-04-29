class Board {
  constructor(totalTiles = 25, mineCount = 3) {
    this.totalTiles = totalTiles;
    this.mineCount = mineCount;
    this.grid = []; // { isMine, revealed }
    this._generate();
  }

  _generate() {
    this.grid = Array.from({ length: this.totalTiles }, () => ({
      isMine: false,
      revealed: false
    }));

    // Fisher-Yates shuffle to place mines
    const indices = Array.from({ length: this.totalTiles }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    for (let i = 0; i < this.mineCount; i++) {
      this.grid[indices[i]].isMine = true;
    }
  }

  reveal(index) {
    const tile = this.grid[index];
    if (tile.revealed) return null;
    tile.revealed = true;
    return tile.isMine ? 'mine' : 'gem';
  }

  getRevealedCount() {
    return this.grid.filter(t => t.revealed && !t.isMine).length;
  }

  revealAll() {
    this.grid.forEach(t => t.revealed = true);
  }

  getState() {
    return this.grid.map(t => ({ ...t }));
  }
}