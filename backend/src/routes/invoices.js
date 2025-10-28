
const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const { PERMISSIONS } = require('../permissions');
const router = express.Router();

router.get('/', auth([PERMISSIONS.VIEW_INVOICES]), async (req, res) => {
  const companyId = req.user.companyId;
  try {
    const { rows } = await db.query(
      `SELECT i.id, i.amount, i.description, i.status, i.created_at,
              i.job_id, j.name AS job_name, j.property_id, p.name AS property_name
       FROM invoices i
       JOIN jobs j ON i.job_id = j.id
       JOIN properties p ON j.property_id = p.id
       WHERE p.company_id = $1
       ORDER BY i.created_at DESC`, [companyId]);
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to fetch invoices' }); }
});

router.post('/', auth([PERMISSIONS.CREATE_INVOICES]), async (req, res) => {
  const companyId = req.user.companyId;
  const { job_id, amount, description, status } = req.body;
  try {
    const { rows: check } = await db.query(
      `SELECT j.id FROM jobs j JOIN properties p ON j.property_id = p.id
       WHERE j.id=$1 AND p.company_id=$2`, [job_id, companyId]);
    if (!check[0]) return res.status(404).json({ error: 'Job not found for this company' });
    const { rows } = await db.query(
      `INSERT INTO invoices (job_id, amount, description, status, created_at)
       VALUES ($1,$2,$3,COALESCE($4,'unpaid'), NOW()) RETURNING *`,
      [job_id, amount, description ?? '', status ?? 'unpaid']);
    res.json(rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to create invoice' }); }
});

router.post('/:id/mark-paid', auth([PERMISSIONS.MARK_INVOICES_PAID]), async (req, res) => {
  const companyId = req.user.companyId; const { id } = req.params;
  try {
    const { rows: check } = await db.query(
      `SELECT i.id FROM invoices i
       JOIN jobs j ON i.job_id = j.id
       JOIN properties p ON j.property_id = p.id
       WHERE i.id=$1 AND p.company_id=$2`, [id, companyId]);
    if (!check[0]) return res.status(404).json({ error: 'Not found' });
    const { rows } = await db.query(`UPDATE invoices SET status='paid' WHERE id=$1 RETURNING *`, [id]);
    res.json(rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to update invoice' }); }
});

module.exports = router;
