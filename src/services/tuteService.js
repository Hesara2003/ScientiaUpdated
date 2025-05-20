import api from './api';

/**
 * Add a new tute (tutorial)
 * Connects to: POST /tutor/tutes
 * @param {Object} tute - Tute data object
 * @returns {Promise<Object>} Created tute object with ID
 */
export const addTute = async (tute) => {
  try {
    const response = await api.post('/tutor/tutes', tute);
    return response.data;
  } catch (error) {
    console.error('Error adding tute:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get all tutes (tutorials)
 * Connects to: GET /tutor/tutes
 * @returns {Promise<Array>} List of tute objects
 */
export const getAllTutes = async () => {
  try {
    const response = await api.get('/tutor/tutes');
    return response.data;
  } catch (error) {
    console.error('Error fetching tutes:', error);
    throw error;
  }
};

/**
 * Get a tute by ID
 * Connects to: GET /tutor/tutes/{id}
 * @param {string|number} tuteId - ID of the tute to retrieve
 * @returns {Promise<Object>} Tute object
 */
export const getTuteById = async (tuteId) => {
  try {
    const response = await api.get(`/tutor/tutes/${tuteId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tute details:', error);
    throw error;
  }
};

/**
 * Delete a tute by ID
 * Connects to: DELETE /tutor/tutes/{id}
 * @param {string|number} tuteId - ID of the tute to delete
 * @returns {Promise<boolean>} Success indicator
 */
export const deleteTute = async (tuteId) => {
  try {
    await api.delete(`/tutor/tutes/${tuteId}`);
    return true; // Success
  } catch (error) {
    console.error('Error deleting tute:', error);
    throw error;
  }
};

/**
 * Update an existing tute
 * Connects to: PUT /tutor/tutes/{id}
 * @param {string|number} tuteId - ID of the tute to update
 * @param {Object} tuteData - Updated tute data
 * @returns {Promise<Object>} Updated tute object
 */
export const updateTute = async (tuteId, tuteData) => {
  try {
    const response = await api.put(`/tutor/tutes/${tuteId}`, tuteData);
    return response.data;
  } catch (error) {
    console.error('Error updating tute:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get tutes by tutor ID
 * This is a client-side filtering since the API doesn't directly support this
 * @param {string|number} tutorId - ID of the tutor
 * @returns {Promise<Array>} List of tutes for the specified tutor
 */
export const getTutesByTutorId = async (tutorId) => {
  try {
    const allTutes = await getAllTutes();
    return allTutes.filter(tute => tute.tutorId.toString() === tutorId.toString());
  } catch (error) {
    console.error('Error fetching tutes for tutor:', error);
    throw error;
  }
};

/**
 * Get tutes by array of IDs
 * @param {Array<string|number>} tuteIds - Array of tute IDs to retrieve
 * @returns {Promise<Array>} Array of tute objects
 */
export const getTutesByIds = async (tuteIds) => {
  try {
    // Map each ID to a promise that fetches the tute
    const promises = tuteIds.map(id => getTuteById(id));
    
    // Wait for all promises to resolve
    const tutes = await Promise.all(promises);
    
    return tutes;
  } catch (error) {
    console.error('Error fetching tutes by IDs:', error);
    throw error;
  }
};

/**
 * Get tutes by subject ID
 * This is a client-side filtering since the API doesn't directly support this
 * @param {string|number} subjectId - ID of the subject
 * @returns {Promise<Array>} List of tutes for the specified subject
 */
export const getTutesBySubjectId = async (subjectId) => {
  try {
    const allTutes = await getAllTutes();
    return allTutes.filter(tute => tute.subjectId.toString() === subjectId.toString());
  } catch (error) {
    console.error('Error fetching tutes for subject:', error);
    throw error;
  }
};

// Export all methods
export default {
  addTute,
  getAllTutes,
  getTuteById,
  deleteTute,
  updateTute,
  getTutesByTutorId,
  getTutesBySubjectId,
  getTutesByIds
};
