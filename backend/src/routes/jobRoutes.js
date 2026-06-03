const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/jobController');
const { protect, allowRoles } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();
const rules = [
  body('company_id').isInt(),
  body('title').notEmpty(),
  body('description').notEmpty(),
  body('package_lpa').isFloat({ min: 0 }),
  body('min_cgpa').optional().isFloat({ min: 0, max: 10 }),
  body('deadline').isISO8601()
];

router.get('/', protect, controller.getJobs);
router.get('/:id', protect, controller.getJobById);
router.post('/', protect, allowRoles('admin'), rules, validate, controller.createJob);
router.put('/:id', protect, allowRoles('admin'), rules, validate, controller.updateJob);
router.delete('/:id', protect, allowRoles('admin'), controller.deleteJob);

module.exports = router;
