// src/Pages/Admin/AdminDashboard.jsx - Complete Admin Dashboard System
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
  Menu,
  MenuItem
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  Business as ProjectsIcon,
  People as PeopleIcon,
  Inventory as MaterialIcon,
  Build as ToolIcon,
  Settings as SettingsIcon,
  AdminPanelSettings as AdminIcon,
  Assessment as ReportsIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Add as AddIcon,
  List as ListIcon
} from '@mui/icons-material';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import InventoryIcon from '@mui/icons-material/Inventory';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useProject } from '../../contexts/ProjectContext';

// Import Admin page components
import AdminHome from './AdminHome/AdminHome';
import AdminSettings from './Settings/AdminSettings';

// Import existing admin components
const Project = React.lazy(() => import('../Project'));
const AddEmployee = React.lazy(() => import('../AddEmployee/AddEmployee'));
const EmployeeList = React.lazy(() => import('../EmployeeList/EmployeeList'));
const ProjectCreation = React.lazy(() => import('../ProjectCreation/ProjectCreation'));
const MaterialRequests = React.lazy(() => import('../MaterialRequests/MaterialRequests'));
const ToolRequests = React.lazy(() => import('../ToolRequests/ToolRequests'));
const MaterialToolHub = React.lazy(() => import('../MaterialToolHub/MaterialToolHub'));

const drawerWidth = 280;

// Admin navigation configuration
const adminNavigation = [
  {
    path: '/admin',
    title: 'Dashboard',
    icon: DashboardIcon,
    component: AdminHome,
    exact: true
  },
  {
    path: '/admin/projects',
    title: 'Projects',
    icon: ProjectsIcon,
    children: [
      {
        path: '/admin/projects/list',
        title: 'Project List',
        icon: ListIcon,
        component: Project
      },
      {
        path: '/admin/projects/create',
        title: 'Create Project',
        icon: AddIcon,
        component: ProjectCreation
      }
    ]
  },
  {
    path: '/admin/employees',
    title: 'Employee Management',
    icon: PeopleIcon,
    children: [
      {
        path: '/admin/employees/add',
        title: 'Add Employee',
        icon: PersonIcon,
        component: AddEmployee
      },
      {
        path: '/admin/employees/list',
        title: 'Employee List',
        icon: GroupIcon,
        component: EmployeeList
      }
    ]
  },
  {
    path: '/admin/material-requests',
    title: 'Material Requests',
    icon: MaterialIcon,
    component: MaterialRequests
  },
  {
    path: '/admin/tool-requests',
    title: 'Tool Requests',
    icon: BuildCircleIcon,
    component: ToolRequests
  },
  {
    path: '/admin/material-tool-hub',
    title: 'Material & Tool Hub',
    icon: InventoryIcon,
    component: MaterialToolHub
  },
  {
    path: '/admin/settings',
    title: 'Settings',
    icon: SettingsIcon,
    component: AdminSettings
  }
];

// Get flat routes for rendering
const getFlatRoutes = (routes = adminNavigation) => {
  const flatRoutes = [];
  
  routes.forEach(route => {
    if (route.component) {
      flatRoutes.push(route);
    }
    if (route.children) {
      flatRoutes.push(...getFlatRoutes(route.children));
    }
  });
  
  return flatRoutes;
};

