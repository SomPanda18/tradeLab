// services/marketService.js
const { io } = require('../server'); // Import the io instance

const simulateMarket = () => {
    // Initial mock data based on your frontend
    let prices = {
        "SPX": 5892.14,
        "IXIC": 18543.72,
        "BTC": 62000.00
    };

    setInterval(() => {
        // Slightly randomize prices (+/- 0.1%)
        for (let ticker in prices) {
            const change = 1 + (Math.random() * 0.002 - 0.001);
            prices[ticker] = (prices[ticker] * change).toFixed(2);
        }

        // Emit the new prices to ALL connected clients
        io.emit('market_update', prices);
    }, 3000); // Update every 3 seconds
};
// Trigger an alert if a stock drops significantly
if (priceChange < -0.05) { // 5% drop
  io.emit('market_alert', {
    type: 'VOLATILITY',
    message: `${ticker} is dropping fast. Consult Nexus AI for a hedge strategy.`
  });
}

module.exports = { simulateMarket };