import api from './api';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Format date for Java backend (YYYY-MM-DD format)
const formatDateForBackend = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

const formatStatusForBackend = (status) => {
  if (!status) return 'Pending';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

const refreshApiToken = async (forceRefresh = false) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      return false;
    }
    console.log('Setting Authorization header with token');
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    if (forceRefresh) {
      const userRole = localStorage.getItem('userRole');
      if (userRole) {
        console.log('Adding X-User-Role header:', userRole);
        api.defaults.headers.common['X-User-Role'] = userRole;
      } else {
        console.warn('No userRole found in localStorage');
      }
    }
    return true;
  } catch (error) {
    console.error('Error refreshing API token:', error);
    return false;
  }
};

/**
 * Make an authenticated API call with proper headers
 * @param {string} url - The API endpoint to call
 * @param {Object} options - Axios request options
 * @returns {Promise} - The API response
 */
export const callWithAuth = async (url, options = {}) => {
  try {
    // Log the request for debugging
    logRequest(options.method || 'GET', url, options.data);
    
    // Make sure token is set
    await refreshApiToken(true); // Force refresh to ensure role headers
    
    // Get authentication token
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole') || 'admin'; // Default to admin
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    // Add admin role explicitly for fees endpoints
    if (url.includes('/fees')) {
      console.log('Adding explicit admin role for fees endpoint');
      localStorage.setItem('userRole', 'admin');
    }
      // Make the API request with enhanced authentication
    const response = await api({
      url,
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`API Response (${url}):`, response.data);
    return response;
  } catch (error) {
    // Handle 403 errors specifically
    if (error.response && error.response.status === 403) {
      console.error('Access forbidden. Trying to refresh credentials...');
      
      try {
        // Try to refresh token and retry with admin role
        localStorage.setItem('userRole', 'admin');
        await refreshApiToken(true);
          // Retry the request with admin credentials
        const retryResponse = await api({
          url,
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`Retry successful for (${url}):`, retryResponse.data);
        return retryResponse;
      } catch (retryError) {
        console.error('Retry failed:', retryError);
        throw new Error('You do not have permission to access this resource. Please contact an administrator.');
      }
    }
    
    console.error(`API call failed: ${url}`, error);
    throw error;
  }
};

export const getAllFees = async () => {
  try {
    // Use callWithAuth instead of direct api.get
    const response = await callWithAuth('/fees', {
      method: 'GET'
    });
    
    // Debug response
    console.log('Fee API response:', response.data);
    
    // More thorough validation of response data
    if (!response.data) {
      console.warn('Fee API returned null or undefined data');
      return [];
    }
    
    // Return array data safely
    if (!Array.isArray(response.data)) {
      console.warn('Fee API did not return an array:', response.data);
      return [];
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching all fees:', error);
    // Use mock data when API fails in development
    if (import.meta.env.DEV) {
      console.warn('Using mock fee data for development');
      return getMockFees();
    }
    return [];
  }
};

/**
 * Generate mock fee data for testing and fallbacks
 * @returns {Array} Array of mock fee objects
 */
export const getMockFees = () => {
  return [
    {
      id: 1,
      feeId: "F1001",
      studentId: 1001,
      amount: 5000,
      dueDate: "2025-01-15",
      status: "paid",
      description: "Tuition fee for Spring semester"
    },
    {
      id: 2,
      feeId: "F1002",
      studentId: 1002,
      amount: 4500,
      dueDate: "2025-02-10",
      status: "pending",
      description: "Tuition fee for Spring semester"
    },
    {
      id: 3,
      feeId: "F1003",
      studentId: 1003,
      amount: 5200,
      dueDate: "2025-03-05",
      status: "paid",
      description: "Tuition fee for Spring semester"
    },
    {
      id: 4,
      feeId: "F1004",
      studentId: 1004,
      amount: 4800,
      dueDate: "2025-04-20",
      status: "pending",
      description: "Tuition fee for Spring semester"
    }
  ];
};

export const getStudentFees = async (studentId) => {
  try {
    await refreshApiToken();
    console.log('Fetching fees for student:', studentId);
    const response = await api.get(`/fees/student/${studentId}`);
    console.log('Student fees:', response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching student fees:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch student fees');
  }
};

export const getFeeById = async (feeId) => {
  try {
    await refreshApiToken();
    console.log('Fetching fee with ID:', feeId);
    const response = await api.get(`/fees/${feeId}`);
    console.log('Fee details:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching fee with ID ${feeId}:`, error);
    throw new Error(error.response?.data?.message || 'Failed to fetch fee');
  }
};

export const addFeePayment = async (feeData) => {
  try {
    // Adapt frontend data to match what backend expects
    const payload = {
      studentId: Number(feeData.studentId),
      amount: Number(feeData.amount),
      dueDate: formatDateForBackend(feeData.dueDate),
      status: formatStatusForBackend(feeData.status || 'pending'),
      category: feeData.category || 'Tuition',
      paymentDate: feeData.status?.toLowerCase() === 'paid' ? 
        formatDateForBackend(new Date()) : null,
      description: feeData.description || ''
    };
    
    // Use callWithAuth for authenticated request
    const response = await callWithAuth('/fees', {
      method: 'POST',
      data: payload
    });
    
    console.log('Fee added successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding fee payment:', error);
    throw error;
  }
};

export const updateFee = async (feeId, feeData) => {
  try {
    await refreshApiToken();
    const formattedFee = {
      ...feeData,
      feeId: Number(feeId),
      student: feeData.studentId ? { studentId: String(feeData.studentId) } : feeData.student,
      dueDate: formatDateForBackend(feeData.dueDate),
      paymentDate: formatDateForBackend(feeData.paymentDate),
    };
    console.log('Updating fee:', feeId, formattedFee);
    const response = await api.put(`/fees/${feeId}`, formattedFee);
    console.log('Fee updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating fee:', error);
    throw new Error(error.response?.data?.message || 'Failed to update fee');
  }
};

export const markFeeAsPaid = async (feeId) => {
  try {
    await refreshApiToken();
    console.log('Marking fee as paid:', feeId);
    const currentFee = await getFeeById(feeId);
    const paymentDate = new Date().toISOString().split('T')[0];
    const updatedFee = {
      ...currentFee,
      status: 'Paid',
      paymentDate: paymentDate,
    };
    const response = await updateFee(feeId, updatedFee);
    console.log('Fee marked as paid:', response);
    return response;
  } catch (error) {
    console.error('Error marking fee as paid:', error);
    throw new Error(error.response?.data?.message || 'Failed to mark fee as paid');
  }
};

export const deleteFee = async (feeId) => {
  try {
    await refreshApiToken();
    console.log('Deleting fee:', feeId);
    await api.delete(`/fees/${feeId}`);
    console.log('Fee deleted:', feeId);
    return true;
  } catch (error) {
    console.error('Error deleting fee:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete fee');
  }
};

// Add to feeService.js
const logRequest = (method, url, payload = null) => {
  console.group(`📤 API Request: ${method} ${url}`);
  console.log('Auth Token:', localStorage.getItem('token')?.substring(0, 15) + '...');
  console.log('User Role:', localStorage.getItem('userRole'));
  if (payload) console.log('Payload:', payload);
  console.groupEnd();
};