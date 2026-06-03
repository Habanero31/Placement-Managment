const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/interviewController');
const { protect, allowRoles } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();
const rules = [
  body('application_id').isInt(),
  body('interview_date').isISO8601(),
  body('mode').isIn(['online', 'offline'])
];

router.get('/me', protect, allowRoles('student'), controller.getMyInterviews);
router.get('/', protect, allowRoles('admin'), controller.getInterviews);
router.post('/', protect, allowRoles('admin'), rules, validate, controller.createInterview);
router.put('/:id', protect, allowRoles('admin'), rules, validate, controller.updateInterview);
router.delete('/:id', protect, allowRoles('admin'), controller.deleteInterview);

module.exports = router;
