import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5050/api',
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log requests in development
    if (process.env.REACT_APP_DEBUG === 'true') {
      console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data,
        params: config.params
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle responses and errors
api.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (process.env.REACT_APP_DEBUG === 'true') {
      console.log(`📡 API Response: ${response.status}`, {
        url: response.config.url,
        data: response.data
      });
    }
    
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error);
    
    const { response, request, message } = error;
    
    if (response) {
      // Server responded with error status
      const { status, data } = response;
      
      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          toast.error('Session expired. Please login again.');
          localStorage.removeItem('userToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
          
        case 403:
          // Forbidden
          toast.error(data?.message || 'Access denied');
          break;
          
        case 404:
          // Not found
          toast.error(data?.message || 'Resource not found');
          break;
          
        case 422:
          // Validation error
          if (data?.errors) {
            const errorMessages = Array.isArray(data.errors) 
              ? data.errors.map(err => err.msg || err.message).join(', ')
              : data.message;
            toast.error(errorMessages);
          } else {
            toast.error(data?.message || 'Validation failed');
          }
          break;
          
        case 429:
          // Rate limit
          toast.error('Too many requests. Please try again later.');
          break;
          
        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors
          toast.error('Server error. Please try again later.');
          break;
          
        default:
          toast.error(data?.message || 'An error occurred');
      }
      
      return Promise.reject({
        status,
        message: data?.message || 'Request failed',
        data: data,
        originalError: error
      });
      
    } else if (request) {
      // Network error
      toast.error('Network error. Please check your connection.');
      return Promise.reject({
        status: 0,
        message: 'Network error',
        originalError: error
      });
      
    } else {
      // Request setup error
      toast.error('Request failed to send');
      return Promise.reject({
        status: -1,
        message: message || 'Request setup failed',
        originalError: error
      });
    }
  }
);

// API service class
class ApiService {
  // Authentication endpoints
  auth = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.post('/auth/logout'),
    me: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.put('/auth/change-password', data),
    refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
    getAllUsers: (params) => api.get('/auth/users', { params }),
    updateUserStatus: (id, data) => api.put(`/auth/users/${id}/status`, data),
  };

  // Project endpoints
  projects = {
    getAll: (params) => api.get('/projects', { params }),
    getById: (id) => api.get(`/projects/${id}`),
    create: (data) => api.post('/projects', data),
    update: (id, data) => api.put(`/projects/${id}`, data),
    delete: (id) => api.delete(`/projects/${id}`),
    updateStatus: (id, status) => api.put(`/projects/${id}/status`, { status }),
    getDashboard: (id) => api.get(`/projects/${id}/dashboard`),
  };

  // Employee endpoints
  employees = {
    getAll: (params) => api.get('/employees', { params }),
    getById: (id) => api.get(`/employees/${id}`),
    create: (data) => api.post('/employees', data),
    update: (id, data) => api.put(`/employees/${id}`, data),
    delete: (id) => api.delete(`/employees/${id}`),
    getByProject: (projectId) => api.get(`/employees/project/${projectId}`),
  };

  // Attendance endpoints
  attendance = {
    getAll: (params) => api.get('/attendance', { params }),
    getById: (id) => api.get(`/attendance/${id}`),
    checkIn: (data) => api.post('/attendance/check-in', data),
    checkOut: (data) => api.post('/attendance/check-out', data),
    getByEmployee: (employeeId, params) => api.get(`/attendance/employee/${employeeId}`, { params }),
    getByProject: (projectId, params) => api.get(`/attendance/project/${projectId}`, { params }),
    approve: (id) => api.put(`/attendance/${id}/approve`),
    reject: (id, data) => api.put(`/attendance/${id}/reject`, data),
  };

  // Material request endpoints
  materials = {
    getAll: (params) => api.get('/materials', { params }),
    getById: (id) => api.get(`/materials/${id}`),
    create: (data) => api.post('/materials', data),
    update: (id, data) => api.put(`/materials/${id}`, data),
    delete: (id) => api.delete(`/materials/${id}`),
    approve: (id, data) => api.put(`/materials/${id}/approve`, data),
    reject: (id, data) => api.put(`/materials/${id}/reject`, data),
    deliver: (id, data) => api.put(`/materials/${id}/deliver`, data),
  };

  // Tool request endpoints
  tools = {
    getAll: (params) => api.get('/tools', { params }),
    getById: (id) => api.get(`/tools/${id}`),
    create: (data) => api.post('/tools', data),
    update: (id, data) => api.put(`/tools/${id}`, data),
    delete: (id) => api.delete(`/tools/${id}`),
    approve: (id, data) => api.put(`/tools/${id}/approve`, data),
    reject: (id, data) => api.put(`/tools/${id}/reject`, data),
    deliver: (id, data) => api.put(`/tools/${id}/deliver`, data),
    return: (id, data) => api.put(`/tools/${id}/return`, data),
  };

  // Progress report endpoints
  progress = {
    getAll: (params) => api.get('/progress', { params }),
    getById: (id) => api.get(`/progress/${id}`),
    create: (data) => api.post('/progress', data),
    update: (id, data) => api.put(`/progress/${id}`, data),
    delete: (id) => api.delete(`/progress/${id}`),
    approve: (id, data) => api.put(`/progress/${id}/approve`, data),
    reject: (id, data) => api.put(`/progress/${id}/reject`, data),
    getByProject: (projectId, params) => api.get(`/progress/project/${projectId}`, { params }),
  };

  // Dashboard endpoints
  dashboard = {
    getOverview: () => api.get('/dashboard/overview'),
    getProjectStats: (projectId) => api.get(`/dashboard/projects/${projectId}/stats`),
    getEmployeeStats: () => api.get('/dashboard/employees/stats'),
    getAttendanceStats: (params) => api.get('/dashboard/attendance/stats', { params }),
    getMaterialStats: () => api.get('/dashboard/materials/stats'),
    getToolStats: () => api.get('/dashboard/tools/stats'),
    getRecentActivity: (params) => api.get('/dashboard/activity', { params }),
  };

  // File upload
  upload = {
    single: (file, folder = 'documents') => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      
      return api.post('/upload/single', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds for file uploads
      });
    },
    
    multiple: (files, folder = 'documents') => {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('folder', folder);
      
      return api.post('/upload/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 120 seconds for multiple file uploads
      });
    }
  };

  // Utility methods
  utils = {
    healthCheck: () => api.get('/health'),
    getApiInfo: () => api.get('/'),
  };
}

// Create and export singleton instance
const apiService = new ApiService();

export default apiService;
export { api };
