// Bet helpers
function halveBet() {
  const input = document.getElementById('betInput');
  input.value = Math.max(0.01, parseFloat(input.value) / 2).toFixed(2);
}

function doubleBet() {
  const input = document.getElementById('betInput');
  input.value = (parseFloat(input.value) * 2).toFixed(2);
}

function updateStats(multiplier, profit, nextChance) {
  document.getElementById('multiplierDisplay').textContent = formatMultiplier(multiplier);
  document.getElementById('profitDisplay').textContent = formatMoney(profit);
  document.getElementById('chanceDisplay').textContent =
    nextChance != null ? formatPercent(nextChance) : '-';
}

function updateBalance(balance) {
  document.getElementById('balanceDisplay').textContent = formatMoney(balance);
}

function setMainBtn(mode) {
  const btn = document.getElementById('mainBtn');
  if (mode === 'bet') {
    btn.textContent = 'Place Bet';
    btn.className = 'btn-main';
    btn.disabled = false;
  } else if (mode === 'cashout') {
    btn.textContent = 'Cash Out';
    btn.className = 'btn-main cashout';
    btn.disabled = false;
  } else if (mode === 'disabled') {
    btn.disabled = true;
  }
}

function showToast(msg, duration = 2000) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
}

// update next tile chance when mine count changes
document.addEventListener('DOMContentLoaded', () => {
  const mineSelect = document.getElementById('mineSelect');
  if (mineSelect) {
    mineSelect.addEventListener('change', () => {
      if (!currentGameId) {
        const mines = parseInt(mineSelect.value);
        const chance = calcNextChance(25, mines, 0);
        document.getElementById('chanceDisplay').textContent = formatPercent(chance);
      }
    });
  }
});
