const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ Allow your Vite frontend
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://linkedin-clone-rho-lemon.vercel.app',
    'https://linkedin-clone-hmzc4vxup-saharbanu-as-projects.vercel.app'
  ],
  credentials: true
}));



// ✅ Increase JSON payload limit for safety
app.use(express.json({ limit: '10mb' })); // Handles large JSON bodies if needed
app.use(express.urlencoded({ limit: '10mb', extended: true })); // Handles form submissions

// ✅ Connect MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB is Connected Successfully..'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts')); // posts route will use multer

// ✅ Server start
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
