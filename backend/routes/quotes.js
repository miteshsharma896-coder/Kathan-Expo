const express = require('express');
const Quote = require('../models/Quote');
const Product = require('../models/Product');
const Settings = require('../models/Settings');
const requireAdmin = require('../middleware/auth');
const { formLimiter } = require('../middleware/security');
const { sendQuoteNotification } = require('../utils/mailer');
const router = express.Router();

// POST /api/quotes — rate limited, input validated
router.post('/', formLimiter, async (req, res) => {
  try {
    const { productId, name, phone, qty, message } = req.body;

    // Input validation
    if (!productId || !name || !phone || !qty) {
      return res.status(400).json({ error: 'productId, name, phone and qty are required' });
    }
    if (typeof name !== 'string' || name.trim().length < 2 || name.length > 100) {
      return res.status(400).json({ error: 'Name must be 2–100 characters' });
    }
    if (typeof phone !== 'string' || phone.length > 30) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }
    const qtyNum = Number(qty);
    if (isNaN(qtyNum) || qtyNum < 1 || qtyNum > 1000000) {
      return res.status(400).json({ error: 'Quantity must be between 1 and 1,000,000 sq.ft' });
    }
    if (message && message.length > 1000) {
      return res.status(400).json({ error: 'Message must be under 1000 characters' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const quote = await Quote.create({
      product: product._id,
      productName: product.name,
      name: name.trim(),
      phone: phone.trim(),
      qty: qtyNum,
      message: message ? message.trim() : '',
    });

    // Email notification — never blocks the response
    try {
      const settings = await Settings.getSingleton();
      if (settings.notificationEmail) {
        await sendQuoteNotification({
          to: settings.notificationEmail,
          quote: { name, phone, qty: qtyNum, message },
          product: product.name,
        });
      }
    } catch (emailErr) {
      console.error('[quotes] Email notification failed:', emailErr.message);
    }

    res.status(201).json(quote);
  } catch (err) {
    console.error('[quotes]', err.message);
    res.status(500).json({ error: 'Could not save quote request' });
  }
});

// GET /api/quotes — admin only
router.get('/', requireAdmin, async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 });
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch quotes' });
  }
});

module.exports = router;
