import api from './api';

/**
 * Add a new student progress record
 * Connects to: POST /student/progress
 * @param {Object} progress - Student progress data object
 * @returns {Promise<Object>} Created progress object with ID
 */
export const addStudentProgress = async (progress) => {
  try {
    const response = await api.post('/student/progress', progress);
    return response.data;
  } catch (error) {
    console.error('Error adding student progress:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get all student progress records
 * Connects to: GET /student/progress
 * @returns {Promise<Array>} List of student progress objects
 */
export const getAllStudentProgress = async () => {
  try {
    const response = await api.get('/student/progress');
    return response.data;
  } catch (error) {
    console.error('Error fetching student progress records:', error);
    throw error;
  }
};

/**
 * Get a student progress record by ID
 * Connects to: GET /student/progress/{id}
 * @param {string|number} progressId - ID of the progress record to retrieve
 * @returns {Promise<Object>} Student progress object
 */
export const getStudentProgressById = async (progressId) => {
  try {
    const response = await api.get(`/student/progress/${progressId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching student progress details:', error);
    throw error;
  }
};

/**
 * Delete a student progress record by ID
 * Connects to: DELETE /student/progress/{id}
 * @param {string|number} progressId - ID of the progress record to delete
 * @returns {Promise<void>} No content on success
 */
export const deleteStudentProgress = async (progressId) => {
  try {
    await api.delete(`/student/progress/${progressId}`);
    return true; // Success
  } catch (error) {
    console.error('Error deleting student progress:', error);
    throw error;
  }
};

/**
 * Get student progress records for a specific student
 * @param {string|number} studentId - ID of the student
 * @returns {Promise<Array>} List of progress records for the student
 */
export const getProgressByStudentId = async (studentId) => {
  try {
    // Since the endpoint doesn't directly support filtering by student ID,
    // we'll get all records and filter on the client side
    const allProgress = await getAllStudentProgress();
    return allProgress.filter(progress => progress.studentId.toString() === studentId.toString());
  } catch (error) {
    console.error('Error fetching progress for student:', error);
    throw error;
  }
};

// Export all methods
export default {
  addStudentProgress,
  getAllStudentProgress,
  getStudentProgressById,
  deleteStudentProgress,
  getProgressByStudentId
};
