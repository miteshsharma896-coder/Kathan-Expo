const express = require('express');
const Category = require('../models/Category');
const Product = require('../models/Product');
const requireAdmin = require('../middleware/auth');
const router = express.Router();

function validateCategory(body) {
  const { slug, name, colorBase, colorVein } = body;
  if (!name || typeof name !== 'string' || name.trim().length < 2 || name.length > 100)
    return 'Name must be 2–100 characters';
  if (slug !== undefined) {
    if (typeof slug !== 'string' || !/^[a-z0-9-]+$/.test(slug) || slug.length > 50)
      return 'Slug must be lowercase letters, numbers and hyphens only';
  }
  const hexColor = /^#[0-9A-Fa-f]{6}$/;
  if (colorBase && !hexColor.test(colorBase))
    return 'colorBase must be a valid hex colour (e.g. #EDEAE1)';
  if (colorVein && !hexColor.test(colorVein))
    return 'colorVein must be a valid hex colour (e.g. #B9AF9C)';
  return null;
}

// GET /api/categories — public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch categories' });
  }
});

// POST /api/categories — admin only
router.post('/', requireAdmin, async (req, res) => {
  try {
    const validationError = validateCategory(req.body);
    if (validationError) return res.status(400).json({ error: validationError });
    const { slug, name, colorBase, colorVein } = req.body;
    const category = await Category.create({ slug, name, colorBase, colorVein });
    res.status(201).json(category);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'A category with that slug already exists' });
    res.status(500).json({ error: 'Could not create category' });
  }
});

// PUT /api/categories/:id — admin only
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const validationError = validateCategory(req.body);
    if (validationError) return res.status(400).json({ error: validationError });
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'A category with that slug already exists' });
    res.status(500).json({ error: 'Could not update category' });
  }
});

// DELETE /api/categories/:id — admin only
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    const productCount = await Product.countDocuments({ category: category.slug });
    if (productCount > 0) {
      return res.status(409).json({
        error: `Can't delete — ${productCount} product${productCount === 1 ? '' : 's'} still use this category.`,
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete category' });
  }
});

module.exports = router;
