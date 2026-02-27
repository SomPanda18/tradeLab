// services/finnhubService.js
const axios = require('axios');

const FINNHUB_BASE = 'https://finnhub.io/api/v1';
const API_KEY = process.env.FINNHUB_API_KEY;

// In-memory cache with TTL
const cache = new Map();
const CACHE_TTL = 30000; // 30 seconds

function getCached(key) {
    const entry = cache.get(key);
    if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
    return null;
}

function setCache(key, data) {
    cache.set(key, { data, ts: Date.now() });
}

// Watchlist: ETF proxies for indices + top stocks + crypto
const WATCHLIST = [
    { symbol: 'SPY', label: 'S&P 500', type: 'index' },
    { symbol: 'QQQ', label: 'NASDAQ', type: 'index' },
    { symbol: 'DIA', label: 'DOW JONES', type: 'index' },
    { symbol: 'AAPL', label: 'Apple', type: 'stock' },
    { symbol: 'MSFT', label: 'Microsoft', type: 'stock' },
    { symbol: 'NVDA', label: 'NVIDIA', type: 'stock' },
    { symbol: 'TSLA', label: 'Tesla', type: 'stock' },
    { symbol: 'GOOGL', label: 'Alphabet', type: 'stock' },
];

// Fetch a single stock quote
async function getQuote(symbol) {
    const cacheKey = `quote:${symbol}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
        const { data } = await axios.get(`${FINNHUB_BASE}/quote`, {
            params: { symbol, token: API_KEY }
        });
        // data = { c: current, d: change, dp: percent change, h: high, l: low, o: open, pc: previous close, t: timestamp }
        const result = {
            symbol,
            current: data.c,
            change: data.d,
            changePercent: data.dp,
            high: data.h,
            low: data.l,
            open: data.o,
            prevClose: data.pc,
            timestamp: data.t,
        };
        setCache(cacheKey, result);
        return result;
    } catch (err) {
        console.error(`Finnhub quote error for ${symbol}:`, err.message);
        return null;
    }
}

// Fetch quotes for all watchlist items
async function getAllQuotes() {
    const cacheKey = 'allQuotes';
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const results = await Promise.all(
        WATCHLIST.map(async (item) => {
            const quote = await getQuote(item.symbol);
            if (!quote) return null;
            return {
                ...quote,
                label: item.label,
                type: item.type,
                positive: quote.changePercent >= 0,
            };
        })
    );

    const filtered = results.filter(Boolean);
    setCache(cacheKey, filtered);
    return filtered;
}

// Fetch general market news
async function getMarketNews() {
    const cacheKey = 'marketNews';
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
        const { data } = await axios.get(`${FINNHUB_BASE}/news`, {
            params: { category: 'general', token: API_KEY }
        });

        const news = data.slice(0, 12).map((item, i) => ({
            id: item.id || i,
            headline: item.headline,
            source: item.source,
            url: item.url,
            image: item.image,
            summary: item.summary,
            time: item.datetime ? getTimeAgo(item.datetime) : 'just now',
            datetime: item.datetime,
            sentiment: guessSentiment(item.headline),
        }));

        setCache(cacheKey, news);
        return news;
    } catch (err) {
        console.error('Finnhub news error:', err.message);
        return [];
    }
}

// Simple sentiment guesser based on keywords
function guessSentiment(headline) {
    const h = headline.toLowerCase();
    const bullish = ['surge', 'jump', 'rally', 'gain', 'rise', 'soar', 'beat', 'record', 'high', 'bull', 'boom', 'upgrade', 'growth', 'profit', 'strong'];
    const bearish = ['drop', 'fall', 'crash', 'decline', 'lose', 'slip', 'cut', 'bear', 'recession', 'weak', 'layoff', 'miss', 'downgrade', 'fear', 'plunge'];

    const bScore = bullish.reduce((s, w) => s + (h.includes(w) ? 1 : 0), 0);
    const bearScore = bearish.reduce((s, w) => s + (h.includes(w) ? 1 : 0), 0);

    if (bScore > bearScore) return 'bullish';
    if (bearScore > bScore) return 'bearish';
    return 'neutral';
}

function getTimeAgo(unixTimestamp) {
    const seconds = Math.floor(Date.now() / 1000 - unixTimestamp);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

module.exports = { getQuote, getAllQuotes, getMarketNews, WATCHLIST };
