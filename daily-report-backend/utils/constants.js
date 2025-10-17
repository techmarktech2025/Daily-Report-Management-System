// Application constants
const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor'
};

const PROJECT_STATUS = {
  PLANNING: 'Planning',
  ACTIVE: 'Active',
  ON_HOLD: 'On Hold',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
};

const PRIORITY_LEVELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical'
};

const REQUEST_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled'
};

const ATTENDANCE_STATUS = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  HALF_DAY: 'Half Day',
  LATE: 'Late',
  HOLIDAY: 'Holiday',
  LEAVE: 'Leave'
};

const PERMISSIONS = {
  // Superadmin permissions
  ALL_PROJECTS: 'all_projects',
  USER_MANAGEMENT: 'user_management',
  SYSTEM_CONFIG: 'system_config',
  
  // Admin permissions
  PROJECT_MANAGEMENT: 'project_management',
  EMPLOYEE_MANAGEMENT: 'employee_management',
  MATERIAL_APPROVAL: 'material_approval',
  TOOL_APPROVAL: 'tool_approval',
  ATTENDANCE_MANAGEMENT: 'attendance_management',
  
  // Supervisor permissions
  ATTENDANCE_ENTRY: 'attendance_entry',
  MATERIAL_REQUEST: 'material_request',
  TOOL_REQUEST: 'tool_request',
  PROGRESS_REPORT: 'progress_report',
  EMPLOYEE_VIEW: 'employee_view',
  
  // Common permissions
  ANALYTICS: 'analytics',
  REPORTS: 'reports'
};

const DEFAULT_PERMISSIONS = {
  [ROLES.SUPERADMIN]: [
    PERMISSIONS.ALL_PROJECTS,
    PERMISSIONS.USER_MANAGEMENT,
    PERMISSIONS.SYSTEM_CONFIG,
    PERMISSIONS.EMPLOYEE_MANAGEMENT,
    PERMISSIONS.ANALYTICS,
    PERMISSIONS.REPORTS
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.PROJECT_MANAGEMENT,
    PERMISSIONS.EMPLOYEE_MANAGEMENT,
    PERMISSIONS.MATERIAL_APPROVAL,
    PERMISSIONS.TOOL_APPROVAL,
    PERMISSIONS.ATTENDANCE_MANAGEMENT,
    PERMISSIONS.REPORTS
  ],
  [ROLES.SUPERVISOR]: [
    PERMISSIONS.ATTENDANCE_ENTRY,
    PERMISSIONS.MATERIAL_REQUEST,
    PERMISSIONS.TOOL_REQUEST,
    PERMISSIONS.PROGRESS_REPORT,
    PERMISSIONS.EMPLOYEE_VIEW
  ]
};

const FILE_TYPES = {
  IMAGES: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  DOCUMENTS: ['pdf', 'doc', 'docx', 'txt'],
  SPREADSHEETS: ['xls', 'xlsx', 'csv'],
  ARCHIVES: ['zip', 'rar', '7z']
};

const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  DATABASE_ERROR: 'DATABASE_ERROR',
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR'
};

const SHIFTS = {
  MORNING: 'Morning',
  EVENING: 'Evening',
  NIGHT: 'Night',
  FULL_DAY: 'Full Day'
};

const WEATHER_CONDITIONS = [
  'Sunny',
  'Cloudy',
  'Partly Cloudy',
  'Rainy',
  'Heavy Rain',
  'Stormy',
  'Windy',
  'Foggy',
  'Hot',
  'Cold'
];

module.exports = {
  ROLES,
  PROJECT_STATUS,
  PRIORITY_LEVELS,
  REQUEST_STATUS,
  ATTENDANCE_STATUS,
  PERMISSIONS,
  DEFAULT_PERMISSIONS,
  FILE_TYPES,
  ERROR_CODES,
  SHIFTS,
  WEATHER_CONDITIONS
};
