// src/Components/Common/Layout/Layout.jsx
import React, { useState } from 'react';
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
  Chip,
  Button,
  Collapse
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  ExpandLess,
  ExpandMore,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { routeConfig } from '../../../routes/index';

const drawerWidth = 300;

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  // Mock admin data - replace with actual user data
  const adminData = {
    name: 'Admin User',
    email: 'admin@company.com',
    role: 'System Administrator',
    avatar: null
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuToggle = (menuPath) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuPath]: !prev[menuPath]
    }));
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('userToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  const renderMenuItem = (route) => {
    const IconComponent = route.icon;
    const hasChildren = route.children && route.children.length > 0;
    const isOpen = openMenus[route.path];
    const isActive = !hasChildren && (location.pathname === route.path || 
                     (route.path === '/admin' && location.pathname === '/'));

    return (
      <React.Fragment key={route.path}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            component={hasChildren ? 'div' : Link}
            to={hasChildren ? undefined : route.path}
            onClick={() => {
              if (hasChildren) {
                handleMenuToggle(route.path);
              }
              if (isMobile && !hasChildren) {
                setMobileOpen(false);
              }
            }}
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
              primary={route.title}
              primaryTypographyProps={{
                fontSize: '0.95rem',
                fontWeight: isActive ? 600 : 500
              }}
            />
            {hasChildren && (isOpen ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </ListItem>

        {/* Render children if they exist */}
        {hasChildren && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {route.children.map((childRoute) => {
                const ChildIconComponent = childRoute.icon;
                const isChildActive = location.pathname === childRoute.path;

                return (
                  <ListItem key={childRoute.path} disablePadding sx={{ ml: 2 }}>
                    <ListItemButton
                      component={Link}
                      to={childRoute.path}
                      onClick={() => isMobile && setMobileOpen(false)}
                      sx={{
                        borderRadius: 2,
                        mx: 1,
                        backgroundColor: isChildActive ? '#1976d2' : 'transparent',
                        color: isChildActive ? 'white' : 'inherit',
                        '&:hover': {
                          backgroundColor: isChildActive ? '#1565c0' : 'rgba(25, 118, 210, 0.08)'
                        },
                        py: 1
                      }}
                    >
                      <ListItemIcon 
                        sx={{ 
                          color: isChildActive ? 'white' : '#1976d2', 
                          minWidth: 35 
                        }}
                      >
                        <ChildIconComponent sx={{ fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={childRoute.title}
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                          fontWeight: isChildActive ? 600 : 400
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Admin Profile Section */}
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
            <AdminIcon sx={{ fontSize: 30 }} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, lineHeight: 1.2 }}>
              {adminData.name}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.85rem' }}>
              {adminData.role}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip 
            label="Admin" 
            size="small" 
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              color: 'white',
              fontWeight: 600
            }} 
          />
          <Chip 
            label="Online" 
            size="small" 
            sx={{ 
              backgroundColor: 'rgba(76, 175, 80, 0.8)', 
              color: 'white',
              fontWeight: 600
            }} 
          />
        </Box>
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List sx={{ pt: 2, px: 1 }}>
          {routeConfig
            .filter(route => route.showInNav)
            .map(renderMenuItem)}
        </List>
      </Box>

      <Divider />

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
      <Box sx={{ p: 2 }}>
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
              Admin Dashboard
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
              borderRight: '1px solid #e0e0e0'
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
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
