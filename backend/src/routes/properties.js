const express = require('express');
const db = require('../db');
const router = express.Router();

// Get all properties for a company
router.get('/', async (req, res) => {
  try {
    const properties = await db.query('SELECT * FROM properties');
    res.json(properties.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// Add a new property
router.post('/', async (req, res) => {
  const { name, address, notes } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO properties (name, address, notes) VALUES ($1, $2, $3) RETURNING *',
      [name, address, notes]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add property' });
  }
});

module.exports = router;
