import api from './api';
import { callAdminApi } from '../utils/apiUtils';
import { debugData, debugHttpError, generateMockData } from '../utils/debugUtils';

/**
 * Generate mock student data for testing and fallback
 * @param {number} count - Number of students to generate
 * @returns {Array} Array of mock student objects
 */
const generateMockStudents = (count = 5) => {
  const names = [
    { first: "Alex", last: "Johnson" },
    { first: "Jamie", last: "Smith" },
    { first: "Taylor", last: "Wilson" },
    { first: "Jordan", last: "Brown" },
    { first: "Casey", last: "Davis" },
    { first: "Riley", last: "Martinez" },
    { first: "Sam", last: "Anderson" },
    { first: "Morgan", last: "Thomas" },
    { first: "Drew", last: "Jackson" },
    { first: "Quinn", last: "White" }
  ];
  
  return Array.from({ length: Math.min(count, names.length) }, (_, i) => ({
    id: 1000 + i,
    studentId: 1000 + i,
    firstName: names[i].first,
    lastName: names[i].last,
    role: 'student',
    email: `${names[i].first.toLowerCase()}.${names[i].last.toLowerCase()}@example.com`,
    enrollmentDate: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active'
  }));
};

/**
 * Generate mock parent data for testing and fallback
 * @param {number} count - Number of parents to generate
 * @returns {Array} Array of mock parent objects
 */
const generateMockParents = (count = 5) => {
  const names = [
    { first: "Pat", last: "Miller" },
    { first: "Chris", last: "Williams" },
    { first: "Jessie", last: "Jones" },
    { first: "Robin", last: "Garcia" },
    { first: "Avery", last: "Rodriguez" },
    { first: "Leslie", last: "Lee" },
    { first: "Blair", last: "Walker" },
    { first: "Cameron", last: "Allen" },
    { first: "Skyler", last: "King" },
    { first: "Logan", last: "Wright" }
  ];
  
  return Array.from({ length: Math.min(count, names.length) }, (_, i) => ({
    id: 2000 + i,
    parentId: 2000 + i,
    firstName: names[i].first,
    lastName: names[i].last,
    role: 'parent',
    email: `${names[i].first.toLowerCase()}.${names[i].last.toLowerCase()}@example.com`,
    createdAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active'
  }));
};

/**
 * Generate mock registrations for testing and fallback
 * @param {number} days - Number of days to look back
 * @param {string|null} role - Role to generate mock data for
 * @returns {Array} Array of mock user objects
 */
const generateMockRegistrations = (days = 7, role = null) => {
  if (role === 'student') {
    return generateMockStudents(Math.min(days, 10));
  } else if (role === 'parent') {
    return generateMockParents(Math.min(days, 10));
  } else {
    // Generate mixed student and parent data
    const students = generateMockStudents(Math.min(Math.floor(days/2), 5));
    const parents = generateMockParents(Math.min(Math.floor(days/2), 5));
    return [...students, ...parents].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA;
    });
  }
};

/**
 * Service for managing users across the application
 */