const AdminDashboard = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [adminStats, setAdminStats] = useState({});
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { projects } = useProject();

  useEffect(() => {
    calculateAdminStats();
  }, [projects]);

  const calculateAdminStats = () => {
    // Calculate admin-specific statistics
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'Active').length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;

    // Calculate pending approvals
    const allRequests = getAllRequests();
    const pendingMaterialRequests = allRequests.filter(r => r.type === 'Material' && r.status === 'Pending').length;
    const pendingToolRequests = allRequests.filter(r => r.type === 'Tool' && r.status === 'Pending').length;
    const totalPendingApprovals = pendingMaterialRequests + pendingToolRequests;

    // Calculate supervisor confirmations needed
    const pendingSupervisorConfirmations = projects.reduce((count, project) => {
      return count + (project.supervisors?.filter(s => s.needsConfirmation).length || 0);
    }, 0);

    setAdminStats({
      totalProjects,
      activeProjects,
      completedProjects,
      pendingMaterialRequests,
      pendingToolRequests,
      totalPendingApprovals,
      pendingSupervisorConfirmations,
      totalSupervisors: new Set(projects.flatMap(p => p.supervisors?.map(s => s.employeeId) || [])).size
    });
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

  // Admin profile data
  const adminData = user ? {
    name: user.name || 'Admin User',
    id: user.id || 'ADM001',
    email: user.email || 'admin@company.com',
    role: 'Administrator',
    avatar: user.avatar || null,
    lastLogin: new Date().toLocaleString(),
    permissions: ['Project Management', 'User Management', 'Resource Approval']
  } : {};

  const renderNavigationItems = (navItems, level = 0) => {
    return navItems.map((navItem) => {
      const IconComponent = navItem.icon;
      const isActive = location.pathname === navItem.path || 
        (navItem.path === '/admin' && location.pathname === '/admin/');
      
      if (navItem.children) {
        return (
          <Box key={navItem.path}>
            <ListItem sx={{ px: 2, py: 1 }}>
              <ListItemIcon sx={{ color: 'primary.main', minWidth: 36 }}>
                <IconComponent />
              </ListItemIcon>
              <ListItemText 
                primary={navItem.title}
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'text.secondary'
                }}
              />
            </ListItem>
            {renderNavigationItems(navItem.children, level + 1)}
          </Box>
        );
      }

      return (
        <ListItem key={navItem.path} disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            component={Link}
            to={navItem.path}
            onClick={() => isMobile && setMobileOpen(false)}
            sx={{
              borderRadius: 2,
              mx: level > 0 ? 3 : 1,
              backgroundColor: isActive ? 'primary.main' : 'transparent',
              color: isActive ? 'white' : 'inherit',
              '&:hover': {
                backgroundColor: isActive ? 'primary.dark' : 'rgba(25, 118, 210, 0.08)'
              },
              py: 1.2,
              pl: level > 0 ? 3 : 2
            }}
          >
            <ListItemIcon sx={{ 
              color: isActive ? 'white' : 'primary.main', 
              minWidth: 36 
            }}>
              <IconComponent />
            </ListItemIcon>
            <ListItemText 
              primary={navItem.title}
              primaryTypographyProps={{
                fontSize: '0.9rem',
                fontWeight: isActive ? 600 : 500
              }}
            />
          </ListItemButton>
        </ListItem>
      );
    });
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Admin Profile Section */}
      <Box sx={{ p: 3, backgroundColor: 'primary.main', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ 
            width: 56, 
            height: 56, 
            mr: 2, 
            backgroundColor: 'white', 
            color: 'primary.main',
            fontSize: '1.5rem',
            fontWeight: 700
          }}>
            {adminData.name ? adminData.name.charAt(0).toUpperCase() : 'A'}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {adminData.name}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {adminData.role}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              ID: {adminData.id}
            </Typography>
          </Box>
        </Box>

        {/* Admin Overview Cards */}
        <Paper elevation={0} sx={{ 
          p: 2, 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          borderRadius: 2,
          backdropFilter: 'blur(10px)'
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Admin Overview
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" fontWeight={600}>
                {adminStats.totalProjects || 0}
              </Typography>
              <Typography variant="caption">Projects</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" fontWeight={600}>
                {adminStats.activeProjects || 0}
              </Typography>
              <Typography variant="caption">Active</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" fontWeight={600}>
                {adminStats.totalSupervisors || 0}
              </Typography>
              <Typography variant="caption">Supervisors</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" fontWeight={600} color="warning.light">
                {adminStats.totalPendingApprovals || 0}
              </Typography>
              <Typography variant="caption">Approvals</Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, p: 1 }}>
        <List>
          {renderNavigationItems(adminNavigation)}
        </List>
      </Box>

      {/* Status & Actions */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          <Chip 
            label="Administrator" 
            color="primary" 
            size="small" 
            icon={<AdminIcon />}
            sx={{ alignSelf: 'flex-start' }} 
          />
          <Chip 
            label="Project Manager"
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
              <ListItemIcon sx={{ color: '#f44336', minWidth: 36 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Logout"
                primaryTypographyProps={{ 
                  fontSize: '0.9rem',
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
          Admin Portal v1.0
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
              Admin Dashboard
            </Typography>
            <IconButton
              color="inherit"
              onClick={handleUserMenuOpen}
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {adminData.name?.charAt(0) || 'A'}
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
          {getFlatRoutes().map((navItem) => (
            <Route
              key={navItem.path}
              path={navItem.path.replace('/admin', '') || '/'}
              element={<navItem.component />}
              exact={navItem.exact}
            />
          ))}
          {/* Default route */}
          <Route path="*" element={<AdminHome />} />
        </Routes>
      </Box>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
      >
        <MenuItem onClick={() => navigate('/admin/settings')}>
          Settings
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AdminDashboard;