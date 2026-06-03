const express = require('express');
const controller = require('../controllers/dashboardController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/stats', protect, allowRoles('admin'), controller.getStats);
router.get('/analytics', protect, allowRoles('admin'), controller.getAnalytics);

module.exports = router;
