const express = require('express');
const Message = require('../models/Message');
const Settings = require('../models/Settings');
const requireAdmin = require('../middleware/auth');
const { formLimiter } = require('../middleware/security');
const { sendContactNotification } = require('../utils/mailer');
const router = express.Router();

// POST /api/messages — rate limited, input validated
router.post('/', formLimiter, async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;

    if (!name || !phone || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (typeof name !== 'string' || name.trim().length < 2 || name.length > 100) {
      return res.status(400).json({ error: 'Name must be 2–100 characters' });
    }
    if (typeof phone !== 'string' || phone.length > 30) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 254) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    if (typeof message !== 'string' || message.trim().length < 2 || message.length > 2000) {
      return res.status(400).json({ error: 'Message must be 2–2000 characters' });
    }

    const doc = await Message.create({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
    });

    try {
      const settings = await Settings.getSingleton();
      if (settings.notificationEmail) {
        await sendContactNotification({
          to: settings.notificationEmail,
          message: { name, phone, email, message },
        });
      }
    } catch (emailErr) {
      console.error('[messages] Email notification failed:', emailErr.message);
    }

    res.status(201).json(doc);
  } catch (err) {
    console.error('[messages]', err.message);
    res.status(500).json({ error: 'Could not save message' });
  }
});

// GET /api/messages — admin only
router.get('/', requireAdmin, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch messages' });
  }
});

module.exports = router;
