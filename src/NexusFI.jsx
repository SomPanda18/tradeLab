import { useState, useEffect, useRef, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, ReferenceLine, BarChart, Bar, CartesianGrid
} from "recharts";
import { PieChart, Pie, Cell } from "recharts";
import { io as socketIO } from "socket.io-client";

// Backend API base URL
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:10000';

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const T = {
  bg: "#0a0a0c",
  bgCard: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.07)",
  borderHi: "rgba(16,185,129,0.35)",
  emerald: "#10b981",
  emeraldDk: "#059669",
  blue: "#3b82f6",
  red: "#ef4444",
  amber: "#f59e0b",
  purple: "#8b5cf6",
  text: "#eaeaea",
  textMid: "#888",
  textDim: "#444",
  font: "'Space Mono', 'Courier New', monospace",
  fontDisp: "'Space Grotesk', sans-serif",
};

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────
const Ico = ({ d, size = 14, color = "currentColor", sw = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const IcoTrendUp = (p) => <Ico {...p} d="m22 7-8.5 8.5-5-5L2 17" />;
const IcoTrendDn = (p) => <Ico {...p} d="m22 17-8.5-8.5-5 5L2 7" />;
const IcoZap = (p) => <Ico {...p} d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />;
const IcoShield = (p) => <Ico {...p} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;
const IcoAlert = (p) => <Ico {...p} d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />;
const IcoX = (p) => <Ico {...p} d="M18 6 6 18M6 6l12 12" />;
const IcoChevR = (p) => <Ico {...p} d="m9 18 6-6-6-6" />;
const IcoGlobe = (p) => <Ico {...p} d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />;
const IcoActivity = (p) => <Ico {...p} d="M22 12h-4l-3 9L9 3 6 12H2" />;
const IcoBell = (p) => <Ico {...p} d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />;
const IcoInfo = (p) => <Ico {...p} d="M12 16v-4M12 8h.01M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" />;
const IcoSend = (p) => <Ico {...p} d="M22 2 11 13M22 2 15 22 11 13 2 9l20-7z" />;
const IcoAward = (p) => <Ico {...p} d="M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM8.21 13.89 7 23l5-3 5 3-1.21-9.12" />;
const IcoSparkles = (p) => <Ico {...p} d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />;
const IcoTarget = (p) => <Ico {...p} d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />;
const IcoBrain2 = (p) => <Ico {...p} d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2z" />;
const IcoCheck = (p) => <Ico {...p} d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3" />;
const IcoRadar = (p) => <Ico {...p} d="M3.34 19a10 10 0 1 1 17.32 0M2 12h20M12 2v10M16.9 7.1 12 12M7.1 7.1 12 12" />;
const IcoFlame = (p) => <Ico {...p} d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />;
const IcoRefresh = (p) => <Ico {...p} d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M3 3v5h5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16m18 5v-5h-5" />;
const IcoLock = (p) => <Ico {...p} d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4" />;
const IcoGoogle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────────────────────
const genSpark = (base, variance, len = 22, up = true) =>
  Array.from({ length: len }, (_, i) => ({
    t: i,
    v: base + (up ? i * (variance / len) : -i * (variance / len)) + (Math.random() - 0.46) * variance * 0.55,
  }));

const INDICES_FALLBACK = [
  { id: "sp500", label: "S&P 500", value: "5,892.14", change: "+1.24%", delta: +72.11, positive: true, high: "5,904.22", low: "5,811.90", vol: "3.2B", data: genSpark(5820, 80, 22, true), color: T.emerald, symbol: "SPY" },
  { id: "nasdaq", label: "NASDAQ", value: "18,543.72", change: "+1.87%", delta: +341.08, positive: true, high: "18,601", low: "18,201", vol: "5.8B", data: genSpark(18200, 360, 22, true), color: T.blue, symbol: "QQQ" },
  { id: "dow", label: "DOW JONES", value: "38,671.33", change: "+0.62%", delta: +238.47, positive: true, high: "38,780", low: "38,401", vol: "2.9B", data: genSpark(38430, 300, 22, true), color: T.purple, symbol: "DIA" },
];

const INDEX_COLORS = { SPY: T.emerald, QQQ: T.blue, DIA: T.purple, AAPL: T.emerald, MSFT: T.blue, NVDA: T.emerald, TSLA: T.red, GOOGL: T.amber };

function formatQuoteToIndex(quote) {
  const c = quote.current;
  const cp = quote.changePercent;
  const ch = quote.change;
  return {
    id: quote.symbol.toLowerCase(),
    symbol: quote.symbol,
    label: quote.label || quote.symbol,
    value: c?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '—',
    change: cp >= 0 ? `+${cp?.toFixed(2)}%` : `${cp?.toFixed(2)}%`,
    delta: ch || 0,
    positive: (cp || 0) >= 0,
    high: quote.high?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '—',
    low: quote.low?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '—',
    vol: '—',
    data: genSpark(c || 100, (c || 100) * 0.01, 22, (cp || 0) >= 0),
    color: INDEX_COLORS[quote.symbol] || T.emerald,
    type: quote.type,
  };
}

const CHART_DATA = Array.from({ length: 48 }, (_, i) => {
  const h = (9 + Math.floor(i / 2)) % 24, m = i % 2 === 0 ? "00" : "30";
  return { t: `${h}:${m}`, price: 5750 + Math.sin(i * 0.4) * 80 + i * 2.1 + (Math.random() - 0.46) * 30 };
});

const DRASTIC_EVENTS = [
  { id: "fed1", severity: "CRITICAL", title: "Fed Emergency Rate Decision", icon: "🏦", color: T.red, market: "US Bonds / Equities", affected: "TLT, SPY, QQQ, DXY", impact: "-3.2% to -8.4% projected", action: "SELL BONDS — BUY PUTS", urgency: 9, description: "Fed chair signals emergency 75bps hike. Treasury yields spike to 5.8%. Equities facing severe correction risk. Crypto correlation high.", category: "MONETARY POLICY" },
  { id: "geo1", severity: "HIGH", title: "Taiwan Strait Flash-Point", icon: "⚠️", color: T.amber, market: "Tech / Semiconductors", affected: "TSM, NVDA, AAPL, INTC", impact: "-6.1% to -14% projected", action: "HEDGE SEMI EXPOSURE", urgency: 8, description: "PLA naval exercises escalate near Taiwan. TSMC supply chain risk now material. Semiconductor sector under extreme pressure.", category: "GEOPOLITICAL" },
  { id: "cyb1", severity: "HIGH", title: "Major Exchange Cyber Attack", icon: "🔐", color: T.purple, market: "Crypto / Fintech", affected: "BTC, ETH, COIN, HOOD", impact: "-9% to -22% projected", action: "EXIT CRYPTO POSITIONS", urgency: 8, description: "Coordinated attack on top 3 exchanges. $2.1B in assets frozen. SEC halts trading on 14 crypto ETFs. Flash crash risk imminent.", category: "CYBER SECURITY" },
  { id: "liq1", severity: "MODERATE", title: "Liquidity Crisis — Asia", icon: "💧", color: T.blue, market: "Asian Markets / FX", affected: "NKY, HSI, USDJPY, CNH", impact: "-2.8% to -5.1% projected", action: "REDUCE ASIA EXPOSURE", urgency: 6, description: "Yen carry-trade unwind accelerating. BOJ intervening at 155.40. Asian interbank rates spike 280bps overnight.", category: "LIQUIDITY" },
];

const NEWS_ITEMS = [
  { id: 1, headline: "Fed signals potential rate cut amid cooling inflation data", source: "Reuters", time: "2m ago", impact: "+18% Vol", sentiment: "bullish", score: 18 },
  { id: 2, headline: "NVIDIA surges 4.2% on record datacenter revenue forecast", source: "Bloomberg", time: "7m ago", impact: "+31% Vol", sentiment: "bullish", score: 31 },
  { id: 3, headline: "China manufacturing PMI contracts for third consecutive month", source: "FT", time: "15m ago", impact: "-22% Vol", sentiment: "bearish", score: -22 },
  { id: 4, headline: "Apple eyes $7B AI infrastructure investment in Southeast Asia", source: "WSJ", time: "28m ago", impact: "+12% Vol", sentiment: "bullish", score: 12 },
  { id: 5, headline: "Oil prices slip as OPEC+ signals production flexibility", source: "Axios", time: "41m ago", impact: "-9% Vol", sentiment: "neutral", score: -9 },
];

const STOCK_DATA = [
  { t: "9:30", price: 178.2, user: null, ai: null },
  { t: "10:00", price: 179.5, user: null, ai: null },
  { t: "10:30", price: 177.8, user: null, ai: null },
  { t: "11:00", price: 181.3, user: null, ai: null },
  { t: "11:30", price: 180.1, user: null, ai: null },
  { t: "12:00", price: 183.7, user: null, ai: null },
  { t: "12:30", price: 182.4, user: 183.0, ai: 184.5 },
  { t: "13:00", price: null, user: 185.5, ai: 186.2 },
  { t: "13:30", price: null, user: 187.2, ai: 185.8 },
  { t: "14:00", price: null, user: 190.0, ai: 187.1 },
];

const PORTFOLIO_DATA = [
  { name: "US Equities", value: 42, color: T.emerald },
  { name: "Crypto", value: 18, color: T.blue },
  { name: "Bonds", value: 22, color: T.purple },
  { name: "Commodities", value: 11, color: T.amber },
  { name: "Cash", value: 7, color: "#6b7280" },
];

const HOLDINGS = [
  { ticker: "AAPL", name: "Apple Inc", value: "$42,180", alloc: "14.8%", pnl: "+$8,340", up: true },
  { ticker: "MSFT", name: "Microsoft", value: "$38,500", alloc: "13.6%", pnl: "+$12,200", up: true },
  { ticker: "NVDA", name: "NVIDIA", value: "$28,900", alloc: "10.2%", pnl: "+$14,100", up: true },
  { ticker: "BTC", name: "Bitcoin", value: "$32,450", alloc: "11.4%", pnl: "+$9,800", up: true },
  { ticker: "TSLA", name: "Tesla", value: "$18,760", alloc: "6.6%", pnl: "-$2,340", up: false },
  { ticker: "GOOGL", name: "Alphabet", value: "$16,800", alloc: "5.9%", pnl: "+$3,100", up: true },
  { ticker: "TLT", name: "iShares 20Y Tsy", value: "$28,100", alloc: "9.9%", pnl: "-$1,200", up: false },
  { ticker: "GLD", name: "SPDR Gold", value: "$19,500", alloc: "6.9%", pnl: "+$2,700", up: true },
];

const BADGES = [
  { name: "Options Alpha", locked: false, color: T.emerald },
  { name: "Macro Thinker", locked: false, color: T.blue },
  { name: "Risk Analyst", locked: false, color: T.purple },
  { name: "Quant Level I", locked: true, color: "#6b7280" },
  { name: "DeFi Architect", locked: true, color: "#6b7280" },
];

const CHAT_INIT = [
  { role: "ai", text: "Good morning, Alex. Markets opened +0.8% today. Your tech holdings are outperforming the sector by 2.3%. Would you like a full portfolio brief?" },
  { role: "user", text: "Analyze the NVDA news impact on my tech holdings." },
  { role: "ai", text: "NVDA's datacenter beat directly boosts MSFT, AMD, and SMCI in your portfolio. Combined exposure is 23.4%. Expected alpha: +1.8% over next 48h based on historical correlation patterns. Recommend holding — do not chase." },
];

const AI_REPLIES = [
  "Analyzing your portfolio against current macro conditions... Your MSFT and GOOGL positions show strong resilience. Recommend trimming TSLA by 8% to reduce correlated tech risk.",
  "Fed rate cut probability stands at 73% for Q2. This historically favors growth equities and REITs. Your current allocation is 78% aligned with this scenario.",
  "Top opportunities today: 1) NVDA momentum continuation, 2) Energy sector mean-reversion play, 3) USD/JPY carry if BOJ holds. Risk-adjusted, #1 fits your profile best.",
  "Your risk score is elevated at 62/100 due to crypto overweight (18% vs recommended 12%) and concentrated tech exposure (38%). Consider rotating $8K of BTC into short-duration treasuries.",
];

const COURSES = [
  { icon: "💰", title: "Budgeting & Cash Flow", meta: "8 lessons · BEGINNER", pct: 100, color: T.emerald, status: "DONE" },
  { icon: "📈", title: "Stock Market Fundamentals", meta: "12 lessons · BEGINNER", pct: 100, color: T.emerald, status: "100%" },
  { icon: "⚖️", title: "Risk Management & Volatility", meta: "10 lessons · INTERMEDIATE", pct: 74, color: T.purple, status: "74%", active: true },
  { icon: "🏦", title: "Options & Derivatives", meta: "14 lessons · ADVANCED", pct: 0, color: T.textDim, status: "0%", locked: true },
  { icon: "🌍", title: "Macro Economics & Global Markets", meta: "16 lessons · ADVANCED", pct: 0, color: T.textDim, status: "0%", locked: true },
];

// ─────────────────────────────────────────────────────────────────────────────
// ASSESSMENT DATA
// ─────────────────────────────────────────────────────────────────────────────
const ASSESSMENT_SCENARIOS = [
  {
    id: 1,
    category: "MACRO ECONOMICS",
    difficulty: "INTERMEDIATE",
    diffColor: "#f59e0b",
    asset: "S&P 500",
    ticker: "SPX",
    context: "The Federal Reserve has just released FOMC minutes signaling a 25bps rate cut in the next meeting. Core CPI came in at 2.8% (below 3.0% forecast). Unemployment ticked up to 4.2%. Tech sector earnings have been broadly beating estimates by ~12%.",
    chartData: Array.from({ length: 20 }, (_, i) => ({ t: `Day ${i + 1}`, price: 5800 + Math.sin(i * 0.5) * 60 + i * 8 + (Math.random() - 0.45) * 25 })),
    aiPrediction: "BULLISH",
    aiTarget: "+2.8%",
    aiConfidence: 81,
    aiReasoning: "Rate cut signal + CPI beat = risk-on environment. Historical back-test: 78% of similar macro setups produced positive 5-day returns averaging +2.4%. Tech earnings momentum provides additional tailwind. Key risk: labor market softness could accelerate recession fears if next payroll disappoints.",
    correctDirection: "BULLISH",
    correctTarget: "+2.1% to +3.4%",
    conceptTaught: "Monetary policy easing typically benefits equities via lower discount rates and improved corporate borrowing conditions.",
    xpReward: 120,
    tags: ["Fed Policy", "CPI", "Rate Sensitivity", "Growth Stocks"],
  },
  {
    id: 2,
    category: "TECHNICAL ANALYSIS",
    difficulty: "ADVANCED",
    diffColor: "#ef4444",
    asset: "Bitcoin",
    ticker: "BTC/USD",
    context: "BTC broke below its 200-day moving average (currently at $58,400) on above-average volume (2.3× daily avg). RSI is at 38 — approaching oversold. A bearish engulfing candle formed on the weekly chart. On-chain data shows long-term holders (1yr+) beginning to distribute. Exchange inflows spiked 340% in 24h.",
    chartData: Array.from({ length: 20 }, (_, i) => ({ t: `Day ${i + 1}`, price: 62000 - i * 400 + Math.sin(i * 0.8) * 800 + (Math.random() - 0.5) * 500 })),
    aiPrediction: "BEARISH",
    aiTarget: "-8.4%",
    aiConfidence: 74,
    aiReasoning: "200DMA breach with volume confirmation is a strong bearish technical signal. Long-term holder distribution combined with exchange inflow surge indicates profit-taking at scale. RSI at 38 suggests room to fall further before reaching classic oversold territory (30). Target zone: $52,000–$55,000.",
    correctDirection: "BEARISH",
    correctTarget: "-6% to -12%",
    conceptTaught: "Breaking key moving averages on high volume, combined with on-chain distribution signals, is a high-conviction bearish setup in crypto markets.",
    xpReward: 180,
    tags: ["200DMA", "RSI", "On-Chain", "Volume Analysis"],
  },
  {
    id: 3,
    category: "SECTOR ROTATION",
    difficulty: "INTERMEDIATE",
    diffColor: "#f59e0b",
    asset: "Energy Sector ETF",
    ticker: "XLE",
    context: "OPEC+ announced a surprise 800k bbl/day production cut effective next month. WTI crude jumped 4.1% intraday. The broader market (SPX) is flat to slightly negative. The 10Y Treasury yield is rising (+8bps today). Inflation expectations (5Y breakeven) moved up 12bps. Energy sector has underperformed for 3 consecutive quarters.",
    chartData: Array.from({ length: 20 }, (_, i) => ({ t: `Day ${i + 1}`, price: 88 + i * 0.6 + Math.sin(i * 0.6) * 2.2 + (Math.random() - 0.4) * 1.5 })),
    aiPrediction: "BULLISH",
    aiTarget: "+5.2%",
    aiConfidence: 88,
    aiReasoning: "Supply shock from OPEC+ cut directly benefits upstream energy producers. Rising yields and inflation expectations signal commodity-friendly macro environment. Sector rotation from growth to value/energy expected. Mean-reversion opportunity after 3Q underperformance adds to conviction.",
    correctDirection: "BULLISH",
    correctTarget: "+4% to +7%",
    conceptTaught: "Sector rotation into energy accelerates during supply shocks. Rising inflation expectations + supply cuts = powerful dual catalyst for energy equities.",
    xpReward: 120,
    tags: ["OPEC+", "Supply Shock", "Sector Rotation", "Commodities"],
  },
  {
    id: 4,
    category: "EARNINGS ANALYSIS",
    difficulty: "BEGINNER",
    diffColor: "#10b981",
    asset: "NVIDIA Corp",
    ticker: "NVDA",
    context: "NVDA reported Q3 earnings: EPS of $4.02 vs $3.37 estimate (+19% beat). Revenue $18.1B vs $16.2B estimate (+11.7% beat). Data Center revenue +112% YoY. Gross margin expanded to 74.6% (guide was 72%). CEO guided Q4 revenue to $20B vs $17.8B consensus. However, the stock has already rallied 22% in the 30 days before the report.",
    chartData: Array.from({ length: 20 }, (_, i) => ({ t: `Day ${i + 1}`, price: 480 + (i < 10 ? i * 4 : (i === 10 ? 80 : 80 - (i - 10) * 3)) + (Math.random() - 0.5) * 8 })),
    aiPrediction: "NEUTRAL",
    aiTarget: "-1.2% to +3%",
    aiConfidence: 62,
    aiReasoning: "Classic 'buy the rumor, sell the news' dynamic. Beat was exceptional but 22% pre-earnings rally suggests expectations were already priced in. Short-term volatility likely. Long-term thesis intact — accumulate on any pullback below $460. Options market implies ±8% move.",
    correctDirection: "NEUTRAL/VOLATILE",
    correctTarget: "High volatility range",
    conceptTaught: "'Buy the rumor, sell the news' — when a stock rallies significantly before earnings, even strong beats can trigger profit-taking as expectations get fully priced in.",
    xpReward: 80,
    tags: ["Earnings Beat", "Priced In", "Options Volatility", "Guidance"],
  },
  {
    id: 5,
    category: "RISK MANAGEMENT",
    difficulty: "ADVANCED",
    diffColor: "#ef4444",
    asset: "EUR/USD",
    ticker: "EURUSD",
    context: "ECB left rates unchanged (as expected) but the statement language shifted from 'restrictive' to 'data-dependent' — a subtle dovish pivot. Meanwhile, US Non-Farm Payrolls beat +287K vs +215K estimate. USD strengthened immediately +0.8%. The euro had been in a 3-week consolidation range of 1.0820–1.0940. A clean break below 1.0820 just occurred on the NFP release.",
    chartData: Array.from({ length: 20 }, (_, i) => ({ t: `Day ${i + 1}`, price: 1.0900 - i * 0.002 + Math.sin(i * 0.7) * 0.004 + (Math.random() - 0.5) * 0.003 })),
    aiPrediction: "BEARISH",
    aiTarget: "-1.6%",
    aiConfidence: 79,
    aiReasoning: "Dual catalyst: ECB dovish shift + NFP beat = USD dominance. Range breakdown below 1.0820 is a technical confirmation of the fundamental move. Next support: 1.0680 (38.2% Fib from 2023 low). Risk: US CPI print next week could reverse if below expectations. Stop-loss above 1.0850 for any short position.",
    correctDirection: "BEARISH",
    correctTarget: "-1.2% to -2%",
    conceptTaught: "In forex, the combination of a hawkish fundamental shift in one currency and a dovish shift in the counterpart creates amplified directional momentum — especially when confirmed by a technical range break.",
    xpReward: 180,
    tags: ["ECB", "NFP", "Range Breakout", "Fibonacci", "Forex"],
  },
];

const SKILL_DIMENSIONS = [
  { key: "macro", label: "Macro Analysis", color: "#10b981", icon: "🌍" },
  { key: "technical", label: "Technical Analysis", color: "#3b82f6", icon: "📊" },
  { key: "risk", label: "Risk Management", color: "#ef4444", icon: "🛡️" },
  { key: "sector", label: "Sector Rotation", color: "#f59e0b", icon: "🔄" },
  { key: "earnings", label: "Earnings Reading", color: "#8b5cf6", icon: "📈" },
];

// ─────────────────────────────────────────────────────────────────────────────
// HOOKS + PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
}

function Reveal({ children, delay = 0, style = {} }) {
  const [ref, vis] = useInView();
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0) scale(1)" : "translateY(24px) scale(0.98)",
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      height: "100%",
      ...style,
    }}>
      {children}
    </div>
  );
}

