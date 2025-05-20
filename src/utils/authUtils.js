/**
 * Authentication utility functions
 */

/**
 * Get the current authenticated user from localStorage or token
 * @returns {Object|null} User object or null if not authenticated
 */
export const getUser = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    // First, try to get role from localStorage (most reliable source)
    const storedRole = localStorage.getItem('userRole');
    const lastRegisteredRole = localStorage.getItem('lastRegisteredRole');
    
    // Get user data from localStorage if it exists
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedData = JSON.parse(userData);
      
      // Override role if needed
      if (lastRegisteredRole === 'student') {
        parsedData.role = 'student';
      } else if (storedRole) {
        parsedData.role = storedRole;
      }
      
      return parsedData;
    }
    
    // Extract from token as fallback
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    
    const userId = payload.sub || payload.id || null;
    
    // Determine role using helper function
    let finalRole;
    
    if (lastRegisteredRole === 'student') {
      finalRole = 'student';
    } else if (storedRole) {
      finalRole = storedRole;
    } else {
      finalRole = getUserRole(payload);
    }
    
    // Create consistent user object
    return {
      id: userId,
      role: finalRole,
      ...payload,
      role: finalRole // Ensure role overrides any conflicting property in payload
    };
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Get the user role from the authentication token or localStorage
 * @param {Object} user - User object from token or localStorage
 * @returns {string} - The user's role
 */
export const getUserRole = (user) => {
  try {
    console.log('Getting user role from token payload:', user);
    
    // First check if we have a stored role preference from registration
    const lastRegisteredRole = localStorage.getItem('lastRegisteredRole');
    
    // If user has explicit role in the object, use it
    if (user && user.role) {
      console.log('Found role in token:', user.role);
      
      // If user registered as student but got parent role, correct it
      if (lastRegisteredRole === 'student' && 
          (user.role.toLowerCase() === 'parent' || user.role.toLowerCase() === 'guardian')) {
        console.log('Overriding role to student based on registration history');
        // Save the corrected role
        localStorage.setItem('userRole', 'student');
        return 'student';
      }
      
      return user.role.toLowerCase();
    }
    
    // If we have lastRegisteredRole as student, prioritize it
    if (lastRegisteredRole === 'student') {
      console.log('No role in token, but found lastRegisteredRole as student');
      localStorage.setItem('userRole', 'student');
      return 'student';
    }
    
    // Try to get the role from localStorage
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) {
      console.log('Found role in localStorage:', storedRole);
      return storedRole.toLowerCase();
    }
    
    // If we have a username, try to infer role from it
    if (user && user.sub) {
      console.log('No explicit role found, using subject for role inference:', user.sub);
      
      // Check if username suggests a student user
      if (user.sub.toLowerCase().includes('student') || 
          user.sub.toLowerCase().includes('learner')) {
        console.log('Username suggests student role');
        localStorage.setItem('userRole', 'student');
        return 'student';
      }
      
      // Default to parent if no role info available
      console.log('No role indicators found, defaulting to parent');
      localStorage.setItem('userRole', 'parent');
      return 'parent';
    }
    
    console.log('No user information available for role detection');
    return null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

/**
 * Check if user has a specific role
 * @param {Object} user - The decoded JWT user object
 * @param {String|Array} requiredRoles - Required role(s) to check
 * @returns {Boolean} True if user has the required role
 */
export const hasRole = (user, requiredRoles) => {
  if (!user) return false;
  
  const userRole = getUserRole(user);
  console.log('Checking role access - User role:', userRole, 'Required roles:', requiredRoles);
  
  if (!userRole) return false;
  
  if (Array.isArray(requiredRoles)) {
    return requiredRoles.some(role => userRole.toLowerCase() === role.toLowerCase());
  }
  
  return userRole.toLowerCase() === requiredRoles.toLowerCase();
};

/**
 * Format error message from API response
 * @param {Error} error - Error object from catch block
 * @returns {String} Formatted error message
 */
export const formatAuthError = (error) => {
  console.log('Formatting auth error:', error);
  
  if (error.response) {
    // The request was made and the server responded with an error status
    if (error.response.data && error.response.data.message) {
      return error.response.data.message;
    }
    if (error.response.data && typeof error.response.data === 'string') {
      return error.response.data;
    }
    if (error.response.status === 401) {
      return 'Invalid username or password';
    }
    if (error.response.status === 403) {
      return 'Access denied. Check your credentials or permissions.';
    }
    return `Server error: ${error.response.status}`;
  } else if (error.request) {
    // The request was made but no response was received
    return 'No response from server. Please check your connection.';
  } else if (error.message) {
    // Something happened in setting up the request or handling the response
    return error.message;
  } else {
    // Generic fallback
    return 'An unexpected error occurred during authentication';
  }
};

/**
 * Ensure consistent role information across the app
 * @param {string} preferredRole - Optional role to prioritize
 * @returns {string} The normalized and consistent role
 */
export const ensureConsistentRole = (preferredRole = null) => {
  // Check various sources for role information
  const storedRole = localStorage.getItem('userRole');
  const lastRegisteredRole = localStorage.getItem('lastRegisteredRole');
  
  // Priority order for role determination
  let finalRole;
  
  // 1. If student registration is recent, use student role
  if (lastRegisteredRole === 'student') {
    finalRole = 'student';
  }
  // 2. If preferred role is specified, use that
  else if (preferredRole) {
    finalRole = preferredRole;
  }
  // 3. Fall back to stored role
  else if (storedRole) {
    finalRole = storedRole;
  }
  // 4. Default case - use parent as fallback
  else {
    finalRole = 'parent';
  }
  
  // Store the final role for consistency
  localStorage.setItem('userRole', finalRole);
  
  return finalRole;
};

/**
 * Get authentication headers for API requests
 * @returns {Object} Headers object with auth token and role information
 */
export const getAuthHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const userRole = localStorage.getItem('userRole');
  if (userRole) {
    headers['X-User-Role'] = userRole;
  }
  
  return headers;
};
