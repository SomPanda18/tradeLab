const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/authRoutes');
const marketRoutes = require('./routes/marketRoutes');
const { broadcastMarketData } = require('./services/marketService');
const { generateFinancialAdvice } = require('./services/aiService');

dotenv.config();

// Validate critical environment variables
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET is not set in environment variables');
  process.exit(1);
}

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/market', marketRoutes);

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('ai_chat_message', async (data) => {
    try {
      const { message, stats, history } = data;

      const contextData = `Risk ${stats?.riskScore || 'N/A'}/100, Holdings: ${stats?.topHoldings || 'N/A'}, Market: ${stats?.marketTrend || 'N/A'}`;

      const aiResponse = await generateFinancialAdvice(message, history, contextData);

      socket.emit('ai_chat_response', {
        role: "ai",
        text: aiResponse
      });
    } catch (err) {
      console.error('AI chat error:', err.message);
      socket.emit('ai_chat_response', {
        role: "ai",
        text: "Connection to strategy core lost. Please try again shortly."
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

broadcastMarketData(io);
module.exports = { io };