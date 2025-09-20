// src/Components/Common/ResponsiveSidebar/ResponsiveSidebar.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { routeConfig } from '../../../routes';

const DRAWER_WIDTH = 240;

const NavItem = ({ 
  route, 
  onItemClick, 
  nested = false, 
  expandedItems,
  onToggleExpand 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = location.pathname === route.path;
  const hasChildren = route.children && route.children.length > 0;
  const isExpanded = expandedItems[route.path];

  const handleClick = () => {
    if (hasChildren) {
      onToggleExpand(route.path);
    } else if (route.component) {
      navigate(route.path);  // Navigate to the exact path
      onItemClick();
    }
  };

  return (
    <>
      <ListItem disablePadding sx={{ pl: nested ? 2 : 0 }}>
        <ListItemButton
          onClick={handleClick}
          selected={isActive}
          sx={{
            minHeight: 48,
            borderRadius: 1,
            mx: 1,
            mb: 0.5,
            '&.Mui-selected': {
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            },
          }}
        >
          {route.icon && (
            <ListItemIcon sx={{ color: isActive ? 'white' : 'inherit' }}>
              <route.icon />
            </ListItemIcon>
          )}
          <ListItemText primary={route.title} />
          {hasChildren && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
      </ListItem>

      {/* Render children if expanded */}
      {hasChildren && (
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {route.children
              .filter(child => child.showInNav !== false)
              .map((child) => (
                <NavItem
                  key={child.path}
                  route={child}
                  onItemClick={onItemClick}
                  nested={true}
                  expandedItems={expandedItems}
                  onToggleExpand={onToggleExpand}
                />
              ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

const ResponsiveSidebar = ({ open, onClose, onItemClick }) => {
  const [expandedItems, setExpandedItems] = useState({});
  const location = useLocation();
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));

  // Auto-expand parent items based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    const newExpandedItems = {};

    // Auto-expand Employee Management if we're on employee pages
    if (currentPath.startsWith('/employees')) {
      newExpandedItems['/employees'] = true;
    }

    setExpandedItems(newExpandedItems);
  }, [location.pathname]);

  const handleToggleExpand = (path) => {
    setExpandedItems(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Title */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" noWrap component="div" fontWeight="bold">
          Project Management
        </Typography>
      </Box>

      {/* Navigation Items */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        <List>
          {routeConfig
            .filter(route => route.showInNav !== false)
            .map((route) => (
              <NavItem
                key={route.path}
                route={route}
                onItemClick={onItemClick}
                expandedItems={expandedItems}
                onToggleExpand={handleToggleExpand}
              />
            ))}
        </List>
      </Box>

      <Divider />
      
      {/* Footer */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="textSecondary">
          Version 1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="persistent"
        open={isLargeScreen && open}
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            position: 'fixed',
            height: '100vh',
            top: 64,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default ResponsiveSidebar;
