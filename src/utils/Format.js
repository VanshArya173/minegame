function formatMoney(amount) {
  return '$' + parseFloat(amount).toFixed(2);
}

function formatMultiplier(val) {
  return parseFloat(val).toFixed(2) + '×';
}

function formatPercent(val) {
  return (val * 100).toFixed(1) + '%';
}