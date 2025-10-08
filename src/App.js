// src/App.js - Updated with Complete Admin Dashboard
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, CircularProgress, Box } from '@mui/material';

// Import contexts
import { AuthProvider } from './contexts/AuthContext';
import { ProjectProvider } from './contexts/ProjectContext';

// Import components
import Login from './Pages/Auth/Login';
import ProtectedRoute from './Components/Common/ProtectedRoute';
import Layout from './Components/Common/Layout/Layout';

// Import dashboard components
import SupervisorDashboard from './Pages/Supervisor/SupervisorDashboard';
import SuperAdminDashboard from './Pages/SuperAdmin/SuperAdminDashboard';
import AdminDashboard from './Pages/Admin/AdminDashboard';  // NEW: Complete Admin Dashboard

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Loading component
const LoadingFallback = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
  >
    <CircularProgress />
  </Box>
);

// Component to handle role-based redirects
const RoleBasedRedirect = () => {
  const storedUser = localStorage.getItem('user');
  
  console.log('RoleBasedRedirect: Checking stored user...', storedUser); // Debug

  if (!storedUser) {
    console.log('RoleBasedRedirect: No user found, redirecting to login'); // Debug
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(storedUser);
    console.log('RoleBasedRedirect: Parsed user:', user); // Debug
    
    switch (user.role) {
      case 'superadmin':
        console.log('RoleBasedRedirect: Redirecting to /superadmin'); // Debug
        return <Navigate to="/superadmin" replace />;
      case 'admin':
        console.log('RoleBasedRedirect: Redirecting to /admin'); // Debug
        return <Navigate to="/admin" replace />;
      case 'supervisor':
        console.log('RoleBasedRedirect: Redirecting to /supervisor'); // Debug
        return <Navigate to="/supervisor" replace />;
      default:
        console.log('RoleBasedRedirect: Unknown role, redirecting to login'); // Debug
        return <Navigate to="/login" replace />;
    }
  } catch (error) {
    console.error('RoleBasedRedirect: Error parsing user data:', error); // Debug
    // If there's an error parsing user data, redirect to login
    return <Navigate to="/login" replace />;
  }
};

function App() {
  console.log('App: Rendering App component'); // Debug

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <ProjectProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Router>
              <Routes>
                {/* Public Login Route */}
                <Route path="/login" element={<Login />} />

                {/* SuperAdmin Routes */}
                <Route 
                  path="/superadmin/*" 
                  element={
                    <ProtectedRoute requiredRole="superadmin">
                      <SuperAdminDashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* Admin Routes - NEW: Complete Admin Dashboard */}
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Supervisor Routes */}
                <Route 
                  path="/supervisor/*" 
                  element={
                    <ProtectedRoute requiredRole="supervisor">
                      <SupervisorDashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* Default redirect logic based on role */}
                <Route 
                  path="/" 
                  element={<RoleBasedRedirect />} 
                />

                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </Router>
          </Suspense>
        </ProjectProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;