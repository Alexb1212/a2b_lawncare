const express = require('express');
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const router = express.Router();

router.post('/register', async (req, res) => {
  const { companyName, email, password } = req.body;
  try {
    const companyRes = await db.query('INSERT INTO companies (name) VALUES ($1) RETURNING id', [companyName]);
    const company = companyRes.rows[0];
    const hash = await bcrypt.hash(password, 10);
    const userRes = await db.query('INSERT INTO users (company_id, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id,email,role',
      [company.id, email, hash, 'admin']);
    const user = userRes.rows[0];
    const token = jwt.sign({ id: user.id, company_id: company.id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRes = await db.query('SELECT * FROM users WHERE email=$1', [email]);
    const user = userRes.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, company_id: user.company_id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;