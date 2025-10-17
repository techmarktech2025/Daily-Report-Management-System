import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('checking');

  // Initialize authentication on app load
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Test API connection
      await apiService.utils.healthCheck();
      setConnectionStatus('connected');
      
      const token = localStorage.getItem('userToken');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          // Verify token with backend
          const response = await apiService.auth.me();
          if (response.data.success) {
            setUser(response.data.data);
            console.log('✅ User authenticated via API:', response.data.data);
          }
        } catch (error) {
          console.error('❌ Token verification failed:', error);
          localStorage.removeItem('userToken');
          localStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.error('❌ API connection failed:', error);
      setConnectionStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      const response = await apiService.auth.login(credentials);
      
      if (response.data.success) {
        const { user: userData, token, refreshToken } = response.data;
        
        setUser(userData);
        localStorage.setItem('userToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        
        toast.success(`Welcome back, ${userData.name}!`);
        return { success: true, user: userData };
      }
    } catch (error) {
      const errorMessage = error.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      const response = await apiService.auth.register(userData);
      
      if (response.data.success) {
        const { user: newUser, token, refreshToken } = response.data;
        
        setUser(newUser);
        localStorage.setItem('userToken', token);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        
        toast.success('Registration successful!');
        return { success: true, user: newUser };
      }
    } catch (error) {
      const errorMessage = error.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiService.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('userToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      toast.success('Logged out successfully');
    }
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    try {
      const response = await apiService.auth.updateProfile(profileData);
      
      if (response.data.success) {
        const updatedUser = { ...user, ...response.data.data };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success('Profile updated successfully');
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to update profile';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [user]);

  const changePassword = useCallback(async (passwordData) => {
    try {
      const response = await apiService.auth.changePassword(passwordData);
      
      if (response.data.success) {
        toast.success('Password changed successfully');
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to change password';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiService.auth.refreshToken(refreshToken);
      
      if (response.data.success) {
        const { token, refreshToken: newRefreshToken } = response.data;
        
        localStorage.setItem('userToken', token);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }
        
        return { success: true };
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return { success: false };
    }
  }, [logout]);

  // Helper functions
  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    if (user.role === 'superadmin') return true;
    return user.permissions && user.permissions.includes(permission);
  }, [user]);

  const hasRole = useCallback((roles) => {
    if (!user) return false;
    return Array.isArray(roles) ? roles.includes(user.role) : user.role === roles;
  }, [user]);

  const canAccessProject = useCallback((projectId) => {
    if (!user) return false;
    if (['superadmin', 'admin'].includes(user.role)) return true;
    
    // Additional logic for supervisor project access
    // This would depend on your project assignment logic
    return false;
  }, [user]);

  const value = {
    user,
    loading,
    connectionStatus,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshToken,
    hasPermission,
    hasRole,
    canAccessProject,
    
    // Computed values
    isAuthenticated: !!user,
    isSuperAdmin: user?.role === 'superadmin',
    isAdmin: ['superadmin', 'admin'].includes(user?.role),
    isSupervisor: user?.role === 'supervisor',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
