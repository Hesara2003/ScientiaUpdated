import api from './api';

/**
 * Add a new parent
 * Connects to: POST /parent/parents
 * @param {Object} parent - Parent data object
 * @returns {Promise<Object>} Created parent with ID
 */
export const addParent = async (parent) => {
  try {
    const response = await api.post('/parent/parents', parent);
    return response.data;
  } catch (error) {
    console.error('Error adding parent:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get all parents
 * Connects to: GET /parent/parents
 * @returns {Promise<Array>} List of parent objects
 */
export const getAllParents = async () => {
  try {
    const response = await api.get('/parent/parents');
    return response.data;
  } catch (error) {
    console.error('Error fetching parents:', error);
    throw error;
  }
};

/**
 * Get a parent by ID
 * Connects to: GET /parent/parents/{id}
 * @param {string|number} parentId - ID of the parent to retrieve
 * @returns {Promise<Object>} Parent object
 */
export const getParentById = async (parentId) => {
  try {
    // Check if parentId looks like a username (string that's not a number)
    if (isNaN(parentId) || typeof parentId === 'string' && /[a-zA-Z]/.test(parentId)) {
      // If it's a username, use the username endpoint
      const response = await api.get(`/parent/parents/username/${parentId}`);
      return response.data;
    } else {
      // If it's a numeric ID, use the original ID endpoint
      const response = await api.get(`/parent/parents/${parentId}`);
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching parent details:', error);
    throw error;
  }
};

/**
 * Delete a parent by ID
 * Connects to: DELETE /parent/parents/{id}
 * @param {string|number} parentId - ID of the parent to delete
 * @returns {Promise<boolean>} Success indicator
 */
export const deleteParent = async (parentId) => {
  try {
    await api.delete(`/parent/parents/${parentId}`);
    return true; // Success
  } catch (error) {
    console.error('Error deleting parent:', error);
    throw error;
  }
};

/**
 * Update a parent by ID
 * This is a helper method as the controller doesn't explicitly define an update endpoint
 * @param {string|number} parentId - ID of the parent to update
 * @param {Object} parentData - Updated parent data
 * @returns {Promise<Object>} Updated parent object
 */
export const updateParent = async (parentId, parentData) => {
  try {
    const response = await api.put(`/parent/parents/${parentId}`, parentData);
    return response.data;
  } catch (error) {
    console.error('Error updating parent:', error);
    throw error;
  }
};

/**
 * Search parents by name
 * This is a client-side filtering since the API doesn't directly support this
 * @param {string} searchTerm - Name to search for
 * @returns {Promise<Array>} List of parents matching the search term
 */
export const searchParentsByName = async (searchTerm) => {
  try {
    const allParents = await getAllParents();
    const term = searchTerm.toLowerCase();
    
    return allParents.filter(parent => {
      const fullName = `${parent.firstName} ${parent.lastName}`.toLowerCase();
      return fullName.includes(term);
    });
  } catch (error) {
    console.error('Error searching parents:', error);
    throw error;
  }
};

/**
 * Get children of a parent
 * Uses the parent-student service to get the relation data
 * @param {string|number} parentId - ID of the parent
 * @param {Function} getStudentById - Function to get student details by ID
 * @param {Function} getStudentsByParentId - Function to get student IDs by parent ID
 * @returns {Promise<Array>} List of student objects who are children of the parent
 */
export const getChildrenOfParent = async (parentId, getStudentById, getStudentsByParentId) => {
  try {
    // Check if the required functions are provided
    if (!getStudentsByParentId || !getStudentById) {
      throw new Error('Required functions not provided');
    }
    
    // Get IDs of all students associated with this parent
    const studentIds = await getStudentsByParentId(parentId);
    
    // Get full student details for each ID
    const students = await Promise.all(
      studentIds.map(id => getStudentById(id))
    );
    
    return students;
  } catch (error) {
    console.error('Error fetching children of parent:', error);
    throw error;
  }
};

// Export all methods
export default {
  addParent,
  getAllParents,
  getParentById,
  deleteParent,
  updateParent,
  searchParentsByName,
  getChildrenOfParent
};
