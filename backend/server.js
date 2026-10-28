
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const designRoutes = require('./routes/designRoutes');
const priceRoutes = require('./routes/priceRoutes');
const customizationRoutes = require('./routes/customizationRoutes');
const authRoutes = require('./routes/authRoutes');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());

app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));

// Health check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Jewelora backend is running successfully!',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/designs', designRoutes);
app.use('/api/price', priceRoutes);
app.use('/api/customizations', customizationRoutes);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);

  res.status(err.status || 500).json({
    success: false,
    message:
      err.status === 413
        ? 'Request is too large. Please use a smaller image.'
        : err.message || 'Internal server error.',
  });
});

// Connect to MongoDB and start server
async function startServer() {
  try {
    const mongoUri =
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jewelora';

    await mongoose.connect(mongoUri);

    console.log(`MongoDB connected: ${mongoose.connection.host}`);

    app.listen(PORT, () => {
      console.log(`Jewelora backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start Jewelora backend:', error.message);
    process.exit(1);
  }
}

startServer();
