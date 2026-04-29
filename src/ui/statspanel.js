class StatsPanel {
  constructor() {
    this.history = [];   // { bet, mines, profit, won }
    this.sessionProfit = 0;
    this.totalGames = 0;
    this.wins = 0;

    this._inject();
  }

  _inject() {
    // Create stats panel DOM and append below sidebar
    const panel = document.createElement('div');
    panel.id = 'statsPanel';
    panel.innerHTML = `
      <div class="stats-title">Session Stats</div>
      <div class="stats-row">
        <span>Games</span>
        <span id="stat-games">0</span>
      </div>
      <div class="stats-row">
        <span>Win Rate</span>
        <span id="stat-winrate">0%</span>
      </div>
      <div class="stats-row">
        <span>Net Profit</span>
        <span id="stat-profit">$0.00</span>
      </div>
      <div class="stats-row">
        <span>Best Win</span>
        <span id="stat-best">$0.00</span>
      </div>
      <div class="stats-title" style="margin-top:12px;">Last 5 Games</div>
      <div id="stat-history"></div>
    `;

    // inject styles
    const style = document.createElement('style');
    style.textContent = `
      #statsPanel {
        background: #1a2332;
        border-top: 1px solid #243044;
        padding: 14px 16px;
        font-size: 13px;
        color: #7a8fa6;
      }
      .stats-title {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.8px;
        color: #4a5f7a;
        margin-bottom: 8px;
      }
      .stats-row {
        display: flex;
        justify-content: space-between;
        padding: 3px 0;
      }
      .stats-row span:last-child { color: #c0c7d0; font-weight: 500; }
      .history-item {
        display: flex;
        justify-content: space-between;
        padding: 3px 0;
        font-size: 12px;
        border-bottom: 1px solid #1e2d3e;
      }
      .win-tag  { color: #00e701; }
      .loss-tag { color: #e74c3c; }
    `;
    document.head.appendChild(style);

    // append panel to sidebar
    const sidebar = document.querySelector('.sidebar');
    sidebar.appendChild(panel);
  }

  recordGame({ bet, mines, profit, won }) {
    this.totalGames++;
    this.sessionProfit += profit;
    if (won) this.wins++;

    this.history.unshift({ bet, mines, profit, won });
    if (this.history.length > 5) this.history.pop();

    this._update();
  }

  _update() {
    document.getElementById('stat-games').textContent = this.totalGames;

    const wr = this.totalGames > 0
      ? ((this.wins / this.totalGames) * 100).toFixed(1) + '%'
      : '0%';
    document.getElementById('stat-winrate').textContent = wr;

    const profitEl = document.getElementById('stat-profit');
    profitEl.textContent = formatMoney(this.sessionProfit);
    profitEl.style.color = this.sessionProfit >= 0 ? '#00e701' : '#e74c3c';

    const bestWin = Math.max(0, ...this.history.filter(h => h.won).map(h => h.profit));
    document.getElementById('stat-best').textContent = formatMoney(bestWin);

    const histEl = document.getElementById('stat-history');
    histEl.innerHTML = this.history.map(h => `
      <div class="history-item">
        <span>${h.mines} mines · ${formatMoney(h.bet)}</span>
        <span class="${h.won ? 'win-tag' : 'loss-tag'}">
          ${h.won ? '+' : ''}${formatMoney(h.profit)}
        </span>
      </div>
    `).join('');
  }

  reset() {
    this.history = [];
    this.sessionProfit = 0;
    this.totalGames = 0;
    this.wins = 0;
    this._update();
  }
}