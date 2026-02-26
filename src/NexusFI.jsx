import { useState, useEffect, useRef, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, ReferenceLine, BarChart, Bar, CartesianGrid
} from "recharts";
import { PieChart, Pie, Cell } from "recharts";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const T = {
  bg:        "#0a0a0c",
  bgCard:    "rgba(255,255,255,0.03)",
  border:    "rgba(255,255,255,0.07)",
  borderHi:  "rgba(16,185,129,0.35)",
  emerald:   "#10b981",
  emeraldDk: "#059669",
  blue:      "#3b82f6",
  red:       "#ef4444",
  amber:     "#f59e0b",
  purple:    "#8b5cf6",
  text:      "#eaeaea",
  textMid:   "#888",
  textDim:   "#444",
  font:      "'Space Mono', 'Courier New', monospace",
  fontDisp:  "'Space Grotesk', sans-serif",
};

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────
const Ico = ({ d, size=14, color="currentColor", sw=1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
);
const IcoTrendUp  = (p) => <Ico {...p} d="m22 7-8.5 8.5-5-5L2 17"/>;
const IcoTrendDn  = (p) => <Ico {...p} d="m22 17-8.5-8.5-5 5L2 7"/>;
const IcoZap      = (p) => <Ico {...p} d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>;
const IcoShield   = (p) => <Ico {...p} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>;
const IcoAlert    = (p) => <Ico {...p} d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/>;
const IcoX        = (p) => <Ico {...p} d="M18 6 6 18M6 6l12 12"/>;
const IcoChevR    = (p) => <Ico {...p} d="m9 18 6-6-6-6"/>;
const IcoGlobe    = (p) => <Ico {...p} d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>;
const IcoActivity = (p) => <Ico {...p} d="M22 12h-4l-3 9L9 3 6 12H2"/>;
const IcoBell     = (p) => <Ico {...p} d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>;
const IcoInfo     = (p) => <Ico {...p} d="M12 16v-4M12 8h.01M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/>;
const IcoSend     = (p) => <Ico {...p} d="M22 2 11 13M22 2 15 22 11 13 2 9l20-7z"/>;
const IcoAward    = (p) => <Ico {...p} d="M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM8.21 13.89 7 23l5-3 5 3-1.21-9.12"/>;
const IcoSparkles = (p) => <Ico {...p} d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>;
const IcoGoogle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────────────────────
const genSpark = (base, variance, len=22, up=true) =>
  Array.from({ length: len }, (_, i) => ({
    t: i,
    v: base + (up ? i*(variance/len) : -i*(variance/len)) + (Math.random()-0.46)*variance*0.55,
  }));

const INDICES = [
  { id:"sp500",  label:"S&P 500",    value:"5,892.14",  change:"+1.24%", delta:+72.11,  positive:true,  high:"5,904.22", low:"5,811.90", vol:"3.2B", data:genSpark(5820,80,22,true),  color:T.emerald },
  { id:"nasdaq", label:"NASDAQ",     value:"18,543.72", change:"+1.87%", delta:+341.08, positive:true,  high:"18,601", low:"18,201",     vol:"5.8B", data:genSpark(18200,360,22,true), color:T.blue    },
  { id:"nifty",  label:"NIFTY 50",   value:"22,147.90", change:"-0.43%", delta:-96.21,  positive:false, high:"22,341", low:"22,098",     vol:"₹4.1T",data:genSpark(22250,220,22,false),color:T.amber  },
  { id:"dow",    label:"DOW JONES",  value:"38,671.33", change:"+0.62%", delta:+238.47, positive:true,  high:"38,780", low:"38,401",     vol:"2.9B", data:genSpark(38430,300,22,true), color:T.purple  },
];

const CHART_DATA = Array.from({ length: 48 }, (_, i) => {
  const h = (9+Math.floor(i/2))%24, m = i%2===0?"00":"30";
  return { t:`${h}:${m}`, price: 5750 + Math.sin(i*0.4)*80 + i*2.1 + (Math.random()-0.46)*30 };
});

const DRASTIC_EVENTS = [
  { id:"fed1", severity:"CRITICAL", title:"Fed Emergency Rate Decision", icon:"🏦", color:T.red, market:"US Bonds / Equities", affected:"TLT, SPY, QQQ, DXY", impact:"-3.2% to -8.4% projected", action:"SELL BONDS — BUY PUTS", urgency:9, description:"Fed chair signals emergency 75bps hike. Treasury yields spike to 5.8%. Equities facing severe correction risk. Crypto correlation high.", category:"MONETARY POLICY" },
  { id:"geo1", severity:"HIGH",     title:"Taiwan Strait Flash-Point",   icon:"⚠️", color:T.amber,market:"Tech / Semiconductors", affected:"TSM, NVDA, AAPL, INTC", impact:"-6.1% to -14% projected", action:"HEDGE SEMI EXPOSURE", urgency:8, description:"PLA naval exercises escalate near Taiwan. TSMC supply chain risk now material. Semiconductor sector under extreme pressure.", category:"GEOPOLITICAL" },
  { id:"cyb1", severity:"HIGH",     title:"Major Exchange Cyber Attack", icon:"🔐", color:T.purple,market:"Crypto / Fintech", affected:"BTC, ETH, COIN, HOOD",  impact:"-9% to -22% projected", action:"EXIT CRYPTO POSITIONS", urgency:8, description:"Coordinated attack on top 3 exchanges. $2.1B in assets frozen. SEC halts trading on 14 crypto ETFs. Flash crash risk imminent.", category:"CYBER SECURITY" },
  { id:"liq1", severity:"MODERATE", title:"Liquidity Crisis — Asia",    icon:"💧", color:T.blue, market:"Asian Markets / FX",  affected:"NKY, HSI, USDJPY, CNH",  impact:"-2.8% to -5.1% projected", action:"REDUCE ASIA EXPOSURE", urgency:6, description:"Yen carry-trade unwind accelerating. BOJ intervening at 155.40. Asian interbank rates spike 280bps overnight.", category:"LIQUIDITY" },
];

const NEWS_ITEMS = [
  { id:1, headline:"Fed signals potential rate cut amid cooling inflation data", source:"Reuters", time:"2m ago", impact:"+18% Vol", sentiment:"bullish", score:18 },
  { id:2, headline:"NVIDIA surges 4.2% on record datacenter revenue forecast", source:"Bloomberg", time:"7m ago", impact:"+31% Vol", sentiment:"bullish", score:31 },
  { id:3, headline:"China manufacturing PMI contracts for third consecutive month", source:"FT", time:"15m ago", impact:"-22% Vol", sentiment:"bearish", score:-22 },
  { id:4, headline:"Apple eyes $7B AI infrastructure investment in Southeast Asia", source:"WSJ", time:"28m ago", impact:"+12% Vol", sentiment:"bullish", score:12 },
  { id:5, headline:"Oil prices slip as OPEC+ signals production flexibility", source:"Axios", time:"41m ago", impact:"-9% Vol", sentiment:"neutral", score:-9 },
];

const STOCK_DATA = [
  { t:"9:30", price:178.2, user:null, ai:null },
  { t:"10:00", price:179.5, user:null, ai:null },
  { t:"10:30", price:177.8, user:null, ai:null },
  { t:"11:00", price:181.3, user:null, ai:null },
  { t:"11:30", price:180.1, user:null, ai:null },
  { t:"12:00", price:183.7, user:null, ai:null },
  { t:"12:30", price:182.4, user:183.0, ai:184.5 },
  { t:"13:00", price:null, user:185.5, ai:186.2 },
  { t:"13:30", price:null, user:187.2, ai:185.8 },
  { t:"14:00", price:null, user:190.0, ai:187.1 },
];

const PORTFOLIO_DATA = [
  { name:"US Equities", value:42, color:T.emerald },
  { name:"Crypto",      value:18, color:T.blue },
  { name:"Bonds",       value:22, color:T.purple },
  { name:"Commodities", value:11, color:T.amber },
  { name:"Cash",        value:7,  color:"#6b7280" },
];

const HOLDINGS = [
  { ticker:"AAPL",  name:"Apple Inc",       value:"$42,180", alloc:"14.8%", pnl:"+$8,340",  up:true  },
  { ticker:"MSFT",  name:"Microsoft",       value:"$38,500", alloc:"13.6%", pnl:"+$12,200", up:true  },
  { ticker:"NVDA",  name:"NVIDIA",          value:"$28,900", alloc:"10.2%", pnl:"+$14,100", up:true  },
  { ticker:"BTC",   name:"Bitcoin",         value:"$32,450", alloc:"11.4%", pnl:"+$9,800",  up:true  },
  { ticker:"TSLA",  name:"Tesla",           value:"$18,760", alloc:"6.6%",  pnl:"-$2,340",  up:false },
  { ticker:"GOOGL", name:"Alphabet",        value:"$16,800", alloc:"5.9%",  pnl:"+$3,100",  up:true  },
  { ticker:"TLT",   name:"iShares 20Y Tsy", value:"$28,100", alloc:"9.9%",  pnl:"-$1,200",  up:false },
  { ticker:"GLD",   name:"SPDR Gold",       value:"$19,500", alloc:"6.9%",  pnl:"+$2,700",  up:true  },
];

const BADGES = [
  { name:"Options Alpha", locked:false, color:T.emerald },
  { name:"Macro Thinker", locked:false, color:T.blue },
  { name:"Risk Analyst",  locked:false, color:T.purple },
  { name:"Quant Level I", locked:true,  color:"#6b7280" },
  { name:"DeFi Architect",locked:true,  color:"#6b7280" },
];

const CHAT_INIT = [
  { role:"ai",   text:"Good morning, Alex. Markets opened +0.8% today. Your tech holdings are outperforming the sector by 2.3%. Would you like a full portfolio brief?" },
  { role:"user", text:"Analyze the NVDA news impact on my tech holdings." },
  { role:"ai",   text:"NVDA's datacenter beat directly boosts MSFT, AMD, and SMCI in your portfolio. Combined exposure is 23.4%. Expected alpha: +1.8% over next 48h based on historical correlation patterns. Recommend holding — do not chase." },
];

const AI_REPLIES = [
  "Analyzing your portfolio against current macro conditions... Your MSFT and GOOGL positions show strong resilience. Recommend trimming TSLA by 8% to reduce correlated tech risk.",
  "Fed rate cut probability stands at 73% for Q2. This historically favors growth equities and REITs. Your current allocation is 78% aligned with this scenario.",
  "Top opportunities today: 1) NVDA momentum continuation, 2) Energy sector mean-reversion play, 3) USD/JPY carry if BOJ holds. Risk-adjusted, #1 fits your profile best.",
  "Your risk score is elevated at 62/100 due to crypto overweight (18% vs recommended 12%) and concentrated tech exposure (38%). Consider rotating $8K of BTC into short-duration treasuries.",
];

const COURSES = [
  { icon:"💰", title:"Budgeting & Cash Flow",          meta:"8 lessons · BEGINNER",      pct:100, color:T.emerald, status:"DONE"        },
  { icon:"📈", title:"Stock Market Fundamentals",       meta:"12 lessons · BEGINNER",     pct:100, color:T.emerald, status:"100%"        },
  { icon:"⚖️", title:"Risk Management & Volatility",    meta:"10 lessons · INTERMEDIATE", pct:74,  color:T.purple,  status:"74%",active:true },
  { icon:"🏦", title:"Options & Derivatives",           meta:"14 lessons · ADVANCED",     pct:0,   color:T.textDim, status:"0%",locked:true  },
  { icon:"🌍", title:"Macro Economics & Global Markets",meta:"16 lessons · ADVANCED",     pct:0,   color:T.textDim, status:"0%",locked:true  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HOOKS + PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
function useInView(threshold=0.15) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
}

function Reveal({ children, delay=0, style={} }) {
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

function GlassCard({ children, style={}, accentColor=T.emerald, onClick }) {
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
      {hov && <div style={{ position:"absolute", inset:0, pointerEvents:"none", background:`radial-gradient(600px circle at 50% 0%, ${accentColor}07, transparent 60%)`, borderRadius:"inherit" }}/>}
      {children}
    </div>
  );
}

function LiveDot({ color=T.emerald, size=6 }) {
  return <span style={{ width:size, height:size, borderRadius:"50%", background:color, display:"inline-block", animation:"pulse 1.5s infinite" }}/>;
}

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"rgba(10,10,12,0.9)", border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 14px", fontSize:11 }}>
      <div style={{ color:T.textMid, marginBottom:4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color:p.stroke||p.color, display:"flex", gap:8, alignItems:"center" }}>
          <span style={{ width:8, height:8, borderRadius:"50%", background:p.stroke||p.color, display:"inline-block" }}/>
          <span>{p.name}: {typeof p.value==="number" ? (p.value > 1000 ? p.value.toFixed(0) : p.value.toFixed(2)) : p.value}</span>
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
  const isCritical = ev.urgency >= 8;

  return (
    <div style={{
      width: expanded ? 360 : 300, fontFamily: T.font,
      animation: "slideInRight 0.45s cubic-bezier(0.16,1,0.3,1)",
      filter: `drop-shadow(0 0 ${isCritical ? 20 : 10}px ${ev.color}44)`,
    }}>
      <div style={{
        background: "rgba(12,12,14,0.96)", borderRadius: 14,
        border: `1px solid ${ev.color}55`,
        backdropFilter: "blur(24px)",
        animation: isCritical ? `flashBorder 1.8s ease infinite` : "none",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ padding: "12px 14px 10px", background: `linear-gradient(135deg, ${ev.color}12, transparent)`, borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:18, animation:"iconPulse 2s ease infinite", color:ev.color }}>{ev.icon}</span>
              <div>
                <div style={{ fontSize:8, letterSpacing:"0.14em", color:ev.color, fontWeight:700 }}>{ev.severity} ALERT · {ev.category}</div>
                <div style={{ fontSize:12, fontWeight:700, color:T.text, lineHeight:1.3, marginTop:1 }}>{ev.title}</div>
              </div>
            </div>
            <button onClick={onDismiss} style={{ background:"none", border:"none", color:T.textMid, cursor:"pointer", padding:4, borderRadius:6, flexShrink:0 }}>
              <IcoX size={12}/>
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding:"12px 14px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
            {[
              { label:"MARKET",  val:ev.market },
              { label:"IMPACT",  val:ev.impact, color:ev.color },
              { label:"AFFECTED",val:ev.affected },
              { label:"ACTION",  val:ev.action, color:T.amber },
            ].map(r => (
              <div key={r.label} style={{ background:"rgba(255,255,255,0.03)", borderRadius:8, padding:"7px 9px", border:`1px solid ${T.border}` }}>
                <div style={{ fontSize:7, color:T.textDim, letterSpacing:"0.1em", marginBottom:3 }}>{r.label}</div>
                <div style={{ fontSize:9, fontWeight:700, color:r.color||T.text, letterSpacing:"0.04em", lineHeight:1.3 }}>{r.val}</div>
              </div>
            ))}
          </div>

          {expanded && (
            <div style={{ fontSize:10, color:"#aaa", lineHeight:1.7, marginBottom:10, padding:"10px", background:"rgba(255,255,255,0.02)", borderRadius:8, border:`1px solid ${T.border}`, animation:"fadeIn 0.3s ease" }}>
              {ev.description}
            </div>
          )}

          <div style={{ display:"flex", gap:6, justifyContent:"space-between", alignItems:"center" }}>
            <button onClick={() => setExpanded(!expanded)} style={{
              fontSize:9, letterSpacing:"0.1em", padding:"6px 12px", borderRadius:8,
              background:`${ev.color}15`, border:`1px solid ${ev.color}40`, color:ev.color,
              cursor:"pointer", display:"flex", alignItems:"center", gap:5,
            }}>
              <IcoInfo size={11}/> {expanded ? "COLLAPSE" : "DETAILS"}
            </button>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ display:"flex", gap:3 }}>
                {Array.from({length:10}).map((_,i) => (
                  <div key={i} style={{ width:4, height:i < ev.urgency ? 14 : 6, borderRadius:2, background: i < ev.urgency ? ev.color : T.border, opacity: i < ev.urgency ? 0.8+(i*0.02) : 0.3 }}/>
                ))}
              </div>
              <span style={{ fontSize:8, color:T.textDim }}>{ev.urgency}/10</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NAV
// ─────────────────────────────────────────────────────────────────────────────
function Nav({ activePage, onNavigate, alertCount=0 }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const pages = ["HOME","MARKETS","LEARN","PORTFOLIO","AI STRATEGY"];
  const pageKeys = ["home","markets","learn","portfolio","ai"];

  return (
    <nav style={{
      position:"fixed", top:0, left:0, right:0, zIndex:100,
      padding:"0 40px", height:64,
      display:"flex", alignItems:"center", justifyContent:"space-between",
      background: scrolled ? "rgba(10,10,12,0.92)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? `1px solid ${T.border}` : "none",
      transition:"all 0.4s ease", fontFamily: T.font,
    }}>
      {/* Logo */}
      <div onClick={() => onNavigate("home")} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
        <div style={{ width:32, height:32, borderRadius:8, background:`linear-gradient(135deg,${T.emerald},${T.emeraldDk})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:"#000", boxShadow:`0 0 20px ${T.emerald}66`, fontFamily:T.fontDisp }}>N</div>
        <span style={{ fontSize:17, fontWeight:700, letterSpacing:"0.12em", color:T.text, fontFamily:T.fontDisp }}>NEXUS<span style={{ color:T.emerald }}>FI</span></span>
      </div>

      {/* Links */}
      <div style={{ display:"flex", gap:28, fontSize:10, letterSpacing:"0.14em" }}>
        {pages.map((label, i) => (
          <span key={label} onClick={() => onNavigate(pageKeys[i])} style={{
            cursor:"pointer", transition:"color 0.2s", position:"relative",
            color: activePage===pageKeys[i] ? T.emerald : T.textMid,
            paddingBottom:2,
          }}>
            {label}
            {activePage===pageKeys[i] && <div style={{ position:"absolute", bottom:-4, left:0, right:0, height:1, background:T.emerald, borderRadius:1 }}/>}
          </span>
        ))}
      </div>

      {/* Right: Alert badge + Connect */}
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        {alertCount > 0 && (
          <div onClick={() => onNavigate("markets")} style={{
            width:32, height:32, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center",
            background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.3)",
            cursor:"pointer", position:"relative",
          }}>
            <IcoBell size={15} color={T.red}/>
            <div style={{ position:"absolute", top:4, right:4, width:8, height:8, borderRadius:"50%", background:T.red, animation:"pulse 1.5s infinite", fontSize:6, display:"flex", alignItems:"center", justifyContent:"center", color:"#000", fontWeight:700 }}>{alertCount}</div>
          </div>
        )}
        <button style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 16px", borderRadius:10, background:"rgba(255,255,255,0.05)", border:`1px solid ${T.border}`, color:T.text, fontSize:11, letterSpacing:"0.08em", cursor:"pointer", fontFamily:T.font }}>
          <IcoGoogle/> Connect Google
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
  useEffect(() => { const t = setInterval(() => setTick(x=>x+1), 2000); return () => clearInterval(t); }, []);
  const words = ["Wealth.", "Alpha.", "Edge.", "Legacy."];

  const navCards = [
    { page:"markets",   icon:"📈", label:"LIVE INTELLIGENCE", title:"Markets & Prediction Arena",   desc:"Real-time charts, AI prediction overlays, drastic event alerts, and global market intelligence feed." },
    { page:"learn",     icon:"🧠", label:"ADAPTIVE LEARNING",  title:"Learning & Financial IQ",       desc:"Personalised education tracks, Financial IQ scoring, achievement badges, and performance analytics." },
    { page:"portfolio", icon:"🎯", label:"INTELLIGENCE DASHBOARD", title:"Portfolio Intelligence",   desc:"Asset allocation breakdown, risk exposure meter, and AI-driven portfolio rebalancing recommendations." },
    { page:"ai",        icon:"⚡", label:"AI ADVISOR",         title:"Nexus AI Strategist",           desc:"GPT-4o powered financial advisor with live market context, portfolio awareness, and 24/7 availability." },
  ];

  return (
    <div>
      {/* Hero */}
      <section style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"120px 40px 80px", textAlign:"center", position:"relative" }}>
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:700, height:700, borderRadius:"50%", background:"radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)", pointerEvents:"none" }}/>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"6px 16px", borderRadius:100, background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.25)", fontSize:10, letterSpacing:"0.18em", color:T.emerald, marginBottom:40, animation:"fadeInDown 0.8s ease" }}>
          <LiveDot/> LIVE MARKETS · 247 ASSETS TRACKED
        </div>
        <h1 style={{ fontSize:"clamp(42px,7vw,88px)", fontWeight:800, lineHeight:1.05, letterSpacing:"-0.02em", fontFamily:T.fontDisp, marginBottom:16, maxWidth:800, animation:"fadeInUp 0.9s ease 0.1s both", color:T.text }}>
          Bridge the Gap Between<br/>Theory and{" "}
          <span style={{ color:T.emerald, textShadow:`0 0 40px ${T.emerald}80`, transition:"all 0.5s ease" }}>
            {words[tick%words.length]}
          </span>
        </h1>
        <p style={{ fontSize:15, color:T.textMid, maxWidth:520, lineHeight:1.7, fontFamily:T.font, marginBottom:48, animation:"fadeInUp 0.9s ease 0.2s both" }}>
          One unified command center. Real-time intelligence, adaptive learning,
          and AI-powered portfolio strategy — synchronized.
        </p>
        <div style={{ display:"flex", gap:16, justifyContent:"center", animation:"fadeInUp 0.9s ease 0.3s both" }}>
          <button onClick={() => onNavigate("ai")} style={{ padding:"14px 32px", borderRadius:12, background:`linear-gradient(135deg,${T.emerald},${T.emeraldDk})`, border:"none", color:"#000", fontSize:13, fontWeight:700, letterSpacing:"0.08em", cursor:"pointer", boxShadow:`0 0 30px ${T.emerald}55`, fontFamily:T.font }}>
            ENTER THE NEXUS
          </button>
          <button onClick={() => onNavigate("markets")} style={{ padding:"14px 32px", borderRadius:12, background:"transparent", border:`1px solid ${T.border}`, color:T.text, fontSize:13, letterSpacing:"0.08em", cursor:"pointer", fontFamily:T.font }}>
            LIVE MARKETS
          </button>
        </div>
        <div style={{ display:"flex", gap:48, marginTop:72, animation:"fadeInUp 0.9s ease 0.4s both", flexWrap:"wrap", justifyContent:"center" }}>
          {[{label:"USERS",value:"47.2K"},{label:"ASSETS TRACKED",value:"1,204"},{label:"AVG. ALPHA",value:"+18.7%"},{label:"AI ACCURACY",value:"79.4%"}].map(s => (
            <div key={s.label} style={{ textAlign:"center" }}>
              <div style={{ fontSize:22, fontWeight:700, color:T.text, letterSpacing:"-0.02em", fontFamily:T.fontDisp }}>{s.value}</div>
              <div style={{ fontSize:9, color:T.textDim, letterSpacing:"0.16em", marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Nav Cards */}
      <section style={{ maxWidth:1400, margin:"0 auto", padding:"0 40px 80px" }}>
        <div style={{ fontSize:10, letterSpacing:"0.2em", color:T.textMid, textAlign:"center", marginBottom:32 }}>// EXPLORE THE PLATFORM</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:12 }}>
          {navCards.map((c, i) => (
            <Reveal key={c.page} delay={i*0.07}>
              <GlassCard onClick={() => onNavigate(c.page)} style={{ padding:28 }}>
                <span style={{ fontSize:32, marginBottom:16, display:"block" }}>{c.icon}</span>
                <div style={{ fontSize:9, letterSpacing:"0.18em", color:T.emerald, marginBottom:8 }}>{c.label}</div>
                <div style={{ fontSize:16, fontWeight:700, color:T.text, fontFamily:T.fontDisp, marginBottom:8 }}>{c.title}</div>
                <div style={{ fontSize:12, color:T.textMid, lineHeight:1.7, marginBottom:16 }}>{c.desc}</div>
                <span style={{ color:T.emerald, fontSize:18 }}>→</span>
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
function Sparkline({ data, color, width=150, height=36 }) {
  if (!data?.length) return null;
  const vals = data.map(d=>d.v);
  const min = Math.min(...vals), max = Math.max(...vals), rng = max - min || 1;
  const pts = vals.map((v,i) => `${(i/(vals.length-1))*width},${height - ((v-min)/rng)*(height-4)}`).join(" ");
  return (
    <svg width={width} height={height} style={{ overflow:"visible" }}>
      <defs>
        <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

function IndexCard({ idx, delay=0 }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:T.bgCard, border:`1px solid ${hov ? idx.color+"44" : T.border}`, borderRadius:16, padding:"18px 20px", transition:"all 0.25s", animation:`fadeInUp 0.5s ease ${delay}ms both`, cursor:"default" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
        <div>
          <div style={{ fontSize:8, letterSpacing:"0.14em", color:T.textDim, marginBottom:4 }}>{idx.region} · INDEX</div>
          <div style={{ fontSize:13, fontWeight:700, fontFamily:T.fontDisp }}>{idx.label}</div>
        </div>
        <div style={{ padding:"3px 8px", borderRadius:6, background:`${idx.positive?T.emerald:T.red}15`, border:`1px solid ${idx.positive?T.emerald:T.red}40`, fontSize:9, fontWeight:700, color:idx.positive?T.emerald:T.red }}>
          {idx.change}
        </div>
      </div>
      <div style={{ fontSize:22, fontWeight:800, fontFamily:T.fontDisp, letterSpacing:"-0.02em", color:idx.positive?T.emerald:T.red, marginBottom:10 }}>{idx.value}</div>
      <Sparkline data={idx.data} color={idx.color} width={160} height={40}/>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:8, fontSize:8, color:T.textDim }}>
        <span>H: {idx.high}</span><span>L: {idx.low}</span><span>VOL: {idx.vol}</span>
      </div>
    </div>
  );
}

function AiNewsPulse({ alertCount, onTriggerAlert }) {
  const [analysis, setAnalysis] = useState(null);
  const [typing, setTyping] = useState(false);

  const analyze = (item) => {
    setAnalysis(null); setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setAnalysis(`Based on the "${item.headline}" headline, sentiment scoring indicates a ${item.sentiment === "bullish" ? "positive" : item.sentiment === "bearish" ? "negative" : "neutral"} market reaction. Expected vol impact: ${item.impact}. Portfolio action: ${item.sentiment === "bullish" ? "HOLD / ACCUMULATE on dip" : item.sentiment === "bearish" ? "HEDGE / REDUCE exposure" : "MONITOR — no immediate action"}.`);
    }, 1000);
  };

  return (
    <div style={{ background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:20, padding:"22px", height:"100%", display:"flex", flexDirection:"column", gap:0 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div>
          <div style={{ fontSize:9, letterSpacing:"0.18em", color:T.emerald, marginBottom:4 }}>AI NEWS PULSE</div>
          <div style={{ fontSize:14, fontWeight:700, fontFamily:T.fontDisp }}>Market Intelligence</div>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {alertCount > 0 && (
            <div style={{ padding:"3px 8px", borderRadius:6, background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.35)", fontSize:9, fontWeight:700, color:T.red }}>
              {alertCount} ALERT{alertCount>1?"S":""}
            </div>
          )}
          <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:8, letterSpacing:"0.14em", color:T.emerald }}>
            <LiveDot size={5}/> LIVE
          </div>
        </div>
      </div>

      <div style={{ flex:1, display:"flex", flexDirection:"column", gap:4, overflowY:"auto" }}>
        {NEWS_ITEMS.map((item, i) => {
          const col = item.sentiment==="bullish" ? T.emerald : item.sentiment==="bearish" ? T.red : T.amber;
          return (
            <div key={item.id} onClick={() => analyze(item)}
              style={{ padding:"10px 12px", borderRadius:10, background:"rgba(255,255,255,0.02)", border:`1px solid ${T.border}`, cursor:"pointer", position:"relative", overflow:"hidden", animation:`fadeInRight 0.4s ease ${i*0.06}s both`, transition:"all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor=col+"33"; }}
              onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor=T.border; }}>
              <div style={{ position:"absolute", left:0, top:6, bottom:6, width:2, borderRadius:2, background:col }}/>
              <div style={{ paddingLeft:10, display:"flex", justifyContent:"space-between", gap:8 }}>
                <p style={{ fontSize:10, color:"#ccc", lineHeight:1.5, margin:0, flex:1 }}>{item.headline}</p>
                <div style={{ padding:"2px 7px", borderRadius:5, background:`${col}15`, border:`1px solid ${col}40`, color:col, fontSize:8, fontWeight:700, whiteSpace:"nowrap", flexShrink:0 }}>{item.impact}</div>
              </div>
              <div style={{ paddingLeft:10, display:"flex", gap:8, marginTop:4, fontSize:8, color:T.textDim }}>
                <span style={{color:T.textMid}}>{item.source}</span><span>{item.time}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Response area */}
      {(typing || analysis) && (
        <div style={{ marginTop:12, padding:"12px 14px", background:"rgba(16,185,129,0.05)", border:`1px solid rgba(16,185,129,0.2)`, borderRadius:12 }}>
          <div style={{ fontSize:8, letterSpacing:"0.12em", color:T.emerald, marginBottom:6 }}>⚡ NEXUS AI ANALYSIS</div>
          {typing ? (
            <div style={{ display:"flex", gap:4 }}>
              {[0,1,2].map(i => <div key={i} style={{ width:5, height:5, borderRadius:"50%", background:T.emerald, animation:`bounce 1s ease ${i*0.15}s infinite` }}/>)}
            </div>
          ) : (
            <p style={{ fontSize:11, color:"#aaa", lineHeight:1.65, margin:0 }}>{analysis}</p>
          )}
        </div>
      )}

      {/* Trigger alert button */}
      <button onClick={onTriggerAlert} style={{ marginTop:12, padding:"8px 14px", borderRadius:10, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", color:T.red, fontSize:9, letterSpacing:"0.12em", cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontFamily:T.font }}>
        <IcoAlert size={11}/> SIMULATE DRASTIC EVENT ALERT
      </button>
    </div>
  );
}

function GlobalTradeNexus() {
  const regions = [
    { name:"NEW YORK", code:"NYSE", status:"OPEN",   time:"14:32 EDT", color:T.emerald, sentiment:+78, assets:["+S&P 500","+NASDAQ","+DOW","-VIX"] },
    { name:"LONDON",   code:"LSE",  status:"CLOSED", time:"19:32 BST", color:T.textDim, sentiment:+34, assets:["+FTSE100","-GBP/USD","=GILT"] },
    { name:"TOKYO",    code:"TSE",  status:"CLOSED", time:"23:32 JST", color:T.textDim, sentiment:-12, assets:["-Nikkei","-USDJPY","=Topix"] },
    { name:"MUMBAI",   code:"NSE",  status:"CLOSED", time:"00:02 IST", color:T.textDim, sentiment:-43, assets:["-NIFTY","-SENSEX","=INR"] },
    { name:"SHANGHAI", code:"SSE",  status:"CLOSED", time:"02:32 CST", color:T.textDim, sentiment:-61, assets:["-CSI300","=CNH","=SHCOMP"] },
    { name:"FRANKFURT",code:"FWB",  status:"CLOSED", time:"20:32 CET", color:T.textDim, sentiment:+22, assets:["+DAX","+EUR/USD","=BUND"] },
  ];

  return (
    <Reveal delay={0.1}>
      <GlassCard style={{ padding:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div>
            <div style={{ fontSize:9, letterSpacing:"0.18em", color:T.blue, marginBottom:4 }}>GLOBAL EXCHANGE NEXUS</div>
            <div style={{ fontSize:16, fontWeight:700, fontFamily:T.fontDisp }}>World Market Status</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:8, letterSpacing:"0.12em", color:T.emerald }}>
            <LiveDot size={5}/> 1 EXCHANGE OPEN
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:10 }}>
          {regions.map(r => {
            const col = r.status==="OPEN" ? T.emerald : T.textDim;
            return (
              <div key={r.code} style={{ background:"rgba(255,255,255,0.02)", borderRadius:12, padding:"14px 16px", border:`1px solid ${r.status==="OPEN" ? T.emerald+"33" : T.border}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                  <div>
                    <div style={{ fontSize:10, fontWeight:700, color:T.text, fontFamily:T.fontDisp }}>{r.name}</div>
                    <div style={{ fontSize:8, color:T.textDim, letterSpacing:"0.1em" }}>{r.code} · {r.time}</div>
                  </div>
                  <div style={{ padding:"2px 7px", borderRadius:5, background:`${col}12`, border:`1px solid ${col}30`, fontSize:7, fontWeight:700, color:col }}>{r.status}</div>
                </div>
                <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                  {r.assets.map(a => (
                    <span key={a} style={{ fontSize:7, padding:"2px 6px", borderRadius:4, background:"rgba(255,255,255,0.04)", color: a[0]==="+" ? T.emerald : a[0]==="-" ? T.red : T.textMid }}>{a.slice(1)}</span>
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
  return (
    <div style={{ paddingTop:80, maxWidth:1440, margin:"0 auto", padding:"80px 32px 40px" }}>
      <Reveal>
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:9, letterSpacing:"0.2em", color:T.emerald, marginBottom:8 }}>LIVE INTELLIGENCE</div>
          <h1 style={{ fontSize:"clamp(28px,4vw,48px)", fontWeight:800, letterSpacing:"-0.02em", fontFamily:T.fontDisp, marginBottom:8 }}>
            Markets & <span style={{ color:T.emerald }}>Prediction Arena</span>
          </h1>
          <p style={{ fontSize:13, color:T.textMid, maxWidth:520, lineHeight:1.7 }}>Real-time global indices, AI-powered signals, and drastic event monitoring.</p>
        </div>
      </Reveal>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:16, marginBottom:20, alignItems:"start" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12 }}>
          {INDICES.map((idx, i) => <IndexCard key={idx.id} idx={idx} delay={i*80}/>)}
        </div>
        <div style={{ minHeight:460 }}>
          <AiNewsPulse alertCount={alertCount} onTriggerAlert={onTriggerAlert}/>
        </div>
      </div>

      {/* Full-width chart */}
      <Reveal delay={0.15}>
        <GlassCard style={{ padding:24, marginBottom:16 }}>
          <div style={{ fontSize:9, letterSpacing:"0.18em", color:T.emerald, marginBottom:6 }}>PREDICTION ARENA</div>
          <div style={{ fontSize:14, fontWeight:700, fontFamily:T.fontDisp, marginBottom:16 }}>S&P 500 — Intraday with AI Overlay</div>
          <div style={{ height:220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA} margin={{ top:5, right:5, bottom:0, left:-20 }}>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={T.emerald} stopOpacity={0.15}/>
                    <stop offset="95%" stopColor={T.emerald} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" tick={{ fontSize:8, fill:T.textDim, fontFamily:T.font }} axisLine={false} tickLine={false} interval={7}/>
                <YAxis tick={{ fontSize:8, fill:T.textDim, fontFamily:T.font }} axisLine={false} tickLine={false} domain={["auto","auto"]}/>
                <Tooltip content={<ChartTip/>}/>
                <Area type="monotone" dataKey="price" name="S&P 500" stroke={T.emerald} strokeWidth={2} fill="url(#chartGrad)" dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </Reveal>

      <GlobalTradeNexus/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LEARN PAGE
// ─────────────────────────────────────────────────────────────────────────────
function LearnPage() {
  const [track, setTrack] = useState("learning");

  return (
    <div style={{ paddingTop:80, maxWidth:1400, margin:"0 auto", padding:"80px 40px 40px" }}>
      <Reveal>
        <div style={{ marginBottom:32 }}>
          <div style={{ fontSize:9, letterSpacing:"0.2em", color:T.purple, marginBottom:8 }}>ADAPTIVE LEARNING</div>
          <h1 style={{ fontSize:"clamp(28px,4vw,48px)", fontWeight:800, letterSpacing:"-0.02em", fontFamily:T.fontDisp, marginBottom:8 }}>
            Financial <span style={{ color:T.purple }}>IQ & Growth</span>
          </h1>
          <p style={{ fontSize:13, color:T.textMid, maxWidth:520, lineHeight:1.7 }}>Adaptive learning paths, personalised assessments, and real investment performance — all in one track.</p>
        </div>
      </Reveal>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {/* Left: FIQ + Badges */}
        <Reveal delay={0.05}>
          <GlassCard accentColor={T.purple} style={{ padding:28, height:"auto" }}>
            {/* Track toggle */}
            <div style={{ display:"flex", gap:0, marginBottom:24, background:"rgba(255,255,255,0.04)", borderRadius:10, padding:3 }}>
              {["learning","investment"].map(t => (
                <button key={t} onClick={() => setTrack(t)} style={{ flex:1, padding:8, borderRadius:8, background:track===t?"rgba(255,255,255,0.08)":"transparent", border:"none", color:track===t?T.text:T.textDim, fontSize:9, letterSpacing:"0.14em", cursor:"pointer", fontFamily:T.font }}>
                  {t.toUpperCase()} TRACK
                </button>
              ))}
            </div>

            {track === "learning" ? (
              <>
                <div style={{ fontSize:9, letterSpacing:"0.18em", color:T.purple, marginBottom:16 }}>FINANCIAL IQ LEVEL</div>
                <div style={{ marginBottom:20 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <span style={{ fontSize:28, fontWeight:800, fontFamily:T.fontDisp, color:T.text }}>74<span style={{ fontSize:14, color:T.textDim }}>/100</span></span>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:11, color:T.purple }}>LEVEL 4</div>
                      <div style={{ fontSize:9, color:T.textDim, letterSpacing:"0.1em" }}>MACRO ANALYST</div>
                    </div>
                  </div>
                  <div style={{ height:6, borderRadius:100, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
                    <div style={{ height:"100%", width:"74%", borderRadius:100, background:"linear-gradient(90deg,#8b5cf6,#a78bfa)", boxShadow:"0 0 12px rgba(139,92,246,0.6)" }}/>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:4, fontSize:8, color:"#333" }}>
                    <span>BEGINNER</span><span>QUANT</span>
                  </div>
                </div>

                {/* 7-day streak */}
                <div style={{ fontSize:9, letterSpacing:"0.14em", color:T.purple, marginBottom:12 }}>7-DAY STREAK</div>
                <div style={{ display:"flex", gap:6, marginBottom:20 }}>
                  {["M","T","W","T","F","S","S"].map((d,i) => (
                    <div key={i} style={{ flex:1, height:38, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, border:`1px solid ${i<4 ? T.emerald+"44" : i===4 ? T.emerald : T.border}`, background:i<4 ? "rgba(16,185,129,0.1)" : i===4 ? "rgba(16,185,129,0.2)" : "transparent", color:i<=4 ? T.emerald : T.textDim }}>
                      {d}{i===4?" ✓":""}
                    </div>
                  ))}
                </div>

                <div style={{ fontSize:9, letterSpacing:"0.14em", color:T.purple, marginBottom:12 }}>ASSESSMENT BADGES</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {BADGES.map(b => (
                    <div key={b.name} style={{ padding:"5px 11px", borderRadius:8, fontSize:10, background:b.locked?"rgba(255,255,255,0.03)":`${b.color}15`, border:`1px solid ${b.locked?"rgba(255,255,255,0.06)":`${b.color}40`}`, color:b.locked?"#333":b.color, display:"flex", alignItems:"center", gap:5, opacity:b.locked?0.5:1 }}>
                      {b.locked ? <IcoShield size={11}/> : <IcoAward size={11}/>} {b.name}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize:9, letterSpacing:"0.18em", color:T.emerald, marginBottom:16 }}>INVESTMENT PERFORMANCE</div>
                {[
                  { label:"Total Return",  val:"+24.8%", color:T.emerald },
                  { label:"Sharpe Ratio",  val:"1.84",   color:T.blue },
                  { label:"Max Drawdown",  val:"-7.2%",  color:T.red },
                  { label:"Win Rate",      val:"64.3%",  color:T.amber },
                  { label:"Best Trade",    val:"+41.2%", color:T.emerald },
                  { label:"Total Trades",  val:"147",    color:T.text },
                ].map(m => (
                  <div key={m.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 0", borderBottom:`1px solid ${T.border}` }}>
                    <span style={{ fontSize:11, color:T.textMid }}>{m.label}</span>
                    <span style={{ fontSize:16, fontWeight:700, fontFamily:T.fontDisp, color:m.color }}>{m.val}</span>
                  </div>
                ))}
              </>
            )}
          </GlassCard>
        </Reveal>

        {/* Right: Courses */}
        <Reveal delay={0.1}>
          <GlassCard accentColor={T.purple} style={{ padding:28, height:"auto" }}>
            <div style={{ fontSize:9, letterSpacing:"0.18em", color:T.purple, marginBottom:4 }}>LEARNING PATH</div>
            <div style={{ fontSize:16, fontWeight:700, fontFamily:T.fontDisp, marginBottom:20 }}>Your Curriculum</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {COURSES.map((c, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 18px", borderRadius:14, background:"rgba(255,255,255,0.02)", border:`1px solid ${c.active ? T.purple+"44" : T.border}`, opacity:c.locked?0.55:1, cursor:c.locked?"default":"pointer", transition:"all 0.2s" }}
                  onMouseEnter={e => { if (!c.locked) e.currentTarget.style.borderColor=T.purple+"55"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor=c.active?T.purple+"44":T.border; }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                    <span style={{ fontSize:22 }}>{c.icon}</span>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, fontFamily:T.fontDisp, color:T.text, marginBottom:3 }}>{c.title}</div>
                      <div style={{ fontSize:10, color:T.textMid }}>{c.meta}{c.active?" · IN PROGRESS":""}{c.locked?" · LOCKED":""}</div>
                    </div>
                  </div>
                  <div style={{ width:72, textAlign:"right" }}>
                    <div style={{ fontSize:9, color:c.active?T.purple:T.textDim, marginBottom:4, letterSpacing:"0.1em" }}>{c.status}</div>
                    <div style={{ height:3, borderRadius:100, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${c.pct}%`, borderRadius:100, background:c.color }}/>
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
    <div style={{ paddingTop:80, maxWidth:1400, margin:"0 auto", padding:"80px 40px 40px" }}>
      <Reveal>
        <div style={{ marginBottom:32 }}>
          <div style={{ fontSize:9, letterSpacing:"0.2em", color:T.blue, marginBottom:8 }}>INTELLIGENCE DASHBOARD</div>
          <h1 style={{ fontSize:"clamp(28px,4vw,48px)", fontWeight:800, letterSpacing:"-0.02em", fontFamily:T.fontDisp, marginBottom:8 }}>
            Portfolio <span style={{ color:T.blue }}>Intelligence</span>
          </h1>
          <p style={{ fontSize:13, color:T.textMid, lineHeight:1.7 }}>Asset allocation breakdown, risk exposure analysis, and AI-powered rebalancing insights.</p>
        </div>
      </Reveal>

      {/* Top stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:16 }}>
        {[
          { val:"$284K",  label:"TOTAL PORTFOLIO VALUE", color:T.emerald },
          { val:"+24.8%", label:"TOTAL RETURN YTD",       color:T.emerald },
          { val:"62/100", label:"RISK SCORE — MODERATE",  color:T.amber },
        ].map((s, i) => (
          <Reveal key={s.label} delay={i*0.06}>
            <GlassCard accentColor={s.color} style={{ padding:24, textAlign:"center" }}>
              <div style={{ fontSize:32, fontWeight:800, fontFamily:T.fontDisp, color:s.color, marginBottom:6 }}>{s.val}</div>
              <div style={{ fontSize:9, letterSpacing:"0.14em", color:T.textDim }}>{s.label}</div>
            </GlassCard>
          </Reveal>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {/* Allocation + risk */}
        <Reveal delay={0.05}>
          <GlassCard accentColor={T.blue} style={{ padding:28, height:"auto" }}>
            <div style={{ fontSize:9, letterSpacing:"0.18em", color:T.blue, marginBottom:6 }}>PORTFOLIO INTELLIGENCE</div>
            <div style={{ fontSize:16, fontWeight:700, fontFamily:T.fontDisp, marginBottom:20 }}>Asset Allocation</div>
            <div style={{ display:"flex", gap:20, alignItems:"center", marginBottom:24 }}>
              <div style={{ position:"relative", width:160, height:160, flexShrink:0 }}>
                <PieChart width={160} height={160}>
                  <Pie data={PORTFOLIO_DATA} cx={75} cy={75} innerRadius={48} outerRadius={68} dataKey="value" strokeWidth={0}
                    onMouseEnter={(_,i) => setActiveSlice(i)} onMouseLeave={() => setActiveSlice(null)}>
                    {PORTFOLIO_DATA.map((entry, i) => (
                      <Cell key={i} fill={entry.color} opacity={activeSlice===null||activeSlice===i?1:0.35}/>
                    ))}
                  </Pie>
                </PieChart>
                <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center", pointerEvents:"none" }}>
                  {activeSlice!==null ? (
                    <><div style={{ fontSize:16, fontWeight:700, color:PORTFOLIO_DATA[activeSlice].color }}>{PORTFOLIO_DATA[activeSlice].value}%</div>
                    <div style={{ fontSize:8, color:T.textDim }}>{PORTFOLIO_DATA[activeSlice].name.toUpperCase()}</div></>
                  ) : (
                    <><div style={{ fontSize:14, fontWeight:700, color:T.text }}>$284K</div><div style={{ fontSize:8, color:T.textDim }}>TOTAL</div></>
                  )}
                </div>
              </div>
              <div style={{ flex:1, display:"flex", flexDirection:"column", gap:10 }}>
                {PORTFOLIO_DATA.map((d, i) => (
                  <div key={d.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", opacity:activeSlice===null||activeSlice===i?1:0.4, transition:"opacity 0.2s" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:8, height:8, borderRadius:2, background:d.color }}/>
                      <span style={{ fontSize:10, color:T.textMid }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize:11, fontWeight:700, color:d.color }}>{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Risk meter */}
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, fontSize:10 }}>
                <span style={{ color:T.textDim, letterSpacing:"0.12em" }}>RISK EXPOSURE</span>
                <span style={{ color:T.amber, fontWeight:700 }}>62/100 — MODERATE</span>
              </div>
              <div style={{ height:8, borderRadius:100, background:"rgba(255,255,255,0.05)", overflow:"hidden" }}>
                <div style={{ height:"100%", width:"62%", borderRadius:100, background:`linear-gradient(90deg,${T.emerald},${T.amber})`, boxShadow:"0 0 10px rgba(245,158,11,0.4)" }}/>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:4, fontSize:8, color:"#333" }}>
                <span>CONSERVATIVE</span><span>AGGRESSIVE</span>
              </div>
            </div>
            {/* AI insight */}
            <div style={{ marginTop:20, padding:14, background:"rgba(16,185,129,0.05)", border:"1px solid rgba(16,185,129,0.15)", borderRadius:12 }}>
              <div style={{ fontSize:8, color:T.emerald, letterSpacing:"0.12em", marginBottom:6 }}>⚡ AI REBALANCING INSIGHT</div>
              <p style={{ fontSize:11, color:"#aaa", lineHeight:1.65, margin:0 }}>Your crypto exposure (18%) exceeds recommended 12% for your risk profile. Consider trimming BTC by ~$8K and rotating into short-duration bonds ahead of CPI data.</p>
            </div>
          </GlassCard>
        </Reveal>

        {/* Holdings table */}
        <Reveal delay={0.1}>
          <GlassCard accentColor={T.blue} style={{ padding:28, height:"auto" }}>
            <div style={{ fontSize:9, letterSpacing:"0.18em", color:T.blue, marginBottom:6 }}>HOLDINGS</div>
            <div style={{ fontSize:16, fontWeight:700, fontFamily:T.fontDisp, marginBottom:20 }}>Current Positions</div>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr>{["TICKER","VALUE","ALLOC","P&L"].map(h => <th key={h} style={{ fontSize:8, letterSpacing:"0.14em", color:T.textDim, textAlign:"left", padding:"6px 10px", borderBottom:`1px solid ${T.border}` }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {HOLDINGS.map(h => (
                  <tr key={h.ticker}
                    onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.02)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background="transparent"; }}>
                    <td style={{ padding:"11px 10px", borderBottom:`1px solid rgba(255,255,255,0.03)`, fontSize:12 }}>
                      <span style={{ color:T.text, fontWeight:600 }}>{h.ticker}</span>
                      <br/><span style={{ fontSize:9, color:T.textDim }}>{h.name}</span>
                    </td>
                    <td style={{ padding:"11px 10px", borderBottom:`1px solid rgba(255,255,255,0.03)`, fontSize:12, color:T.textMid }}>{h.value}</td>
                    <td style={{ padding:"11px 10px", borderBottom:`1px solid rgba(255,255,255,0.03)`, fontSize:12, color:T.textMid }}>{h.alloc}</td>
                    <td style={{ padding:"11px 10px", borderBottom:`1px solid rgba(255,255,255,0.03)`, fontSize:12, color:h.up?T.emerald:T.red }}>{h.pnl}</td>
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

  const PROMPTS = ["Why is my risk score elevated?","Rebalance for rate cut scenario","Top 3 opportunities today","Explain my NVDA exposure"];

  const send = (text=input) => {
    if (!text.trim()) return;
    setMessages(m => [...m, { role:"user", text:text.trim() }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, { role:"ai", text:AI_REPLIES[Math.floor(Math.random()*AI_REPLIES.length)] }]);
    }, 1400);
  };

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, typing]);

  const sideStats = [
    { label:"S&P 500",  val:"5,892.14 ▲", color:T.emerald },
    { label:"NASDAQ",   val:"18,543 ▲",   color:T.emerald },
    { label:"VIX",      val:"16.43 ▼",    color:T.red },
    { label:"Fed Rate", val:"5.25–5.50%", color:T.text },
    { label:"10Y Yield",val:"4.31%",      color:T.text },
  ];
  const portStats = [
    { label:"Total Value", val:"$284,180",  color:T.emerald },
    { label:"Today's P&L", val:"+$2,134",   color:T.emerald },
    { label:"Risk Score",  val:"62/100",    color:T.amber },
    { label:"Top Holding", val:"AAPL 14.8%",color:T.text },
  ];

  return (
    <div style={{ paddingTop:64, height:"100vh", display:"flex", flexDirection:"column" }}>
      <div style={{ flex:1, display:"grid", gridTemplateColumns:"340px 1fr", gap:14, maxWidth:1440, margin:"0 auto", padding:"20px 32px", width:"100%", minHeight:0 }}>
        
        {/* Sidebar */}
        <div style={{ display:"flex", flexDirection:"column", gap:10, overflowY:"auto" }}>
          {/* Market context */}
          <GlassCard style={{ padding:18 }}>
            <div style={{ fontSize:8, letterSpacing:"0.18em", color:T.emerald, marginBottom:12 }}>MARKET CONTEXT</div>
            {sideStats.map(s => (
              <div key={s.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid rgba(255,255,255,0.04)` }}>
                <span style={{ fontSize:10, color:T.textDim }}>{s.label}</span>
                <span style={{ fontSize:12, fontWeight:700, fontFamily:T.fontDisp, color:s.color }}>{s.val}</span>
              </div>
            ))}
          </GlassCard>

          {/* Portfolio */}
          <GlassCard style={{ padding:18 }}>
            <div style={{ fontSize:8, letterSpacing:"0.18em", color:T.emerald, marginBottom:12 }}>YOUR PORTFOLIO</div>
            {portStats.map(s => (
              <div key={s.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid rgba(255,255,255,0.04)` }}>
                <span style={{ fontSize:10, color:T.textDim }}>{s.label}</span>
                <span style={{ fontSize:12, fontWeight:700, fontFamily:T.fontDisp, color:s.color }}>{s.val}</span>
              </div>
            ))}
          </GlassCard>

          {/* AI context */}
          <GlassCard style={{ padding:18 }}>
            <div style={{ fontSize:8, letterSpacing:"0.18em", color:T.emerald, marginBottom:12 }}>AI CONTEXT ACTIVE</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
              {[["Live Prices",T.emerald],["Portfolio Data",T.emerald],["News Sentiment",T.blue],["Risk Profile",T.amber],["GPT-4o",T.emerald],["RAG Enabled",T.blue]].map(([l,c]) => (
                <span key={l} style={{ fontSize:8, letterSpacing:"0.08em", padding:"3px 9px", borderRadius:20, background:`${c}10`, border:`1px solid ${c}30`, color:c }}>{l}</span>
              ))}
            </div>
            <p style={{ fontSize:10, color:T.textDim, lineHeight:1.7, margin:0 }}>The AI has full context of your portfolio, current market conditions, and today's news feed to give accurate, personalised advice.</p>
          </GlassCard>

          {/* Signals */}
          <GlassCard style={{ padding:18 }}>
            <div style={{ fontSize:8, letterSpacing:"0.18em", color:T.emerald, marginBottom:12 }}>TODAY'S SIGNALS</div>
            {[
              { label:"NVDA Momentum", badge:"BULLISH", col:T.emerald },
              { label:"TSLA Risk",     badge:"ELEVATED", col:T.red },
              { label:"Bond Outlook",  badge:"NEUTRAL",  col:T.amber },
              { label:"BTC 24h",       badge:"+3.2%",    col:T.emerald },
            ].map(s => (
              <div key={s.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid rgba(255,255,255,0.04)` }}>
                <span style={{ fontSize:10, color:T.textDim }}>{s.label}</span>
                <span style={{ fontSize:8, fontWeight:700, padding:"2px 8px", borderRadius:5, background:`${s.col}15`, border:`1px solid ${s.col}40`, color:s.col }}>{s.badge}</span>
              </div>
            ))}
          </GlassCard>
        </div>

        {/* Chat panel */}
        <div style={{ background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:20, display:"flex", flexDirection:"column", overflow:"hidden", minHeight:0 }}>
          {/* Header */}
          <div style={{ padding:"18px 22px 14px", borderBottom:`1px solid rgba(255,255,255,0.05)`, background:`linear-gradient(180deg, rgba(16,185,129,0.06) 0%, transparent 100%)`, flexShrink:0 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${T.emerald},${T.emeraldDk})`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 0 20px ${T.emerald}44`, fontSize:16, flexShrink:0 }}>⚡</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, fontFamily:T.fontDisp }}>Nexus AI Strategist</div>
                  <div style={{ fontSize:9, color:T.emerald, letterSpacing:"0.12em", display:"flex", alignItems:"center", gap:5, marginTop:2 }}>
                    <LiveDot size={5}/> ONLINE · GPT-4o + MARKET CONTEXT
                  </div>
                </div>
              </div>
              <button onClick={() => setAiInfo(!aiInfo)} style={{ padding:"5px 10px", borderRadius:8, background:"rgba(255,255,255,0.04)", border:`1px solid ${T.border}`, color:T.textMid, fontSize:9, cursor:"pointer", fontFamily:T.font }}>
                {aiInfo ? "▼ HIDE" : "▲ INFO"}
              </button>
            </div>
            {aiInfo && (
              <div style={{ marginTop:12, fontSize:11, color:"#aaa", lineHeight:1.65, padding:"10px 14px", background:"rgba(16,185,129,0.04)", borderRadius:10, border:`1px solid rgba(16,185,129,0.12)`, animation:"fadeInUp 0.3s ease" }}>
                Nexus AI is a simulated GPT-4o model with real-time market context injection. It uses RAG over live news, your portfolio state, and macro signals to provide personalised financial intelligence.
              </div>
            )}
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex:1, overflowY:"auto", padding:"16px 20px", display:"flex", flexDirection:"column", gap:10, minHeight:0 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start", animation:"fadeInUp 0.3s ease" }}>
                <div style={{ maxWidth:"80%", padding:"10px 14px", borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px", background:m.role==="user"?"rgba(16,185,129,0.12)":"rgba(255,255,255,0.04)", border:`1px solid ${m.role==="user"?"rgba(16,185,129,0.25)":"rgba(255,255,255,0.06)"}`, fontSize:11, lineHeight:1.65, color:m.role==="user"?"#c5f0e4":"#ccc" }}>
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div style={{ display:"flex", gap:4, padding:"10px 14px", background:"rgba(255,255,255,0.04)", borderRadius:"14px 14px 14px 4px", width:"fit-content", border:`1px solid rgba(255,255,255,0.06)` }}>
                {[0,1,2].map(i => <div key={i} style={{ width:5, height:5, borderRadius:"50%", background:T.emerald, animation:`bounce 1s ease ${i*0.15}s infinite` }}/>)}
              </div>
            )}
          </div>

          {/* Suggested prompts */}
          <div style={{ padding:"8px 16px", display:"flex", gap:6, flexWrap:"wrap", borderTop:`1px solid rgba(255,255,255,0.04)`, flexShrink:0 }}>
            {PROMPTS.map(p => (
              <button key={p} onClick={() => send(p)} style={{ padding:"4px 10px", borderRadius:6, background:"rgba(255,255,255,0.04)", border:`1px solid ${T.border}`, color:T.textMid, fontSize:9, letterSpacing:"0.08em", cursor:"pointer", fontFamily:T.font, transition:"all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background="rgba(16,185,129,0.08)"; e.currentTarget.style.borderColor="rgba(16,185,129,0.3)"; e.currentTarget.style.color=T.emerald; }}
                onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor=T.border; e.currentTarget.style.color=T.textMid; }}>
                {p}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding:"10px 16px 14px", display:"flex", gap:8, flexShrink:0 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter" && send()}
              placeholder="Ask Nexus AI anything..."
              style={{ flex:1, padding:"10px 14px", borderRadius:10, background:"rgba(255,255,255,0.05)", border:`1px solid rgba(255,255,255,0.09)`, color:T.text, fontSize:11, outline:"none", fontFamily:T.font }}
              onFocus={e => e.target.style.borderColor="rgba(16,185,129,0.4)"}
              onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.09)"}
            />
            <button onClick={() => send()} style={{ width:40, height:40, borderRadius:10, background:`linear-gradient(135deg,${T.emerald},${T.emeraldDk})`, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 0 20px ${T.emerald}44`, color:"#000" }}>
              <IcoSend size={14}/>
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
    <footer style={{ padding:"32px 40px", borderTop:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16, marginTop:40 }}>
      <div onClick={() => onNavigate("home")} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
        <div style={{ width:24, height:24, borderRadius:6, background:`linear-gradient(135deg,${T.emerald},${T.emeraldDk})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#000", fontFamily:T.fontDisp }}>N</div>
        <span style={{ fontSize:13, fontWeight:700, letterSpacing:"0.12em", fontFamily:T.fontDisp }}>NEXUS<span style={{ color:T.emerald }}>FI</span></span>
      </div>
      <p style={{ fontSize:9, color:T.textDim, letterSpacing:"0.08em" }}>© 2025 NexusFI Technologies · All financial data is simulated for demonstration purposes</p>
      <div style={{ display:"flex", gap:20, fontSize:8, color:T.textDim, letterSpacing:"0.12em" }}>
        {["PRIVACY","TERMS","API DOCS","STATUS"].map(l => (
          <span key={l} style={{ cursor:"pointer" }} onMouseEnter={e=>e.target.style.color=T.emerald} onMouseLeave={e=>e.target.style.color=T.textDim}>{l}</span>
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

  // Trigger alerts periodically on markets page
  const fireAlert = useCallback(() => {
    setEventIdx(i => {
      const idx = i % DRASTIC_EVENTS.length;
      const ev = { ...DRASTIC_EVENTS[idx], uid: Date.now() };
      setActiveAlerts(prev => [...prev.filter(a => a.uid !== ev.uid), ev]);
      setAlertHistory(h => [ev, ...h].slice(0, 20));
      return idx + 1;
    });
  }, []);

  useEffect(() => {
    const first = setTimeout(() => fireAlert(), 4000);
    const loop = setInterval(() => fireAlert(), 25000);
    return () => { clearTimeout(first); clearInterval(loop); };
  }, [fireAlert]);

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
      `}</style>

      <div style={{ background:"#0a0a0c", color:T.text, fontFamily:T.font, minHeight:"100vh", position:"relative", overflowX:"hidden" }}>
        {/* BG layers */}
        <div style={{ position:"fixed", inset:0, backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`, pointerEvents:"none", zIndex:0 }}/>
        <div style={{ position:"fixed", inset:0, backgroundImage:`linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px)`, backgroundSize:"80px 80px", pointerEvents:"none", zIndex:0 }}/>
        <div style={{ position:"fixed", top:80, right:0, width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 70%)", pointerEvents:"none", zIndex:0 }}/>
        <div style={{ position:"fixed", bottom:0, left:0, width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)", pointerEvents:"none", zIndex:0 }}/>
        <div style={{ position:"fixed", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:0 }}>
          <div style={{ position:"absolute", left:0, right:0, height:2, background:"linear-gradient(transparent,rgba(16,185,129,0.06),transparent)", animation:"scanline 8s linear infinite" }}/>
        </div>

        <div style={{ position:"relative", zIndex:1 }}>
          <Nav activePage={page} onNavigate={navigate} alertCount={activeAlerts.length}/>

          {page === "home"      && <HomePage onNavigate={navigate}/>}
          {page === "markets"   && <MarketsPage onTriggerAlert={fireAlert} alertCount={activeAlerts.length}/>}
          {page === "learn"     && <LearnPage/>}
          {page === "portfolio" && <PortfolioPage/>}
          {page === "ai"        && <AIStrategyPage/>}

          {page !== "ai" && <Footer onNavigate={navigate}/>}
        </div>

        {/* Alert overlays */}
        {activeAlerts.map((ev, i) => (
          <div key={ev.uid} style={{ position:"fixed", zIndex:9999, top:76+(i*8), right:20+(i*4) }}>
            <DrasticAlertOverlay event={ev} onDismiss={() => dismissAlert(ev.uid)}/>
          </div>
        ))}

        {/* Alert history log */}
        {alertHistory.length > 0 && (
          <div style={{ position:"fixed", bottom:20, left:20, zIndex:300, width:240, fontFamily:T.font, animation:"fadeInUp 0.4s ease" }}>
            <div style={{ background:"rgba(12,12,14,0.94)", border:`1px solid ${T.border}`, borderRadius:12, overflow:"hidden", backdropFilter:"blur(20px)" }}>
              <div style={{ padding:"8px 12px 6px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:6 }}>
                <IcoAlert size={10} color={T.amber}/>
                <span style={{ fontSize:7, letterSpacing:"0.14em", color:T.amber }}>ALERT HISTORY</span>
                <span style={{ marginLeft:"auto", fontSize:7, color:T.textDim }}>{alertHistory.length} events</span>
              </div>
              <div style={{ maxHeight:140, overflowY:"auto" }}>
                {alertHistory.slice(0,4).map((h,i) => (
                  <div key={`${h.uid}-${i}`} style={{ padding:"6px 12px", borderBottom:`1px solid rgba(255,255,255,0.04)`, display:"flex", alignItems:"flex-start", gap:6 }}>
                    <span style={{ fontSize:10, flexShrink:0 }}>{h.icon}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:7, color:h.color, fontWeight:700, letterSpacing:"0.08em", marginBottom:1 }}>{h.severity} · {h.title}</div>
                      <div style={{ fontSize:6, color:T.textDim, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{h.affected}</div>
                    </div>
                  </div>
                ))}
              </div>
              {alertHistory.length > 4 && <div style={{ padding:"5px 12px", fontSize:7, color:T.textDim, textAlign:"center", borderTop:`1px solid ${T.border}` }}>+{alertHistory.length-4} more in log</div>}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
