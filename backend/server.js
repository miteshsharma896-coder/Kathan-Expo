require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const connectDB = require('./config/db');
const { apiLimiter } = require('./middleware/security');

const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/products');
const quotesRoutes = require('./routes/quotes');
const messagesRoutes = require('./routes/messages');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const settingsRoutes = require('./routes/settings');

const app = express();

connectDB();

// ── Security headers (helmet) ─────────────────────────────────────────────────
// Sets 15+ HTTP headers: X-Frame-Options, X-Content-Type-Options, 
// Strict-Transport-Security, Content-Security-Policy, etc.
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow /uploads images to load on frontend
}));

// ── CORS — only allow requests from your own frontend ─────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
];
app.use(cors({
  origin: (origin, cb) => {
    // allow server-to-server requests (no origin) and known origins
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('CORS policy: origin not allowed'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ── Body parsing with size limits ────────────────────────────────────────────
// 10kb cap prevents large payload attacks
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── NoSQL injection prevention ───────────────────────────────────────────────
// Strips $ and . from request bodies, params and query strings
// e.g. { "username": { "$gt": "" } } becomes harmless
app.use(mongoSanitize());

// ── HTTP parameter pollution prevention ─────────────────────────────────────
// Prevents ?category=white&category=black&category[$gt]= type attacks
app.use(hpp());

// ── Rate limiting on all API routes ──────────────────────────────────────────
app.use('/api', apiLimiter);

// ── Static files ─────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ ok: true }));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/categories', categoriesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/quotes', quotesRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingsRoutes);

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler ─────────────────────────────────────────────────────
// Never leaks stack traces or internal details to the client
app.use((err, req, res, next) => {
  console.error('[error]', err.message);
  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? 'Something went wrong on the server' : err.message,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`MarbleHub API running on http://localhost:${PORT}`));
