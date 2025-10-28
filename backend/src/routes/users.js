
const express = require('express');
const db = require('../db');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const { PERMISSIONS } = require('../permissions');
const router = express.Router();

router.post('/', auth([PERMISSIONS.CREATE_USERS]), async (req, res) => {
  const companyId = req.user.companyId;
  const { email, password, role } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await db.query(
      `INSERT INTO users (company_id, email, password_hash, role)
       VALUES ($1,$2,$3,$4)
       RETURNING id, email, role, company_id`,
      [companyId, email, hash, role || 'crew']
    );
    res.json(rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to create user' }); }
});

module.exports = router;
