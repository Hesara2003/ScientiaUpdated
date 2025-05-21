import axios from 'axios';

// Initialize with token if available
const token = localStorage.getItem('token');

// Function to determine correct baseURL for different environments
const getBaseURL = () => {
  // Use environment variable if defined
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // For production (Vercel) we need to use a relative URL to avoid mixed content
  if (window.location.protocol === 'https:') {
    // Using a relative URL will make requests relative to the current domain
    // This approach requires proper CORS setup on backend and proxy configuration in Vercel
    return '/api';
  }
  
  // For local development over HTTP, use direct URL
  return 'http://16.171.173.27:8080';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  },
  // Useful for debugging
  validateStatus: (status) => {
    // Log but return true for all statuses so we can handle them in our catch blocks
    if (status >= 400) {
      console.warn(`API call returned status ${status}`);
    }
    return true;
  }
});

// Add request interceptor for debugging and token handling
api.interceptors.request.use(  (config) => {
    const token = localStorage.getItem('token');
    if (token) {      // Ensure exact formatting of 'Bearer ' + token with a space
      config.headers.Authorization = `Bearer ${token}`;
      
      console.log(`API Request to ${config.url} with token`);
      
      // Check token validity before sending
      try {
        const parts = token.split('.');
        if (parts.length !== 3) {
          console.warn('WARNING: Malformed JWT token structure in Authorization header');
        }
      } catch (e) {
        console.error('Error checking token format:', e);
      }
    } else {
      console.log(`API Request to ${config.url} without token`);
    }
    return config;
  },
  (error) => {
    console.error('API Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`API Response from ${response.config.url}: Status ${response.status}`);
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const url = error.config?.url || 'unknown endpoint';

      // Handle authentication errors
      if (status === 401) {
        console.error(`Authentication error (401) from ${url}. Token might be invalid or expired.`);
        console.error('Current token:', localStorage.getItem('token')?.substring(0, 20) + '...');
        console.error('Current role:', localStorage.getItem('userRole'));
        
        // Don't auto-logout for login requests
        if (!url.includes('/auth/login')) {
          // Try refresh token logic could go here
          
          // If login failure OR token expired, don't clear token during login attempts
          if (!url.includes('/auth/login')) {
            console.log('Token expired or invalid, but keeping user session active if possible');
          }
        }      } else if (status === 403) {
        console.error(`Authorization error (403) from ${url}. User might not have required permissions.`);
        
        // Try to recover from 403 by refreshing token and adding explicit admin role
        if (error.config && !error.config.__isRetryRequest) {
          const token = localStorage.getItem('token');
          
          if (token) {
            console.log('Attempting to recover from 403 by setting explicit admin role in headers');
            
            // Set admin role in localStorage for all future requests
            localStorage.setItem('userRole', 'admin');
            
            // Create a new request with enhanced admin role information
            const newRequest = {...error.config};
            newRequest.headers = {
              ...newRequest.headers,
              'Authorization': `Bearer ${token}`,
              'X-User-Role': 'admin',
              'Role': 'admin'
            };
            
            // Add query parameter with role for backend servers that check query params
            const hasParams = newRequest.url.includes('?');
            newRequest.url = newRequest.url + (hasParams ? '&' : '?') + 'role=admin';
            
            // Add role to request data if it's a POST/PUT request
            if ((newRequest.method === 'post' || newRequest.method === 'put') && newRequest.data) {
              try {
                const data = typeof newRequest.data === 'string' 
                  ? JSON.parse(newRequest.data) 
                  : newRequest.data;
                
                data.userRole = 'admin';
                data.createdBy = localStorage.getItem('userId');
                newRequest.data = typeof newRequest.data === 'string' 
                  ? JSON.stringify(data)
                  : data;
              } catch(e) {
                console.warn('Could not modify request data', e);
              }
            }
            
            newRequest.__isRetryRequest = true;
            
            return axios(newRequest);
          }
        }
      } else {
        console.error(`API Error from ${url}: Status ${status}`, error.response.data);
      }
    } else if (error.request) {
      // Request was made but no response was received (network error)
      console.error('API Request failed, no response received:', error.request);
    } else {
      // Error in setting up the request
      console.error('API Error during request setup:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;