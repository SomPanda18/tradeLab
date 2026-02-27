// services/marketService.js
const { getAllQuotes } = require('./finnhubService');

const broadcastMarketData = (io) => {
  // Broadcast real market data every 15 seconds
  const broadcast = async () => {
    try {
      const quotes = await getAllQuotes();
      if (quotes && quotes.length > 0) {
        // Emit structured quotes
        io.emit('market_update', quotes);
      }
    } catch (err) {
      console.error('Market broadcast error:', err.message);
    }
  };

  // Initial fetch after 5 seconds (let server start first)
  setTimeout(broadcast, 5000);
  // Then every 15 seconds
  setInterval(broadcast, 15000);
};

module.exports = { broadcastMarketData };