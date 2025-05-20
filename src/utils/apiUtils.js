import api from '../services/api';
import { toast } from 'react-hot-toast';

/**
 * Utility function to refresh the token in axios headers
 * Useful when the app has been running for a while and might have outdated token
 * @returns {boolean} whether token was successfully refreshed
 */
export const refreshApiToken = () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('No token found in localStorage to refresh');
      return false;
    }
    
    // Check if token is correctly formatted
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Token does not have three parts (header.payload.signature)');
      
      // Try to decode token parts anyway (in case it's just a formatting issue)
      try {
        // Test if we can extract payload
        const base64Url = parts[1] || parts[0];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        if (payload && (payload.exp || payload.sub || payload.id)) {
          console.log('Token payload seems valid despite format issues:', payload);
          // Continue using token but fix format
          const fixedToken = token.replace(/\s+/g, '').trim();
          localStorage.setItem('token', fixedToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${fixedToken}`;
          return true;
        }
      } catch (decodeError) {
        console.error('Error trying to salvage malformed token:', decodeError);
      }
      
      return false;
    }
    
    // Update the Authorization header with the current token (ensure Bearer format)
    const formattedToken = token.trim(); // Remove any whitespace
    api.defaults.headers.common['Authorization'] = `Bearer ${formattedToken}`;
    
    // Set admin role for admin pages
    if (window.location.pathname.includes('/admin')) {
      localStorage.setItem('userRole', 'admin');
      api.defaults.headers.common['X-User-Role'] = 'admin';
    }
    
    console.log('API token refreshed from localStorage');
    return true;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
};

/**
 * Attempt to fix authorization errors by refreshing token
 * @param {Error} error - The error that occurred
 */
export const handleAuthError = (error) => {
  if (error.response && (error.response.status === 401 || error.response.status === 403)) {
    console.log('Auth error detected, trying to refresh token');
    const refreshed = refreshApiToken();
    
    if (refreshed) {
      toast.success('Authorization refreshed. Please try your action again.');
    } else {
      toast.error('Authentication error. Please log in again.');
      // You could redirect to login here
      // window.location.href = '/auth/login';
    }
  }
};

/**
 * Special handling for admin API calls
 * Forces admin role in headers when calling admin endpoints
 * @param {string} url - API endpoint to call
 * @param {Object} options - Axios options
 * @returns {Promise} Axios response promise
 */
export const callAdminApi = async (url, options = {}) => {
  try {
    // Fix: Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Create proper headers with token
    const headers = {
      ...options.headers,
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : undefined
    };
    
    // Verify admin role is set in localStorage (if not, set it)
    localStorage.setItem('userRole', 'admin');
    
    // Modify URL to include role in query param as backup
    const separator = url.includes('?') ? '&' : '?';
    const adminUrl = url + `${separator}role=admin`;
    
    // Make API call with admin role and proper headers
    console.log(`Making admin API call to ${adminUrl}`);
    const response = await api({
      url: adminUrl,
      ...options,
      headers
    });
    
    // Check response data format
    if (response.data) {
      console.log('Admin API response format:', {
        isArray: Array.isArray(response.data),
        type: typeof response.data,
        length: Array.isArray(response.data) ? response.data.length : 'N/A'
      });
      
      // Attempt to normalize the response if needed
      if (!Array.isArray(response.data) && typeof response.data === 'object') {
        // Some APIs wrap data in a 'data' property
        if (response.data.data && Array.isArray(response.data.data)) {
          console.log('Found array in response.data.data - normalizing response');
          // Save original response format
          response._originalData = response.data;
          // Replace with the array directly for easier consumption
          response.data = response.data.data;
        }
        // Check for common patterns where API returns an object with collection keys
        else if (response.data) {
          const possibleArrayProps = ['results', 'items', 'records', 'users', 'students', 'parents'];
          for (const prop of possibleArrayProps) {
            if (response.data[prop] && Array.isArray(response.data[prop])) {
              console.log(`Found array in response.data.${prop} - normalizing response`);
              response._originalData = response.data;
              response.data = response.data[prop];
              break;
            }
          }
        }
      } else if (typeof response.data === 'string' && 
                (response.data.startsWith('[') || response.data.startsWith('{'))) {
        // The data might be a JSON string that needs parsing
        try {
          const parsedData = JSON.parse(response.data);
          console.log('Parsed string response data as JSON');
          response._originalData = response.data;
          response.data = parsedData;
        } catch (e) {
          console.warn('Failed to parse response data string as JSON:', e);
        }
      }
    }
    
    return response;
  } catch (error) {
    // Handle specific error cases
    if (error.response && error.response.status === 403) {
      console.error('Admin API access forbidden. Token may be invalid or expired.');
      // You might want to refresh token here
    }
    throw error;
  }
};
