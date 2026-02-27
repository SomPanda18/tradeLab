const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/authRoutes');
const { simulateMarket } = require('./services/marketService');
const { generateFinancialAdvice } = require('./services/aiService');

dotenv.config();
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

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('ai_chat_message', async (data) => {
    const { message, stats, history } = data;

    const contextData = `Risk ${stats?.riskScore || 'N/A'}/100, Holdings: ${stats?.topHoldings || 'N/A'}, Market: ${stats?.marketTrend || 'N/A'}`;

    const aiResponse = await generateFinancialAdvice(message, history, contextData);

    socket.emit('ai_chat_response', {
      role: "ai",
      text: aiResponse
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

simulateMarket(io);
module.exports = { io };