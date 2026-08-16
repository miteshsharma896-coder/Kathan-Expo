const express = require('express');
const jwt = require('jsonwebtoken');
const { loginLimiter } = require('../middleware/security');
const router = express.Router();

// POST /api/auth/login — rate limited to 10 attempts per 15 min per IP
router.post('/login', loginLimiter, (req, res) => {
  const { username, password } = req.body;

  // Basic input validation
  if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  // Length cap — prevents absurdly large payloads getting to the compare
  if (username.length > 100 || password.length > 200) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
    const token = jwt.sign({ role: 'admin', username }, process.env.JWT_SECRET, {
      expiresIn: '8h',
    });
    return res.json({ token });
  }

  // Uniform error — never reveal whether it was username or password that was wrong
  return res.status(401).json({ error: 'Incorrect username or password' });
});

module.exports = router;
