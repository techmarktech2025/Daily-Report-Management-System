const { sequelize } = require('../config/db');

// Import all models
const User = require('./User');
const Project = require('./Project');
const Employee = require('./Employee');
const Attendance = require('./Attendance');
const MaterialRequest = require('./MaterialRequest');
const ToolRequest = require('./ToolRequest');
const WorkProgress = require('./WorkProgress');
// const ProjectAssignment = require('./ProjectAssignment');
// const Notification = require('./Notification');
// const SystemLog = require('./SystemLog');
// const FileUpload = require('./FileUpload');

// Define associations
const defineAssociations = () => {
  // User associations
  User.hasMany(Project, { foreignKey: 'created_by', as: 'createdProjects' });
  User.hasOne(Employee, { foreignKey: 'user_id', as: 'employeeProfile' });
  User.hasMany(MaterialRequest, { foreignKey: 'requested_by', as: 'materialRequests' });
  User.hasMany(ToolRequest, { foreignKey: 'requested_by', as: 'toolRequests' });
  User.hasMany(WorkProgress, { foreignKey: 'submitted_by', as: 'progressReports' });
//   User.hasMany(Notification, { foreignKey: 'recipient_id', as: 'receivedNotifications' });
//   User.hasMany(Notification, { foreignKey: 'sender_id', as: 'sentNotifications' });
//   User.hasMany(SystemLog, { foreignKey: 'user_id', as: 'systemLogs' });
//   User.hasMany(FileUpload, { foreignKey: 'uploaded_by', as: 'uploadedFiles' });

  // Project associations
  Project.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
//   Project.hasMany(ProjectAssignment, { foreignKey: 'project_id', as: 'assignments' });
  Project.hasMany(Attendance, { foreignKey: 'project_id', as: 'attendanceRecords' });
  Project.hasMany(MaterialRequest, { foreignKey: 'project_id', as: 'materialRequests' });
  Project.hasMany(ToolRequest, { foreignKey: 'project_id', as: 'toolRequests' });
  Project.hasMany(WorkProgress, { foreignKey: 'project_id', as: 'progressReports' });

  // Employee associations
  Employee.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  Employee.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
//   Employee.hasMany(ProjectAssignment, { foreignKey: 'employee_id', as: 'assignments' });
  Employee.hasMany(Attendance, { foreignKey: 'employee_id', as: 'attendanceRecords' });

  // ProjectAssignment associations
//   ProjectAssignment.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
//   ProjectAssignment.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
//   ProjectAssignment.belongsTo(User, { foreignKey: 'supervisor_id', as: 'supervisor' });
//   ProjectAssignment.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

  // Attendance associations
  Attendance.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
  Attendance.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
  Attendance.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });

  // MaterialRequest associations
  MaterialRequest.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
  MaterialRequest.belongsTo(User, { foreignKey: 'requested_by', as: 'requester' });
  MaterialRequest.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewer' });

  // ToolRequest associations
  ToolRequest.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
  ToolRequest.belongsTo(User, { foreignKey: 'requested_by', as: 'requester' });
  ToolRequest.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewer' });

  // WorkProgress associations
  WorkProgress.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
  WorkProgress.belongsTo(User, { foreignKey: 'submitted_by', as: 'submitter' });
  WorkProgress.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });

  // Notification associations
//   Notification.belongsTo(User, { foreignKey: 'recipient_id', as: 'recipient' });
//   Notification.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

  // SystemLog associations
//   SystemLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // FileUpload associations
//   FileUpload.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });
};

// Initialize associations
defineAssociations();

module.exports = {
  sequelize,
  User,
  Project,
  Employee,
  Attendance,
  MaterialRequest,
  ToolRequest,
  WorkProgress,
//   ProjectAssignment,
//   Notification,
//   SystemLog,
//   FileUpload
};
