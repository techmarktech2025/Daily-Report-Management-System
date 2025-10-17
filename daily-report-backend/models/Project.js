const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const moment = require('moment');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  project_id: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      len: [3, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      isValidLocation(value) {
        if (!value || typeof value !== 'object') {
          throw new Error('Location must be a valid object');
        }
        if (!value.address) {
          throw new Error('Location must have an address');
        }
      }
    }
  },
  client: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      isValidClient(value) {
        if (!value || typeof value !== 'object') {
          throw new Error('Client must be a valid object');
        }
        if (!value.name) {
          throw new Error('Client must have a name');
        }
      }
    }
  },
  status: {
    type: DataTypes.ENUM('Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'),
    defaultValue: 'Planning'
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
    defaultValue: 'Medium'
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true,
      isAfter: '2020-01-01'
    }
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true,
      isAfterStartDate(value) {
        if (this.start_date && value <= this.start_date) {
          throw new Error('End date must be after start date');
        }
      }
    }
  },
  estimated_budget: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  actual_cost: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  completion_percentage: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  scope_of_work: {
    type: DataTypes.JSON,
    defaultValue: [],
    allowNull: true
  },
  project_documents: {
    type: DataTypes.JSON,
    defaultValue: [],
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'projects',
  hooks: {
    beforeCreate: (project) => {
      if (!project.project_id) {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 4).toUpperCase();
        project.project_id = `PROJ-${timestamp}${random}`;
      }
    },
    beforeUpdate: (project) => {
      // Auto-update status based on completion percentage
      if (project.completion_percentage === 100 && project.status !== 'Completed') {
        project.status = 'Completed';
      } else if (project.completion_percentage > 0 && project.status === 'Planning') {
        project.status = 'Active';
      }
    }
  },
  indexes: [
    { fields: ['status'] },
    { fields: ['priority'] },
    { fields: ['start_date', 'end_date'] },
    { fields: ['created_by'] },
    { fields: ['is_active'] },
    { fields: ['project_id'] }
  ]
});

// Instance methods
Project.prototype.getDurationDays = function() {
  if (this.start_date && this.end_date) {
    return moment(this.end_date).diff(moment(this.start_date), 'days') + 1;
  }
  return 0;
};

Project.prototype.getDaysRemaining = function() {
  if (this.end_date && this.status !== 'Completed') {
    const today = moment();
    const endDate = moment(this.end_date);
    return Math.max(0, endDate.diff(today, 'days'));
  }
  return 0;
};

Project.prototype.getDaysElapsed = function() {
  if (this.start_date) {
    const today = moment();
    const startDate = moment(this.start_date);
    return Math.max(0, today.diff(startDate, 'days'));
  }
  return 0;
};

Project.prototype.getBudgetUtilization = function() {
  if (this.estimated_budget && this.estimated_budget > 0) {
    return ((this.actual_cost / this.estimated_budget) * 100).toFixed(2);
  }
  return 0;
};

Project.prototype.isOverdue = function() {
  return this.status !== 'Completed' && moment().isAfter(moment(this.end_date));
};

Project.prototype.isDelayed = function() {
  const daysElapsed = this.getDaysElapsed();
  const totalDays = this.getDurationDays();
  const expectedProgress = totalDays > 0 ? (daysElapsed / totalDays) * 100 : 0;
  return this.completion_percentage < expectedProgress;
};

// Class methods
Project.getActiveProjects = function() {
  return Project.findAll({
    where: { 
      is_active: true,
      status: ['Planning', 'Active', 'On Hold']
    },
    include: [{
      model: require('./User'),
      as: 'creator',
      attributes: ['id', 'name', 'username']
    }],
    order: [['priority', 'DESC'], ['start_date', 'ASC']]
  });
};

Project.getProjectsByStatus = function(status) {
  return Project.findAll({
    where: { 
      status,
      is_active: true 
    },
    include: [{
      model: require('./User'),
      as: 'creator',
      attributes: ['id', 'name', 'username']
    }],
    order: [['start_date', 'DESC']]
  });
};

Project.getOverdueProjects = function() {
  return Project.findAll({
    where: {
      is_active: true,
      status: ['Planning', 'Active', 'On Hold'],
      end_date: {
        [require('sequelize').Op.lt]: moment().format('YYYY-MM-DD')
      }
    },
    include: [{
      model: require('./User'),
      as: 'creator',
      attributes: ['id', 'name', 'username']
    }],
    order: [['end_date', 'ASC']]
  });
};

module.exports = Project;
