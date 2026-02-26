/**
 * Co-Working Space Booking System - Express Server
 */
require('dotenv').config();
const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');
const path       = require('path');

const routes     = require('./routes/index');
const { startScheduler } = require('./utils/scheduler');

const app  = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// Security Middleware
// ============================================================
app.use(helmet({
  contentSecurityPolicy: false,  // allow inline scripts in frontend
}));

app.use(cors({
  origin: '*',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max:      parseInt(process.env.RATE_LIMIT_MAX)        || 200,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// ============================================================
// Body Parsing
// ============================================================
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ============================================================
// Static Frontend
// ============================================================
app.use(express.static(path.join(__dirname, '../frontend')));

// ============================================================
// API Routes
// ============================================================
app.use('/api', routes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Co-Working API is running', timestamp: new Date() });
});

// ============================================================
// SPA Fallback - serve index.html for all non-API routes
// ============================================================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ============================================================
// Error Handler
// ============================================================
app.use((err, req, res, next) => {
  console.error('[Error]', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ============================================================
// Start Server
// ============================================================
app.listen(PORT, () => {
  console.log(`\n🚀 Co-Working Space Booking System`);
  console.log(`   Server running at http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
  startScheduler();
});

module.exports = app;
