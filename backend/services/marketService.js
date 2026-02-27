// services/marketService.js

const simulateMarket = (io) => {
  // Initial mock data based on your frontend
  let prices = {
    "SPX": 5892.14,
    "IXIC": 18543.72,
    "BTC": 62000.00
  };

  setInterval(() => {
    for (let ticker in prices) {
      const oldPrice = parseFloat(prices[ticker]);
      // Slightly randomize prices (+/- 0.1%)
      const change = 1 + (Math.random() * 0.002 - 0.001);
      prices[ticker] = (oldPrice * change).toFixed(2);

      // Trigger an alert if a stock drops significantly (5% drop)
      const priceChange = (parseFloat(prices[ticker]) - oldPrice) / oldPrice;
      if (priceChange < -0.05) {
        io.emit('market_alert', {
          type: 'VOLATILITY',
          message: `${ticker} is dropping fast. Consult Nexus AI for a hedge strategy.`
        });
      }
    }

    // Emit the new prices to ALL connected clients
    io.emit('market_update', prices);
  }, 3000); // Update every 3 seconds
};

module.exports = { simulateMarket };