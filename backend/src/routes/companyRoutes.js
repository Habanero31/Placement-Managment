const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/companyController');
const { protect, allowRoles } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();
const rules = [body('name').notEmpty(), body('industry').notEmpty()];

router.get('/', protect, controller.getCompanies);
router.get('/:id', protect, controller.getCompanyById);
router.post('/', protect, allowRoles('admin'), rules, validate, controller.createCompany);
router.put('/:id', protect, allowRoles('admin'), rules, validate, controller.updateCompany);
router.delete('/:id', protect, allowRoles('admin'), controller.deleteCompany);

module.exports = router;
