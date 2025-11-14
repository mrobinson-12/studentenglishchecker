/**
 * Student English Checker - Backend Server
 * Express server that serves the frontend and provides API endpoints
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const analyseRouter = require('./routes/analyse');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Support larger draft texts
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api', analyseRouter);

// Serve static frontend files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    hasApiKey: !!process.env.OPENAI_API_KEY
  });
});

// Fallback to serve index.html for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║   Student English Checker - Backend Server            ║
╚════════════════════════════════════════════════════════╝

Server running on: http://localhost:${PORT}

API Endpoints:
  - POST /api/analyse       (Draft analysis with criteria)
  - POST /api/quick-check   (Quick feedback)
  - GET  /api/health        (Server health check)

Frontend: http://localhost:${PORT}

Environment:
  - OpenAI API Key: ${process.env.OPENAI_API_KEY ? '✓ Configured' : '✗ Missing'}
  
${!process.env.OPENAI_API_KEY ? '⚠️  WARNING: OPENAI_API_KEY not set in .env file\n' : ''}
Press Ctrl+C to stop the server
`);
});

module.exports = app;
