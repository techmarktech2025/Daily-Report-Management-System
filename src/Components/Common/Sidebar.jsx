import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Business as ProjectIcon,
  People as EmployeeIcon,
  Schedule as AttendanceIcon,
  Inventory as MaterialIcon,
  Build as ToolIcon,
  TrendingUp as ProgressIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  Person as ProfileIcon,
  SupervisorAccount as AdminIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ onClose }) => {
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation items based on role and permissions
  const getNavigationItems = () => {
    const items = [];

    // Dashboard (always visible)
    items.push({
      text: 'Dashboard',
      icon: DashboardIcon,
      path: user?.role === 'superadmin' ? '/superadmin' : 
            user?.role === 'admin' ? '/admin' : '/supervisor',
      permission: null
    });

    // Projects
    if (hasPermission('project_management') || hasPermission('all_projects')) {
      items.push({
        text: 'Projects',
        icon: ProjectIcon,
        path: '/projects',
        permission: 'project_management'
      });
    }

    // Employees
    if (hasPermission('employee_management') || hasPermission('employee_view')) {
      items.push({
        text: 'Employees',
        icon: EmployeeIcon,
        path: '/employees',
        permission: 'employee_management'
      });
    }

    // Attendance
    if (hasPermission('attendance_management') || hasPermission('attendance_entry')) {
      items.push({
        text: 'Attendance',
        icon: AttendanceIcon,
        path: '/attendance',
        permission: 'attendance_entry'
      });
    }

    // Materials
    if (hasPermission('material_approval') || hasPermission('material_request')) {
      items.push({
        text: 'Materials',
        icon: MaterialIcon,
        path: '/materials',
        permission: 'material_request'
      });
    }

    // Tools
    if (hasPermission('tool_approval') || hasPermission('tool_request')) {
      items.push({
        text: 'Tools',
        icon: ToolIcon,
        path: '/tools',
        permission: 'tool_request'
      });
    }

    // Progress Reports
    if (hasPermission('progress_report')) {
      items.push({
        text: 'Progress',
        icon: ProgressIcon,
        path: '/progress',
        permission: 'progress_report'
      });
    }

    // Reports
    if (hasPermission('reports')) {
      items.push({
        text: 'Reports',
        icon: ReportIcon,
        path: '/reports',
        permission: 'reports'
      });
    }

    return items;
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Header */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white' }}>
          Daily Report
        </Typography>
        <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
          Management System
        </Typography>
      </Box>

      <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />

      {/* User Profile Section */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.2)', 
              color: 'white',
              mr: 2 
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>
              {user?.name || 'User'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              {user?.employeeId || 'N/A'}
            </Typography>
          </Box>
        </Box>
        <Chip
          label={user?.role?.toUpperCase() || 'USER'}
          size="small"
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            fontWeight: 600
          }}
        />
      </Box>

      <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />

      {/* Navigation Items */}
      <List sx={{ flexGrow: 1, px: 1, py: 2 }}>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path ||
                          (item.path !== '/' && location.pathname.startsWith(item.path));

          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  backgroundColor: isActive 
                    ? 'rgba(255, 255, 255, 0.15)' 
                    : 'transparent',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  py: 1.5
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                  <Icon />
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '0.95rem',
                      fontWeight: isActive ? 600 : 400
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />

      {/* Bottom Section */}
      <List sx={{ px: 1, pb: 2 }}>
        {/* Profile Settings */}
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            onClick={() => handleNavigation('/profile')}
            sx={{
              borderRadius: 2,
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
              <ProfileIcon />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItemButton>
        </ListItem>

        {/* User Management (Admin only) */}
        {hasPermission('user_management') && (
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleNavigation('/users')}
              sx={{
                borderRadius: 2,
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                <AdminIcon />
              </ListItemIcon>
              <ListItemText primary="Users" />
            </ListItemButton>
          </ListItem>
        )}

        {/* Logout */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};

export default Sidebar;
