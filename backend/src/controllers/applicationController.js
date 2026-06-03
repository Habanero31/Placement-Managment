const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

exports.getApplications = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT a.*, u.name AS student_name, s.roll_no, j.title AS job_title, j.package_lpa, c.name AS company_name
    FROM applications a
    JOIN students s ON s.id = a.student_id
    JOIN users u ON u.id = s.user_id
    JOIN jobs j ON j.id = a.job_id
    JOIN companies c ON c.id = j.company_id
    ORDER BY a.id DESC
  `);
  res.json(rows);
});

exports.getMyApplications = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT a.*, j.title AS job_title, c.name AS company_name, j.package_lpa
    FROM applications a
    JOIN students s ON s.id = a.student_id
    JOIN jobs j ON j.id = a.job_id
    JOIN companies c ON c.id = j.company_id
    WHERE s.user_id = ?
    ORDER BY a.id DESC
  `, [req.user.id]);
  res.json(rows);
});

exports.createApplication = asyncHandler(async (req, res) => {
  const { student_id, job_id } = req.body;
  let finalStudentId = student_id;

  if (req.user.role === 'student') {
    const [rows] = await pool.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (!rows[0]) return res.status(404).json({ message: 'Student profile not found' });
    finalStudentId = rows[0].id;
  }

  const [result] = await pool.query(
    'INSERT INTO applications (student_id, job_id, status) VALUES (?, ?, "applied")',
    [finalStudentId, job_id]
  );
  res.status(201).json({ message: 'Application submitted', id: result.insertId });
});

exports.updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const [result] = await pool.query('UPDATE applications SET status = ? WHERE id = ?', [status, req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Application not found' });
  res.json({ message: 'Application status updated' });
});

exports.deleteApplication = asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM applications WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Application not found' });
  res.json({ message: 'Application deleted' });
});
