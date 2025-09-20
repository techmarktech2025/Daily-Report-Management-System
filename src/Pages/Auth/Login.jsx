// src/Pages/Auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { Login as LoginIcon, Business as CompanyIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    if (error) setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(credentials);
    
    if (result.success) {
      // Route based on user role
      if (result.user.role === 'admin') {
        navigate('/admin');
      } else if (result.user.role === 'supervisor') {
        navigate('/supervisor');
      }
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  // Quick login buttons for testing
  const quickLogin = (type) => {
    if (type === 'admin') {
      setCredentials({ username: 'admin', password: 'admin123' });
    } else {
      setCredentials({ username: 'supervisor1', password: 'super123' });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center',
      py: 4
    }}>
      <Paper elevation={8} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
        
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CompanyIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
            Daily Report System
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sign in to your account
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            required
            variant="outlined"
            sx={{ mb: 3 }}
            disabled={loading}
          />
          
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={credentials.password}
            onChange={handleChange}
            required
            variant="outlined"
            sx={{ mb: 3 }}
            disabled={loading}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
            disabled={loading}
            sx={{ 
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              textTransform: 'none',
              mb: 3
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {/* Quick Login for Testing */}
        <Divider sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Quick Login (For Testing)
          </Typography>
        </Divider>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => quickLogin('admin')}
            disabled={loading}
          >
            Login as Admin
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => quickLogin('supervisor')}
            disabled={loading}
          >
            Login as Supervisor
          </Button>
        </Box>

        {/* Test Credentials */}
        <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="caption" display="block" gutterBottom>
            <strong>Test Credentials:</strong>
          </Typography>
          <Typography variant="caption" display="block">
            Admin: admin / admin123
          </Typography>
          <Typography variant="caption" display="block">
            Supervisor: supervisor1 / super123
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
