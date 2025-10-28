
const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const { PERMISSIONS } = require('../permissions');
const router = express.Router();

router.get('/', auth([PERMISSIONS.VIEW_PROPERTIES]), async (req, res) => {
  const companyId = req.user.companyId;
  try {
    const { rows } = await db.query('SELECT * FROM properties WHERE company_id = $1 ORDER BY name', [companyId]);
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to fetch properties' }); }
});

router.patch('/:id', auth([PERMISSIONS.EDIT_PROPERTIES]), async (req, res) => {
  const companyId = req.user.companyId; const { id } = req.params; const { notes } = req.body;
  try {
    const { rows: check } = await db.query('SELECT id FROM properties WHERE id=$1 AND company_id=$2', [id, companyId]);
    if (!check[0]) return res.status(404).json({ error: 'Not found' });
    const { rows } = await db.query('UPDATE properties SET notes=$1 WHERE id=$2 RETURNING *', [notes ?? '', id]);
    res.json(rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to update property' }); }
});

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
