
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load local environment variables during local development.
dotenv.config();

// Import routes
const designRoutes = require('./routes/designRoutes');
const priceRoutes = require('./routes/priceRoutes');
const customizationRoutes = require('./routes/customizationRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors());

app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));

// MongoDB connection management.
// Vercel can reuse the connection across function invocations.
let mongoConnectionPromise = null;

async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is missing.');
  }

  if (!mongoConnectionPromise) {
    mongoConnectionPromise = mongoose
      .connect(process.env.MONGODB_URI)
      .catch((error) => {
        mongoConnectionPromise = null;
        throw error;
      });
  }

  await mongoConnectionPromise;
}

// Ensure MongoDB is connected before API requests execute.
// The root health endpoint remains available for deployment testing.
app.use('/api', async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);

    res.status(503).json({
      success: false,
      message: 'Database connection failed. Please try again later.',
    });
  }
});

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
        : 'An internal server error occurred.',
  });
});

// Export the Express app for Vercel.
// Do not call app.listen() in this deployment entry point.
module.exports = app;
