import api from './api';

/**
 * Get all tutorials (for student view)
 * @returns {Promise<Array>} List of all tutorials
 */
export const getAllTutes = async () => {
  try {
    const response = await api.get('/tutor/tutes');
    return response.data;
  } catch (error) {
    console.error('Error fetching tutorials:', error);
    throw error;
  }
};

/**
 * Get a tutorial by ID
 * @param {string|number} tuteId - ID of the tutorial to retrieve
 * @returns {Promise<Object>} Tutorial object
 */
export const getTuteById = async (tuteId) => {
  // Validate tuteId
  if (!tuteId || tuteId === 'undefined' || tuteId === 'null') {
    console.error('Invalid tutorial ID:', tuteId);
    throw new Error('Invalid tutorial ID');
  }

  // GET /tutor/tutes/{id}
  try {
    const response = await api.get(`/tutor/tutes/${tuteId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tutorial details:', error);
    throw error;
  }
};

/**
 * Get tutorials created by a specific tutor
 * Since your backend doesn't have a separate endpoint for this,
 * we'll fetch all and filter on the frontend
 * @param {string|number} tutorId - ID of the tutor
 * @returns {Promise<Array>} List of tutorials created by the tutor
 */
export const getTutesByTutorId = async (tutorId) => {
  try {
    // Get all tutorials
    const allTutes = await getAllTutes();
    
    // Filter by tutorId (assuming your Tute model has a tutorId field)
    return allTutes.filter(tute => tute.tutorId === tutorId || tute.tutorId === String(tutorId));
  } catch (error) {
    console.error('Error fetching tutor tutorials:', error);
    throw error;
  }
};

/**
 * Create a new tutorial
 * @param {Object} tuteData - Tutorial data
 * @returns {Promise<Object>} Created tutorial object
 */
export const createTute = async (tuteData) => {
  // Validate tuteData
  if (!tuteData || Object.keys(tuteData).length === 0) {
    console.error('Invalid tutorial data for creation:', tuteData);
    throw new Error('Invalid tutorial data');
  }

  // Ensure required fields are present
  const requiredFields = ['title', 'subject', 'description', 'price'];
  const missingFields = requiredFields.filter(field => !tuteData[field]);
  
  if (missingFields.length > 0) {
    console.error(`Missing required fields: ${missingFields.join(', ')}`);
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // POST /tutor/tutes
  try {
    const response = await api.post('/tutor/tutes', tuteData);
    return response.data;
  } catch (error) {
    console.error('Error creating tutorial:', error);
    throw error;
  }
};

/**
 * Update an existing tutorial
 * @param {string|number} tuteId - ID of the tutorial to update
 * @param {Object} tuteData - Updated tutorial data
 * @param {number} retryCount - Number of retry attempts (default: 2)
 * @returns {Promise<Object>} Updated tutorial object
 */
export const updateTute = async (tuteId, tuteData, retryCount = 2) => {
  // Validate tuteId
  if (!tuteId || tuteId === 'undefined' || tuteId === 'null') {
    console.error('Invalid tutorial ID for update:', tuteId);
    throw new Error('Invalid tutorial ID');
  }

  // Validate tuteData
  if (!tuteData || Object.keys(tuteData).length === 0) {
    console.error('Invalid tutorial data for update:', tuteData);
    throw new Error('Invalid tutorial data');
  }

  // Ensure required fields are present
  const requiredFields = ['title', 'subject', 'description', 'price'];
  const missingFields = requiredFields.filter(field => !tuteData[field]);
  
  if (missingFields.length > 0) {
    console.error(`Missing required fields for update: ${missingFields.join(', ')}`);
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // PUT /tutor/tutes/{id}
  try {
    console.log(`Updating tutorial with ID: ${tuteId}`, tuteData);
    
    let response;
    try {
      // First, try to get the tutorial to verify it exists
      await getTuteById(tuteId);
    } catch (getError) {
      console.warn(`Tutorial with ID ${tuteId} not found, skipping verification`);
      // Continue anyway, maybe the backend will handle it
    }
    
    // Handle price field formatting - ensure it's a number
    const formattedData = {
      ...tuteData,
      price: typeof tuteData.price === 'string' ? parseFloat(tuteData.price) : tuteData.price
    };
    
    // Add timestamp for debugging
    console.log(`Sending update request at ${new Date().toISOString()}`);
    
    response = await api.put(`/tutor/tutes/${tuteId}`, formattedData);
    
    // Log the response for debugging
    console.log('Update response:', response);
    
    if (response.status >= 400) {
      throw new Error(`Failed to update tutorial: ${response.data?.message || response.statusText}`);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error updating tutorial:', error);
    
    // Retry logic
    if (retryCount > 0) {
      console.log(`Retrying update tutorial (${retryCount} attempts left)...`);
      
      // Wait 1 second before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return updateTute(tuteId, tuteData, retryCount - 1);
    }
    
    throw error;
  }
};

/**
 * Delete a tutorial
 * @param {string|number} tuteId - ID of the tutorial to delete
 * @param {number} retryCount - Number of retry attempts (default: 2)
 * @returns {Promise<boolean>} Success indicator
 */
export const deleteTute = async (id) => {
  try {
    // Validate the ID
    if (!id || isNaN(parseInt(id, 10))) {
      throw new Error('Invalid tutorial ID');
    }
    
    // Convert to number if it's a string
    const tuteId = typeof id === 'string' ? parseInt(id, 10) : id;
    
    const response = await api.delete(`/tutor/tutes/${tuteId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : undefined
      }
    });
    
    // Log the response for debugging
    console.log('Delete response:', response);
    
    if (response.status >= 400) {
      throw new Error(`Failed to delete tutorial: ${response.data?.message || response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting tutorial:', error);
    
    // Retry logic
    if (retryCount > 0) {
      console.log(`Retrying delete tutorial (${retryCount} attempts left)...`);
      
      // Wait 1 second before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return deleteTute(tuteId, retryCount - 1);
    }
    
    throw error;
  }
};

/**
 * Delete multiple tutorials at once
 * @param {Array<string|number>} tuteIds - Array of tutorial IDs to delete
 * @returns {Promise<{success: Array, failed: Array}>} Result with successful and failed deletions
 */
export const bulkDeleteTutes = async (tuteIds) => {
  if (!Array.isArray(tuteIds) || tuteIds.length === 0) {
    throw new Error('Invalid tutorial IDs for bulk deletion');
  }

  const results = {
    success: [],
    failed: []
  };

  // Process each deletion sequentially to avoid overwhelming the server
  for (const id of tuteIds) {
    try {
      await deleteTute(id);
      results.success.push(id);
    } catch (error) {
      console.error(`Error deleting tutorial ${id}:`, error);
      results.failed.push({
        id,
        error: error.message
      });
    }
  }

  return results;
};

/**
 * Get published tutorials (for public view)
 * This can be used to show only published tutorials to students or the public
 * @param {boolean} publishedOnly - Whether to return only published tutorials
 * @returns {Promise<Array>} List of published tutorials
 */
export const getPublishedTutes = async (publishedOnly = true) => {
  try {
    const allTutes = await getAllTutes();
    
    // If publishedOnly is true, filter by published status
    if (publishedOnly) {
      return allTutes.filter(tute => tute.isPublished);
    }
    
    return allTutes;
  } catch (error) {
    console.error('Error fetching published tutorials:', error);
    throw error;
  }
};

/**
 * Search tutorials by keyword
 * @param {string} keyword - Keyword to search for
 * @returns {Promise<Array>} List of matching tutorials
 */
export const searchTutes = async (keyword) => {
  try {
    if (!keyword || keyword.trim() === '') {
      return getAllTutes();
    }
    
    const allTutes = await getAllTutes();
    const searchTerm = keyword.toLowerCase().trim();
    
    return allTutes.filter(tute => {
      return (
        (tute.title && tute.title.toLowerCase().includes(searchTerm)) ||
        (tute.subject && tute.subject.toLowerCase().includes(searchTerm)) ||
        (tute.description && tute.description.toLowerCase().includes(searchTerm))
      );
    });
  } catch (error) {
    console.error('Error searching tutorials:', error);
    throw error;
  }
};

/**
 * Toggle tutorial published status
 * @param {string|number} tuteId - ID of the tutorial to toggle
 * @param {boolean} isPublished - New published status
 * @returns {Promise<Object>} Updated tutorial object
 */
export const toggleTutePublishedStatus = async (tuteId, isPublished) => {
  // Validate tuteId
  if (!tuteId || tuteId === 'undefined' || tuteId === 'null') {
    console.error('Invalid tutorial ID for publishing:', tuteId);
    throw new Error('Invalid tutorial ID');
  }

  try {
    // First get the tutorial
    const tutorial = await getTuteById(tuteId);
    
    // Then update just the published status
    const updatedTute = {
      ...tutorial,
      isPublished: isPublished
    };
    
    // Update the tutorial
    return await updateTute(tuteId, updatedTute);
  } catch (error) {
    console.error('Error toggling tutorial published status:', error);
    throw error;
  }
};

/**
 * Filter tutorials by subject
 * @param {string} subject - Subject to filter by
 * @returns {Promise<Array>} List of tutorials for the specified subject
 */
export const getTutesBySubject = async (subject) => {
  if (!subject || subject.trim() === '') {
    return getAllTutes();
  }

  try {
    const allTutes = await getAllTutes();
    return allTutes.filter(tute => 
      tute.subject && tute.subject.toLowerCase() === subject.toLowerCase()
    );
  } catch (error) {
    console.error('Error filtering tutorials by subject:', error);
    throw error;
  }
};

/**
 * Get tutorials sorted by price
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Promise<Array>} Sorted list of tutorials
 */
export const getTutesSortedByPrice = async (order = 'asc') => {
  try {
    const allTutes = await getAllTutes();
    
    return [...allTutes].sort((a, b) => {
      const priceA = parseFloat(a.price) || 0;
      const priceB = parseFloat(b.price) || 0;
      
      return order.toLowerCase() === 'desc' ? priceB - priceA : priceA - priceB;
    });
  } catch (error) {
    console.error('Error sorting tutorials by price:', error);
    throw error;
  }
};

/**
 * Get all unique subjects from available tutorials
 * @returns {Promise<Array<string>>} List of unique subject names
 */
export const getUniqueSubjects = async () => {
  try {
    const allTutes = await getAllTutes();
    
    // Extract unique subjects
    const subjectSet = new Set();
    allTutes.forEach(tute => {
      if (tute.subject) {
        subjectSet.add(tute.subject);
      }
    });
    
    return [...subjectSet].sort();
  } catch (error) {
    console.error('Error getting unique subjects:', error);
    throw error;
  }
};

/**
 * Get tutorials within a price range
 * @param {number} minPrice - Minimum price
 * @param {number} maxPrice - Maximum price
 * @returns {Promise<Array>} List of tutorials in the specified price range
 */
export const getTutesByPriceRange = async (minPrice, maxPrice) => {
  try {
    const allTutes = await getAllTutes();
    
    return allTutes.filter(tute => {
      const price = parseFloat(tute.price) || 0;
      return price >= minPrice && price <= maxPrice;
    });
  } catch (error) {
    console.error('Error filtering tutorials by price range:', error);
    throw error;
  }
};

/**
 * Check if the tutorial API is accessible
 * @returns {Promise<boolean>}
 */
export const checkTuteApiAccess = async () => {
  try {
    console.log('Checking tutorial API access...');
    // Try to get tutorials as a test
    const response = await api.get('/tutor/tutes');
    console.log('API access check response:', response);
    
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    console.error('Error checking tutorial API access:', error);
    return false;
  }
};

/**
 * Diagnostic function to check specific API endpoints
 * @param {string} method - HTTP method to test (GET, POST, PUT, DELETE)
 * @param {string} endpoint - API endpoint to test
 * @param {Object} data - Optional data to send with the request
 * @returns {Promise<Object>} Response object with success flag and details
 */
export const diagnoseTuteEndpoint = async (method, endpoint, data = null) => {
  try {
    console.log(`Testing API endpoint with ${method}: ${endpoint}`);
    let response;
    
    switch (method.toUpperCase()) {
      case 'GET':
        response = await api.get(endpoint);
        break;
      case 'POST':
        response = await api.post(endpoint, data);
        break;
      case 'PUT':
        response = await api.put(endpoint, data);
        break;
      case 'DELETE':
        response = await api.delete(endpoint);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
    
    console.log(`API test response for ${endpoint}:`, response);
    
    return {
      success: response.status >= 200 && response.status < 300,
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers
    };
  } catch (error) {
    console.error(`Error testing API endpoint ${endpoint}:`, error);
    return {
      success: false,
      error: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    };
  }
};

export default {
  getAllTutes,
  getTuteById,
  getTutesByTutorId,
  getPublishedTutes,
  createTute,
  updateTute,
  deleteTute,
  searchTutes,
  toggleTutePublishedStatus,
  bulkDeleteTutes,
  getTutesBySubject,
  getTutesSortedByPrice,
  getUniqueSubjects,
  getTutesByPriceRange,
  checkTuteApiAccess,
  diagnoseTuteEndpoint
};
