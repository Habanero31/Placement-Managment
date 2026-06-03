const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

exports.getCompanies = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM companies ORDER BY id DESC');
  res.json(rows);
});

exports.getCompanyById = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM companies WHERE id = ?', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ message: 'Company not found' });
  res.json(rows[0]);
});

exports.createCompany = asyncHandler(async (req, res) => {
  const { name, industry, website, location, contact_email } = req.body;
  const [result] = await pool.query(
    'INSERT INTO companies (name, industry, website, location, contact_email) VALUES (?, ?, ?, ?, ?)',
    [name, industry, website || null, location || null, contact_email || null]
  );
  res.status(201).json({ message: 'Company created', id: result.insertId });
});

exports.updateCompany = asyncHandler(async (req, res) => {
  const { name, industry, website, location, contact_email } = req.body;
  const [result] = await pool.query(
    'UPDATE companies SET name = ?, industry = ?, website = ?, location = ?, contact_email = ? WHERE id = ?',
    [name, industry, website || null, location || null, contact_email || null, req.params.id]
  );
  if (!result.affectedRows) return res.status(404).json({ message: 'Company not found' });
  res.json({ message: 'Company updated' });
});

exports.deleteCompany = asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM companies WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Company not found' });
  res.json({ message: 'Company deleted' });
});
