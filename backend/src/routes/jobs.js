const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const { PERMISSIONS } = require('../permissions');
const router = express.Router();

/**
 * GET /api/jobs
 * List all jobs for this company (via property join)
 */
router.get('/', auth([PERMISSIONS.VIEW_JOBS]), async (req, res) => {
  const companyId = req.user.companyId;
  try {
    const { rows } = await db.query(
      `SELECT j.*, p.name AS property_name, p.company_id
       FROM jobs j
       JOIN properties p ON j.property_id = p.id
       WHERE p.company_id = $1
       ORDER BY j.id DESC`, [companyId]);
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to fetch jobs' }); }
});

/**
 * POST /api/jobs
 * Create a job (admin/manager)
 * body: { property_id:number, name?:string }
 */
router.post('/', auth([PERMISSIONS.CREATE_JOBS]), async (req, res) => {
  const companyId = req.user.companyId;
  const { property_id, name } = req.body;
  try {
    // Verify property belongs to company
    const { rows: prop } = await db.query(
      'SELECT id FROM properties WHERE id=$1 AND company_id=$2', [property_id, companyId]
    );
    if (!prop[0]) return res.status(404).json({ error: 'Property not found for this company' });

    const { rows } = await db.query(
      `INSERT INTO jobs (property_id, name, status)
       VALUES ($1, $2, 'pending')
       RETURNING id, property_id, name, status`,
      [property_id, name || 'Scheduled Job']
    );
    res.json(rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to create job' }); }
});

/**
 * POST /api/jobs/:jobId/start
 * Start a specific job (crew/manager/admin)
 */
router.post('/:jobId/start', auth([PERMISSIONS.START_STOP_JOBS]), async (req, res) => {
  const companyId = req.user.companyId; const { jobId } = req.params;
  try {
    const { rows: check } = await db.query(
      `SELECT j.id, j.status
         FROM jobs j
         JOIN properties p ON j.property_id = p.id
        WHERE j.id = $1 AND p.company_id = $2`,
      [jobId, companyId]
    );
    const job = check[0];
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.status === 'running') return res.status(400).json({ error: 'Job already running' });
    if (job.status === 'completed') return res.status(400).json({ error: 'Job already completed' });

    const { rows } = await db.query(
      `UPDATE jobs SET start_time = NOW(), status='running'
        WHERE id=$1
        RETURNING id, start_time, status`,
      [jobId]
    );
    res.json(rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to start job' }); }
});

/**
 * Existing: start a new job directly from property (kept for convenience)
 */
router.post('/property/:propertyId/start', auth([PERMISSIONS.START_STOP_JOBS]), async (req, res) => {
  const companyId = req.user.companyId; const { propertyId } = req.params;
  try {
    const { rows: propRows } = await db.query('SELECT id FROM properties WHERE id=$1 AND company_id=$2', [propertyId, companyId]);
    if (!propRows[0]) return res.status(404).json({ error: 'Property not found' });
    const { rows } = await db.query(
      `INSERT INTO jobs (property_id, start_time, status)
       VALUES ($1, NOW(), 'running') RETURNING id, start_time, status`, [propertyId]);
    res.json(rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to start job' }); }
});

/**
 * POST /api/jobs/:jobId/stop
 * Stop a running job (crew/manager/admin)
 */
router.post('/:jobId/stop', auth([PERMISSIONS.START_STOP_JOBS]), async (req, res) => {
  const companyId = req.user.companyId; const { jobId } = req.params;
  try {
    const { rows: check } = await db.query(
      `SELECT j.id, j.start_time FROM jobs j
       JOIN properties p ON j.property_id = p.id
       WHERE j.id=$1 AND p.company_id=$2`, [jobId, companyId]);
    const job = check[0];
    if (!job) return res.status(404).json({ error: 'Not found' });
    if (!job.start_time) return res.status(400).json({ error: 'Job not started yet' });
    const { rows } = await db.query(
      `UPDATE jobs SET end_time=NOW(), status='completed'
       WHERE id=$1
       RETURNING id, start_time, end_time, status,
         EXTRACT(EPOCH FROM (end_time - start_time))/60 AS duration_minutes`, [jobId]);
    res.json(rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to stop job' }); }
});

module.exports = router;
