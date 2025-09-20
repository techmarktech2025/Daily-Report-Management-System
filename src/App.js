// src/App.js
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, CircularProgress, Box } from '@mui/material';

// Import contexts
import { AuthProvider } from './contexts/AuthContext';

// Import components
import Login from './Pages/Auth/Login';
import ProtectedRoute from './Components/Common/ProtectedRoute';
import Layout from './Components/Common/Layout/Layout';
import SupervisorDashboard from './Pages/Supervisor/SupervisorDashboard';
import { getFlatRoutes } from './routes/index';

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
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
    <CircularProgress />
  </Box>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public Login Route */}
              <Route path="/login" element={<Login />} />

              {/* Admin Routes */}
              <Route path="/admin/*" element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <Routes>
                      {getFlatRoutes().map((route) => (
                        <Route
                          key={route.path}
                          path={route.path.replace('/admin', '') || '/'}
                          element={<route.component />}
                        />
                      ))}
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Supervisor Routes */}
              <Route path="/supervisor/*" element={
                <ProtectedRoute requiredRole="supervisor">
                  <SupervisorDashboard />
                </ProtectedRoute>
              } />

              {/* Default redirect to login */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
