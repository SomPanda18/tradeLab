const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');
// 1. ADD THIS LINE (The Missing Piece)
const authRoutes = require('./routes/authRoutes'); 
const { simulateMarket } = require('./services/marketService');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173", // Fallback to local Vite port
        methods: ["GET", "POST"],
        credentials: true
    }
});
app.use(cors());
app.use(express.json());

// 2. THIS IS THE LINE THAT WAS FAILING
app.use('/api/auth', authRoutes); 
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});
const PORT = process.env.PORT || 10000; // Render uses 10000 by default
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
socket.on('ai_chat_message', async (data) => {
  const { message, stats } = data;

  // Build the Personalized Context
  const personalizedPrompt = `
    User Stats: Risk ${stats.riskScore}/100, Holdings: ${stats.topHoldings}.
    Market Context: ${stats.marketTrend}.
    User Query: ${message}
    
    Response Instructions: Act as Nexus AI Strategist. Be highly technical. 
    If they mention a stock they own, give specific alpha/rebalance advice.
  `;

  const aiResponse = await generateFinancialAdvice(personalizedPrompt);

  socket.emit('ai_chat_response', {
    role: "ai",
    text: aiResponse
  });
});
simulateMarket();
module.exports = { io };