const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Attendance = require('../models/Attendance');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Attendance.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const users = [
      {
        name: 'Manager User',
        email: 'manager@company.com',
        password: 'password123',
        role: 'manager',
        employeeId: 'MGR001',
        department: 'Management'
      },
      {
        name: 'John Doe',
        email: 'emp1@company.com',
        password: 'password123',
        role: 'employee',
        employeeId: 'EMP001',
        department: 'Engineering'
      },
      {
        name: 'Jane Smith',
        email: 'emp2@company.com',
        password: 'password123',
        role: 'employee',
        employeeId: 'EMP002',
        department: 'Engineering'
      },
      {
        name: 'Bob Johnson',
        email: 'emp3@company.com',
        password: 'password123',
        role: 'employee',
        employeeId: 'EMP003',
        department: 'Sales'
      },
      {
        name: 'Alice Williams',
        email: 'emp4@company.com',
        password: 'password123',
        role: 'employee',
        employeeId: 'EMP004',
        department: 'Engineering'
      },
      {
        name: 'Charlie Brown',
        email: 'emp5@company.com',
        password: 'password123',
        role: 'employee',
        employeeId: 'EMP005',
        department: 'Sales'
      },
      {
        name: 'Diana Prince',
        email: 'emp6@company.com',
        password: 'password123',
        role: 'employee',
        employeeId: 'EMP006',
        department: 'Engineering'
      },
      {
        name: 'Eve Davis',
        email: 'emp7@company.com',
        password: 'password123',
        role: 'employee',
        employeeId: 'EMP007',
        department: 'Sales'
      },
      {
        name: 'Frank Miller',
        email: 'emp8@company.com',
        password: 'password123',
        role: 'employee',
        employeeId: 'EMP008',
        department: 'Engineering'
      }
    ];

    const createdUsers = await User.create(users);
    console.log('Users created:', createdUsers.length);

    // Create attendance records for the last 30 days
    const employees = createdUsers.filter(u => u.role === 'employee');
    const attendanceRecords = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      for (const employee of employees) {
        // 90% attendance rate
        if (Math.random() > 0.1) {
          const checkInHour = 8 + Math.floor(Math.random() * 2); // 8-9 AM
          const checkInMinute = Math.floor(Math.random() * 60);
          const checkInTime = new Date(date);
          checkInTime.setHours(checkInHour, checkInMinute, 0, 0);

          const checkOutHour = 17 + Math.floor(Math.random() * 2); // 5-6 PM
          const checkOutMinute = Math.floor(Math.random() * 60);
          const checkOutTime = new Date(date);
          checkOutTime.setHours(checkOutHour, checkOutMinute, 0, 0);

          // Calculate hours
          const totalHours = parseFloat(((checkOutTime - checkInTime) / (1000 * 60 * 60)).toFixed(2));

          // Determine status
          const workStartTime = new Date(date);
          workStartTime.setHours(9, 0, 0, 0);
          let status = checkInTime > workStartTime ? 'late' : 'present';
          if (totalHours < 4) status = 'half-day';

          attendanceRecords.push({
            user: employee._id,
            date,
            checkInTime,
            checkOutTime,
            status,
            totalHours
          });
        }
      }
    }

    await Attendance.create(attendanceRecords);
    console.log('Attendance records created:', attendanceRecords.length);

    console.log('\n✅ Seed data created successfully!');
    console.log('\nDemo Credentials:');
    console.log('Manager: manager@company.com / password123');
    console.log('Employee: emp1@company.com / password123');
    console.log('(Use any emp1-emp8@company.com)\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

connectDB().then(() => seedData());