const express = require('express');
const db = require('../db'); // your db connection
const router = express.Router();

// Create a new invoice
router.post('/', async (req, res) => {
  const { job_id, property_id, company_id, amount, description, status } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO invoices 
        (job_id, property_id, company_id, amount, description, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [
        job_id,
        property_id,
        company_id,
        amount,
        description || '',
        status || 'unpaid'
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Get all invoices for a company
router.get('/company/:companyId', async (req, res) => {
  const { companyId } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM invoices WHERE company_id = $1 ORDER BY created_at DESC',
      [companyId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

module.exports = router;
