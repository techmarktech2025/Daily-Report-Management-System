// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

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

  useEffect(() => {
    // Check if user is logged in on app load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      // Simulate API call - replace with your actual API
      const response = await mockLogin(credentials);
      
      if (response.success) {
        const userData = response.user;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userToken', response.token);
        return { success: true, user: userData };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userToken');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Mock login function - replace with your actual API call
const mockLogin = async (credentials) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock users database
  const mockUsers = [
    {
      id: 1,
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      name: 'Admin User',
      email: 'admin@company.com',
      permissions: ['all']
    },
    {
      id: 2,
      username: 'supervisor1',
      password: 'super123',
      role: 'supervisor',
      name: 'Rajesh Kumar',
      employeeId: 'SUP001',
      email: 'rajesh@company.com',
      assignedProjects: [
        {
          id: 'PROJ-001',
          name: 'Project Alpha',
          location: 'Mumbai Site-1',
          startDate: '2025-01-15'
        }
      ]
    },
    {
      id: 3,
      username: 'supervisor2', 
      password: 'super123',
      role: 'supervisor',
      name: 'Priya Sharma',
      employeeId: 'SUP002',
      email: 'priya@company.com',
      assignedProjects: [
        {
          id: 'PROJ-002',
          name: 'Project Beta',
          location: 'Delhi Site-2',
          startDate: '2025-02-01'
        }
      ]
    }
  ];

  const user = mockUsers.find(u => 
    u.username === credentials.username && u.password === credentials.password
  );

  if (user) {
    const { password, ...userWithoutPassword } = user;
    return {
      success: true,
      user: userWithoutPassword,
      token: 'mock-jwt-token-' + user.id
    };
  } else {
    return {
      success: false,
      error: 'Invalid username or password'
    };
  }
};
