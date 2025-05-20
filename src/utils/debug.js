import { jwtDecode } from 'jwt-decode';
import api from '../services/api';
import { refreshApiToken } from './apiUtils';

// Add global debugging utilities
export const setupDebugTools = () => {
  // Check JWT token details
  window.checkCurrentToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found in localStorage');
      return null;
    }
    
    console.log('Token from localStorage:', token);
    console.log('Token length:', token.length);
    console.log('Token parts:', token.split('.').length);
    
    try {
      const decoded = jwtDecode(token);
      console.log('Decoded token:', decoded);
      console.log('Token expires at:', new Date(decoded.exp * 1000).toLocaleString());
      console.log('Current time:', new Date().toLocaleString());
      console.log('Token expired:', decoded.exp < Date.now() / 1000);
      console.log('User role in localStorage:', localStorage.getItem('userRole'));
      
      // Check token format
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Token does not have three parts (header.payload.signature)');
      }
      
      // Check header format in axios
      const authHeader = api.defaults.headers.common['Authorization'];
      console.log('Authorization header in axios:', authHeader);
      console.log('Header correct format:', authHeader === `Bearer ${token}`);
      
      return decoded;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };
  
  // Fix common token issues
  window.fixToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
      // Fix common token issues
      const fixedToken = token
        .replace(/^Bearer\s+/i, '') // Remove any "Bearer " prefix
        .trim(); // Remove whitespace
      
      localStorage.setItem('token', fixedToken);
      localStorage.setItem('userRole', 'admin');
      
      // Refresh token in API headers
      refreshApiToken();
      
      console.log('Token fixed. Original length:', token.length);
      console.log('New token length:', fixedToken.length);
      console.log('New token format:', fixedToken.split('.').length === 3 ? 'Valid JWT format' : 'Invalid format');
      
      // Update Axios headers
      api.defaults.headers.common['Authorization'] = `Bearer ${fixedToken}`;
      api.defaults.headers.common['X-User-Role'] = 'admin';
      
      return { success: true, fixedToken: fixedToken.substring(0, 10) + '...' };
    }
    return { success: false, message: 'No token found' };
  };
  // Test authentication headers on a request
  window.testAuthRequest = async (endpoint = '/students') => {
    console.log('Testing authenticated request to:', endpoint);
    try {
      // First check what headers we're sending
      const token = localStorage.getItem('token');
      console.log('Current token in localStorage:', token ? 'exists' : 'missing');
      console.log('Current auth header:', api.defaults.headers.common['Authorization']);
      
      // Make the request
      const response = await api.get(endpoint);
      console.log('Response:', response);
      return response.data;
    } catch (error) {
      console.error('Auth request test failed:', error);
      console.log('Response status:', error.response?.status);
      console.log('Response data:', error.response?.data);
      return { error: error.message, details: error.response?.data };
    }
  };
  
  // Test admin API access
  window.testAdminAccess = async (endpoint = '/admin/users') => {
    console.group('Testing Admin API Access');
    try {
      // Set admin role in localStorage
      localStorage.setItem('userRole', 'admin');
      
      // Refresh token
      refreshApiToken();
      
      console.log('Testing admin API access to:', endpoint);
      console.log('Headers being sent:');
      console.log('- Authorization:', api.defaults.headers.common['Authorization']?.substring(0, 20) + '...');
      console.log('- X-User-Role:', 'admin');
      
      // Create admin headers
      const headers = {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'X-User-Role': 'admin'
      };
      
      // Attempt the request
      const response = await api.get(endpoint, { headers });
      console.log('Admin API Response:', response.status);
      console.log('Response data:', response.data);
      console.groupEnd();
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Admin API access error:', error);
      
      if (error.response) {
        console.log('Response status:', error.response.status);
        console.log('Response data:', error.response.data);
      }
      
      console.groupEnd();
      return { 
        success: false, 
        status: error.response?.status, 
        error: error.message,
        data: error.response?.data
      };
    }
  };
};
