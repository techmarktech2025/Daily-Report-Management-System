const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50],
      isAlphanumeric: true
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    },
    set(value) {
      this.setDataValue('email', value.toLowerCase().trim());
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  role: {
    type: DataTypes.ENUM('superadmin', 'admin', 'supervisor'),
    allowNull: false,
    defaultValue: 'supervisor'
  },
  employee_id: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: true,
    validate: {
      is: /^[\+]?[1-9]?[\d\s\-\(\)]{7,15}$/
    }
  },
  avatar: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  permissions: {
    type: DataTypes.JSON,
    defaultValue: [],
    allowNull: true
  }
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        user.password = await bcrypt.hash(user.password, saltRounds);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        user.password = await bcrypt.hash(user.password, saltRounds);
      }
    }
  },
  indexes: [
    { fields: ['role'] },
    { fields: ['is_active'] },
    { fields: ['employee_id'] },
    { fields: ['email'] },
    { fields: ['username'] }
  ]
});

// Instance methods
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.generateToken = function() {
  return jwt.sign(
    {
      id: this.id,
      username: this.username,
      role: this.role,
      name: this.name,
      permissions: this.permissions
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

User.prototype.generateRefreshToken = function() {
  return jwt.sign(
    { id: this.id, tokenType: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE }
  );
};

User.prototype.hasPermission = function(permission) {
  if (this.role === 'superadmin') return true;
  return this.permissions && this.permissions.includes(permission);
};

User.prototype.canAccessProject = function(projectId) {
  if (['superadmin', 'admin'].includes(this.role)) return true;
  // Additional logic for supervisor project access
  return false;
};

User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

// Class methods
User.findByCredentials = async function(username, password) {
  const user = await User.findOne({
    where: { 
      username, 
      is_active: true 
    },
    attributes: { include: ['password'] }
  });

  if (!user || !(await user.comparePassword(password))) {
    throw new Error('Invalid credentials');
  }

  return user;
};

User.findActiveUsers = function(role = null) {
  const where = { is_active: true };
  if (role) where.role = role;
  
  return User.findAll({
    where,
    attributes: { exclude: ['password'] },
    order: [['name', 'ASC']]
  });
};

module.exports = User;
