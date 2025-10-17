const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const moment = require('moment');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  attendance_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  check_in_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  check_out_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  check_in_location: {
    type: DataTypes.JSON,
    allowNull: true
  },
  check_out_location: {
    type: DataTypes.JSON,
    allowNull: true
  },
  total_hours: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true
  },
  break_hours: {
    type: DataTypes.DECIMAL(4, 2),
    defaultValue: 0
  },
  overtime_hours: {
    type: DataTypes.DECIMAL(4, 2),
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('Present', 'Absent', 'Half Day', 'Late', 'Holiday', 'Leave'),
    defaultValue: 'Present'
  },
  work_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  photos: {
    type: DataTypes.JSON,
    allowNull: true
  },
  weather_conditions: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  is_approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approved_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'attendance',
  indexes: [
    { unique: true, fields: ['employee_id', 'attendance_date'] },
    { fields: ['attendance_date'] },
    { fields: ['project_id'] },
    { fields: ['status'] }
  ]
});

// Instance methods
Attendance.prototype.calculateTotalHours = function() {
  if (this.check_in_time && this.check_out_time) {
    const checkIn = moment(`2000-01-01 ${this.check_in_time}`);
    const checkOut = moment(`2000-01-01 ${this.check_out_time}`);
    const diffHours = checkOut.diff(checkIn, 'hours', true);
    return Math.max(0, diffHours - (this.break_hours || 0));
  }
  return 0;
};

Attendance.prototype.calculateOvertime = function(standardHours = 8) {
  const totalHours = this.calculateTotalHours();
  return Math.max(0, totalHours - standardHours);
};

Attendance.prototype.isLate = function(standardStartTime = '09:00:00') {
  if (this.check_in_time) {
    const checkIn = moment(`2000-01-01 ${this.check_in_time}`);
    const standardStart = moment(`2000-01-01 ${standardStartTime}`);
    return checkIn.isAfter(standardStart);
  }
  return false;
};

module.exports = Attendance;
