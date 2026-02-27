const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// 1. ADD THIS LINE (The Missing Piece)
const authRoutes = require('./routes/authRoutes'); 

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// 2. THIS IS THE LINE THAT WAS FAILING
app.use('/api/auth', authRoutes); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});