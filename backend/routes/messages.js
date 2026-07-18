const express = require('express');
const Message = require('../models/Message');
const requireAdmin = require('../middleware/auth');
const router = express.Router();

// POST /api/messages  (public - contact form)
router.post('/', async (req, res) => {
  const { name, phone, email, message } = req.body;
  const doc = await Message.create({ name, phone, email, message });
  res.status(201).json(doc);
});

// GET /api/messages  (admin only)
router.get('/', requireAdmin, async (req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 });
  res.json(messages);
});

module.exports = router;
