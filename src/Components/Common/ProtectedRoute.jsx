// src/Components/Common/ProtectedRoute.jsx - Fixed for SuperAdmin
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Verifying access...
        </Typography>
      </Box>
    );
  }

  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has the required role
  if (requiredRole && user.role !== requiredRole) {
    // Redirect based on user's actual role
    switch (user.role) {
      case 'superadmin':
        return <Navigate to="/superadmin" replace />;
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'supervisor':
        return <Navigate to="/supervisor" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  // User has correct role, render the protected content
  return children;
};

export default ProtectedRoute;