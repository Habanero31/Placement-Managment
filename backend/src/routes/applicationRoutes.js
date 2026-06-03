const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/applicationController');
const { protect, allowRoles } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/me', protect, allowRoles('student'), controller.getMyApplications);
router.get('/', protect, allowRoles('admin'), controller.getApplications);
router.post('/', protect, body('job_id').isInt(), validate, controller.createApplication);
router.patch('/:id/status', protect, allowRoles('admin'), [
  body('status').isIn(['applied', 'shortlisted', 'selected', 'rejected'])
], validate, controller.updateApplicationStatus);
router.delete('/:id', protect, allowRoles('admin'), controller.deleteApplication);

module.exports = router;
