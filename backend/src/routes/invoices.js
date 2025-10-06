const express = require('express');
const db = require('../db');
const router = express.Router();

// Simple invoice creation route
router.post('/', async (req, res) => {
  const { job_id, amount, description } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO invoices (job_id, amount, description, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [job_id, amount, description]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

module.exports = router;
