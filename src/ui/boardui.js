class BoardUI {
  constructor(gridEl, game, onReveal) {
    this.gridEl   = gridEl;
    this.game     = game;
    this.onReveal = onReveal;
    this._revealedSet = new Set();
  }

  // Called when game starts — 25 blank clickable tiles
  renderEmpty() {
    this._revealedSet.clear();
    this.gridEl.innerHTML = '';
    for (let i = 0; i < 25; i++) {
      const btn = document.createElement('button');
      btn.className = 'tile';
      btn.addEventListener('click', () => this.onReveal(i));
      this.gridEl.appendChild(btn);
    }
  }

  // Called after each safe reveal — marks gems, keeps rest clickable
  renderRevealed(revealedIndices) {
    this._revealedSet = new Set(revealedIndices);
    const tiles = this.gridEl.querySelectorAll('.tile');
    tiles.forEach((btn, i) => {
      if (this._revealedSet.has(i)) {
        btn.classList.add('revealed-gem');
        btn.textContent = '💎';
        btn.disabled = true;
      }
    });
  }

  // Called on mine hit — freeze board, show all mines
  renderWithMines(mineIndices, clickedIndex) {
    const tiles = this.gridEl.querySelectorAll('.tile');
    tiles.forEach((btn, i) => {
      const clone = btn.cloneNode(true);
      btn.parentNode.replaceChild(clone, btn);
      clone.disabled = true;

      if (mineIndices.includes(i)) {
        clone.classList.remove('revealed-gem');
        clone.classList.add(i === clickedIndex ? 'revealed-mine-hit' : 'revealed-mine');
        clone.textContent = '💣';
      } else if (this._revealedSet.has(i)) {
        clone.classList.add('revealed-gem');
        clone.textContent = '💎';
      }
    });
  }

  // Idle — disabled tiles shown before any bet
  renderIdle() {
    this._revealedSet.clear();
    this.gridEl.innerHTML = '';
    for (let i = 0; i < 25; i++) {
      const btn = document.createElement('button');
      btn.className = 'tile inactive';
      btn.disabled = true;
      this.gridEl.appendChild(btn);
    }
  }
}