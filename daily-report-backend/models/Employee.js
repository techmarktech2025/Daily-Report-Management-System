const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  employee_id: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  personal_info: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      isValidPersonalInfo(value) {
        if (!value || !value.first_name || !value.last_name) {
          throw new Error('Personal info must include first_name and last_name');
        }
      }
    }
  },
  employment: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      isValidEmployment(value) {
        if (!value || !value.department || !value.designation) {
          throw new Error('Employment info must include department and designation');
        }
      }
    }
  },
  skills: {
    type: DataTypes.JSON,
    defaultValue: [],
    allowNull: true
  },
  qualifications: {
    type: DataTypes.JSON,
    defaultValue: [],
    allowNull: true
  },
  emergency_contact: {
    type: DataTypes.JSON,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  termination_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  termination_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  performance_rating: {
    type: DataTypes.DECIMAL(2, 1),
    allowNull: true,
    validate: {
      min: 1.0,
      max: 5.0
    }
  },
  last_review_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
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
  tableName: 'employees',
  hooks: {
    beforeCreate: (employee) => {
      if (!employee.employee_id) {
        const employment = employee.employment || {};
        const dept = employment.department || 'EMP';
        const deptCode = dept.substring(0, 3).toUpperCase();
        const timestamp = Date.now().toString().slice(-4);
        const random = Math.random().toString(36).substring(2, 3).toUpperCase();
        employee.employee_id = `${deptCode}-${timestamp}${random}`;
      }
    }
  },
  indexes: [
    { fields: ['is_active'] },
    { fields: ['user_id'] },
    { fields: ['employee_id'] }
  ]
});

// Instance methods
Employee.prototype.getFullName = function() {
  const personalInfo = this.personal_info || {};
  return `${personalInfo.first_name || ''} ${personalInfo.last_name || ''}`.trim();
};

Employee.prototype.getAge = function() {
  const personalInfo = this.personal_info || {};
  if (personalInfo.date_of_birth) {
    const birthDate = new Date(personalInfo.date_of_birth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  }
  return null;
};

Employee.prototype.getDepartment = function() {
  return this.employment?.department || 'Unknown';
};

Employee.prototype.getDesignation = function() {
  return this.employment?.designation || 'Unknown';
};

Employee.prototype.getExperience = function() {
  const employment = this.employment || {};
  if (employment.joining_date) {
    const joinDate = new Date(employment.joining_date);
    const today = new Date();
    const years = today.getFullYear() - joinDate.getFullYear();
    const months = today.getMonth() - joinDate.getMonth();
    return years + (months / 12);
  }
  return 0;
};

module.exports = Employee;
