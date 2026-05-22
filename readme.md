# 💣 Mines Game

A **Stake-inspired mine game** built with HTML, CSS, and JavaScript — featuring real probability mechanics, dynamic multipliers, a balance system, leaderboard, and daily rewards.

🔗 **[Live Demo](https://minegame-uxiw.onrender.com)**

---

## 🎮 How to Play

1. **Set your bet amount** — use the 1/2x or 2x quick buttons or type manually
2. **Choose number of mines** — pick from 1, 2, 3, 5, 10, 15, 20, or 24
3. **Place your bet** — a 5×5 grid appears with hidden tiles
4. **Click tiles** — each safe tile reveals a gem 💎 and increases your multiplier
5. **Cash out anytime** — or hit a mine 💣 and lose your bet
6. The fewer safe tiles remaining, the higher the multiplier and risk

---

## ✨ Features

- 🎲 **Probability-based engine** — real-time calculation of next tile safety chance
- 📈 **Dynamic multiplier** — grows with each safe tile revealed
- 💰 **Balance system** — persistent in-session balance tracking
- 🏆 **Leaderboard** — Top 10 players ranking
- 🎁 **Daily Claim** — login daily to claim bonus balance
- 👤 **Guest mode** — play without signing up
- ⚡ **Real-time UI** — instant feedback on every tile click

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js |
| Hosting | Render |

---

## 📁 Project Structure

```
minegame/
├── index.html        # Main game UI
├── login.html        # Login / Guest entry
├── style.css         # Styling
├── src/              # Game logic & scripts
├── server/           # Backend server (Node.js)
└── assets/           # Images and icons
```

---

## 🚀 Run Locally

```bash
# Clone the repo
git clone https://github.com/VanshArya173/minegame.git
cd minegame

# Install dependencies
npm install

# Start the server
node server/index.js
```

Then open `http://localhost:3000` in your browser.

---

## 📐 Game Logic

The multiplier and payout are calculated based on:
- **Total tiles:** 25 (5×5 grid)
- **Mines placed:** chosen by the player
- **Safe tiles revealed:** increases multiplier each time
- **Next tile chance:** displayed live as `safe_remaining / total_remaining`

The expected value model mirrors real gambling platforms — higher mine count = higher risk = higher reward.

---

## 👨‍💻 Author

**Vansh Arya Verma** — B.Tech CSSS @ IIITD  
[GitHub](https://github.com/VanshArya173) · [LinkedIn](https://linkedin.com/in/vansh-arya-975448366)
