const express = require('express');
const Settings = require('../models/Settings');
const requireAdmin = require('../middleware/auth');
const router = express.Router();

// GET /api/settings — admin only
router.get('/', requireAdmin, async (req, res) => {
  try {
    const settings = await Settings.getSingleton();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch settings' });
  }
});

// PUT /api/settings — admin only
router.put('/', requireAdmin, async (req, res) => {
  try {
    const { notificationEmail } = req.body;

    // Validate the email if provided
    if (notificationEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(notificationEmail) || notificationEmail.length > 254) {
        return res.status(400).json({ error: 'Invalid email address' });
      }
    }

    const settings = await Settings.getSingleton();
    settings.notificationEmail = notificationEmail ? notificationEmail.trim().toLowerCase() : '';
    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Could not update settings' });
  }
});

module.exports = router;
