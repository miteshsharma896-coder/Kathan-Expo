require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/products');
const quotesRoutes = require('./routes/quotes');
const messagesRoutes = require('./routes/messages');
const authRoutes = require('./routes/auth');

const app = express();

connectDB();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/categories', categoriesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/quotes', quotesRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/auth', authRoutes);

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`MarbleHub API running on http://localhost:${PORT}`));
