// src/contexts/AuthContext.jsx - Complete Fixed Version with Debug
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
    console.log('AuthProvider: Initializing...'); // Debug
    
    // Check if user is logged in on app load
    const storedUser = localStorage.getItem('user');
    
    console.log('AuthProvider: Stored user:', storedUser); // Debug
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('AuthProvider: Parsed user:', parsedUser); // Debug
        setUser(parsedUser);
      } catch (error) {
        console.error('AuthProvider: Error parsing stored user:', error); // Debug
        localStorage.removeItem('user'); // Clean up invalid data
      }
    }
    
    setLoading(false);
    console.log('AuthProvider: Initialization complete'); // Debug
  }, []);

  const login = async (credentials) => {
    console.log('AuthProvider: Login attempt with credentials:', credentials); // Debug
    
    try {
      // Simulate API call - replace with your actual API
      const response = await mockLogin(credentials);
      
      console.log('AuthProvider: Login response:', response); // Debug
      
      if (response.success) {
        const userData = response.user;
        console.log('AuthProvider: Setting user data:', userData); // Debug
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userToken', response.token);
        
        console.log('AuthProvider: Login successful, user stored'); // Debug
        return { success: true, user: userData };
      } else {
        console.log('AuthProvider: Login failed:', response.error); // Debug
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('AuthProvider: Login error:', error); // Debug
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const logout = () => {
    console.log('AuthProvider: Logging out user'); // Debug
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userToken');
  };

  console.log('AuthProvider: Current user state:', user); // Debug

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Mock login function - replace with your actual API call
const mockLogin = async (credentials) => {
  console.log('mockLogin: Called with credentials:', credentials); // Debug
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock users database with SuperAdmin
  const mockUsers = [
    {
      id: 0,
      username: 'superadmin',
      password: 'super123',
      role: 'superadmin',
      name: 'Super Administrator',
      email: 'superadmin@techmark.tech',
      permissions: ['all_projects', 'user_management', 'system_config', 'analytics', 'reports']
    },
    {
      id: 1,
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      name: 'Admin User',
      email: 'admin@company.com',
      permissions: ['project_management', 'user_management']
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

  console.log('mockLogin: Available users:', mockUsers.map(u => ({ username: u.username, role: u.role }))); // Debug

  const user = mockUsers.find(u => 
    u.username === credentials.username && u.password === credentials.password
  );

  console.log('mockLogin: Found user:', user ? { username: user.username, role: user.role } : 'None'); // Debug

  if (user) {
    const { password, ...userWithoutPassword } = user;
    const result = {
      success: true,
      user: userWithoutPassword,
      token: 'mock-jwt-token-' + user.id
    };
    
    console.log('mockLogin: Returning success result:', result); // Debug
    return result;
  } else {
    const result = {
      success: false,
      error: 'Invalid username or password'
    };
    
    console.log('mockLogin: Returning error result:', result); // Debug
    return result;
  }
};