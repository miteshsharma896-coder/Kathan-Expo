const express = require('express');
const Category = require('../models/Category');
const Product = require('../models/Product');
const requireAdmin = require('../middleware/auth');
const router = express.Router();

// GET /api/categories
router.get('/', async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json(categories);
});

// POST /api/categories  (admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { slug, name, colorBase, colorVein } = req.body;
    const category = await Category.create({ slug, name, colorBase, colorVein });
    res.status(201).json(category);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'A category with that slug already exists' });
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/categories/:id  (admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'A category with that slug already exists' });
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/categories/:id  (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ error: 'Category not found' });

  const productCount = await Product.countDocuments({ category: category.slug });
  if (productCount > 0) {
    return res.status(409).json({
      error: `Can't delete — ${productCount} product${productCount === 1 ? '' : 's'} still use this category. Reassign or delete them first.`,
    });
  }

  await Category.findByIdAndDelete(req.params.id);
  res.json({ deleted: true });
});

module.exports = router;
