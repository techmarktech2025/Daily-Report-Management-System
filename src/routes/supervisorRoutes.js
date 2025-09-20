// src/routes/supervisorRoutes.js
import React from 'react';
import {
  Schedule as AttendanceIcon,
  Assignment as ScopeIcon,
  Engineering as WorkProgressIcon,
  Assessment as EstimateIcon,
  Inventory as MaterialToolIcon,
  People as EmployeesIcon,
  CallReceived as InwardIcon,
  CallMade as OutwardIcon,
  Home as HomeIcon
} from '@mui/icons-material';

// Import supervisor components
const SupervisorHome = React.lazy(() => import('../Pages/Supervisor/SupervisorHome/SupervisorHome'));
const SupervisorAttendance = React.lazy(() => import('../Pages/Supervisor/Attendance/Attendance'));
const SupervisorScopeOfWork = React.lazy(() => import('../Pages/Supervisor/ScopeOfWork/ScopeOfWork'));
const SupervisorWorkProgress = React.lazy(() => import('../Pages/Supervisor/WorkProgress/WorkProgress'));
const SupervisorWorkEstimate = React.lazy(() => import('../Pages/Supervisor/WorkEstimate/WorkEstimate'));
const SupervisorMaterialToolRequest = React.lazy(() => import('../Pages/Supervisor/MaterialToolRequest/MaterialToolRequest'));
const SupervisorEmployees = React.lazy(() => import('../Pages/Supervisor/Employees/Employees'));
const SupervisorInward = React.lazy(() => import('../Pages/Supervisor/Inward/Inward'));
const SupervisorOutward = React.lazy(() => import('../Pages/Supervisor/Outward/Outward'));

// Supervisor route configuration
export const supervisorRouteConfig = [
  {
    path: '/supervisor',
    component: SupervisorHome,
    title: 'Home',
    icon: HomeIcon,
    showInNav: true,
    exact: true
  },
  {
    path: '/supervisor/attendance',
    component: SupervisorAttendance,
    title: 'Attendance',
    icon: AttendanceIcon,
    showInNav: true
  },
  {
    path: '/supervisor/scope-of-work',
    component: SupervisorScopeOfWork,
    title: 'Scope of Work',
    icon: ScopeIcon,
    showInNav: true
  },
  {
    path: '/supervisor/work-progress',
    component: SupervisorWorkProgress,
    title: 'Work in progress',
    icon: WorkProgressIcon,
    showInNav: true
  },
  {
    path: '/supervisor/work-estimate',
    component: SupervisorWorkEstimate,
    title: 'Work Estimate',
    icon: EstimateIcon,
    showInNav: true
  },
  {
    path: '/supervisor/material-tool-request',
    component: SupervisorMaterialToolRequest,
    title: 'Material & Tool Request',
    icon: MaterialToolIcon,
    showInNav: true
  },
  {
    path: '/supervisor/employees',
    component: SupervisorEmployees,
    title: 'Employees',
    icon: EmployeesIcon,
    showInNav: true
  },
  {
    path: '/supervisor/inward',
    component: SupervisorInward,
    title: 'Inward',
    icon: InwardIcon,
    showInNav: true
  },
  {
    path: '/supervisor/outward',
    component: SupervisorOutward,
    title: 'Outward',
    icon: OutwardIcon,
    showInNav: true
  }
];

// Helper function to get flat routes for React Router
export const getSupervisorFlatRoutes = (routes = supervisorRouteConfig) => {
  const flatRoutes = [];
  
  routes.forEach(route => {
    if (route.component) {
      flatRoutes.push(route);
    }
    if (route.children) {
      flatRoutes.push(...getSupervisorFlatRoutes(route.children));
    }
  });
  
  return flatRoutes;
};
