const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

exports.getInterviews = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT i.*, u.name AS student_name, j.title AS job_title, c.name AS company_name
    FROM interviews i
    JOIN applications a ON a.id = i.application_id
    JOIN students s ON s.id = a.student_id
    JOIN users u ON u.id = s.user_id
    JOIN jobs j ON j.id = a.job_id
    JOIN companies c ON c.id = j.company_id
    ORDER BY i.interview_date ASC
  `);
  res.json(rows);
});

exports.getMyInterviews = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT i.*, j.title AS job_title, c.name AS company_name
    FROM interviews i
    JOIN applications a ON a.id = i.application_id
    JOIN students s ON s.id = a.student_id
    JOIN jobs j ON j.id = a.job_id
    JOIN companies c ON c.id = j.company_id
    WHERE s.user_id = ?
    ORDER BY i.interview_date ASC
  `, [req.user.id]);
  res.json(rows);
});

exports.createInterview = asyncHandler(async (req, res) => {
  const { application_id, interview_date, mode, venue, interviewer, result, notes } = req.body;
  const [queryResult] = await pool.query(
    'INSERT INTO interviews (application_id, interview_date, mode, venue, interviewer, result, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [application_id, interview_date, mode, venue || null, interviewer || null, result || 'scheduled', notes || null]
  );
  res.status(201).json({ message: 'Interview scheduled', id: queryResult.insertId });
});

exports.updateInterview = asyncHandler(async (req, res) => {
  const { application_id, interview_date, mode, venue, interviewer, result, notes } = req.body;
  const [queryResult] = await pool.query(
    'UPDATE interviews SET application_id = ?, interview_date = ?, mode = ?, venue = ?, interviewer = ?, result = ?, notes = ? WHERE id = ?',
    [application_id, interview_date, mode, venue || null, interviewer || null, result || 'scheduled', notes || null, req.params.id]
  );
  if (!queryResult.affectedRows) return res.status(404).json({ message: 'Interview not found' });
  res.json({ message: 'Interview updated' });
});

exports.deleteInterview = asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM interviews WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Interview not found' });
  res.json({ message: 'Interview deleted' });
});