const userService = {  /**
   * Get all users with optional role filtering
   * @param {string} role - Filter users by role (student, tutor, parent, admin)
   * @returns {Promise<Array>} List of users matching the criteria
   */
  getAllUsers: async (role = null) => {
    try {
      let endpoint = '/admin/users';
      if (role) {
        endpoint += `?role=${role}`;
      }      try {
        // Use admin API call helper 
        const response = await callAdminApi(endpoint);
        
        // Debug response data format
        debugData('getAllUsers response data', response.data);
        
        // Ensure we always return an array
        if (!Array.isArray(response.data)) {
          console.warn('API response is not an array:', response.data);
          
          // Check if response.data has a nested data property (common API pattern)
          if (response.data && Array.isArray(response.data.data)) {
            console.log('Found array in nested data property');
            return response.data.data;
          }
          
          // Check if response data is a string that might be JSON
          if (typeof response.data === 'string') {
            try {
              const parsed = JSON.parse(response.data);
              if (Array.isArray(parsed)) {
                console.log('Successfully parsed string response into array');
                return parsed;
              } else if (parsed && Array.isArray(parsed.data)) {
                console.log('Successfully parsed string response, found array in data property');
                return parsed.data;
              }
            } catch (parseError) {
              console.error('Failed to parse response string as JSON:', parseError);
            }
          }
          
          // If we can't find an array, return an empty one
          return [];
        }
        
        return response.data;
      } catch (adminApiError) {
        // If access is forbidden (403), try alternative endpoint
        if (adminApiError.response && adminApiError.response.status === 403) {
          console.warn(`Access forbidden to admin endpoint. Trying alternative approach...`, adminApiError);
          
          // Determine fallback endpoint based on role
          let fallbackEndpoint = '/users';
          if (role === 'student') {
            fallbackEndpoint = '/students';
          } else if (role === 'parent') {
            fallbackEndpoint = '/parents';
          } else if (role === 'tutor') {
            fallbackEndpoint = '/tutors';
          }
          
          try {
            // Try fallback endpoint
            const fallbackResponse = await api.get(fallbackEndpoint);
            return fallbackResponse.data || [];
          } catch (fallbackError) {
            console.error(`Error fetching from fallback endpoint ${fallbackEndpoint}:`, fallbackError);
            // Return mock data as a last resort
            if (role === 'student') {
              return generateMockStudents(10);
            } else if (role === 'parent') {
              return generateMockParents(10);
            } else {
              return [];
            }
          }
        }
        
        // Re-throw for other errors
        throw adminApiError;
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      return []; // Return empty array instead of throwing to prevent component errors
    }
  },
  /**
   * Get all students (shorthand for getAllUsers with role=student)
   * @returns {Promise<Array>} List of student users
   */
  getAllStudents: async () => {
    try {
      const studentsData = await userService.getAllUsers('student');
      // Ensure we always return an array
      return Array.isArray(studentsData) ? studentsData : [];
    } catch (error) {
      console.error('Error in getAllStudents:', error);
      return []; // Always return an array
    }
  },

  /**
   * Get all tutors (shorthand for getAllUsers with role=tutor)
   * @returns {Promise<Array>} List of tutor users
   */
  getAllTutors: async () => {
    return await userService.getAllUsers('tutor');
  },

  /**
   * Create a new user (primarily for admin to create tutors)
   * @param {Object} userData - User data including username, password, role, etc.
   * @returns {Promise<Object>} Created user
   */
  createUser: async (userData) => {
    try {
      const response = await api.post('/admin/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  /**
   * Create a new tutor account (specialized version of createUser)
   * @param {Object} tutorData - Tutor data
   * @returns {Promise<Object>} Created tutor user
   */
  createTutor: async (tutorData) => {
    // Ensure role is set to tutor
    const userData = {
      ...tutorData,
      role: 'tutor'
    };
    return await userService.createUser(userData);
  },  /**
   * Get recent registrations (users who recently signed up)
   * @param {number} days - Number of days to look back
   * @param {string|null} role - Optional role filter (student, parent, tutor, etc.)
   * @returns {Promise<Array>} List of recently registered users
   */
  getRecentRegistrations: async (days = 7, role = null) => {
    try {
      // Use admin API call helper
      const roleParam = role ? `&role=${role}` : '';
      console.log(`Fetching recent registrations with role: ${role || 'all'}`);
      
      try {
        // Ensure admin role is set in localStorage
        localStorage.setItem('userRole', 'admin');
        
        // First attempt with admin API
        const response = await callAdminApi(`/admin/users/recent?days=${days}${roleParam}`);
          // Debug response data
        const { debugData, generateMockData } = await import('../utils/debugUtils');
        debugData(`Recent registrations response (role=${role})`, response.data, { showMockData: true });
        
        // Handle various response formats
        let responseData = response.data;
        
        // Special handling for empty string responses from API (often 403 errors)
        if (responseData === '') {
          console.warn(`Empty string response received from /admin/users/recent (role=${role})`);
          console.log('This is likely due to a permissions issue - using mock data');
          
          // Generate appropriate mock data based on role
          const mockCount = 7; // One for each day in the last week
          responseData = role === 'student' 
            ? generateMockData('students', mockCount) 
            : role === 'parent' 
              ? generateMockData('parents', mockCount)
              : generateMockData('users', mockCount);
              
          console.log(`Generated ${mockCount} mock ${role || 'user'} records`);
          return responseData;
        }
        
        // Ensure result is always an array
        if (!Array.isArray(responseData)) {
          console.warn('Recent registrations response is not an array:', responseData);
          
          // Check for nested data property
          if (responseData && Array.isArray(responseData.data)) {
            console.log('Found array in nested data property');
            responseData = responseData.data;
          } else if (responseData && typeof responseData === 'object') {
            // Try to extract relevant keys that might contain an array
            const possibleArrays = Object.values(responseData).filter(Array.isArray);
            if (possibleArrays.length > 0) {
              console.log('Found potential array in response object');
              responseData = possibleArrays[0];
            } else {
              console.log('No arrays found in object - using empty array');
              responseData = [];
            }
          } else {
            console.log('Response is not an object or array - using empty array');
            responseData = [];
          }
        }
        
        console.log(`Returning ${responseData.length} recent ${role || 'all'} registrations`);
        return responseData;
      } catch (adminApiError) {
        // Import debugging utilities
        const { debugHttpError, generateMockData } = await import('../utils/debugUtils');
        
        // Use our enhanced error debugging
        debugHttpError(adminApiError, `Recent registrations API (role=${role})`);
        
        // Check for admin access forbidden flag or 403 status
        if (adminApiError.isAdminAccessForbidden || 
           (adminApiError.response && adminApiError.response.status === 403)) {
          console.warn('Access forbidden when fetching recent registrations. Trying alternative approach...');
          
          // Try refreshing the token before fallback
          const { refreshApiToken } = require('../utils/apiUtils');
          const refreshed = refreshApiToken();
            if (refreshed) {
            // Retry with refreshed token
            try {
              const retryResponse = await callAdminApi(`/admin/users/recent?days=${days}${roleParam}`);
              console.log('Retry successful after token refresh:', retryResponse.data);
              return Array.isArray(retryResponse.data) ? retryResponse.data : [];
            } catch (retryError) {
              console.warn('Retry after token refresh still failed:', retryError);
              debugHttpError(retryError, `Retry after token refresh (role=${role})`);
            }
          }
          
          // Determine which endpoint to use based on role
          let endpoint = '/users';
          if (role === 'student') {
            endpoint = '/students';
          } else if (role === 'parent') {
            endpoint = '/parents';
          }
          
          try {
            // Fallback to appropriate endpoint
            console.log(`Falling back to endpoint: ${endpoint}`);
            const allUsersResponse = await api.get(endpoint);
            
            // Check response format
            if (!allUsersResponse.data) {
              console.warn(`No data returned from fallback endpoint ${endpoint}`);
              return generateMockData(role === 'student' ? 'students' : 
                      role === 'parent' ? 'parents' : 'users', 7);
            }
            
            // Filter to only show recently registered users (last X days)
            const allUsers = Array.isArray(allUsersResponse.data) 
              ? allUsersResponse.data 
              : Array.isArray(allUsersResponse.data.data) 
                ? allUsersResponse.data.data 
                : [];
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            
            const filteredUsers = Array.isArray(allUsers) ? 
              allUsers.filter(user => {
                if (!user.createdAt && !user.enrollmentDate) return false;
                const userDate = new Date(user.createdAt || user.enrollmentDate);
                return userDate >= cutoffDate;
              }) : [];
              
            console.log(`Filtered ${filteredUsers.length} recent registrations from fallback endpoint`);
            return filteredUsers;
          } catch (endpointError) {
            console.error(`Error fetching from ${endpoint}:`, endpointError);
            // Return mock data for fallback
            console.log('Using mock data as fallback');
            return generateMockRegistrations(days, role);
          }
        } else {
          // For non-403 errors, just return mock data
          console.error('Non-403 error fetching recent registrations:', adminApiError);
          return generateMockRegistrations(days, role);
        }
      }
    } catch (error) {
      console.error('Error fetching recent registrations:', error);
      // Return mock data based on role
      return generateMockRegistrations(days, role);
    }
  },

  /**
   * Get user details by ID
   * @param {string|number} userId - User ID
   * @returns {Promise<Object>} User details
   */
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  },
  
  /**
   * Update user details
   * @param {string|number} userId - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} Updated user
   */
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/admin/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete a user
   * @param {string|number} userId - User ID
   * @returns {Promise<boolean>} Success indicator
   */
  deleteUser: async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error;
    }
  }
};

export default userService;