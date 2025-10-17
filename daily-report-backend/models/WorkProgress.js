const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const WorkProgress = sequelize.define('WorkProgress', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  report_id: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  report_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  shift: {
    type: DataTypes.ENUM('Morning', 'Evening', 'Night', 'Full Day'),
    defaultValue: 'Full Day'
  },
  weather_conditions: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tasks_completed: {
    type: DataTypes.JSON,
    allowNull: true
  },
  tasks_in_progress: {
    type: DataTypes.JSON,
    allowNull: true
  },
  tasks_planned: {
    type: DataTypes.JSON,
    allowNull: true
  },
  materials_used: {
    type: DataTypes.JSON,
    allowNull: true
  },
  tools_used: {
    type: DataTypes.JSON,
    allowNull: true
  },
  manpower: {
    type: DataTypes.JSON,
    allowNull: true
  },
  safety_incidents: {
    type: DataTypes.JSON,
    allowNull: true
  },
  quality_checks: {
    type: DataTypes.JSON,
    allowNull: true
  },
  challenges_faced: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  solutions_implemented: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  next_day_plan: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  photos: {
    type: DataTypes.JSON,
    allowNull: true
  },
  documents: {
    type: DataTypes.JSON,
    allowNull: true
  },
  overall_progress_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
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
  approval_comments: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  submitted_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'work_progress',
  indexes: [
    { unique: true, fields: ['project_id', 'report_date', 'shift'] },
    { fields: ['report_date'] },
    { fields: ['project_id'] },
    { fields: ['is_approved'] }
  ],
  hooks: {
    beforeCreate: (progress) => {
      if (!progress.report_id) {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 4).toUpperCase();
        progress.report_id = `RPT-${timestamp}${random}`;
      }
    }
  }
});

module.exports = WorkProgress;
