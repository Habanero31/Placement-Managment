const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

function createToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

exports.login = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND role = ?', [email, role]);
  const user = rows[0];

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid email, password, or role' });
  }

  res.json({
    message: 'Login successful',
    token: createToken(user),
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

exports.registerStudent = asyncHandler(async (req, res) => {
  const { name, email, password, roll_no, department, graduation_year, cgpa, skills, phone, resume_url } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const [userResult] = await connection.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, "student")',
      [name, email, hashedPassword]
    );
    await connection.query(
      'INSERT INTO students (user_id, roll_no, department, graduation_year, cgpa, skills, phone, resume_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userResult.insertId, roll_no, department, graduation_year, cgpa, skills || null, phone || null, resume_url || null]
    );
    await connection.commit();
    res.status(201).json({ message: 'Student registered successfully' });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});
