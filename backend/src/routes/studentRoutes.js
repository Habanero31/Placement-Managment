const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/studentController');
const { protect, allowRoles } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();
const studentRules = [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('roll_no').notEmpty(),
  body('department').notEmpty(),
  body('graduation_year').isInt({ min: 2020, max: 2100 }),
  body('cgpa').isFloat({ min: 0, max: 10 })
];

router.get('/me', protect, allowRoles('student'), controller.getMyProfile);
router.get('/', protect, allowRoles('admin'), controller.getStudents);
router.get('/:id', protect, allowRoles('admin'), controller.getStudentById);
router.post('/', protect, allowRoles('admin'), studentRules, validate, controller.createStudent);
router.put('/:id', protect, allowRoles('admin'), studentRules, validate, controller.updateStudent);
router.delete('/:id', protect, allowRoles('admin'), controller.deleteStudent);

module.exports = router;
