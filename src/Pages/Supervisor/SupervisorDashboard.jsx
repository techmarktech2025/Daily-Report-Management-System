// src/Pages/Supervisor/SupervisorDashboard.jsx
import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useTheme,
  useMediaQuery,
  Avatar,
  Divider,
  Paper,
  Chip,
  Button
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  CalendarToday as DateIcon,
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
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Import supervisor page components
import SupervisorHome from './SupervisorHome/SupervisorHome';
import Attendance from './Attendance/Attendance';
import ScopeOfWork from './ScopeOfWork/ScopeOfWork';
import WorkProgress from './WorkProgress/WorkProgress';
import WorkEstimate from './WorkEstimate/WorkEstimate';
import MaterialToolRequest from './MaterialToolRequest/MaterialToolRequest';
import Employees from './Employees/Employees';
import Inward from './Inward/Inward';
import Outward from './Outward/Outward';

const drawerWidth = 300;

// Supervisor navigation configuration
const supervisorNavigation = [
  {
    path: '/supervisor',
    title: 'Home',
    icon: HomeIcon,
    component: SupervisorHome,
    exact: true
  },
  {
    path: '/supervisor/attendance',
    title: 'Attendance',
    icon: AttendanceIcon,
    component: Attendance
  },
  {
    path: '/supervisor/scope-of-work',
    title: 'Scope of Work',
    icon: ScopeIcon,
    component: ScopeOfWork
  },
  {
    path: '/supervisor/work-progress',
    title: 'Work in progress',
    icon: WorkProgressIcon,
    component: WorkProgress
  },
  {
    path: '/supervisor/work-estimate',
    title: 'Work Estimate',
    icon: EstimateIcon,
    component: WorkEstimate
  },
  {
    path: '/supervisor/material-tool-request',
    title: 'Material & Tool Request',
    icon: MaterialToolIcon,
    component: MaterialToolRequest
  },
  {
    path: '/supervisor/employees',
    title: 'Employees',
    icon: EmployeesIcon,
    component: Employees
  },
  {
    path: '/supervisor/inward',
    title: 'Inward',
    icon: InwardIcon,
    component: Inward
  },
  {
    path: '/supervisor/outward',
    title: 'Outward',
    icon: OutwardIcon,
    component: Outward
  }
];

const SupervisorDashboard = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const { user, logout } = useAuth();

  // Get supervisor data from authenticated user
  const supervisorData = user ? {
    name: user.name,
    id: user.employeeId,
    email: user.email,
    project: user.assignedProjects?.[0]?.name || 'No Project Assigned',
    location: user.assignedProjects?.[0]?.location || 'Location Not Set',
    startDate: user.assignedProjects?.[0]?.startDate || '',
    avatar: user.avatar || null
  } : {};

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      window.location.href = '/login';
    }
  };

  const drawer = (
    <Box>
      {/* Supervisor Profile Section */}
      <Box sx={{ p: 3, backgroundColor: '#1976d2', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            sx={{ 
              width: 60, 
              height: 60, 
              mr: 2, 
              backgroundColor: 'white', 
              color: '#1976d2',
              fontSize: '1.5rem',
              fontWeight: 600
            }}
          >
            {supervisorData.name ? supervisorData.name.charAt(0).toUpperCase() : 'S'}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, lineHeight: 1.2 }}>
              {supervisorData.name}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.85rem' }}>
              ID: {supervisorData.id}
            </Typography>
          </Box>
        </Box>

        {/* Project Information */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            borderRadius: 2,
            backdropFilter: 'blur(10px)'
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, fontSize: '0.9rem' }}>
            Current Project
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, fontSize: '1rem' }}>
            {supervisorData.project}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationIcon sx={{ fontSize: 16, mr: 1, opacity: 0.8 }} />
            <Typography variant="body2" sx={{ fontSize: '0.8rem', opacity: 0.9 }}>
              {supervisorData.location}
            </Typography>
          </Box>
          
          {supervisorData.startDate && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DateIcon sx={{ fontSize: 16, mr: 1, opacity: 0.8 }} />
              <Typography variant="body2" sx={{ fontSize: '0.8rem', opacity: 0.9 }}>
                Started: {new Date(supervisorData.startDate).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <List sx={{ pt: 2, px: 1 }}>
        {supervisorNavigation.map((navItem) => {
          const IconComponent = navItem.icon;
          const isActive = location.pathname === navItem.path || 
                          (navItem.path === '/supervisor' && location.pathname === '/supervisor/');
          
          return (
            <ListItem key={navItem.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to={navItem.path}
                onClick={() => isMobile && setMobileOpen(false)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  backgroundColor: isActive ? '#1976d2' : 'transparent',
                  color: isActive ? 'white' : 'inherit',
                  '&:hover': {
                    backgroundColor: isActive ? '#1565c0' : 'rgba(25, 118, 210, 0.08)'
                  },
                  py: 1.2
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: isActive ? 'white' : '#1976d2', 
                    minWidth: 40 
                  }}
                >
                  <IconComponent />
                </ListItemIcon>
                <ListItemText 
                  primary={navItem.title}
                  primaryTypographyProps={{
                    fontSize: '0.95rem',
                    fontWeight: isActive ? 600 : 500
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Status Chips */}
      <Box sx={{ px: 2, py: 1 }}>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Chip 
            label="Online" 
            color="success" 
            size="small" 
            sx={{ alignSelf: 'flex-start' }} 
          />
          <Chip 
            label={`Project: ${supervisorData.project ? 'Active' : 'Inactive'}`}
            color={supervisorData.project !== 'No Project Assigned' ? 'primary' : 'default'}
            size="small" 
            sx={{ alignSelf: 'flex-start' }} 
          />
        </Box>
      </Box>

      <Divider sx={{ mt: 2 }} />

      {/* Logout Button */}
      <List sx={{ px: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              mx: 1,
              my: 1,
              color: '#f44336',
              '&:hover': {
                backgroundColor: 'rgba(244, 67, 54, 0.08)'
              }
            }}
          >
            <ListItemIcon sx={{ color: '#f44336', minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Logout"
              primaryTypographyProps={{ 
                fontSize: '0.95rem',
                fontWeight: 500 
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>

      {/* Footer */}
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          Daily Report System v1.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile App Bar */}
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
            display: { sm: 'none' }
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              Supervisor Dashboard
            </Typography>
            <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid #e0e0e0',
              display: 'flex',
              flexDirection: 'column'
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
          pt: { xs: 8, sm: 0 }
        }}
      >
        <Routes>
          {supervisorNavigation.map((navItem) => (
            <Route
              key={navItem.path}
              path={navItem.path.replace('/supervisor', '') || '/'}
              element={<navItem.component />}
              exact={navItem.exact}
            />
          ))}
          {/* Default route */}
          <Route path="/" element={<SupervisorHome />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default SupervisorDashboard;
