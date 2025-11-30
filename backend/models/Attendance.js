const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkInTime: {
    type: Date,
    default: null
  },
  checkOutTime: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half-day'],
    default: 'present'
  },
  totalHours: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create compound index for user and date to prevent duplicate entries
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

// Method to calculate total hours
attendanceSchema.methods.calculateHours = function() {
  if (this.checkInTime && this.checkOutTime) {
    const diff = this.checkOutTime - this.checkInTime;
    this.totalHours = parseFloat((diff / (1000 * 60 * 60)).toFixed(2));
  }
};

module.exports = mongoose.model('Attendance', attendanceSchema);