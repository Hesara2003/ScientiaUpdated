import api from './api';
import { jwtDecode } from 'jwt-decode';

// Store token in localStorage
const setToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    // Make sure we're using the proper Bearer format for the Authorization header
    // Spring Security expects this exact format with a space after "Bearer"
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('Token set in headers:', `Bearer ${token}`);
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    console.log('Token removed from headers');
  }
};

const initAuth = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log('No token found in localStorage');
    return null;
  }
  
  // Validate token format (basic check)
  if (typeof token !== 'string' || !token.includes('.')) {
    console.error('Invalid token format in localStorage');
    logout(); // Clear invalid token
    return null;
  }
  
  // Try to split the token to validate JWT structure (header.payload.signature)
  const parts = token.split('.');
  if (parts.length !== 3) {
    console.error('Invalid JWT format: token does not have three parts');
    logout(); // Clear invalid token
    return null;
  }
  
  // Check if token is expired
  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    console.log('Token decoded successfully:', decodedToken);
    
    if (decodedToken.exp < currentTime) {
      // Token expired, logout user
      console.log('Token expired, logging out');
      logout();
      return null;
    }
    
    // Set token in axios headers
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Extract user data
    const userId = decodedToken.id || decodedToken.sub;
    if (userId) {
      localStorage.setItem('userId', userId);
    }
    
    // Make sure the role is preserved even if not in the token
    const savedRole = localStorage.getItem('userRole');
    if (!decodedToken.role && savedRole) {
      console.log('Adding saved role to user object:', savedRole);
      decodedToken.role = savedRole;
    } else if (decodedToken.role) {
      // Ensure role is saved in localStorage
      localStorage.setItem('userRole', decodedToken.role);
    }
    
    return decodedToken;
  } catch (error) {
    console.error('Error decoding token:', error);
    logout();
    return null;
  }
};

// Login user
const login = async (username, password) => {
  try {
    console.log('Logging in user:', username);
    const response = await api.post('/auth/login', { username, password });
    console.log('Login response received:', response.data);    // Extract token and role from the response
    const token = response.data.token;
    const role = response.data.role;
    
    if (!token) {
      throw new Error('No token received from server');
    }

    console.log('Valid token received, setting in localStorage');
    setToken(token);
    
    // Store role in localStorage explicitly
    if (role) {
      localStorage.setItem('userRole', role.toLowerCase());
    }

    // Create user object from token
    console.log('Decoding JWT token...');
    const decoded = jwtDecode(token);
    console.log('Token decoded successfully');
    
    // Add server-provided role to decoded token
    if (role) {
      decoded.role = role.toLowerCase();
      localStorage.setItem('userRole', role.toLowerCase());
      console.log('Using role from server response:', role);
    }

    return decoded;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Register new user
const register = async (userData) => {
  try {
    console.log('Registering user with data:', { ...userData, password: '*****' });
    
    // Normalize role to lowercase for consistency
    if (userData.role) {
      userData.role = userData.role.toLowerCase();
    }
    
    const response = await api.post('/auth/register', userData);
    console.log('Registration successful, response:', response.data);
    
    // Store the user role in localStorage to help with login later
    if (userData.role) {
      localStorage.setItem('lastRegisteredRole', userData.role);
    }
    
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    if (error.response?.data?.message) {
      throw { message: error.response.data.message };
    }
    throw { message: 'Registration failed. Please try again.' };
  }
};

// Logout user
const logout = () => {
  console.log('Logging out user, removing token');
  
  // Remove token from localStorage
  localStorage.removeItem('token');
  
  // Remove token from API headers
  delete api.defaults.headers.common['Authorization'];
  
  // Clear any other auth-related storage
  localStorage.removeItem('userRole');
  localStorage.removeItem('lastRegisteredRole');
  localStorage.removeItem('studentVisited');
  
  console.log('User logged out successfully');
};

// Check if user is authenticated
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  try {
    // Check if token is expired
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    return decodedToken.exp > currentTime;
  } catch (error) {
    return false;
  }
};

// Get current user from token
const getCurrentUser = () => {  try {
    const token = localStorage.getItem('token');
    if (token) {
      return jwtDecode(token);
    }
    return null;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export {
  login,
  register,
  logout,
  initAuth,
  isAuthenticated,
  getCurrentUser,
  setToken
};

// Debug function to check if backend is reachable
// You can call this from your browser console for troubleshooting
window.checkBackendConnection = async () => {
  try {
    const response = await api.get('/auth/health', { 
      timeout: 5000,
      // Skip auth header for this test
      headers: { 'Authorization': undefined }
    });
    console.log('Backend health check:', response.data);
    return response.data;
  } catch (error) {
    console.error('Backend connection error:', error);
    return { error: error.message, details: error.response?.data };
  }
};

// Debug function to inspect JWT format
window.debugJwtToken = () => {
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
    console.error('Error deocoding token:', error);
    return null;  }
};

// Test backend connection by making a simple request
window.testBackendConnection = async () => {
  try {
    // Try a simple GET request to check if server is reachable
    const response = await api.get('/');
    console.log('Backend connection test successful:', response);
    return { success: true, response };
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return { 
      success: false, 
      error: error.toString(),
      response: error.response,
      status: error.response?.status
    };
  }
};

// Debug current token state
window.checkCurrentToken = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log('No token found in localStorage');
    return { found: false, message: 'No token found in localStorage' };
  }
  
  console.log('Token found in localStorage:', token);
  
  // Basic validation
  if (typeof token !== 'string') {
    return { 
      found: true, 
      valid: false, 
      message: `Invalid token type: ${typeof token}`,
      token
    };
  }
  
  // Check structure
  const parts = token.split('.');
  if (parts.length !== 3) {
    return { 
      found: true, 
      valid: false, 
      message: `Invalid JWT format: has ${parts.length} parts instead of 3`,
      token,
      parts
    };
  }
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const isExpired = decoded.exp < currentTime;
    
    return {
      found: true,
      valid: true,
      expired: isExpired,
      message: isExpired ? 'Token is expired' : 'Token is valid',
      decoded,
      token,
      expiresIn: decoded.exp - currentTime
    };
  } catch (error) {
    return {
      found: true,
      valid: false,
      message: 'Token could not be decoded: ' + error.message,
      token,
      error: error.toString()
    };
  }
};

// Debug function to manually decode JWT token
window.debugJwtToken = (token) => {
  console.log('Attempting to decode token:', token);
  
  // First validate token format
  if (!token || typeof token !== 'string') {
    console.error('Invalid token type:', typeof token);
    return { error: 'Invalid token type' };
  }
  
  // Check if token has correct structure
  const parts = token.split('.');
  if (parts.length !== 3) {
    console.error('Invalid JWT format: token does not have three parts', parts);
    return { error: 'Invalid token format: should have 3 parts (header.payload.signature)' };
  }
  
  try {
    // Try built-in JWT decode first
    const decoded = jwtDecode(token);
    console.log('Successfully decoded token using jwt-decode:', decoded);
    return decoded;
  } catch (error) {
    console.error('jwt-decode failed:', error);
    
    // Fallback to manual decoding
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded = JSON.parse(jsonPayload);
      console.log('Successfully decoded token manually:', decoded);
      return decoded;
    } catch (manualError) {
      console.error('Manual token decode failed:', manualError);
      return { error: 'Failed to decode token: ' + manualError.message };
    }
  }
};
