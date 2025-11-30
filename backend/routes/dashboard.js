const express = require('express');
const router = express.Router();
const { getEmployeeStats, getManagerStats } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.get('/employee', protect, authorize('employee'), getEmployeeStats);
router.get('/manager', protect, authorize('manager'), getManagerStats);

module.exports = router;