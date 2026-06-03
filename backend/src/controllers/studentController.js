const bcrypt = require('bcrypt');
const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

exports.getStudents = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT s.*, u.name, u.email
    FROM students s
    JOIN users u ON u.id = s.user_id
    ORDER BY s.id DESC
  `);
  res.json(rows);
});

exports.getStudentById = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT s.*, u.name, u.email
    FROM students s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = ?
  `, [req.params.id]);

  if (!rows[0]) return res.status(404).json({ message: 'Student not found' });
  res.json(rows[0]);
});

exports.createStudent = asyncHandler(async (req, res) => {
  const { name, email, password, roll_no, department, graduation_year, cgpa, skills, phone, resume_url } = req.body;
  const hashedPassword = await bcrypt.hash(password || 'password123', 10);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const [userResult] = await connection.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, "student")',
      [name, email, hashedPassword]
    );
    const [studentResult] = await connection.query(
      'INSERT INTO students (user_id, roll_no, department, graduation_year, cgpa, skills, phone, resume_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userResult.insertId, roll_no, department, graduation_year, cgpa, skills || null, phone || null, resume_url || null]
    );
    await connection.commit();
    res.status(201).json({ message: 'Student created', id: studentResult.insertId });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

exports.updateStudent = asyncHandler(async (req, res) => {
  const { name, email, roll_no, department, graduation_year, cgpa, skills, phone, resume_url } = req.body;
  const [students] = await pool.query('SELECT user_id FROM students WHERE id = ?', [req.params.id]);
  if (!students[0]) return res.status(404).json({ message: 'Student not found' });

  await pool.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, students[0].user_id]);
  await pool.query(
    'UPDATE students SET roll_no = ?, department = ?, graduation_year = ?, cgpa = ?, skills = ?, phone = ?, resume_url = ? WHERE id = ?',
    [roll_no, department, graduation_year, cgpa, skills || null, phone || null, resume_url || null, req.params.id]
  );
  res.json({ message: 'Student updated' });
});

exports.deleteStudent = asyncHandler(async (req, res) => {
  const [students] = await pool.query('SELECT user_id FROM students WHERE id = ?', [req.params.id]);
  if (!students[0]) return res.status(404).json({ message: 'Student not found' });
  await pool.query('DELETE FROM users WHERE id = ?', [students[0].user_id]);
  res.json({ message: 'Student deleted' });
});

exports.getMyProfile = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT s.*, u.name, u.email
    FROM students s
    JOIN users u ON u.id = s.user_id
    WHERE u.id = ?
  `, [req.user.id]);
  if (!rows[0]) return res.status(404).json({ message: 'Profile not found' });
  res.json(rows[0]);
});
