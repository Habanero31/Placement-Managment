const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

exports.getJobs = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT j.*, c.name AS company_name
    FROM jobs j
    JOIN companies c ON c.id = j.company_id
    ORDER BY j.id DESC
  `);
  res.json(rows);
});

exports.getJobById = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT j.*, c.name AS company_name
    FROM jobs j
    JOIN companies c ON c.id = j.company_id
    WHERE j.id = ?
  `, [req.params.id]);
  if (!rows[0]) return res.status(404).json({ message: 'Job not found' });
  res.json(rows[0]);
});

exports.createJob = asyncHandler(async (req, res) => {
  const { company_id, title, description, package_lpa, min_cgpa, location, deadline, status } = req.body;
  const [result] = await pool.query(
    'INSERT INTO jobs (company_id, title, description, package_lpa, min_cgpa, location, deadline, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [company_id, title, description, package_lpa, min_cgpa || 0, location || null, deadline, status || 'open']
  );
  res.status(201).json({ message: 'Job created', id: result.insertId });
});

exports.updateJob = asyncHandler(async (req, res) => {
  const { company_id, title, description, package_lpa, min_cgpa, location, deadline, status } = req.body;
  const [result] = await pool.query(
    'UPDATE jobs SET company_id = ?, title = ?, description = ?, package_lpa = ?, min_cgpa = ?, location = ?, deadline = ?, status = ? WHERE id = ?',
    [company_id, title, description, package_lpa, min_cgpa || 0, location || null, deadline, status || 'open', req.params.id]
  );
  if (!result.affectedRows) return res.status(404).json({ message: 'Job not found' });
  res.json({ message: 'Job updated' });
});

exports.deleteJob = asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM jobs WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Job not found' });
  res.json({ message: 'Job deleted' });
});
