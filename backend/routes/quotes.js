const express = require('express');
const Quote = require('../models/Quote');
const Product = require('../models/Product');
const requireAdmin = require('../middleware/auth');
const router = express.Router();

// POST /api/quotes  (public - anyone can request a quote)
router.post('/', async (req, res) => {
  const { productId, name, phone, qty, message } = req.body;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const quote = await Quote.create({
    product: product._id,
    productName: product.name,
    name,
    phone,
    qty,
    message,
  });
  res.status(201).json(quote);
});

// GET /api/quotes  (admin only - view requests)
router.get('/', requireAdmin, async (req, res) => {
  const quotes = await Quote.find().sort({ createdAt: -1 });
  res.json(quotes);
});

module.exports = router;
