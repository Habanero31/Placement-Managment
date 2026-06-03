const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');

const router = express.Router();

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('role').isIn(['admin', 'student']).withMessage('Role must be admin or student')
], validate, authController.login);

router.post('/register-student', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('roll_no').notEmpty(),
  body('department').notEmpty(),
  body('graduation_year').isInt({ min: 2020, max: 2100 }),
  body('cgpa').isFloat({ min: 0, max: 10 })
], validate, authController.registerStudent);

module.exports = router;
