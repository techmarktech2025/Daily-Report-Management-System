import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  AccountCircle,
  Logout,
} from '@mui/icons-material';

import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
    handleClose();
  };

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        backgroundColor: 'white',
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        color: 'text.primary'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Page Title */}
        <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 600 }}>
          Welcome back, {user?.name || 'User'}
        </Typography>

        {/* Right side actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Notifications */}
          <IconButton color="inherit">
            <Badge badgeContent={4} color="error">
              <NotificationsIcon sx={{ color: 'text.secondary' }} />
            </Badge>
          </IconButton>

          {/* Settings */}
          <IconButton color="inherit">
            <SettingsIcon sx={{ color: 'text.secondary' }} />
          </IconButton>

          {/* User Menu */}
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
            sx={{ p: 0.5 }}
          >
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main',
                width: 40,
                height: 40
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
          
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              sx: { mt: 1, minWidth: 200 }
            }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {user?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
              <Typography variant="caption" color="primary.main">
                {user?.role?.toUpperCase()}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleProfile}>
              <AccountCircle sx={{ mr: 2 }} />
              Profile Settings
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 2 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
