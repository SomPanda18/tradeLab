// routes/marketRoutes.js
const express = require('express');
const router = express.Router();
const { getAllQuotes, getMarketNews, getQuote } = require('../services/finnhubService');

// GET /api/market/quotes — all watchlist quotes
router.get('/quotes', async (req, res) => {
    try {
        const quotes = await getAllQuotes();
        res.json(quotes);
    } catch (err) {
        console.error('Market quotes error:', err.message);
        res.status(500).json({ error: 'Failed to fetch market data' });
    }
});

// GET /api/market/news — latest market news
router.get('/news', async (req, res) => {
    try {
        const news = await getMarketNews();
        res.json(news);
    } catch (err) {
        console.error('Market news error:', err.message);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

// GET /api/market/quote/:symbol — single symbol quote
router.get('/quote/:symbol', async (req, res) => {
    try {
        const quote = await getQuote(req.params.symbol.toUpperCase());
        if (!quote) return res.status(404).json({ error: 'Quote not found' });
        res.json(quote);
    } catch (err) {
        console.error('Quote error:', err.message);
        res.status(500).json({ error: 'Failed to fetch quote' });
    }
});

module.exports = router;
