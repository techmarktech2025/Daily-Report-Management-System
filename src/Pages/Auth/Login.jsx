// src/Pages/Auth/Login.jsx - Fixed for SuperAdmin redirect
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  Login as LoginIcon,
  SupervisorAccount as SuperAdminIcon,
  AdminPanelSettings as AdminIcon,
  Person as UserIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname;
      
      // If there's a specific redirect, use it, otherwise redirect based on role
      if (from) {
        navigate(from, { replace: true });
      } else {
        redirectToRoleDashboard(user.role);
      }
    }
  }, [user, navigate, location]);

  const redirectToRoleDashboard = (role) => {
    switch (role) {
      case 'superadmin':
        navigate('/superadmin', { replace: true });
        break;
      case 'admin':
        navigate('/admin', { replace: true });
        break;
      case 'supervisor':
        navigate('/supervisor', { replace: true });
        break;
      default:
        navigate('/login', { replace: true });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', credentials); // Debug log
      
      const result = await login(credentials);
      
      console.log('Login result:', result); // Debug log

      if (result.success) {
        console.log('Login successful, user:', result.user); // Debug log
        
        // Navigate based on user role
        redirectToRoleDashboard(result.user.role);
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error); // Debug log
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (role) => {
    const credentials = {
      superadmin: { username: 'superadmin', password: 'super123' },
      admin: { username: 'admin', password: 'admin123' },
      supervisor: { username: 'supervisor1', password: 'super123' }
    };

    const creds = credentials[role];
    if (creds) {
      setCredentials(creds);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: 4,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <LoginIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Daily Report System
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Sign in to access your dashboard
            </Typography>
          </Box>

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={credentials.username}
              onChange={handleInputChange}
              margin="normal"
              required
              autoFocus
              disabled={isLoading}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={credentials.password}
              onChange={handleInputChange}
              margin="normal"
              required
              disabled={isLoading}
              sx={{ mb: 3 }}
            />

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ 
                py: 1.5, 
                mb: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                }
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Quick Login
            </Typography>
          </Divider>

          {/* Quick Login Buttons */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<SuperAdminIcon />}
              onClick={() => handleQuickLogin('superadmin')}
              disabled={isLoading}
              sx={{
                justifyContent: 'flex-start',
                color: 'error.main',
                borderColor: 'error.main',
                '&:hover': {
                  borderColor: 'error.dark',
                  backgroundColor: 'error.50'
                }
              }}
            >
              SuperAdmin (superadmin / super123)
            </Button>

            <Button
              variant="outlined"
              startIcon={<AdminIcon />}
              onClick={() => handleQuickLogin('admin')}
              disabled={isLoading}
              sx={{
                justifyContent: 'flex-start',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.50'
                }
              }}
            >
              Admin (admin / admin123)
            </Button>

            <Button
              variant="outlined"
              startIcon={<UserIcon />}
              onClick={() => handleQuickLogin('supervisor')}
              disabled={isLoading}
              sx={{
                justifyContent: 'flex-start',
                color: 'success.main',
                borderColor: 'success.main',
                '&:hover': {
                  borderColor: 'success.dark',
                  backgroundColor: 'success.50'
                }
              }}
            >
              Supervisor (supervisor1 / super123)
            </Button>
          </Box>

          {/* Footer */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Techmark Tech © 2025 - Daily Report Management System
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;