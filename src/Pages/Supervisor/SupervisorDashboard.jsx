// src/Pages/Supervisor/SupervisorDashboardUpdated.jsx
import React, { useState, useEffect } from 'react';
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
  Button,
  Alert
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
  Home as HomeIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useProject } from '../../contexts/ProjectContext';

// Import supervisor components
import SupervisorHome from './SupervisorHome/SupervisorHome';
import SupervisorConfirmation from './SupervisorConfirmation/SupervisorConfirmation';
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
    title: 'Work in Progress',
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
    component: MaterialToolRequest // Use updated component
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
  const [authorizationStatus, setAuthorizationStatus] = useState('checking');
  const [project, setProject] = useState(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const { user, logout } = useAuth();
  const { getProjectBySupervisor, needsConfirmation } = useProject();

  useEffect(() => {
    checkAuthorizationStatus();
  }, [user]);

  const checkAuthorizationStatus = async () => {
    if (user && user.employeeId) {
      const userProject = getProjectBySupervisor(user.employeeId);
      
      if (userProject) {
        setProject(userProject);
        
        // Check if supervisor needs confirmation
        const needsAuth = needsConfirmation(userProject.id, user.employeeId);
        setAuthorizationStatus(needsAuth ? 'needs_confirmation' : 'authorized');
      } else {
        setAuthorizationStatus('no_project');
      }
    } else {
      setAuthorizationStatus('no_user');
    }
  };

  const handleConfirmationComplete = () => {
    setAuthorizationStatus('authorized');
  };

  // Get supervisor data from authenticated user and project
  const supervisorData = user && project ? {
    name: user.name,
    id: user.employeeId,
    email: user.email,
    project: project.projectName || 'No Project Assigned',
    location: project.location || 'Location Not Set',
    startDate: project.createdAt ? new Date(project.createdAt).toLocaleDateString() : '',
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

  // Show confirmation screen if needed
  if (authorizationStatus === 'needs_confirmation') {
    return <SupervisorConfirmation onConfirmationComplete={handleConfirmationComplete} />;
  }

  // Show loading state
  if (authorizationStatus === 'checking') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Checking authorization...</Typography>
      </Box>
    );
  }

  // Show error states
  if (authorizationStatus === 'no_project') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <Typography variant="h6">No Project Assigned</Typography>
          <Typography>You are not currently assigned to any project. Please contact your administrator.</Typography>
        </Alert>
      </Box>
    );
  }

  if (authorizationStatus === 'no_user') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <Typography variant="h6">Authentication Required</Typography>
          <Typography>Please log in to access the supervisor dashboard.</Typography>
        </Alert>
      </Box>
    );
  }

  const drawer = (
    <Box>
      {/* Supervisor Profile Section */}
      <Paper sx={{ m: 2, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            {supervisorData.name ? supervisorData.name.charAt(0).toUpperCase() : 'S'}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              {supervisorData.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {supervisorData.id}
            </Typography>
          </Box>
        </Box>

        {/* Project Information */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="primary">
            Current Project
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {supervisorData.project}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <LocationIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {supervisorData.location}
            </Typography>
          </Box>

          {supervisorData.startDate && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <DateIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                Started: {supervisorData.startDate}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      <Divider />

      {/* Navigation Menu */}
      <List sx={{ px: 1 }}>
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
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  <IconComponent />
                </ListItemIcon>
                <ListItemText primary={navItem.title} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Status Chips */}
      <Box sx={{ px: 3, py: 2 }}>
        <Chip 
          label="Authorized" 
          color="success" 
          size="small" 
          sx={{ mr: 1, mb: 1 }}
        />
        <Chip 
          label="Active Project" 
          color="info" 
          size="small" 
          sx={{ mb: 1 }}
        />
      </Box>

      <Divider />

      {/* Logout Button */}
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Daily Report System v1.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Mobile App Bar */}
      {isMobile && (
        <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              Supervisor Dashboard
            </Typography>
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
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
              mt: isMobile ? 7 : 0
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${drawerWidth}px)` }, mt: isMobile ? 7 : 0 }}>
        <Routes>
          {supervisorNavigation.map((navItem) => (
            <Route
              key={navItem.path}
              path={navItem.path.replace('/supervisor', '')}
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