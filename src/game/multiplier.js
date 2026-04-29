// Combinatorics-based multiplier — same math Stake uses
// P(safe streak) = C(safeTiles, revealed) / C(totalTiles, revealed)
// Multiplier = 0.99 / probability  (0.99 = house edge)

function combination(n, r) {
  if (r > n) return 0;
  if (r === 0 || r === n) return 1;
  let num = 1, den = 1;
  for (let i = 0; i < r; i++) {
    num *= (n - i);
    den *= (i + 1);
  }
  return num / den;
}

function calcMultiplier(totalTiles, mines, revealed) {
  if (revealed === 0) return 1.00;
  const safeTiles = totalTiles - mines;
  const prob = combination(safeTiles, revealed) / combination(totalTiles, revealed);
  return (0.99 / prob);
}

function calcNextChance(totalTiles, mines, revealed) {
  const remaining = totalTiles - revealed;
  const minesLeft = mines;
  const safeLeft = remaining - minesLeft;
  if (remaining <= 0) return 0;
  return safeLeft / remaining;
}