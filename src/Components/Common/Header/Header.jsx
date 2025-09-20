// src/components/common/Header/Header.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Breadcrumbs,
  Link,
  Box,
} from '@mui/material';
import {
  Menu as MenuIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { routeConfig, getFlatRoutes } from '../../../routes';

const Header = ({ onMenuClick, sidebarOpen }) => {
  const location = useLocation();
  const flatRoutes = getFlatRoutes();
  
  // Find current page title
  const currentRoute = flatRoutes.find(route => route.path === location.pathname);
  const pageTitle = currentRoute?.title || 'Dashboard';

  // Generate breadcrumbs
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ title: 'Home', path: '/' }];

    let currentPath = '';
    pathSegments.forEach(segment => {
      currentPath += `/${segment}`;
      const route = flatRoutes.find(r => r.path === currentPath);
      if (route) {
        breadcrumbs.push({ title: route.title, path: currentPath });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="toggle drawer"
          onClick={onMenuClick}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" noWrap component="div">
            {pageTitle}
          </Typography>
          
          {breadcrumbs.length > 1 && (
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" />}
              sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}
            >
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return isLast ? (
                  <Typography
                    key={crumb.path}
                    color="inherit"
                    sx={{ fontSize: '0.875rem' }}
                  >
                    {crumb.title}
                  </Typography>
                ) : (
                  <Link
                    key={crumb.path}
                    color="inherit"
                    href={crumb.path}
                    sx={{ fontSize: '0.875rem' }}
                  >
                    {crumb.title}
                  </Link>
                );
              })}
            </Breadcrumbs>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
