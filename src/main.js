const API = {
  token: localStorage.getItem('token'),

  async call(method, endpoint, body) {
    const res = await fetch(`/api${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.token
      },
      body: body ? JSON.stringify(body) : undefined
    });
    return res.json();
  },

  get(endpoint)        { return this.call('GET', endpoint); },
  post(endpoint, body) { return this.call('POST', endpoint, body); }
};

const gridEl     = document.getElementById('grid');
const statsPanel = new StatsPanel();
const provably   = new Provably();

let currentGameId = null;
let currentBet    = 0;
let currentMines  = 3;

const boardUI = new BoardUI(gridEl, null, async (index) => {
  if (!currentGameId) return;

  Sound.play('click');

  const res = await API.post('/game/reveal', { gameId: currentGameId, index });
  if (res.error) { showToast(res.error); return; }

  if (res.result === 'mine') {
    Sound.play('mine');
    currentGameId = null;
    boardUI.renderWithMines(res.mines, index);
    updateBalance(res.balance);
    updateStats(1, 0, null);
    setMainBtn('bet');
    showToast('BOOM! You hit a mine!');
    statsPanel.recordGame({ bet: currentBet, mines: currentMines, profit: -currentBet, won: false });
    return;
  }

  if (res.result === 'cashout') {
    Sound.play('cashout');
    currentGameId = null;
    boardUI.renderIdle();
    updateBalance(res.balance);
    updateStats(res.multiplier, res.profit, null);
    setMainBtn('bet');
    showToast(`Auto cashed out! Won ${formatMoney(res.winAmount)}`);
    statsPanel.recordGame({ bet: currentBet, mines: currentMines, profit: res.profit, won: true });
    return;
  }

  // result === 'gem'
  Sound.play('gem');
  boardUI.renderRevealed(res.revealed);
  updateStats(res.multiplier, res.profit, res.nextChance);
  setMainBtn('cashout');
});

async function handleMainBtn() {
  // --- CASHOUT ---
  if (currentGameId) {
    const res = await API.post('/game/cashout', { gameId: currentGameId });
    if (res.error) { showToast(res.error); return; }

    Sound.play('cashout');
    currentGameId = null;
    boardUI.renderIdle();
    updateBalance(res.balance);
    updateStats(res.multiplier, res.profit, null);
    setMainBtn('bet');
    showToast(`Cashed out! Won ${formatMoney(res.winAmount)}`);
    statsPanel.recordGame({ bet: currentBet, mines: currentMines, profit: res.profit, won: true });
    return;
  }

  // --- PLACE BET ---
  currentBet   = parseFloat(document.getElementById('betInput').value);
  currentMines = parseInt(document.getElementById('mineSelect').value);

  if (!currentBet || currentBet <= 0) { showToast('Enter a valid bet'); return; }
  if (!API.token) { window.location.href = '/login.html'; return; }

  const res = await API.post('/game/start', {
    betAmount:  currentBet,
    mineCount:  currentMines,
    clientSeed: provably.clientSeed
  });

  if (res.error) { showToast(res.error); return; }

  currentGameId = res.gameId;
  boardUI.renderEmpty();
  updateBalance(res.balance);
  updateStats(1.00, 0, calcNextChance(25, currentMines, 0));
  setMainBtn('cashout');
}

// ── Init ──────────────────────────────────────────────────────────────
boardUI.renderIdle();
updateBalance(0);
updateStats(1, 0, null);
setMainBtn('bet');

// Load balance + set up mine-change listener
API.get('/auth/me').then(res => {
  if (res.error) {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
    return;
  }
  updateBalance(res.balance);

  document.getElementById('mineSelect').addEventListener('change', () => {
    if (!currentGameId) {
      const mines = parseInt(document.getElementById('mineSelect').value);
      document.getElementById('chanceDisplay').textContent = formatPercent(calcNextChance(25, mines, 0));
    }
  });

  document.getElementById('chanceDisplay').textContent =
    formatPercent(calcNextChance(25, currentMines, 0));
});