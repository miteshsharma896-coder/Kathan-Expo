const express = require('express');
const Product = require('../models/Product');
const requireAdmin = require('../middleware/auth');
const router = express.Router();

function validateProduct(body) {
  const { name, category, origin, thickness, finish } = body;
  if (!name || typeof name !== 'string' || name.trim().length < 2 || name.length > 200)
    return 'Name must be 2–200 characters';
  if (!category || typeof category !== 'string' || category.length > 50)
    return 'Valid category is required';
  if (!origin || typeof origin !== 'string' || origin.length > 200)
    return 'Origin is required';
  if (!thickness || typeof thickness !== 'string' || thickness.length > 50)
    return 'Thickness is required';
  if (!finish || typeof finish !== 'string' || finish.length > 100)
    return 'Finish is required';
  return null;
}

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category) {
      if (typeof category !== 'string' || category.length > 50)
        return res.status(400).json({ error: 'Invalid category' });
      filter.category = category;
    }
    if (search) {
      if (typeof search !== 'string' || search.length > 100)
        return res.status(400).json({ error: 'Search query too long' });
      // Escape regex special chars to prevent ReDoS
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { origin: { $regex: escaped, $options: 'i' } },
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch products' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(404).json({ error: 'Product not found' });
  }
});

// POST /api/products — admin only
router.post('/', requireAdmin, async (req, res) => {
  try {
    const validationError = validateProduct(req.body);
    if (validationError) return res.status(400).json({ error: validationError });
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: 'Could not create product' });
  }
});

// PUT /api/products/:id — admin only
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const validationError = validateProduct(req.body);
    if (validationError) return res.status(400).json({ error: validationError });
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Could not update product' });
  }
});

// DELETE /api/products/:id — admin only
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete product' });
  }
});

module.exports = router;
