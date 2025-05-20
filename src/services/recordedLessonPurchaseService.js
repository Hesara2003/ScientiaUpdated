import api from './api';

/**
 * Purchase a recorded lesson
 * Connects to: POST /student/lesson-purchases
 * @param {Object} purchase - Recorded lesson purchase data object
 * @returns {Promise<Object>} Created purchase record with ID
 */
export const purchaseRecordedLesson = async (purchase) => {
  try {
    const response = await api.post('/student/lesson-purchases', purchase);
    return response.data;
  } catch (error) {
    console.error('Error purchasing recorded lesson:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get all recorded lesson purchases
 * Connects to: GET /student/lesson-purchases
 * @returns {Promise<Array>} List of recorded lesson purchase objects
 */
export const getAllRecordedLessonPurchases = async () => {
  try {
    const response = await api.get('/student/lesson-purchases');
    return response.data;
  } catch (error) {
    console.error('Error fetching recorded lesson purchases:', error);
    throw error;
  }
};

/**
 * Get a recorded lesson purchase by ID
 * Connects to: GET /student/lesson-purchases/{id}
 * @param {string|number} purchaseId - ID of the purchase to retrieve
 * @returns {Promise<Object>} Recorded lesson purchase object
 */
export const getRecordedLessonPurchaseById = async (purchaseId) => {
  try {
    const response = await api.get(`/student/lesson-purchases/${purchaseId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recorded lesson purchase details:', error);
    throw error;
  }
};

/**
 * Delete a recorded lesson purchase by ID
 * Connects to: DELETE /student/lesson-purchases/{id}
 * @param {string|number} purchaseId - ID of the purchase to delete
 * @returns {Promise<boolean>} Success indicator
 */
export const deleteRecordedLessonPurchase = async (purchaseId) => {
  try {
    await api.delete(`/student/lesson-purchases/${purchaseId}`);
    return true; // Success
  } catch (error) {
    console.error('Error deleting recorded lesson purchase:', error);
    throw error;
  }
};

/**
 * Get purchases by student ID
 * This is a client-side filtering since the API doesn't directly support this
 * @param {string|number} studentId - ID of the student
 * @returns {Promise<Array>} List of purchases for the specified student
 */
export const getLessonPurchasesByStudentId = async (studentId) => {
  try {
    const allPurchases = await getAllRecordedLessonPurchases();
    return allPurchases.filter(purchase => purchase.studentId.toString() === studentId.toString());
  } catch (error) {
    console.error('Error fetching lesson purchases for student:', error);
    throw error;
  }
};

/**
 * Get purchases by lesson ID
 * This is a client-side filtering since the API doesn't directly support this
 * @param {string|number} lessonId - ID of the recorded lesson
 * @returns {Promise<Array>} List of purchases for the specified lesson
 */
export const getLessonPurchasesByLessonId = async (lessonId) => {
  try {
    const allPurchases = await getAllRecordedLessonPurchases();
    return allPurchases.filter(purchase => purchase.lessonId.toString() === lessonId.toString());
  } catch (error) {
    console.error('Error fetching purchases for lesson:', error);
    throw error;
  }
};

/**
 * Check if a student has purchased a specific recorded lesson
 * @param {string|number} studentId - ID of the student
 * @param {string|number} lessonId - ID of the recorded lesson
 * @returns {Promise<boolean>} True if the student has purchased the lesson, false otherwise
 */
export const hasStudentPurchasedLesson = async (studentId, lessonId) => {
  try {
    const studentPurchases = await getLessonPurchasesByStudentId(studentId);
    return studentPurchases.some(purchase => 
      purchase.lessonId.toString() === lessonId.toString() && 
      purchase.status === 'COMPLETED'
    );
  } catch (error) {
    console.error('Error checking if student purchased lesson:', error);
    throw error;
  }
};

/**
 * Get all lessons purchased by a student
 * @param {string|number} studentId - ID of the student
 * @returns {Promise<Array>} Array of lessonIds purchased by the student
 */
export const getPurchasedLessonIds = async (studentId) => {
  try {
    const studentPurchases = await getLessonPurchasesByStudentId(studentId);
    return studentPurchases
      .filter(purchase => purchase.status === 'COMPLETED')
      .map(purchase => purchase.lessonId);
  } catch (error) {
    console.error('Error fetching purchased lesson IDs:', error);
    throw error;
  }
};

// Export all methods
export default {
  purchaseRecordedLesson,
  getAllRecordedLessonPurchases,
  getRecordedLessonPurchaseById,
  deleteRecordedLessonPurchase,
  getLessonPurchasesByStudentId,
  getLessonPurchasesByLessonId,
  hasStudentPurchasedLesson,
  getPurchasedLessonIds
};
