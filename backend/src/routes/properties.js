const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const { PERMISSIONS } = require('../permissions');
const router = express.Router();

// GET /api/properties
// Now returns each property PLUS its current running job (if any)
// as: current_job: { id, name, duration_minutes }
router.get('/', auth([PERMISSIONS.VIEW_PROPERTIES]), async (req, res) => {
  const companyId = req.user.companyId;
  try {
    const { rows } = await db.query(
      `
      SELECT
        p.id,
        p.company_id,
        p.name,
        p.address,
        p.notes,
        j.id AS current_job_id,
        j.name AS current_job_name,
        j.start_time AS current_job_start,
        CASE
          WHEN j.start_time IS NOT NULL THEN EXTRACT(EPOCH FROM (NOW() - j.start_time)) / 60.0
          ELSE NULL
        END AS current_job_duration_minutes
      FROM properties p
      LEFT JOIN jobs j
        ON j.property_id = p.id
       AND j.status = 'running'
      WHERE p.company_id = $1
      ORDER BY p.name
      `,
      [companyId]
    );

    const shaped = rows.map(r => ({
      id: r.id,
      company_id: r.company_id,
      name: r.name,
      address: r.address,
      notes: r.notes,
      current_job: r.current_job_id ? {
        id: r.current_job_id,
        name: r.current_job_name || 'Job',
        duration_minutes: r.current_job_duration_minutes ?? 0
      } : null
    }));

    res.json(shaped);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// PATCH /api/properties/:id (unchanged)
router.patch('/:id', auth([PERMISSIONS.EDIT_PROPERTIES]), async (req, res) => {
  const companyId = req.user.companyId; const { id } = req.params; const { notes } = req.body;
  try {
    const { rows: check } = await db.query('SELECT id FROM properties WHERE id=$1 AND company_id=$2', [id, companyId]);
    if (!check[0]) return res.status(404).json({ error: 'Not found' });
    const { rows } = await db.query('UPDATE properties SET notes=$1 WHERE id=$2 RETURNING *', [notes ?? '', id]);
    res.json(rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to update property' }); }
});

// POST /api/properties (unchanged)
router.post('/', auth([PERMISSIONS.CREATE_PROPERTIES]), async (req, res) => {
  const companyId = req.user.companyId; const { name, address, notes } = req.body;
  try {
    const { rows } = await db.query(
      'INSERT INTO properties (company_id, name, address, notes) VALUES ($1,$2,$3,$4) RETURNING *',
      [companyId, name, address, notes ?? '']
    );
    res.json(rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to create property' }); }
});

module.exports = router;
