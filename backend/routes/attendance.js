const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  getMyHistory,
  getMySummary,
  getTodayStatus,
  getAllAttendance,
  getEmployeeAttendance,
  getTeamSummary
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');
const { exportToCSV } = require('../utils/csvExport');
const Attendance = require('../models/Attendance');

// Employee routes
router.post('/checkin', protect, authorize('employee'), checkIn);
router.post('/checkout', protect, authorize('employee'), checkOut);
router.get('/my-history', protect, authorize('employee'), getMyHistory);
router.get('/my-summary', protect, authorize('employee'), getMySummary);
router.get('/today', protect, getTodayStatus);

// Manager routes
router.get('/all', protect, authorize('manager'), getAllAttendance);
router.get('/employee/:id', protect, authorize('manager'), getEmployeeAttendance);
router.get('/summary', protect, authorize('manager'), getTeamSummary);
router.get('/today-status', protect, authorize('manager'), getTodayStatus);

// Export route
router.get('/export', protect, authorize('manager'), async (req, res) => {
  try {
    const attendance = await Attendance.find()
      .populate('user', 'name email employeeId department')
      .sort({ date: -1 });

    const csv = exportToCSV(attendance);

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename=attendance-report.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;