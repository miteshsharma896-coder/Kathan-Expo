const express = require('express');
const Product = require('../models/Product');
const requireAdmin = require('../middleware/auth');
const router = express.Router();

// GET /api/products?category=white&search=makrana
router.get('/', async (req, res) => {
  const { category, search } = req.query;
  const filter = {};

  if (category) filter.category = category;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { origin: { $regex: search, $options: 'i' } },
    ];
  }

  const products = await Product.find(filter).sort({ createdAt: -1 });
  res.json(products);
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// POST /api/products  (admin only)
router.post('/', requireAdmin, async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

// PUT /api/products/:id  (admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// DELETE /api/products/:id  (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ deleted: true });
});

module.exports = router;
