const express = require('express');
const db = require('../db');
const router = express.Router();

// Start a job timer
router.post('/:jobId/start', async (req, res) => {
  const { jobId } = req.params;
  try {
    await db.query('UPDATE jobs SET start_time = NOW(), status = $1 WHERE id = $2', ['in_progress', jobId]);
    res.json({ message: 'Job started' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to start job' });
  }
});

// Stop a job timer
router.post('/:jobId/stop', async (req, res) => {
  const { jobId } = req.params;
  try {
    await db.query('UPDATE jobs SET end_time = NOW(), status = $1 WHERE id = $2', ['completed', jobId]);
    res.json({ message: 'Job completed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to complete job' });
  }
});

module.exports = router;