function GlassCard({ children, style = {}, accentColor = T.emerald, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: T.bgCard, border: `1px solid ${T.border}`,
        borderRadius: 20, backdropFilter: "blur(12px)",
        position: "relative", overflow: "hidden",
        transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease, border-color 0.3s ease",
        transform: hov ? "translateY(-4px) scale(1.006)" : "translateY(0) scale(1)",
        boxShadow: hov ? `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${accentColor}22` : "0 4px 24px rgba(0,0,0,0.3)",
        borderColor: hov ? `${accentColor}44` : T.border,
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}>
      {hov && <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(600px circle at 50% 0%, ${accentColor}07, transparent 60%)`, borderRadius: "inherit" }} />}
      {children}
    </div>
  );
}

function LiveDot({ color = T.emerald, size = 6 }) {
  return <span style={{ width: size, height: size, borderRadius: "50%", background: color, display: "inline-block", animation: "pulse 1.5s infinite" }} />;
}

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "rgba(10,10,12,0.9)", border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 11 }}>
      <div style={{ color: T.textMid, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.stroke || p.color, display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.stroke || p.color, display: "inline-block" }} />
          <span>{p.name}: {typeof p.value === "number" ? (p.value > 1000 ? p.value.toFixed(0) : p.value.toFixed(2)) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DRASTIC ALERT OVERLAY (from markets_alert.js)
// ─────────────────────────────────────────────────────────────────────────────
function DrasticAlertOverlay({ event: ev, onDismiss }) {
  const [expanded, setExpanded] = useState(false);
  const [exiting, setExiting] = useState(false);
  const isCritical = ev.urgency >= 8;

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(onDismiss, 280);
  };

  // Mirror the 7s auto-dismiss with an exit animation at ~6.7s
  useEffect(() => {
    const t = setTimeout(() => setExiting(true), 6700);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      width: expanded ? 360 : 300, fontFamily: T.font,
      animation: exiting ? "slideOutRight 0.3s ease forwards" : "slideInRight 0.45s cubic-bezier(0.16,1,0.3,1)",
      filter: `drop-shadow(0 0 ${isCritical ? 20 : 10}px ${ev.color}44)`,
    }}>
      <div style={{
        background: "rgba(12,12,14,0.96)", borderRadius: 14,
        border: `1px solid ${ev.color}55`,
        backdropFilter: "blur(24px)",
        animation: isCritical ? `flashBorder 1.8s ease infinite` : "none",
        overflow: "hidden",
      }}>
        {/* 7-second countdown drain bar at top */}
        <div style={{ height: 2, background: "rgba(255,255,255,0.06)", position: "relative", overflow: "hidden" }}>
          <div style={{
            position: "absolute", top: 0, left: 0, height: "100%",
            background: `linear-gradient(90deg, ${ev.color}, ${ev.color}88)`,
            animation: "timerDrain 7s linear forwards",
            boxShadow: `0 0 6px ${ev.color}`,
          }} />
        </div>

        {/* Header */}
        <div style={{ padding: "12px 14px 10px", background: `linear-gradient(135deg, ${ev.color}12, transparent)`, borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18, animation: "iconPulse 2s ease infinite", color: ev.color }}>{ev.icon}</span>
              <div>
                <div style={{ fontSize: 8, letterSpacing: "0.14em", color: ev.color, fontWeight: 700 }}>{ev.severity} ALERT · {ev.category}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.text, lineHeight: 1.3, marginTop: 1 }}>{ev.title}</div>
              </div>
            </div>
            <button onClick={handleDismiss} style={{ background: "none", border: "none", color: T.textMid, cursor: "pointer", padding: 4, borderRadius: 6, flexShrink: 0 }}>
              <IcoX size={12} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "12px 14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
            {[
              { label: "MARKET", val: ev.market },
              { label: "IMPACT", val: ev.impact, color: ev.color },
              { label: "AFFECTED", val: ev.affected },
              { label: "ACTION", val: ev.action, color: T.amber },
            ].map(r => (
              <div key={r.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "7px 9px", border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 7, color: T.textDim, letterSpacing: "0.1em", marginBottom: 3 }}>{r.label}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: r.color || T.text, letterSpacing: "0.04em", lineHeight: 1.3 }}>{r.val}</div>
              </div>
            ))}
          </div>

          {expanded && (
            <div style={{ fontSize: 10, color: "#aaa", lineHeight: 1.7, marginBottom: 10, padding: "10px", background: "rgba(255,255,255,0.02)", borderRadius: 8, border: `1px solid ${T.border}`, animation: "fadeIn 0.3s ease" }}>
              {ev.description}
            </div>
          )}

          <div style={{ display: "flex", gap: 6, justifyContent: "space-between", alignItems: "center" }}>
            <button onClick={() => setExpanded(!expanded)} style={{
              fontSize: 9, letterSpacing: "0.1em", padding: "6px 12px", borderRadius: 8,
              background: `${ev.color}15`, border: `1px solid ${ev.color}40`, color: ev.color,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
            }}>
              <IcoInfo size={11} /> {expanded ? "COLLAPSE" : "DETAILS"}
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ display: "flex", gap: 3 }}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} style={{ width: 4, height: i < ev.urgency ? 14 : 6, borderRadius: 2, background: i < ev.urgency ? ev.color : T.border, opacity: i < ev.urgency ? 0.8 + (i * 0.02) : 0.3 }} />
                ))}
              </div>
              <span style={{ fontSize: 8, color: T.textDim }}>{ev.urgency}/10</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ASSESSMENT PAGE — User vs AI Prediction Self-Assessment
// ─────────────────────────────────────────────────────────────────────────────
function RadarChart({ scores }) {
  const dims = SKILL_DIMENSIONS;
  const cx = 110, cy = 110, r = 80;
  const pts = dims.map((_, i) => {
    const angle = (i / dims.length) * Math.PI * 2 - Math.PI / 2;
    const val = (scores[dims[i].key] || 0) / 100;
    return { x: cx + Math.cos(angle) * r * val, y: cy + Math.sin(angle) * r * val, ax: cx + Math.cos(angle) * (r + 22), ay: cy + Math.sin(angle) * (r + 22) };
  });
  const gridLevels = [0.25, 0.5, 0.75, 1];
  return (
    <svg width={220} height={220} style={{ overflow: "visible" }}>
      {/* Grid rings */}
      {gridLevels.map(level => {
        const gpts = dims.map((_, i) => {
          const angle = (i / dims.length) * Math.PI * 2 - Math.PI / 2;
          return `${cx + Math.cos(angle) * r * level},${cy + Math.sin(angle) * r * level}`;
        }).join(" ");
        return <polygon key={level} points={gpts} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />;
      })}
      {/* Spokes */}
      {dims.map((_, i) => {
        const angle = (i / dims.length) * Math.PI * 2 - Math.PI / 2;
        return <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(angle) * r} y2={cy + Math.sin(angle) * r} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />;
      })}
      {/* Score polygon */}
      <polygon points={pts.map(p => `${p.x},${p.y}`).join(" ")} fill="rgba(16,185,129,0.12)" stroke="#10b981" strokeWidth="1.5" />
      {/* Score dots */}
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={3} fill={dims[i].color} />)}
      {/* Axis labels */}
      {pts.map((p, i) => (
        <text key={i} x={p.ax} y={p.ay} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 8, fill: dims[i].color, fontFamily: "'Space Mono', monospace", letterSpacing: "0.08em" }}>
          {dims[i].icon}
        </text>
      ))}
    </svg>
  );
}


function ScenarioCard({ scenario, onSubmit, submitted, userAnswer, result }) {
  const [direction, setDirection] = useState(null);
  const [confidence, setConfidence] = useState(50);
  const [rationale, setRationale] = useState("");
  const [showAI, setShowAI] = useState(false);
  const [phase, setPhase] = useState("predict"); // predict | reveal

  const directions = [
    { key: "BULLISH", label: "BULLISH", color: "#10b981", icon: "▲" },
    { key: "BEARISH", label: "BEARISH", color: "#ef4444", icon: "▼" },
    { key: "NEUTRAL", label: "NEUTRAL", color: "#f59e0b", icon: "■" },
    { key: "NEUTRAL/VOLATILE", label: "VOLATILE", color: "#8b5cf6", icon: "⚡" },
  ];

  const handleSubmit = () => {
    if (!direction) return;
    onSubmit({ direction, confidence, rationale });
    setPhase("reveal");
  };

  const isCorrect = direction === scenario.correctDirection || (scenario.correctDirection.includes(direction));
  const accuracyDelta = Math.abs(confidence - scenario.aiConfidence);
  const score = isCorrect ? Math.max(40, 100 - accuracyDelta * 0.5) : Math.max(0, 30 - accuracyDelta * 0.3);

  const diffColors = { BEGINNER: T.emerald, INTERMEDIATE: T.amber, ADVANCED: T.red };

  return (
    <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 20, overflow: "hidden" }}>
      {/* Scenario header */}
      <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${T.border}`, background: `linear-gradient(135deg, rgba(16,185,129,0.05), rgba(59,130,246,0.03))` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 8, letterSpacing: "0.14em", padding: "3px 9px", borderRadius: 5, background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)", color: T.blue }}>{scenario.category}</span>
            <span style={{ fontSize: 8, letterSpacing: "0.14em", padding: "3px 9px", borderRadius: 5, background: `${diffColors[scenario.difficulty]}15`, border: `1px solid ${diffColors[scenario.difficulty]}40`, color: diffColors[scenario.difficulty] }}>{scenario.difficulty}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 9, color: T.amber }}>
            <IcoFlame size={12} color={T.amber} /> +{scenario.xpReward} XP
          </div>
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, fontFamily: T.fontDisp, color: T.text, marginBottom: 2 }}>{scenario.asset}</div>
        <div style={{ fontSize: 10, color: T.textMid, letterSpacing: "0.08em" }}>{scenario.ticker}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 0 }}>
        {/* Left: context + prediction */}
        <div style={{ padding: "20px 24px", borderRight: `1px solid ${T.border}` }}>
          {/* Market context */}
          <div style={{ fontSize: 8, letterSpacing: "0.14em", color: T.textDim, marginBottom: 8 }}>MARKET CONTEXT</div>
          <p style={{ fontSize: 11, color: "#bbb", lineHeight: 1.8, marginBottom: 20, padding: "14px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 10, border: `1px solid ${T.border}` }}>
            {scenario.context}
          </p>

          {/* Tags */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
            {scenario.tags.map(tag => (
              <span key={tag} style={{ fontSize: 8, padding: "2px 8px", borderRadius: 20, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`, color: T.textMid }}>{tag}</span>
            ))}
          </div>

          {phase === "predict" ? (
            <>
              {/* Direction picker */}
              <div style={{ fontSize: 8, letterSpacing: "0.14em", color: T.textDim, marginBottom: 10 }}>YOUR PREDICTION — DIRECTION</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 20 }}>
                {directions.map(d => (
                  <button key={d.key} onClick={() => setDirection(d.key)} style={{
                    padding: "10px 6px", borderRadius: 10, cursor: "pointer", fontFamily: T.font,
                    background: direction === d.key ? `${d.color}18` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${direction === d.key ? d.color + "66" : T.border}`,
                    color: direction === d.key ? d.color : T.textDim,
                    fontSize: 9, letterSpacing: "0.1em", transition: "all 0.2s",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                    boxShadow: direction === d.key ? `0 0 16px ${d.color}22` : "none",
                  }}>
                    <span style={{ fontSize: 16 }}>{d.icon}</span>
                    {d.label}
                  </button>
                ))}
              </div>

              {/* Confidence slider */}
              <div style={{ fontSize: 8, letterSpacing: "0.14em", color: T.textDim, marginBottom: 8 }}>CONFIDENCE LEVEL — {confidence}%</div>
              <div style={{ position: "relative", marginBottom: 20 }}>
                <input type="range" min={10} max={99} value={confidence} onChange={e => setConfidence(+e.target.value)}
                  style={{ width: "100%", accentColor: T.emerald, cursor: "pointer", height: 6 }} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 8, color: T.textDim }}>
                  <span>LOW CONVICTION</span><span>HIGH CONVICTION</span>
                </div>
              </div>

              {/* Rationale */}
              <div style={{ fontSize: 8, letterSpacing: "0.14em", color: T.textDim, marginBottom: 8 }}>YOUR RATIONALE <span style={{ color: "#333" }}>(optional)</span></div>
              <textarea value={rationale} onChange={e => setRationale(e.target.value)}
                placeholder="Explain your reasoning... What signals drove your decision?"
                style={{ width: "100%", minHeight: 72, padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`, color: T.text, fontSize: 10, outline: "none", fontFamily: T.font, resize: "vertical", lineHeight: 1.6 }}
                onFocus={e => e.target.style.borderColor = "rgba(16,185,129,0.4)"}
                onBlur={e => e.target.style.borderColor = T.border}
              />

              <button onClick={handleSubmit} disabled={!direction} style={{
                marginTop: 16, width: "100%", padding: "13px", borderRadius: 12,
                background: direction ? `linear-gradient(135deg,${T.emerald},${T.emeraldDk})` : "rgba(255,255,255,0.05)",
                border: "none", color: direction ? "#000" : T.textDim,
                fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", cursor: direction ? "pointer" : "not-allowed",
                fontFamily: T.font, transition: "all 0.2s",
                boxShadow: direction ? `0 0 24px ${T.emerald}33` : "none",
              }}>
                LOCK IN PREDICTION →
              </button>
            </>
          ) : (
            /* REVEAL PHASE */
            <div style={{ animation: "fadeInUp 0.5s ease" }}>
              {/* Score banner */}
              <div style={{
                padding: "16px 20px", borderRadius: 14, marginBottom: 16,
                background: isCorrect ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.08)",
                border: `1px solid ${isCorrect ? T.emerald + "44" : T.red + "44"}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: "0.12em", color: isCorrect ? T.emerald : T.red, marginBottom: 4 }}>
                    {isCorrect ? "✓ CORRECT DIRECTION" : "✗ DIRECTION MISSED"}
                  </div>
                  <div style={{ fontSize: 11, color: "#bbb" }}>
                    Your call: <strong style={{ color: direction === "BULLISH" ? T.emerald : direction === "BEARISH" ? T.red : T.amber }}>{direction}</strong>
                    {" · "} Correct: <strong style={{ color: T.emerald }}>{scenario.correctDirection}</strong>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, fontFamily: T.fontDisp, color: isCorrect ? T.emerald : T.amber }}>+{Math.round(score)}</div>
                  <div style={{ fontSize: 8, color: T.textDim, letterSpacing: "0.1em" }}>POINTS EARNED</div>
                </div>
              </div>

              {/* Concept taught */}
              <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)", marginBottom: 12 }}>
                <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.blue, marginBottom: 6 }}>💡 KEY CONCEPT</div>
                <p style={{ fontSize: 11, color: "#bbb", lineHeight: 1.7, margin: 0 }}>{scenario.conceptTaught}</p>
              </div>

              {/* Target range */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 8, color: T.textDim, letterSpacing: "0.1em", marginBottom: 4 }}>YOUR CONFIDENCE</div>
                  <div style={{ fontSize: 18, fontWeight: 700, fontFamily: T.fontDisp, color: confidence > 70 ? T.emerald : T.amber }}>{confidence}%</div>
                </div>
                <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 8, color: T.textDim, letterSpacing: "0.1em", marginBottom: 4 }}>AI CONFIDENCE</div>
                  <div style={{ fontSize: 18, fontWeight: 700, fontFamily: T.fontDisp, color: T.blue }}>{scenario.aiConfidence}%</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: chart + AI prediction */}
        <div style={{ padding: "20px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Mini price chart */}
          <div>
            <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.textDim, marginBottom: 8 }}>PRICE ACTION (20 DAYS)</div>
            <div style={{ height: 110 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scenario.chartData} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
                  <defs>
                    <linearGradient id={`grad-${scenario.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={T.emerald} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={T.emerald} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="t" tick={{ fontSize: 7, fill: T.textDim, fontFamily: T.font }} axisLine={false} tickLine={false} interval={4} />
                  <YAxis tick={{ fontSize: 7, fill: T.textDim, fontFamily: T.font }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                  <Tooltip content={<ChartTip />} />
                  <Area type="monotone" dataKey="price" name={scenario.ticker} stroke={T.emerald} strokeWidth={1.5} fill={`url(#grad-${scenario.id})`} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Prediction — always visible after submit, hidden before */}
          {(phase === "reveal" || showAI) ? (
            <div style={{ flex: 1, padding: "14px", background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, animation: "fadeInUp 0.4s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: `linear-gradient(135deg,${T.emerald},${T.emeraldDk})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>⚡</div>
                <span style={{ fontSize: 9, letterSpacing: "0.12em", color: T.emerald }}>NEXUS AI VERDICT</span>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <div style={{ padding: "6px 12px", borderRadius: 8, background: scenario.aiPrediction === "BULLISH" ? "rgba(16,185,129,0.15)" : scenario.aiPrediction === "BEARISH" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)", border: `1px solid ${scenario.aiPrediction === "BULLISH" ? T.emerald : scenario.aiPrediction === "BEARISH" ? T.red : T.amber}44`, color: scenario.aiPrediction === "BULLISH" ? T.emerald : scenario.aiPrediction === "BEARISH" ? T.red : T.amber, fontSize: 10, fontWeight: 700 }}>
                  {scenario.aiPrediction}
                </div>
                <div style={{ padding: "6px 10px", borderRadius: 8, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", color: T.blue, fontSize: 10, fontWeight: 700 }}>
                  {scenario.aiTarget}
                </div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: T.textDim, marginBottom: 4 }}>
                  <span>AI CONFIDENCE</span><span style={{ color: T.blue }}>{scenario.aiConfidence}%</span>
                </div>
                <div style={{ height: 4, borderRadius: 100, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${scenario.aiConfidence}%`, borderRadius: 100, background: `linear-gradient(90deg,${T.blue},#60a5fa)` }} />
                </div>
              </div>
              <p style={{ fontSize: 10, color: "#999", lineHeight: 1.65, margin: 0 }}>{scenario.aiReasoning}</p>
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: "20px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: `1px dashed ${T.border}`, cursor: "pointer" }} onClick={() => setShowAI(true)}>
              <IcoLock size={20} color={T.textDim} />
              <div style={{ fontSize: 9, letterSpacing: "0.12em", color: T.textDim, textAlign: "center", lineHeight: 1.6 }}>AI VERDICT HIDDEN<br /><span style={{ color: "#333" }}>Make your prediction first<br />or click to peek</span></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AssessmentPage() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [results, setResults] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [activeScenarioPhase, setActiveScenarioPhase] = useState("predict");
  const [userAnswers, setUserAnswers] = useState({});
  const topRef = useRef(null);

  const scenario = ASSESSMENT_SCENARIOS[currentIdx];

  const handleSubmit = (answer) => {
    const newAnswers = { ...userAnswers, [scenario.id]: answer };
    setUserAnswers(newAnswers);
    setActiveScenarioPhase("reveal");
  };

  const handleNext = () => {
    if (currentIdx + 1 >= ASSESSMENT_SCENARIOS.length) {
      // Calculate final results
      const finalResults = ASSESSMENT_SCENARIOS.map(s => {
        const ans = userAnswers[s.id];
        if (!ans) return { scenarioId: s.id, correct: false, score: 0, category: s.category };
        const correct = ans.direction === s.correctDirection || s.correctDirection.includes(ans.direction);
        const score = correct ? Math.max(40, 100 - Math.abs(ans.confidence - s.aiConfidence) * 0.5) : 20;
        return { scenarioId: s.id, correct, score, category: s.category, confidence: ans.confidence };
      });
      setResults(finalResults);
      setCompleted(true);
    } else {
      setCurrentIdx(i => i + 1);
      setActiveScenarioPhase("predict");
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setResults([]);
    setCompleted(false);
    setActiveScenarioPhase("predict");
    setUserAnswers({});
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Compute radar scores from results
  const radarScores = SKILL_DIMENSIONS.reduce((acc, dim) => {
    const relevant = results.filter(r => {
      const s = ASSESSMENT_SCENARIOS.find(sc => sc.id === r.scenarioId);
      return s && s.category.toLowerCase().includes(dim.key.toLowerCase().replace("2", ""));
    });
    const score = relevant.length > 0 ? Math.round(relevant.reduce((sum, r) => sum + r.score, 0) / relevant.length) : 50;
    acc[dim.key] = score;
    return acc;
  }, {});
  // Fill empties with partial scores
  SKILL_DIMENSIONS.forEach(d => { if (!radarScores[d.key]) radarScores[d.key] = 45 + Math.random() * 30; });

  const totalXP = results.reduce((sum, r) => {
    const s = ASSESSMENT_SCENARIOS.find(sc => sc.id === r.scenarioId);
    return sum + (r.correct ? s?.xpReward || 0 : Math.round((s?.xpReward || 0) * 0.25));
  }, 0);
  const accuracy = results.length > 0 ? Math.round(results.filter(r => r.correct).length / results.length * 100) : 0;
  const avgConfidence = results.length > 0 ? Math.round(results.reduce((s, r) => s + (r.confidence || 50), 0) / results.length) : 0;
  const avgAIConf = Math.round(ASSESSMENT_SCENARIOS.reduce((s, sc) => s + sc.aiConfidence, 0) / ASSESSMENT_SCENARIOS.length);
  const overallScore = results.length > 0 ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length) : 0;

  const getGrade = (score) => {
    if (score >= 85) return { grade: "S", label: "QUANT ANALYST", color: "#10b981" };
    if (score >= 70) return { grade: "A", label: "MARKET STRATEGIST", color: "#3b82f6" };
    if (score >= 55) return { grade: "B", label: "MACRO ANALYST", color: "#8b5cf6" };
    if (score >= 40) return { grade: "C", label: "JUNIOR TRADER", color: "#f59e0b" };
    return { grade: "D", label: "APPRENTICE", color: "#ef4444" };
  };
  const { grade, label, color: gradeColor } = getGrade(overallScore);

  return (
    <div ref={topRef} style={{ paddingTop: 80, maxWidth: 1200, margin: "0 auto", padding: "80px 40px 60px", fontFamily: T.font }}>

      {/* Page header */}
      <Reveal>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: T.emerald }}>SELF-ASSESSMENT</div>
            <span style={{ fontSize: 9, color: T.textDim }}>·</span>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: T.textDim }}>USER VS AI PREDICTION ARENA</div>
          </div>
          <h1 style={{ fontSize: "clamp(28px,4vw,52px)", fontWeight: 800, letterSpacing: "-0.02em", fontFamily: T.fontDisp, marginBottom: 10, color: T.text }}>
            Predict Like a{" "}<span style={{ color: T.emerald }}>Professional.</span>
          </h1>
          <p style={{ fontSize: 13, color: T.textMid, maxWidth: 600, lineHeight: 1.8 }}>
            Test your market analysis skills against Nexus AI across 5 real-world scenarios. Each challenge is scored on direction accuracy, confidence calibration, and reasoning quality.
          </p>
        </div>
      </Reveal>

      {/* Progress bar + stats strip */}
      {!completed && (
        <Reveal delay={0.05}>
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: "16px 22px", marginBottom: 24, display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: T.textDim, letterSpacing: "0.1em", marginBottom: 6 }}>
                <span>SCENARIO {currentIdx + 1} OF {ASSESSMENT_SCENARIOS.length}</span>
                <span style={{ color: T.emerald }}>{Math.round(((currentIdx + (activeScenarioPhase === "reveal" ? 1 : 0)) / ASSESSMENT_SCENARIOS.length) * 100)}% COMPLETE</span>
              </div>
              <div style={{ height: 6, borderRadius: 100, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 100, background: `linear-gradient(90deg,${T.emerald},${T.blue})`, width: `${((currentIdx + (activeScenarioPhase === "reveal" ? 1 : 0)) / ASSESSMENT_SCENARIOS.length) * 100}%`, transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)", boxShadow: `0 0 10px ${T.emerald}44` }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 20, flexShrink: 0 }}>
              {[
                { label: "CORRECT", val: Object.values(userAnswers).filter((a, i) => { const s = ASSESSMENT_SCENARIOS[i]; return s && (a.direction === s.correctDirection || s.correctDirection.includes(a.direction)); }).length, color: T.emerald },
                { label: "XP EARNED", val: Object.values(userAnswers).reduce((sum, a, i) => { const s = ASSESSMENT_SCENARIOS[i]; if (!s) return sum; const correct = a.direction === s.correctDirection || s.correctDirection.includes(a.direction); return sum + (correct ? s.xpReward : Math.round(s.xpReward * 0.25)); }, 0), color: T.amber },
              ].map(st => (
                <div key={st.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, fontFamily: T.fontDisp, color: st.color }}>{st.val}</div>
                  <div style={{ fontSize: 7, letterSpacing: "0.12em", color: T.textDim }}>{st.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {/* Scenario thumbnails nav */}
      {!completed && (
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {ASSESSMENT_SCENARIOS.map((s, i) => {
            const isAnswered = !!userAnswers[s.id];
            const isCurrent = i === currentIdx;
            const isLocked = i > currentIdx && !isAnswered;
            return (
              <div key={s.id} style={{ flex: 1, padding: "10px 12px", borderRadius: 12, border: `1px solid ${isCurrent ? T.emerald + "66" : isAnswered ? T.blue + "44" : T.border}`, background: isCurrent ? "rgba(16,185,129,0.08)" : isAnswered ? "rgba(59,130,246,0.06)" : "rgba(255,255,255,0.02)", cursor: isLocked ? "not-allowed" : "pointer", opacity: isLocked ? 0.4 : 1, transition: "all 0.2s" }}
                onClick={() => { if (!isLocked) { setCurrentIdx(i); setActiveScenarioPhase(isAnswered ? "reveal" : "predict"); } }}>
                <div style={{ fontSize: 7, letterSpacing: "0.1em", color: isCurrent ? T.emerald : isAnswered ? T.blue : T.textDim, marginBottom: 2 }}>#{i + 1}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: T.text, fontFamily: T.fontDisp, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.asset}</div>
                <div style={{ fontSize: 7, color: T.textDim }}>{s.category}</div>
                {isAnswered && <div style={{ marginTop: 4, width: 16, height: 3, borderRadius: 2, background: T.emerald }} />}
              </div>
            );
          })}
        </div>
      )}

      {/* Main scenario or results */}
      {!completed ? (
        <div style={{ animation: "fadeInUp 0.4s ease" }}>
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            onSubmit={handleSubmit}
            submitted={!!userAnswers[scenario.id]}
            userAnswer={userAnswers[scenario.id]}
            phase={activeScenarioPhase}
          />

          {activeScenarioPhase === "reveal" && (
            <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", animation: "fadeInUp 0.3s ease" }}>
              <button onClick={handleNext} style={{ padding: "13px 32px", borderRadius: 12, background: `linear-gradient(135deg,${T.emerald},${T.emeraldDk})`, border: "none", color: "#000", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", cursor: "pointer", fontFamily: T.font, boxShadow: `0 0 24px ${T.emerald}44` }}>
                {currentIdx + 1 >= ASSESSMENT_SCENARIOS.length ? "VIEW RESULTS →" : "NEXT SCENARIO →"}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ── RESULTS SCREEN ── */
        <div style={{ animation: "fadeInUp 0.5s ease" }}>
          {/* Big score card */}
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 24, padding: "36px 40px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: `radial-gradient(circle,${gradeColor}12,transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 40, alignItems: "center" }}>
              {/* Grade */}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 72, fontWeight: 900, fontFamily: T.fontDisp, color: gradeColor, lineHeight: 1, textShadow: `0 0 40px ${gradeColor}66` }}>{grade}</div>
                <div style={{ fontSize: 9, letterSpacing: "0.14em", color: T.textDim, marginTop: 6 }}>ASSESSMENT GRADE</div>
                <div style={{ marginTop: 8, padding: "4px 12px", borderRadius: 20, background: `${gradeColor}15`, border: `1px solid ${gradeColor}40`, fontSize: 9, fontWeight: 700, color: gradeColor, letterSpacing: "0.1em", display: "inline-block" }}>{label}</div>
              </div>

              {/* Stats */}
              <div>
                <div style={{ fontSize: 14, color: T.textMid, letterSpacing: "0.1em", marginBottom: 4 }}>ASSESSMENT COMPLETE</div>
                <div style={{ fontSize: 32, fontWeight: 800, fontFamily: T.fontDisp, color: T.text, marginBottom: 16 }}>
                  Overall Score: <span style={{ color: gradeColor }}>{overallScore}/100</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                  {[
                    { label: "ACCURACY", val: `${accuracy}%`, color: accuracy >= 60 ? T.emerald : T.amber },
                    { label: "TOTAL XP", val: `+${totalXP}`, color: T.amber },
                    { label: "YOUR CONF", val: `${avgConfidence}%`, color: T.blue },
                    { label: "AI CONF", val: `${avgAIConf}%`, color: T.emerald },
                  ].map(st => (
                    <div key={st.label} style={{ padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: `1px solid ${T.border}` }}>
                      <div style={{ fontSize: 9, color: T.textDim, letterSpacing: "0.1em", marginBottom: 6 }}>{st.label}</div>
                      <div style={{ fontSize: 22, fontWeight: 800, fontFamily: T.fontDisp, color: st.color }}>{st.val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Radar chart */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <RadarChart scores={radarScores} />
                <div style={{ fontSize: 8, color: T.textDim, letterSpacing: "0.1em", marginTop: 4 }}>SKILL RADAR</div>
              </div>
            </div>
          </div>

          {/* Per-scenario breakdown */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            {/* Scenario-by-scenario */}
            <GlassCard style={{ padding: 24 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.14em", color: T.blue, marginBottom: 16 }}>SCENARIO BREAKDOWN</div>
              {ASSESSMENT_SCENARIOS.map((s, i) => {
                const r = results[i];
                const ans = userAnswers[s.id];
                if (!r || !ans) return null;
                const correct = r.correct;
                return (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: correct ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.1)", border: `1px solid ${correct ? T.emerald + "40" : T.red + "40"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>
                        {correct ? "✓" : "✗"}
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: T.text, fontFamily: T.fontDisp }}>{s.asset}</div>
                        <div style={{ fontSize: 8, color: T.textDim, letterSpacing: "0.08em" }}>{s.category}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <div style={{ fontSize: 9, padding: "2px 8px", borderRadius: 5, background: `${ans.direction === "BULLISH" ? T.emerald : ans.direction === "BEARISH" ? T.red : T.amber}15`, color: ans.direction === "BULLISH" ? T.emerald : ans.direction === "BEARISH" ? T.red : T.amber, border: `1px solid ${ans.direction === "BULLISH" ? T.emerald : ans.direction === "BEARISH" ? T.red : T.amber}40` }}>
                        YOU: {ans.direction}
                      </div>
                      <div style={{ fontSize: 9, padding: "2px 8px", borderRadius: 5, background: "rgba(59,130,246,0.1)", color: T.blue, border: "1px solid rgba(59,130,246,0.25)" }}>
                        AI: {s.aiPrediction}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, fontFamily: T.fontDisp, color: correct ? T.emerald : T.amber, minWidth: 32, textAlign: "right" }}>
                        {Math.round(r.score)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </GlassCard>

            {/* Skill dimensions */}
            <GlassCard style={{ padding: 24 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.14em", color: T.purple, marginBottom: 16 }}>SKILL DIMENSION SCORES</div>
              {SKILL_DIMENSIONS.map(dim => {
                const sc = Math.round(radarScores[dim.key] || 50);
                return (
                  <div key={dim.key} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 6 }}>
                      <span style={{ color: dim.color }}>{dim.icon} {dim.label}</span>
                      <span style={{ color: T.text, fontWeight: 700 }}>{sc}/100</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 100, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${sc}%`, borderRadius: 100, background: `linear-gradient(90deg,${dim.color},${dim.color}aa)`, boxShadow: `0 0 8px ${dim.color}44`, transition: "width 1s cubic-bezier(0.16,1,0.3,1)" }} />
                    </div>
                    <div style={{ fontSize: 8, color: T.textDim, marginTop: 3 }}>{sc >= 75 ? "Strong performance" : sc >= 55 ? "Developing skill" : "Needs practice"}</div>
                  </div>
                );
              })}
            </GlassCard>
          </div>

          {/* AI vs User comparison bar chart */}
          <GlassCard style={{ padding: 24, marginBottom: 20 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.14em", color: T.emerald, marginBottom: 6 }}>YOU VS NEXUS AI — CONFIDENCE CALIBRATION</div>
            <div style={{ fontSize: 12, color: T.textMid, lineHeight: 1.6, marginBottom: 16 }}>Comparing your confidence levels against AI confidence across all scenarios. Well-calibrated confidence (close to AI) shows systematic thinking.</div>
            <div style={{ height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ASSESSMENT_SCENARIOS.map((s, i) => ({ name: s.ticker, user: userAnswers[s.id]?.confidence || 0, ai: s.aiConfidence }))} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 8, fill: T.textDim, fontFamily: T.font }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 8, fill: T.textDim, fontFamily: T.font }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                  <Bar dataKey="user" name="Your Confidence" fill={T.blue} radius={[4, 4, 0, 0]} fillOpacity={0.8} />
                  <Bar dataKey="ai" name="AI Confidence" fill={T.emerald} radius={[4, 4, 0, 0]} fillOpacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 9, color: T.textDim }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: T.blue, display: "inline-block" }} /> Your Confidence</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: T.emerald, display: "inline-block" }} /> AI Confidence</span>
            </div>
          </GlassCard>

          {/* Personalized feedback */}
          <GlassCard accentColor={T.emerald} style={{ padding: 28, marginBottom: 20 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.14em", color: T.emerald, marginBottom: 16 }}>⚡ NEXUS AI — PERSONALIZED PERFORMANCE FEEDBACK</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { title: "Strengths", icon: "🏆", color: T.emerald, items: SKILL_DIMENSIONS.filter(d => (radarScores[d.key] || 50) >= 65).slice(0, 3).map(d => d.label) },
                { title: "Focus Areas", icon: "🎯", color: T.amber, items: SKILL_DIMENSIONS.filter(d => (radarScores[d.key] || 50) < 65).slice(0, 3).map(d => d.label) },
              ].map(section => (
                <div key={section.title} style={{ padding: "14px 16px", borderRadius: 12, background: `${section.color}08`, border: `1px solid ${section.color}20` }}>
                  <div style={{ fontSize: 10, color: section.color, letterSpacing: "0.1em", marginBottom: 10 }}>{section.icon} {section.title.toUpperCase()}</div>
                  {section.items.length > 0 ? section.items.map(item => (
                    <div key={item} style={{ fontSize: 11, color: "#bbb", padding: "4px 0", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 4, height: 4, borderRadius: "50%", background: section.color, display: "inline-block", flexShrink: 0 }} />
                      {item}
                    </div>
                  )) : (
                    <div style={{ fontSize: 11, color: T.textDim }}>All skills performing well!</div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: `1px solid ${T.border}` }}>
              <p style={{ fontSize: 11, color: "#aaa", lineHeight: 1.8, margin: 0 }}>
                <strong style={{ color: T.text }}>AI Assessment:</strong> {
                  accuracy >= 80 ? "Exceptional prediction accuracy. Your directional calls are consistently well-calibrated. Focus on refining entry/exit timing precision and confidence calibration — your intuition is strong, now build the systematic framework to match." :
                    accuracy >= 60 ? "Solid performance with clear analytical foundations. Your macro and technical signal-reading is developing well. Key opportunity: reduce overconfidence on high-complexity setups and practice more scenario-based analysis on sector rotation plays." :
                      "You're building the foundations of systematic market analysis. Focus on the three core pillars: macro signal identification, technical confirmation, and risk-reward assessment. Complete the Risk Management curriculum module to strengthen your weakest dimension."
                }
              </p>
            </div>
          </GlassCard>

          {/* Restart button */}
          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            <button onClick={handleRestart} style={{ padding: "13px 28px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}`, color: T.text, fontSize: 11, letterSpacing: "0.1em", cursor: "pointer", fontFamily: T.font, display: "flex", alignItems: "center", gap: 8 }}>
              <IcoRefresh size={14} /> RETAKE ASSESSMENT
            </button>
            <button style={{ padding: "13px 28px", borderRadius: 12, background: `linear-gradient(135deg,${T.emerald},${T.emeraldDk})`, border: "none", color: "#000", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", cursor: "pointer", fontFamily: T.font, boxShadow: `0 0 24px ${T.emerald}44` }}>
              CONTINUE LEARNING →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NAV
// ─────────────────────────────────────────────────────────────────────────────
function Nav({ activePage, onNavigate, alertCount = 0, alertHistory = [], onClearUnread }) {
  const [scrolled, setScrolled] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const bellRef = useRef(null);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  // Increment unread whenever a new alert lands in history
  const prevLen = useRef(0);
  useEffect(() => {
    if (alertHistory.length > prevLen.current) {
      setUnreadCount(c => c + (alertHistory.length - prevLen.current));
    }
    prevLen.current = alertHistory.length;
  }, [alertHistory.length]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!bellOpen) return;
    const handler = (e) => { if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [bellOpen]);

  const openBell = () => {
    setBellOpen(b => !b);
    setUnreadCount(0);
  };

  const timeAgo = (ts) => {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    return `${Math.floor(s / 3600)}h ago`;
  };

  const pages = ["HOME", "MARKETS", "LEARN", "ASSESSMENT", "PORTFOLIO", "AI STRATEGY"];
  const pageKeys = ["home", "markets", "learn", "assessment", "portfolio", "ai"];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      padding: "0 40px", height: 64,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: scrolled ? "rgba(10,10,12,0.92)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? `1px solid ${T.border}` : "none",
      transition: "all 0.4s ease", fontFamily: T.font,
    }}>
      {/* Logo */}
      <div onClick={() => onNavigate("home")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg,${T.emerald},${T.emeraldDk})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#000", boxShadow: `0 0 20px ${T.emerald}66`, fontFamily: T.fontDisp }}>N</div>
        <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: "0.12em", color: T.text, fontFamily: T.fontDisp }}>NEXUS<span style={{ color: T.emerald }}>FI</span></span>
      </div>

      {/* Links */}
      <div style={{ display: "flex", gap: 28, fontSize: 10, letterSpacing: "0.14em" }}>
        {pages.map((label, i) => (
          <span key={label} onClick={() => onNavigate(pageKeys[i])} style={{
            cursor: "pointer", transition: "color 0.2s", position: "relative",
            color: activePage === pageKeys[i] ? T.emerald : T.textMid,
            paddingBottom: 2,
          }}>
            {label}
            {activePage === pageKeys[i] && <div style={{ position: "absolute", bottom: -4, left: 0, right: 0, height: 1, background: T.emerald, borderRadius: 1 }} />}
          </span>
        ))}
      </div>

      {/* Right: Bell + Connect */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

        {/* Bell — always visible, shows unread badge */}
        <div ref={bellRef} style={{ position: "relative" }}>
          <div onClick={openBell} style={{
            width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
            background: bellOpen ? "rgba(239,68,68,0.14)" : alertHistory.length > 0 ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${bellOpen ? "rgba(239,68,68,0.5)" : alertHistory.length > 0 ? "rgba(239,68,68,0.25)" : T.border}`,
            cursor: "pointer", transition: "all 0.2s",
            animation: unreadCount > 0 ? "bellShake 0.5s ease" : "none",
          }}>
            <IcoBell size={15} color={alertHistory.length > 0 ? T.red : T.textMid} />
          </div>

          {/* Unread badge */}
          {unreadCount > 0 && (
            <div style={{
              position: "absolute", top: -4, right: -4,
              minWidth: 16, height: 16, borderRadius: 8,
              background: T.red, color: "#fff",
              fontSize: 8, fontWeight: 700, fontFamily: T.fontDisp,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "0 4px",
              animation: "badgePop 0.3s cubic-bezier(0.16,1,0.3,1)",
              border: "2px solid #0a0a0c",
              boxShadow: `0 0 8px ${T.red}88`,
            }}>{unreadCount > 9 ? "9+" : unreadCount}</div>
          )}

          {/* Dropdown panel */}
          {bellOpen && (
            <div style={{
              position: "absolute", top: 44, right: 0,
              width: 340, maxHeight: 440,
              background: "rgba(10,10,12,0.97)", border: `1px solid ${T.border}`,
              borderRadius: 16, overflow: "hidden",
              backdropFilter: "blur(24px)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 40px rgba(239,68,68,0.1)",
              animation: "fadeInUp 0.25s cubic-bezier(0.16,1,0.3,1)",
              zIndex: 200, fontFamily: T.font,
            }}>
              {/* Panel header */}
              <div style={{ padding: "14px 16px 12px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(239,68,68,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <IcoAlert size={12} color={T.red} />
                  <span style={{ fontSize: 9, letterSpacing: "0.16em", color: T.text, fontWeight: 700 }}>CRITICAL ALERTS</span>
                  <span style={{ padding: "1px 6px", borderRadius: 4, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", fontSize: 8, color: T.red, fontWeight: 700 }}>{alertHistory.length}</span>
                </div>
                <span style={{ fontSize: 8, letterSpacing: "0.1em", color: T.textDim }}>HIGH IMPACT ONLY</span>
              </div>

              {/* Notification list */}
              <div style={{ overflowY: "auto", maxHeight: 370 }}>
                {alertHistory.length === 0 ? (
                  <div style={{ padding: "32px 20px", textAlign: "center" }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>🔕</div>
                    <div style={{ fontSize: 10, color: T.textDim, letterSpacing: "0.1em" }}>NO ALERTS YET</div>
                    <div style={{ fontSize: 9, color: "#333", marginTop: 4, lineHeight: 1.6 }}>Only critical market events<br />will appear here</div>
                  </div>
                ) : alertHistory.map((ev, i) => (
                  <div key={`${ev.uid}-${i}`} style={{
                    padding: "12px 16px",
                    borderBottom: `1px solid rgba(255,255,255,0.04)`,
                    background: i === 0 ? `${ev.color}06` : "transparent",
                    transition: "background 0.2s", cursor: "default",
                    position: "relative", overflow: "hidden",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = `${ev.color}08`}
                    onMouseLeave={e => e.currentTarget.style.background = i === 0 ? `${ev.color}06` : "transparent"}>

                    {/* Left severity bar */}
                    <div style={{ position: "absolute", left: 0, top: 10, bottom: 10, width: 2, borderRadius: 2, background: ev.color }} />

                    <div style={{ paddingLeft: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 5 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 13 }}>{ev.icon}</span>
                          <div>
                            <div style={{ fontSize: 9, fontWeight: 700, color: ev.color, letterSpacing: "0.1em", marginBottom: 1 }}>{ev.severity} · {ev.category}</div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: T.text, fontFamily: T.fontDisp, lineHeight: 1.3 }}>{ev.title}</div>
                          </div>
                        </div>
                        <span style={{ fontSize: 8, color: T.textDim, whiteSpace: "nowrap", flexShrink: 0 }}>{ev.firedAt ? timeAgo(ev.firedAt) : "just now"}</span>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                        <div style={{ fontSize: 8, color: T.textDim }}>
                          <span style={{ color: "#555" }}>IMPACT </span>
                          <span style={{ color: ev.color, fontWeight: 700 }}>{ev.impact}</span>
                        </div>
                        <div style={{ fontSize: 8, color: T.textDim }}>
                          <span style={{ color: "#555" }}>ACTION </span>
                          <span style={{ color: T.amber, fontWeight: 700 }}>{ev.action}</span>
                        </div>
                      </div>

                      <div style={{ marginTop: 5, fontSize: 8, color: "#555", letterSpacing: "0.06em" }}>
                        Affected: <span style={{ color: "#777" }}>{ev.affected}</span>
                      </div>
                    </div>

                    {/* "NEW" tag for first item */}
                    {i === 0 && (
                      <div style={{ position: "absolute", top: 10, right: 12, padding: "1px 6px", borderRadius: 3, background: `${ev.color}20`, border: `1px solid ${ev.color}50`, fontSize: 7, fontWeight: 700, color: ev.color, letterSpacing: "0.12em" }}>NEW</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer */}
              {alertHistory.length > 0 && (
                <div style={{ padding: "10px 16px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.01)" }}>
                  <span style={{ fontSize: 8, color: T.textDim, letterSpacing: "0.08em" }}>{alertHistory.length} event{alertHistory.length !== 1 ? "s" : ""} logged this session</span>
                  <span onClick={() => onNavigate("markets")} style={{ fontSize: 8, color: T.emerald, cursor: "pointer", letterSpacing: "0.1em" }}>VIEW MARKETS →</span>
                </div>
              )}
            </div>
          )}
        </div>

        <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}`, color: T.text, fontSize: 11, letterSpacing: "0.08em", cursor: "pointer", fontFamily: T.font }}>
          <IcoGoogle /> Connect Google
        </button>
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOME PAGE
// ─────────────────────────────────────────────────────────────────────────────
function HomePage({ onNavigate }) {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(x => x + 1), 2000); return () => clearInterval(t); }, []);
  const words = ["Wealth.", "Alpha.", "Edge.", "Legacy."];

  const navCards = [
    { page: "markets", icon: "📈", label: "LIVE INTELLIGENCE", title: "Markets & Prediction Arena", desc: "Real-time charts, AI prediction overlays, drastic event alerts, and global market intelligence feed." },
    { page: "learn", icon: "🧠", label: "ADAPTIVE LEARNING", title: "Learning & Financial IQ", desc: "Personalised education tracks, Financial IQ scoring, achievement badges, and performance analytics." },
    { page: "assessment", icon: "🎯", label: "SELF-ASSESSMENT", title: "User vs AI Prediction Arena", desc: "Test your market analysis skills against Nexus AI across real-world scenarios. Earn XP and discover your edge." },
    { page: "portfolio", icon: "🏦", label: "INTELLIGENCE DASHBOARD", title: "Portfolio Intelligence", desc: "Asset allocation breakdown, risk exposure meter, and AI-driven portfolio rebalancing recommendations." },
    { page: "ai", icon: "⚡", label: "AI ADVISOR", title: "Nexus AI Strategist", desc: "GPT-4o powered financial advisor with live market context, portfolio awareness, and 24/7 availability." },
  ];

  return (
    <div>
      {/* Hero */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 40px 80px", textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 100, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", fontSize: 10, letterSpacing: "0.18em", color: T.emerald, marginBottom: 40, animation: "fadeInDown 0.8s ease" }}>
          <LiveDot /> LIVE MARKETS · 247 ASSETS TRACKED
        </div>
        <h1 style={{ fontSize: "clamp(42px,7vw,88px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.02em", fontFamily: T.fontDisp, marginBottom: 16, maxWidth: 800, animation: "fadeInUp 0.9s ease 0.1s both", color: T.text }}>
          Bridge the Gap Between<br />Theory and{" "}
          <span style={{ color: T.emerald, textShadow: `0 0 40px ${T.emerald}80`, transition: "all 0.5s ease" }}>
            {words[tick % words.length]}
          </span>
        </h1>
        <p style={{ fontSize: 15, color: T.textMid, maxWidth: 520, lineHeight: 1.7, fontFamily: T.font, marginBottom: 48, animation: "fadeInUp 0.9s ease 0.2s both" }}>
          One unified command center. Real-time intelligence, adaptive learning,
          and AI-powered portfolio strategy — synchronized.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", animation: "fadeInUp 0.9s ease 0.3s both" }}>
          <button onClick={() => onNavigate("ai")} style={{ padding: "14px 32px", borderRadius: 12, background: `linear-gradient(135deg,${T.emerald},${T.emeraldDk})`, border: "none", color: "#000", fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", cursor: "pointer", boxShadow: `0 0 30px ${T.emerald}55`, fontFamily: T.font }}>
            ENTER THE NEXUS
          </button>
          <button onClick={() => onNavigate("markets")} style={{ padding: "14px 32px", borderRadius: 12, background: "transparent", border: `1px solid ${T.border}`, color: T.text, fontSize: 13, letterSpacing: "0.08em", cursor: "pointer", fontFamily: T.font }}>
            LIVE MARKETS
          </button>
        </div>
        <div style={{ display: "flex", gap: 48, marginTop: 72, animation: "fadeInUp 0.9s ease 0.4s both", flexWrap: "wrap", justifyContent: "center" }}>
          {[{ label: "USERS", value: "47.2K" }, { label: "ASSETS TRACKED", value: "1,204" }, { label: "AVG. ALPHA", value: "+18.7%" }, { label: "AI ACCURACY", value: "79.4%" }].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: T.text, letterSpacing: "-0.02em", fontFamily: T.fontDisp }}>{s.value}</div>
              <div style={{ fontSize: 9, color: T.textDim, letterSpacing: "0.16em", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Nav Cards */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "0 40px 80px" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.2em", color: T.textMid, textAlign: "center", marginBottom: 32 }}>// EXPLORE THE PLATFORM</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12 }}>
          {navCards.map((c, i) => (
            <Reveal key={c.page} delay={i * 0.07}>
              <GlassCard onClick={() => onNavigate(c.page)} style={{ padding: 28 }}>
                <span style={{ fontSize: 32, marginBottom: 16, display: "block" }}>{c.icon}</span>
                <div style={{ fontSize: 9, letterSpacing: "0.18em", color: T.emerald, marginBottom: 8 }}>{c.label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.text, fontFamily: T.fontDisp, marginBottom: 8 }}>{c.title}</div>
                <div style={{ fontSize: 12, color: T.textMid, lineHeight: 1.7, marginBottom: 16 }}>{c.desc}</div>
                <span style={{ color: T.emerald, fontSize: 18 }}>→</span>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MARKETS PAGE (from markets_alert.js)
// ─────────────────────────────────────────────────────────────────────────────
function Sparkline({ data, color, width = 150, height = 36 }) {
  if (!data?.length) return null;
  const vals = data.map(d => d.v);
  const min = Math.min(...vals), max = Math.max(...vals), rng = max - min || 1;
  const pts = vals.map((v, i) => `${(i / (vals.length - 1)) * width},${height - ((v - min) / rng) * (height - 4)}`).join(" ");
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function IndexCard({ idx, delay = 0 }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: T.bgCard, border: `1px solid ${hov ? idx.color + "44" : T.border}`, borderRadius: 16, padding: "18px 20px", transition: "all 0.25s", animation: `fadeInUp 0.5s ease ${delay}ms both`, cursor: "default" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 8, letterSpacing: "0.14em", color: T.textDim, marginBottom: 4 }}>{idx.region} · INDEX</div>
          <div style={{ fontSize: 13, fontWeight: 700, fontFamily: T.fontDisp }}>{idx.label}</div>
        </div>
        <div style={{ padding: "3px 8px", borderRadius: 6, background: `${idx.positive ? T.emerald : T.red}15`, border: `1px solid ${idx.positive ? T.emerald : T.red}40`, fontSize: 9, fontWeight: 700, color: idx.positive ? T.emerald : T.red }}>
          {idx.change}
        </div>
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, fontFamily: T.fontDisp, letterSpacing: "-0.02em", color: idx.positive ? T.emerald : T.red, marginBottom: 10 }}>{idx.value}</div>
      <Sparkline data={idx.data} color={idx.color} width={160} height={40} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 8, color: T.textDim }}>
        <span>H: {idx.high}</span><span>L: {idx.low}</span><span>VOL: {idx.vol}</span>
      </div>
    </div>
  );
}

function AiNewsPulse({ alertCount, onTriggerAlert, newsItems }) {
  const [analysis, setAnalysis] = useState(null);
  const [typing, setTyping] = useState(false);
  const displayNews = newsItems || NEWS_ITEMS;

  const analyze = (item) => {
    setAnalysis(null); setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setAnalysis(`Based on the "${item.headline}" headline, sentiment scoring indicates a ${item.sentiment === "bullish" ? "positive" : item.sentiment === "bearish" ? "negative" : "neutral"} market reaction. Expected vol impact: ${item.impact}. Portfolio action: ${item.sentiment === "bullish" ? "HOLD / ACCUMULATE on dip" : item.sentiment === "bearish" ? "HEDGE / REDUCE exposure" : "MONITOR — no immediate action"}.`);
    }, 1000);
  };

  return (
    <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 20, padding: "22px", height: "100%", display: "flex", flexDirection: "column", gap: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.18em", color: T.emerald, marginBottom: 4 }}>AI NEWS PULSE</div>
          <div style={{ fontSize: 14, fontWeight: 700, fontFamily: T.fontDisp }}>Market Intelligence</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {alertCount > 0 && (
            <div style={{ padding: "3px 8px", borderRadius: 6, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)", fontSize: 9, fontWeight: 700, color: T.red }}>
              {alertCount} ALERT{alertCount > 1 ? "S" : ""}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 8, letterSpacing: "0.14em", color: T.emerald }}>
            <LiveDot size={5} /> LIVE
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, overflowY: "auto" }}>
        {displayNews.map((item, i) => {
          const col = item.sentiment === "bullish" ? T.emerald : item.sentiment === "bearish" ? T.red : T.amber;
          return (
            <div key={item.id} onClick={() => analyze(item)}
              style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: `1px solid ${T.border}`, cursor: "pointer", position: "relative", overflow: "hidden", animation: `fadeInRight 0.4s ease ${i * 0.06}s both`, transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = col + "33"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = T.border; }}>
              <div style={{ position: "absolute", left: 0, top: 6, bottom: 6, width: 2, borderRadius: 2, background: col }} />
              <div style={{ paddingLeft: 10, display: "flex", justifyContent: "space-between", gap: 8 }}>
                <p style={{ fontSize: 10, color: "#ccc", lineHeight: 1.5, margin: 0, flex: 1 }}>{item.headline}</p>
                <div style={{ padding: "2px 7px", borderRadius: 5, background: `${col}15`, border: `1px solid ${col}40`, color: col, fontSize: 8, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 }}>{item.impact}</div>
              </div>
              <div style={{ paddingLeft: 10, display: "flex", gap: 8, marginTop: 4, fontSize: 8, color: T.textDim }}>
                <span style={{ color: T.textMid }}>{item.source}</span><span>{item.time}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Response area */}
      {(typing || analysis) && (
        <div style={{ marginTop: 12, padding: "12px 14px", background: "rgba(16,185,129,0.05)", border: `1px solid rgba(16,185,129,0.2)`, borderRadius: 12 }}>
          <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.emerald, marginBottom: 6 }}>⚡ NEXUS AI ANALYSIS</div>
          {typing ? (
            <div style={{ display: "flex", gap: 4 }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: T.emerald, animation: `bounce 1s ease ${i * 0.15}s infinite` }} />)}
            </div>
          ) : (
            <p style={{ fontSize: 11, color: "#aaa", lineHeight: 1.65, margin: 0 }}>{analysis}</p>
          )}
        </div>
      )}

      {/* Trigger alert button — high-impact events only */}
      <button onClick={onTriggerAlert} style={{ marginTop: 12, padding: "8px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: T.red, fontSize: 9, letterSpacing: "0.12em", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: T.font }}>
        <IcoAlert size={11} /> SIMULATE CRITICAL EVENT ALERT
      </button>
    </div>
  );
}

function GlobalTradeNexus() {
  const regions = [
    { name: "NEW YORK", code: "NYSE", status: "OPEN", time: "14:32 EDT", color: T.emerald, sentiment: +78, assets: ["+S&P 500", "+NASDAQ", "+DOW", "-VIX"] },
    { name: "LONDON", code: "LSE", status: "CLOSED", time: "19:32 BST", color: T.textDim, sentiment: +34, assets: ["+FTSE100", "-GBP/USD", "=GILT"] },
    { name: "TOKYO", code: "TSE", status: "CLOSED", time: "23:32 JST", color: T.textDim, sentiment: -12, assets: ["-Nikkei", "-USDJPY", "=Topix"] },
    { name: "MUMBAI", code: "NSE", status: "CLOSED", time: "00:02 IST", color: T.textDim, sentiment: -43, assets: ["-NIFTY", "-SENSEX", "=INR"] },
    { name: "SHANGHAI", code: "SSE", status: "CLOSED", time: "02:32 CST", color: T.textDim, sentiment: -61, assets: ["-CSI300", "=CNH", "=SHCOMP"] },
    { name: "FRANKFURT", code: "FWB", status: "CLOSED", time: "20:32 CET", color: T.textDim, sentiment: +22, assets: ["+DAX", "+EUR/USD", "=BUND"] },
  ];

  return (
    <Reveal delay={0.1}>
      <GlassCard style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.18em", color: T.blue, marginBottom: 4 }}>GLOBAL EXCHANGE NEXUS</div>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: T.fontDisp }}>World Market Status</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 8, letterSpacing: "0.12em", color: T.emerald }}>
            <LiveDot size={5} /> 1 EXCHANGE OPEN
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10 }}>
          {regions.map(r => {
            const col = r.status === "OPEN" ? T.emerald : T.textDim;
            return (
              <div key={r.code} style={{ background: "rgba(255,255,255,0.02)", borderRadius: 12, padding: "14px 16px", border: `1px solid ${r.status === "OPEN" ? T.emerald + "33" : T.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: T.text, fontFamily: T.fontDisp }}>{r.name}</div>
                    <div style={{ fontSize: 8, color: T.textDim, letterSpacing: "0.1em" }}>{r.code} · {r.time}</div>
                  </div>
                  <div style={{ padding: "2px 7px", borderRadius: 5, background: `${col}12`, border: `1px solid ${col}30`, fontSize: 7, fontWeight: 700, color: col }}>{r.status}</div>
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {r.assets.map(a => (
                    <span key={a} style={{ fontSize: 7, padding: "2px 6px", borderRadius: 4, background: "rgba(255,255,255,0.04)", color: a[0] === "+" ? T.emerald : a[0] === "-" ? T.red : T.textMid }}>{a.slice(1)}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </Reveal>
  );
}

function MarketsPage({ onTriggerAlert, alertCount }) {
  const [indices, setIndices] = useState(INDICES_FALLBACK);
  const [liveNews, setLiveNews] = useState(NEWS_ITEMS);
  const [loading, setLoading] = useState(true);
  const priceHistoryRef = useRef({});

  // Fetch initial data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quotesRes, newsRes] = await Promise.all([
          fetch(`${API_BASE}/api/market/quotes`).then(r => r.json()).catch(() => null),
          fetch(`${API_BASE}/api/market/news`).then(r => r.json()).catch(() => null),
        ]);

        if (quotesRes && Array.isArray(quotesRes) && quotesRes.length > 0) {
          // Split into index ETFs and stocks
          const indexQuotes = quotesRes.filter(q => q.type === 'index').map(formatQuoteToIndex);
          if (indexQuotes.length > 0) setIndices(indexQuotes);
        }

        if (newsRes && Array.isArray(newsRes) && newsRes.length > 0) {
          setLiveNews(newsRes.map((n, i) => ({
            id: n.id || i,
            headline: n.headline,
            source: n.source,
            time: n.time || 'just now',
            impact: n.sentiment === 'bullish' ? '+Vol' : n.sentiment === 'bearish' ? '-Vol' : '~Vol',
            sentiment: n.sentiment || 'neutral',
            score: n.sentiment === 'bullish' ? 15 : n.sentiment === 'bearish' ? -15 : 0,
          })));
        }
      } catch (err) {
        console.warn('Using fallback data:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Socket.IO for real-time updates
  useEffect(() => {
    const socket = socketIO(API_BASE, { transports: ['websocket', 'polling'] });
    socket.on('market_update', (quotes) => {
      if (Array.isArray(quotes) && quotes.length > 0 && quotes[0].symbol) {
        const indexQuotes = quotes.filter(q => q.type === 'index').map(formatQuoteToIndex);
        if (indexQuotes.length > 0) setIndices(indexQuotes);
      }
    });
    return () => socket.disconnect();
  }, []);

  return (
    <div style={{ paddingTop: 80, maxWidth: 1440, margin: "0 auto", padding: "80px 32px 40px" }}>
      <Reveal>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: T.emerald, marginBottom: 8 }}>LIVE INTELLIGENCE</div>
          <h1 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, letterSpacing: "-0.02em", fontFamily: T.fontDisp, marginBottom: 8 }}>
            Markets & <span style={{ color: T.emerald }}>Prediction Arena</span>
          </h1>
          <p style={{ fontSize: 13, color: T.textMid, maxWidth: 520, lineHeight: 1.7 }}>Real-time global indices, AI-powered signals, and drastic event monitoring.</p>
        </div>
      </Reveal>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16, marginBottom: 20, alignItems: "start" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
          {loading ? (
            [0, 1, 2].map(i => (
              <div key={i} style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: "18px 20px", height: 160, animation: 'pulse 1.5s infinite', opacity: 0.5 }}>
                <div style={{ width: '60%', height: 12, borderRadius: 4, background: 'rgba(255,255,255,0.05)', marginBottom: 12 }} />
                <div style={{ width: '80%', height: 24, borderRadius: 4, background: 'rgba(255,255,255,0.05)', marginBottom: 12 }} />
                <div style={{ width: '100%', height: 40, borderRadius: 4, background: 'rgba(255,255,255,0.03)' }} />
              </div>
            ))
          ) : (
            indices.map((idx, i) => <IndexCard key={idx.id} idx={idx} delay={i * 80} />)
          )}
        </div>
        <div style={{ minHeight: 460 }}>
          <AiNewsPulse alertCount={alertCount} onTriggerAlert={onTriggerAlert} newsItems={liveNews} />
        </div>
      </div>

      {/* Full-width chart */}
      <Reveal delay={0.15}>
        <GlassCard style={{ padding: 24, marginBottom: 16 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.18em", color: T.emerald, marginBottom: 6 }}>PREDICTION ARENA</div>
          <div style={{ fontSize: 14, fontWeight: 700, fontFamily: T.fontDisp, marginBottom: 16 }}>S&P 500 — Intraday with AI Overlay</div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={T.emerald} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={T.emerald} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" tick={{ fontSize: 8, fill: T.textDim, fontFamily: T.font }} axisLine={false} tickLine={false} interval={7} />
                <YAxis tick={{ fontSize: 8, fill: T.textDim, fontFamily: T.font }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                <Tooltip content={<ChartTip />} />
                <Area type="monotone" dataKey="price" name="S&P 500" stroke={T.emerald} strokeWidth={2} fill="url(#chartGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </Reveal>

      <GlobalTradeNexus />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LEARN PAGE
// ─────────────────────────────────────────────────────────────────────────────
function LearnPage() {
  const [track, setTrack] = useState("learning");

  return (
    <div style={{ paddingTop: 80, maxWidth: 1400, margin: "0 auto", padding: "80px 40px 40px" }}>
      <Reveal>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: T.purple, marginBottom: 8 }}>ADAPTIVE LEARNING</div>
          <h1 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, letterSpacing: "-0.02em", fontFamily: T.fontDisp, marginBottom: 8 }}>
            Financial <span style={{ color: T.purple }}>IQ & Growth</span>
          </h1>
          <p style={{ fontSize: 13, color: T.textMid, maxWidth: 520, lineHeight: 1.7 }}>Adaptive learning paths, personalised assessments, and real investment performance — all in one track.</p>
        </div>
      </Reveal>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Left: FIQ + Badges */}
        <Reveal delay={0.05}>
          <GlassCard accentColor={T.purple} style={{ padding: 28, height: "auto" }}>
            {/* Track toggle */}
            <div style={{ display: "flex", gap: 0, marginBottom: 24, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 3 }}>
              {["learning", "investment"].map(t => (
                <button key={t} onClick={() => setTrack(t)} style={{ flex: 1, padding: 8, borderRadius: 8, background: track === t ? "rgba(255,255,255,0.08)" : "transparent", border: "none", color: track === t ? T.text : T.textDim, fontSize: 9, letterSpacing: "0.14em", cursor: "pointer", fontFamily: T.font }}>
                  {t.toUpperCase()} TRACK
                </button>
              ))}
            </div>

            {track === "learning" ? (
              <>
                <div style={{ fontSize: 9, letterSpacing: "0.18em", color: T.purple, marginBottom: 16 }}>FINANCIAL IQ LEVEL</div>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 28, fontWeight: 800, fontFamily: T.fontDisp, color: T.text }}>74<span style={{ fontSize: 14, color: T.textDim }}>/100</span></span>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 11, color: T.purple }}>LEVEL 4</div>
                      <div style={{ fontSize: 9, color: T.textDim, letterSpacing: "0.1em" }}>MACRO ANALYST</div>
                    </div>
                  </div>
                  <div style={{ height: 6, borderRadius: 100, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: "74%", borderRadius: 100, background: "linear-gradient(90deg,#8b5cf6,#a78bfa)", boxShadow: "0 0 12px rgba(139,92,246,0.6)" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 8, color: "#333" }}>
                    <span>BEGINNER</span><span>QUANT</span>
                  </div>
                </div>

                {/* 7-day streak */}
                <div style={{ fontSize: 9, letterSpacing: "0.14em", color: T.purple, marginBottom: 12 }}>7-DAY STREAK</div>
                <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
                  {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                    <div key={i} style={{ flex: 1, height: 38, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, border: `1px solid ${i < 4 ? T.emerald + "44" : i === 4 ? T.emerald : T.border}`, background: i < 4 ? "rgba(16,185,129,0.1)" : i === 4 ? "rgba(16,185,129,0.2)" : "transparent", color: i <= 4 ? T.emerald : T.textDim }}>
                      {d}{i === 4 ? " ✓" : ""}
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: 9, letterSpacing: "0.14em", color: T.purple, marginBottom: 12 }}>ASSESSMENT BADGES</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {BADGES.map(b => (
                    <div key={b.name} style={{ padding: "5px 11px", borderRadius: 8, fontSize: 10, background: b.locked ? "rgba(255,255,255,0.03)" : `${b.color}15`, border: `1px solid ${b.locked ? "rgba(255,255,255,0.06)" : `${b.color}40`}`, color: b.locked ? "#333" : b.color, display: "flex", alignItems: "center", gap: 5, opacity: b.locked ? 0.5 : 1 }}>
                      {b.locked ? <IcoShield size={11} /> : <IcoAward size={11} />} {b.name}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 9, letterSpacing: "0.18em", color: T.emerald, marginBottom: 16 }}>INVESTMENT PERFORMANCE</div>
                {[
                  { label: "Total Return", val: "+24.8%", color: T.emerald },
                  { label: "Sharpe Ratio", val: "1.84", color: T.blue },
                  { label: "Max Drawdown", val: "-7.2%", color: T.red },
                  { label: "Win Rate", val: "64.3%", color: T.amber },
                  { label: "Best Trade", val: "+41.2%", color: T.emerald },
                  { label: "Total Trades", val: "147", color: T.text },
                ].map(m => (
                  <div key={m.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: `1px solid ${T.border}` }}>
                    <span style={{ fontSize: 11, color: T.textMid }}>{m.label}</span>
                    <span style={{ fontSize: 16, fontWeight: 700, fontFamily: T.fontDisp, color: m.color }}>{m.val}</span>
                  </div>
                ))}
              </>
            )}
          </GlassCard>
        </Reveal>

        {/* Right: Courses */}
        <Reveal delay={0.1}>
          <GlassCard accentColor={T.purple} style={{ padding: 28, height: "auto" }}>
            <div style={{ fontSize: 9, letterSpacing: "0.18em", color: T.purple, marginBottom: 4 }}>LEARNING PATH</div>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: T.fontDisp, marginBottom: 20 }}>Your Curriculum</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {COURSES.map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderRadius: 14, background: "rgba(255,255,255,0.02)", border: `1px solid ${c.active ? T.purple + "44" : T.border}`, opacity: c.locked ? 0.55 : 1, cursor: c.locked ? "default" : "pointer", transition: "all 0.2s" }}
                  onMouseEnter={e => { if (!c.locked) e.currentTarget.style.borderColor = T.purple + "55"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = c.active ? T.purple + "44" : T.border; }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ fontSize: 22 }}>{c.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, fontFamily: T.fontDisp, color: T.text, marginBottom: 3 }}>{c.title}</div>
                      <div style={{ fontSize: 10, color: T.textMid }}>{c.meta}{c.active ? " · IN PROGRESS" : ""}{c.locked ? " · LOCKED" : ""}</div>
                    </div>
                  </div>
                  <div style={{ width: 72, textAlign: "right" }}>
                    <div style={{ fontSize: 9, color: c.active ? T.purple : T.textDim, marginBottom: 4, letterSpacing: "0.1em" }}>{c.status}</div>
                    <div style={{ height: 3, borderRadius: 100, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${c.pct}%`, borderRadius: 100, background: c.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PORTFOLIO PAGE
// ─────────────────────────────────────────────────────────────────────────────
function PortfolioPage() {
  const [activeSlice, setActiveSlice] = useState(null);

  return (
    <div style={{ paddingTop: 80, maxWidth: 1400, margin: "0 auto", padding: "80px 40px 40px" }}>
      <Reveal>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: T.blue, marginBottom: 8 }}>INTELLIGENCE DASHBOARD</div>
          <h1 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, letterSpacing: "-0.02em", fontFamily: T.fontDisp, marginBottom: 8 }}>
            Portfolio <span style={{ color: T.blue }}>Intelligence</span>
          </h1>
          <p style={{ fontSize: 13, color: T.textMid, lineHeight: 1.7 }}>Asset allocation breakdown, risk exposure analysis, and AI-powered rebalancing insights.</p>
        </div>
      </Reveal>

      {/* Top stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 16 }}>
        {[
          { val: "$284K", label: "TOTAL PORTFOLIO VALUE", color: T.emerald },
          { val: "+24.8%", label: "TOTAL RETURN YTD", color: T.emerald },
          { val: "62/100", label: "RISK SCORE — MODERATE", color: T.amber },
        ].map((s, i) => (
          <Reveal key={s.label} delay={i * 0.06}>
            <GlassCard accentColor={s.color} style={{ padding: 24, textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 800, fontFamily: T.fontDisp, color: s.color, marginBottom: 6 }}>{s.val}</div>
              <div style={{ fontSize: 9, letterSpacing: "0.14em", color: T.textDim }}>{s.label}</div>
            </GlassCard>
          </Reveal>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Allocation + risk */}
        <Reveal delay={0.05}>
          <GlassCard accentColor={T.blue} style={{ padding: 28, height: "auto" }}>
            <div style={{ fontSize: 9, letterSpacing: "0.18em", color: T.blue, marginBottom: 6 }}>PORTFOLIO INTELLIGENCE</div>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: T.fontDisp, marginBottom: 20 }}>Asset Allocation</div>
            <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 24 }}>
              <div style={{ position: "relative", width: 160, height: 160, flexShrink: 0 }}>
                <PieChart width={160} height={160}>
                  <Pie data={PORTFOLIO_DATA} cx={75} cy={75} innerRadius={48} outerRadius={68} dataKey="value" strokeWidth={0}
                    onMouseEnter={(_, i) => setActiveSlice(i)} onMouseLeave={() => setActiveSlice(null)}>
                    {PORTFOLIO_DATA.map((entry, i) => (
                      <Cell key={i} fill={entry.color} opacity={activeSlice === null || activeSlice === i ? 1 : 0.35} />
                    ))}
                  </Pie>
                </PieChart>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", pointerEvents: "none" }}>
                  {activeSlice !== null ? (
                    <><div style={{ fontSize: 16, fontWeight: 700, color: PORTFOLIO_DATA[activeSlice].color }}>{PORTFOLIO_DATA[activeSlice].value}%</div>
                      <div style={{ fontSize: 8, color: T.textDim }}>{PORTFOLIO_DATA[activeSlice].name.toUpperCase()}</div></>
                  ) : (
                    <><div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>$284K</div><div style={{ fontSize: 8, color: T.textDim }}>TOTAL</div></>
                  )}
                </div>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                {PORTFOLIO_DATA.map((d, i) => (
                  <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", opacity: activeSlice === null || activeSlice === i ? 1 : 0.4, transition: "opacity 0.2s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                      <span style={{ fontSize: 10, color: T.textMid }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: d.color }}>{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Risk meter */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 10 }}>
                <span style={{ color: T.textDim, letterSpacing: "0.12em" }}>RISK EXPOSURE</span>
                <span style={{ color: T.amber, fontWeight: 700 }}>62/100 — MODERATE</span>
              </div>
              <div style={{ height: 8, borderRadius: 100, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: "62%", borderRadius: 100, background: `linear-gradient(90deg,${T.emerald},${T.amber})`, boxShadow: "0 0 10px rgba(245,158,11,0.4)" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 8, color: "#333" }}>
                <span>CONSERVATIVE</span><span>AGGRESSIVE</span>
              </div>
            </div>
            {/* AI insight */}
            <div style={{ marginTop: 20, padding: 14, background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 12 }}>
              <div style={{ fontSize: 8, color: T.emerald, letterSpacing: "0.12em", marginBottom: 6 }}>⚡ AI REBALANCING INSIGHT</div>
              <p style={{ fontSize: 11, color: "#aaa", lineHeight: 1.65, margin: 0 }}>Your crypto exposure (18%) exceeds recommended 12% for your risk profile. Consider trimming BTC by ~$8K and rotating into short-duration bonds ahead of CPI data.</p>
            </div>
          </GlassCard>
        </Reveal>

        {/* Holdings table */}
        <Reveal delay={0.1}>
          <GlassCard accentColor={T.blue} style={{ padding: 28, height: "auto" }}>
            <div style={{ fontSize: 9, letterSpacing: "0.18em", color: T.blue, marginBottom: 6 }}>HOLDINGS</div>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: T.fontDisp, marginBottom: 20 }}>Current Positions</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>{["TICKER", "VALUE", "ALLOC", "P&L"].map(h => <th key={h} style={{ fontSize: 8, letterSpacing: "0.14em", color: T.textDim, textAlign: "left", padding: "6px 10px", borderBottom: `1px solid ${T.border}` }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {HOLDINGS.map(h => (
                  <tr key={h.ticker}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                    <td style={{ padding: "11px 10px", borderBottom: `1px solid rgba(255,255,255,0.03)`, fontSize: 12 }}>
                      <span style={{ color: T.text, fontWeight: 600 }}>{h.ticker}</span>
                      <br /><span style={{ fontSize: 9, color: T.textDim }}>{h.name}</span>
                    </td>
                    <td style={{ padding: "11px 10px", borderBottom: `1px solid rgba(255,255,255,0.03)`, fontSize: 12, color: T.textMid }}>{h.value}</td>
                    <td style={{ padding: "11px 10px", borderBottom: `1px solid rgba(255,255,255,0.03)`, fontSize: 12, color: T.textMid }}>{h.alloc}</td>
                    <td style={{ padding: "11px 10px", borderBottom: `1px solid rgba(255,255,255,0.03)`, fontSize: 12, color: h.up ? T.emerald : T.red }}>{h.pnl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>
        </Reveal>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AI STRATEGY PAGE
// ─────────────────────────────────────────────────────────────────────────────
function AIStrategyPage() {
  const [messages, setMessages] = useState(CHAT_INIT);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [aiInfo, setAiInfo] = useState(false);
  const scrollRef = useRef(null);

  const PROMPTS = ["Why is my risk score elevated?", "Rebalance for rate cut scenario", "Top 3 opportunities today", "Explain my NVDA exposure"];

  const send = (text = input) => {
    if (!text.trim()) return;
    setMessages(m => [...m, { role: "user", text: text.trim() }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, { role: "ai", text: AI_REPLIES[Math.floor(Math.random() * AI_REPLIES.length)] }]);
    }, 1400);
  };

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, typing]);

  const sideStats = [
    { label: "S&P 500", val: "5,892.14 ▲", color: T.emerald },
    { label: "NASDAQ", val: "18,543 ▲", color: T.emerald },
    { label: "VIX", val: "16.43 ▼", color: T.red },
    { label: "Fed Rate", val: "5.25–5.50%", color: T.text },
    { label: "10Y Yield", val: "4.31%", color: T.text },
  ];
  const portStats = [
    { label: "Total Value", val: "$284,180", color: T.emerald },
    { label: "Today's P&L", val: "+$2,134", color: T.emerald },
    { label: "Risk Score", val: "62/100", color: T.amber },
    { label: "Top Holding", val: "AAPL 14.8%", color: T.text },
  ];

  return (
    <div style={{ paddingTop: 64, height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "340px 1fr", gap: 14, maxWidth: 1440, margin: "0 auto", padding: "20px 32px", width: "100%", minHeight: 0 }}>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, overflowY: "auto" }}>
          {/* Market context */}
          <GlassCard style={{ padding: 18 }}>
            <div style={{ fontSize: 8, letterSpacing: "0.18em", color: T.emerald, marginBottom: 12 }}>MARKET CONTEXT</div>
            {sideStats.map(s => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                <span style={{ fontSize: 10, color: T.textDim }}>{s.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, fontFamily: T.fontDisp, color: s.color }}>{s.val}</span>
              </div>
            ))}
          </GlassCard>

          {/* Portfolio */}
          <GlassCard style={{ padding: 18 }}>
            <div style={{ fontSize: 8, letterSpacing: "0.18em", color: T.emerald, marginBottom: 12 }}>YOUR PORTFOLIO</div>
            {portStats.map(s => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                <span style={{ fontSize: 10, color: T.textDim }}>{s.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, fontFamily: T.fontDisp, color: s.color }}>{s.val}</span>
              </div>
            ))}
          </GlassCard>

          {/* AI context */}
          <GlassCard style={{ padding: 18 }}>
            <div style={{ fontSize: 8, letterSpacing: "0.18em", color: T.emerald, marginBottom: 12 }}>AI CONTEXT ACTIVE</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
              {[["Live Prices", T.emerald], ["Portfolio Data", T.emerald], ["News Sentiment", T.blue], ["Risk Profile", T.amber], ["GPT-4o", T.emerald], ["RAG Enabled", T.blue]].map(([l, c]) => (
                <span key={l} style={{ fontSize: 8, letterSpacing: "0.08em", padding: "3px 9px", borderRadius: 20, background: `${c}10`, border: `1px solid ${c}30`, color: c }}>{l}</span>
              ))}
            </div>
            <p style={{ fontSize: 10, color: T.textDim, lineHeight: 1.7, margin: 0 }}>The AI has full context of your portfolio, current market conditions, and today's news feed to give accurate, personalised advice.</p>
          </GlassCard>

          {/* Signals */}
          <GlassCard style={{ padding: 18 }}>
            <div style={{ fontSize: 8, letterSpacing: "0.18em", color: T.emerald, marginBottom: 12 }}>TODAY'S SIGNALS</div>
            {[
              { label: "NVDA Momentum", badge: "BULLISH", col: T.emerald },
              { label: "TSLA Risk", badge: "ELEVATED", col: T.red },
              { label: "Bond Outlook", badge: "NEUTRAL", col: T.amber },
              { label: "BTC 24h", badge: "+3.2%", col: T.emerald },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                <span style={{ fontSize: 10, color: T.textDim }}>{s.label}</span>
                <span style={{ fontSize: 8, fontWeight: 700, padding: "2px 8px", borderRadius: 5, background: `${s.col}15`, border: `1px solid ${s.col}40`, color: s.col }}>{s.badge}</span>
              </div>
            ))}
          </GlassCard>
        </div>

        {/* Chat panel */}
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 20, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
          {/* Header */}
          <div style={{ padding: "18px 22px 14px", borderBottom: `1px solid rgba(255,255,255,0.05)`, background: `linear-gradient(180deg, rgba(16,185,129,0.06) 0%, transparent 100%)`, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${T.emerald},${T.emeraldDk})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 20px ${T.emerald}44`, fontSize: 16, flexShrink: 0 }}>⚡</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFamily: T.fontDisp }}>Nexus AI Strategist</div>
                  <div style={{ fontSize: 9, color: T.emerald, letterSpacing: "0.12em", display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                    <LiveDot size={5} /> ONLINE · GPT-4o + MARKET CONTEXT
                  </div>
                </div>
              </div>
              <button onClick={() => setAiInfo(!aiInfo)} style={{ padding: "5px 10px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`, color: T.textMid, fontSize: 9, cursor: "pointer", fontFamily: T.font }}>
                {aiInfo ? "▼ HIDE" : "▲ INFO"}
              </button>
            </div>
            {aiInfo && (
              <div style={{ marginTop: 12, fontSize: 11, color: "#aaa", lineHeight: 1.65, padding: "10px 14px", background: "rgba(16,185,129,0.04)", borderRadius: 10, border: `1px solid rgba(16,185,129,0.12)`, animation: "fadeInUp 0.3s ease" }}>
                Nexus AI is a simulated GPT-4o model with real-time market context injection. It uses RAG over live news, your portfolio state, and macro signals to provide personalised financial intelligence.
              </div>
            )}
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10, minHeight: 0 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", animation: "fadeInUp 0.3s ease" }}>
                <div style={{ maxWidth: "80%", padding: "10px 14px", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: m.role === "user" ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${m.role === "user" ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.06)"}`, fontSize: 11, lineHeight: 1.65, color: m.role === "user" ? "#c5f0e4" : "#ccc" }}>
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div style={{ display: "flex", gap: 4, padding: "10px 14px", background: "rgba(255,255,255,0.04)", borderRadius: "14px 14px 14px 4px", width: "fit-content", border: `1px solid rgba(255,255,255,0.06)` }}>
                {[0, 1, 2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: T.emerald, animation: `bounce 1s ease ${i * 0.15}s infinite` }} />)}
              </div>
            )}
          </div>

          {/* Suggested prompts */}
          <div style={{ padding: "8px 16px", display: "flex", gap: 6, flexWrap: "wrap", borderTop: `1px solid rgba(255,255,255,0.04)`, flexShrink: 0 }}>
            {PROMPTS.map(p => (
              <button key={p} onClick={() => send(p)} style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`, color: T.textMid, fontSize: 9, letterSpacing: "0.08em", cursor: "pointer", fontFamily: T.font, transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(16,185,129,0.08)"; e.currentTarget.style.borderColor = "rgba(16,185,129,0.3)"; e.currentTarget.style.color = T.emerald; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMid; }}>
                {p}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: "10px 16px 14px", display: "flex", gap: 8, flexShrink: 0 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Ask Nexus AI anything..."
              style={{ flex: 1, padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.09)`, color: T.text, fontSize: 11, outline: "none", fontFamily: T.font }}
              onFocus={e => e.target.style.borderColor = "rgba(16,185,129,0.4)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.09)"}
            />
            <button onClick={() => send()} style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg,${T.emerald},${T.emeraldDk})`, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 20px ${T.emerald}44`, color: "#000" }}>
              <IcoSend size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────────────────────
function Footer({ onNavigate }) {
  return (
    <footer style={{ padding: "32px 40px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginTop: 40 }}>
      <div onClick={() => onNavigate("home")} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
        <div style={{ width: 24, height: 24, borderRadius: 6, background: `linear-gradient(135deg,${T.emerald},${T.emeraldDk})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#000", fontFamily: T.fontDisp }}>N</div>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", fontFamily: T.fontDisp }}>NEXUS<span style={{ color: T.emerald }}>FI</span></span>
      </div>
      <p style={{ fontSize: 9, color: T.textDim, letterSpacing: "0.08em" }}>© 2025 NexusFI Technologies · All financial data is simulated for demonstration purposes</p>
      <div style={{ display: "flex", gap: 20, fontSize: 8, color: T.textDim, letterSpacing: "0.12em" }}>
        {["PRIVACY", "TERMS", "API DOCS", "STATUS"].map(l => (
          <span key={l} style={{ cursor: "pointer" }} onMouseEnter={e => e.target.style.color = T.emerald} onMouseLeave={e => e.target.style.color = T.textDim}>{l}</span>
        ))}
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────────────────────
export default function NexusFI() {
  const [page, setPage] = useState("home");
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [alertHistory, setAlertHistory] = useState([]);
  const [eventIdx, setEventIdx] = useState(0);

  // Only surface CRITICAL / HIGH urgency events (urgency >= 8) as overlay notifications
  const HIGH_IMPACT_EVENTS = DRASTIC_EVENTS.filter(e => e.urgency >= 8);

  const fireAlert = useCallback(() => {
    setEventIdx(i => {
      const idx = i % HIGH_IMPACT_EVENTS.length;
      const ev = { ...HIGH_IMPACT_EVENTS[idx], uid: Date.now(), firedAt: Date.now() };
      setActiveAlerts(prev => [...prev.filter(a => a.id !== ev.id), ev]);
      setAlertHistory(h => [ev, ...h].slice(0, 50));
      return idx + 1;
    });
  }, []);

  useEffect(() => {
    const first = setTimeout(() => fireAlert(), 4000);
    const loop = setInterval(() => fireAlert(), 28000);
    return () => { clearTimeout(first); clearInterval(loop); };
  }, [fireAlert]);

  // Auto-dismiss overlays after 7 seconds — alert remains in bell history
  const activeUids = activeAlerts.map(a => a.uid).join(",");
  useEffect(() => {
    if (activeAlerts.length === 0) return;
    const timers = activeAlerts.map(ev =>
      setTimeout(() => setActiveAlerts(prev => prev.filter(a => a.uid !== ev.uid)), 7000)
    );
    return () => timers.forEach(clearTimeout);
  }, [activeUids]);

  const dismissAlert = (uid) => setActiveAlerts(prev => prev.filter(a => a.uid !== uid));

  const navigate = (p) => {
    setPage(p);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Space+Grotesk:wght@400;600;700;800&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html { scroll-behavior:smooth; }
        body { background:#0a0a0c; color:#eaeaea; margin:0; font-family:'Space Mono',monospace; }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(16,185,129,0.3); border-radius:2px; }
        @keyframes fadeInDown  { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:none} }
        @keyframes fadeInUp    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes fadeInRight { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:none} }
        @keyframes fadeIn      { from{opacity:0} to{opacity:1} }
        @keyframes pulse       { 0%,100%{opacity:1;box-shadow:0 0 8px currentColor} 50%{opacity:0.5;box-shadow:0 0 3px currentColor} }
        @keyframes bounce      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes scanline    { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        @keyframes iconPulse   { 0%,100%{transform:scale(1);box-shadow:0 0 12px currentColor} 50%{transform:scale(1.08);box-shadow:0 0 24px currentColor} }
        @keyframes flashBorder { 0%,100%{border-color:rgba(239,68,68,0.35)} 50%{border-color:rgba(239,68,68,0.7)} }
        @keyframes slideInRight{ from{opacity:0;transform:translateX(24px) scale(0.96)} to{opacity:1;transform:translateX(0) scale(1)} }
        @keyframes slideOutRight{ from{opacity:1;transform:translateX(0) scale(1)} to{opacity:0;transform:translateX(32px) scale(0.94)} }
        @keyframes timerDrain  { from{width:100%} to{width:0%} }
        @keyframes bellShake   { 0%,100%{transform:rotate(0)} 20%{transform:rotate(-14deg)} 40%{transform:rotate(14deg)} 60%{transform:rotate(-8deg)} 80%{transform:rotate(8deg)} }
        @keyframes badgePop    { 0%{transform:scale(0)} 70%{transform:scale(1.2)} 100%{transform:scale(1)} }
      `}</style>

      <div style={{ background: "#0a0a0c", color: T.text, fontFamily: T.font, minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
        {/* BG layers */}
        <div style={{ position: "fixed", inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`, pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "fixed", inset: 0, backgroundImage: `linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px)`, backgroundSize: "80px 80px", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "fixed", top: 80, right: 0, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "fixed", bottom: 0, left: 0, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
          <div style={{ position: "absolute", left: 0, right: 0, height: 2, background: "linear-gradient(transparent,rgba(16,185,129,0.06),transparent)", animation: "scanline 8s linear infinite" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <Nav activePage={page} onNavigate={navigate} alertCount={activeAlerts.length} alertHistory={alertHistory} onClearUnread={() => { }} />

          {page === "home" && <HomePage onNavigate={navigate} />}
          {page === "markets" && <MarketsPage onTriggerAlert={fireAlert} alertCount={activeAlerts.length} />}
          {page === "learn" && <LearnPage />}
          {page === "assessment" && <AssessmentPage />}
          {page === "portfolio" && <PortfolioPage />}
          {page === "ai" && <AIStrategyPage />}

          {page !== "ai" && <Footer onNavigate={navigate} />}
        </div>

        {/* Alert overlays — auto-dismiss after 7s */}
        {activeAlerts.map((ev, i) => (
          <div key={ev.uid} style={{ position: "fixed", zIndex: 9999, top: 76 + (i * 8), right: 20 + (i * 4) }}>
            <DrasticAlertOverlay event={ev} onDismiss={() => dismissAlert(ev.uid)} />
          </div>
        ))}
      </div>
    </>
  );
}