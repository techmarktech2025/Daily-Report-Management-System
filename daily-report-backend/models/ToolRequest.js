const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ToolRequest = sequelize.define('ToolRequest', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  request_id: {
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
  tools: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      isValidTools(value) {
        if (!Array.isArray(value) || value.length === 0) {
          throw new Error('Tools must be a non-empty array');
        }
      }
    }
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Delivered', 'Returned', 'Cancelled'),
    defaultValue: 'Pending'
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
    defaultValue: 'Medium'
  },
  request_type: {
    type: DataTypes.ENUM('Purchase', 'Rent', 'Borrow'),
    defaultValue: 'Purchase'
  },
  required_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  return_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  reviewed_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  review_comments: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  delivered_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  delivered_by: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  returned_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  return_condition: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  total_estimated_cost: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  actual_cost: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  supplier_info: {
    type: DataTypes.JSON,
    allowNull: true
  },
  attachments: {
    type: DataTypes.JSON,
    allowNull: true
  },
  requested_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reviewed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'tool_requests',
  hooks: {
    beforeCreate: (request) => {
      if (!request.request_id) {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 4).toUpperCase();
        request.request_id = `TOOL-${timestamp}${random}`;
      }
    }
  },
  indexes: [
    { fields: ['status'] },
    { fields: ['project_id'] },
    { fields: ['required_date'] },
    { fields: ['priority'] }
  ]
});

module.exports = ToolRequest;
