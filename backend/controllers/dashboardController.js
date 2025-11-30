const Attendance = require('../models/Attendance');
const User = require('../models/User');

// @desc    Get employee dashboard stats
// @route   GET /api/dashboard/employee
// @access  Private (Employee)
exports.getEmployeeStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const monthStart = new Date(currentYear, currentMonth, 1);

    // Today's status
    const todayAttendance = await Attendance.findOne({
      user: req.user._id,
      date: today
    });

    // This month's stats
    const monthAttendance = await Attendance.find({
      user: req.user._id,
      date: { $gte: monthStart, $lte: today }
    });

    // Recent 7 days
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentAttendance = await Attendance.find({
      user: req.user._id,
      date: { $gte: sevenDaysAgo, $lte: today }
    }).sort({ date: -1 });

    const stats = {
      todayStatus: todayAttendance,
      monthSummary: {
        present: monthAttendance.filter(a => a.status === 'present').length,
        absent: monthAttendance.filter(a => a.status === 'absent').length,
        late: monthAttendance.filter(a => a.status === 'late').length,
        totalHours: monthAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0).toFixed(2)
      },
      recentAttendance
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get manager dashboard stats
// @route   GET /api/dashboard/manager
// @access  Private (Manager)
exports.getManagerStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total employees
    const totalEmployees = await User.countDocuments({ role: 'employee' });

    // Today's attendance
    const todayAttendance = await Attendance.find({ date: today })
      .populate('user', 'name employeeId department');

    const presentToday = todayAttendance.length;
    const absentToday = totalEmployees - presentToday;
    const lateToday = todayAttendance.filter(a => a.status === 'late').length;

    // Get all employees to find who's absent
    const allEmployees = await User.find({ role: 'employee' }).select('name employeeId');
    const presentEmployeeIds = todayAttendance.map(a => a.user._id.toString());
    const absentEmployees = allEmployees.filter(
      emp => !presentEmployeeIds.includes(emp._id.toString())
    );

    // Weekly trend (last 5 days)
    const weeklyTrend = [];
    for (let i = 4; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dayAttendance = await Attendance.countDocuments({ date });
      
      weeklyTrend.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date,
        present: dayAttendance
      });
    }

    // Department-wise stats
    const departments = await User.distinct('department', { role: 'employee' });
    const departmentStats = [];

    for (const dept of departments) {
      const deptEmployees = await User.countDocuments({ 
        role: 'employee', 
        department: dept 
      });
      
      const deptPresent = todayAttendance.filter(
        a => a.user.department === dept
      ).length;

      departmentStats.push({
        department: dept,
        total: deptEmployees,
        present: deptPresent
      });
    }

    const stats = {
      totalEmployees,
      presentToday,
      absentToday,
      lateToday,
      absentEmployees,
      weeklyTrend,
      departmentStats,
      todayAttendance
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};