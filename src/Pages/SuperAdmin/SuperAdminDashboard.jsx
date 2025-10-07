// src/Pages/SuperAdmin/SuperAdminDashboard.jsx - Updated with Settings
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
  Paper,
  Chip,
  Button,
  Menu,
  MenuItem,
  Alert
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  Business as ProjectsIcon,
  Analytics as AnalyticsIcon,
  Inventory as InventoryIcon,
  People as UsersIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendsIcon,
  Assessment as ReportsIcon,
  SupervisorAccount as SuperAdminIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useProject } from '../../contexts/ProjectContext';

// Import SuperAdmin page components
import SuperAdminHome from './SuperAdminHome/SuperAdminHome';
import ProjectsOverview from './ProjectsOverview/ProjectsOverview';
import AnalyticsDashboard from './Analytics/AnalyticsDashboard';
import InventoryOverview from './Inventory/InventoryOverview';
import UsersManagement from './Users/UsersManagement';
import ReportsCenter from './Reports/ReportsCenter';
import SuperAdminSettings from './Settings/SuperAdminSettings';

const drawerWidth = 320;

// SuperAdmin navigation configuration
const superAdminNavigation = [
  {
    path: '/superadmin',
    title: 'Dashboard Overview',
    icon: DashboardIcon,
    component: SuperAdminHome,
    exact: true
  },
  {
    path: '/superadmin/projects',
    title: 'All Projects',
    icon: ProjectsIcon,
    component: ProjectsOverview
  },
  {
    path: '/superadmin/analytics',
    title: 'Analytics & Insights',
    icon: AnalyticsIcon,
    component: AnalyticsDashboard
  },
  {
    path: '/superadmin/inventory',
    title: 'Material & Tool Inventory',
    icon: InventoryIcon,
    component: InventoryOverview
  },
  {
    path: '/superadmin/users',
    title: 'Users Management',
    icon: UsersIcon,
    component: UsersManagement
  },
  {
    path: '/superadmin/reports',
    title: 'Reports Center',
    icon: ReportsIcon,
    component: ReportsCenter
  },
  {
    path: '/superadmin/settings',
    title: 'System Settings',
    icon: SettingsIcon,
    component: SuperAdminSettings
  }
];

const SuperAdminDashboard = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [systemStats, setSystemStats] = useState({});
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { projects } = useProject();

  useEffect(() => {
    calculateSystemStats();
  }, [projects]);

  const calculateSystemStats = () => {
    const stats = {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'Active').length,
      completedProjects: projects.filter(p => p.status === 'Completed').length,
      totalSupervisors: new Set(projects.flatMap(p => p.supervisors?.map(s => s.employeeId) || [])).size,
      totalRequests: getAllRequests().length,
      pendingRequests: getAllRequests().filter(r => r.status === 'Pending').length
    };
    setSystemStats(stats);
  };

  const getAllRequests = () => {
    const allRequests = [];
    projects.forEach(project => {
      const projectRequests = localStorage.getItem(`requests_${project.id}`);
      if (projectRequests) {
        allRequests.push(...JSON.parse(projectRequests));
      }
    });
    return allRequests;
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  // SuperAdmin profile data
  const superAdminData = user ? {
    name: user.name || 'Super Admin',
    id: user.id || 'SUPER001',
    email: user.email || 'superadmin@techmark.tech',
    role: 'Super Administrator',
    avatar: user.avatar || null,
    lastLogin: new Date().toLocaleString(),
    permissions: ['Full System Access', 'All Projects', 'User Management', 'System Configuration']
  } : {};

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* SuperAdmin Profile Section */}
      <Box sx={{ p: 3, backgroundColor: 'error.main', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ 
            width: 64, 
            height: 64, 
            mr: 2, 
            backgroundColor: 'white', 
            color: '#d32f2f',
            fontSize: '1.8rem',
            fontWeight: 700
          }}>
            {superAdminData.name ? superAdminData.name.charAt(0).toUpperCase() : 'S'}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {superAdminData.name}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {superAdminData.role}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              ID: {superAdminData.id}
            </Typography>
          </Box>
        </Box>

        {/* System Overview Cards */}
        <Paper elevation={0} sx={{ 
          p: 2, 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          borderRadius: 2,
          backdropFilter: 'blur(10px)'
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            System Overview
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" fontWeight={600}>
                {systemStats.totalProjects || 0}
              </Typography>
              <Typography variant="caption">Projects</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" fontWeight={600}>
                {systemStats.activeProjects || 0}
              </Typography>
              <Typography variant="caption">Active</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" fontWeight={600}>
                {systemStats.totalSupervisors || 0}
              </Typography>
              <Typography variant="caption">Supervisors</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" fontWeight={600} color="warning.light">
                {systemStats.pendingRequests || 0}
              </Typography>
              <Typography variant="caption">Pending</Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, p: 1 }}>
        <List>
          {superAdminNavigation.map((navItem) => {
            const IconComponent = navItem.icon;
            const isActive = location.pathname === navItem.path || 
              (navItem.path === '/superadmin' && location.pathname === '/superadmin/');
            
            return (
              <ListItem key={navItem.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={Link}
                  to={navItem.path}
                  onClick={() => isMobile && setMobileOpen(false)}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    backgroundColor: isActive ? '#d32f2f' : 'transparent',
                    color: isActive ? 'white' : 'inherit',
                    '&:hover': {
                      backgroundColor: isActive ? '#c62828' : 'rgba(211, 47, 47, 0.08)'
                    },
                    py: 1.5
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: isActive ? 'white' : '#d32f2f', 
                    minWidth: 40 
                  }}>
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
      </Box>

      {/* Status & Actions */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          <Chip 
            label="System Admin" 
            color="error" 
            size="small" 
            icon={<SuperAdminIcon />}
            sx={{ alignSelf: 'flex-start' }} 
          />
          <Chip 
            label="Full Access"
            color="success"
            size="small" 
            sx={{ alignSelf: 'flex-start' }} 
          />
        </Box>

        {/* Logout Button */}
        <List>
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
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, textAlign: 'center', borderTop: '1px solid #e0e0e0' }}>
        <Typography variant="caption" color="text.secondary">
          SuperAdmin Portal v1.0
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          Techmark Systems
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
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
              SuperAdmin Dashboard
            </Typography>
            <IconButton
              color="inherit"
              onClick={handleUserMenuOpen}
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {superAdminData.name?.charAt(0) || 'S'}
              </Avatar>
            </IconButton>
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
          {superAdminNavigation.map((navItem) => (
            <Route
              key={navItem.path}
              path={navItem.path.replace('/superadmin', '') || '/'}
              element={<navItem.component />}
              exact={navItem.exact}
            />
          ))}
          {/* Default route */}
          <Route path="*" element={<SuperAdminHome />} />
        </Routes>
      </Box>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
      >
        <MenuItem onClick={() => navigate('/superadmin/settings')}>
          Settings
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default SuperAdminDashboard;