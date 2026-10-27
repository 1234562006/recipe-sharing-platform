const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables from .env if present
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');
const favoriteRoutes = require('./routes/favorites');
const userRoutes = require('./routes/users');

const app = express();
app.set('trust proxy', 1);
// Enable CORS
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

// Body parser
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Apply general API rate limiter
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.status(200).json({
    success: true,
    message: 'RecipeNest API is running smoothly',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    database: {
      status: dbStatusMap[dbState] || 'unknown',
      readyState: dbState,
      name: mongoose.connection.name || 'none',
    },
    environment: process.env.NODE_ENV || 'development',
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/users', userRoutes);

// Serve frontend static files
const frontendDir = path.join(__dirname, '../frontend');
app.use(express.static(frontendDir));

// Route 404 for undefined API endpoints
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
  });
});

// Fallback to index.html for non-API client-side routing
app.get('*', (req, res, next) => {
  // If requesting a specific file that doesn't exist, proceed to 404
  if (req.path.includes('.')) {
    return next();
  }
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// Centralized error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server function
const startServer = async () => {
  try {
    // Only connect if not already connected (e.g., in automated tests)
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    const server = app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`  🍳 RecipeNest Server Running Successfully!`);
      console.log(`  🌐 Website URL : http://localhost:${PORT}`);
      console.log(`  🩺 API Health  : http://localhost:${PORT}/api/health`);
      console.log(`  📚 Environment : ${process.env.NODE_ENV || 'development'}`);
      console.log(`======================================================\n`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\x1b[31m[Port Error]\x1b[0m Port ${PORT} is already in use.`);
        console.error(`             Change PORT in .env (e.g. PORT=3001 or 5000) or close the other app.\n`);
      } else {
        console.error(`\x1b[31m[Server Error]\x1b[0m ${err.message}`);
      }
    });

    return server;
  } catch (error) {
    console.error(`\x1b[31m[Server Startup Warning]\x1b[0m ${error.message}`);
    console.log(
      `\x1b[33m[Notice]\x1b[0m Server is starting in standalone/offline mode on http://localhost:${PORT}.`
    );
    console.log(
      `         Please provide a valid MONGODB_URI in .env to enable full Atlas persistence.\n`
    );

    const server = app.listen(PORT, () => {
      console.log(`  🌐 Website URL : http://localhost:${PORT}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\x1b[31m[Port Error]\x1b[0m Port ${PORT} is already in use.`);
        console.error(`             Change PORT in .env (e.g. PORT=3001 or 5000) or close the other app.\n`);
      } else {
        console.error(`\x1b[31m[Server Error]\x1b[0m ${err.message}`);
      }
    });

    return server;
  }
};

// If run directly (not imported via require/test)
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
