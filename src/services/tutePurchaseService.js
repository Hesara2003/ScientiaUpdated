import api from './api';

/**
 * Purchase a tute (tutorial)
 * Connects to: POST /student/tute-purchases
 * @param {Object} purchase - Tute purchase data object
 * @returns {Promise<Object>} Created purchase record with ID
 */
export const purchaseTute = async (purchase) => {
  try {
    const response = await api.post('/student/tute-purchases', purchase);
    return response.data;
  } catch (error) {
    console.error('Error purchasing tute:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get all tute purchases
 * Connects to: GET /student/tute-purchases
 * @returns {Promise<Array>} List of tute purchase objects
 */
export const getAllTutePurchases = async () => {
  try {
    const response = await api.get('/student/tute-purchases');
    return response.data;
  } catch (error) {
    console.error('Error fetching tute purchases:', error);
    throw error;
  }
};

/**
 * Get a tute purchase by ID
 * Connects to: GET /student/tute-purchases/{id}
 * @param {string|number} purchaseId - ID of the purchase to retrieve
 * @returns {Promise<Object>} Tute purchase object
 */
export const getTutePurchaseById = async (purchaseId) => {
  try {
    const response = await api.get(`/student/tute-purchases/${purchaseId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tute purchase details:', error);
    throw error;
  }
};

/**
 * Delete a tute purchase by ID
 * Connects to: DELETE /student/tute-purchases/{id}
 * @param {string|number} purchaseId - ID of the purchase to delete
 * @returns {Promise<boolean>} Success indicator
 */
export const deleteTutePurchase = async (purchaseId) => {
  try {
    await api.delete(`/student/tute-purchases/${purchaseId}`);
    return true; // Success
  } catch (error) {
    console.error('Error deleting tute purchase:', error);
    throw error;
  }
};

/**
 * Get purchases by student ID
 * This is a client-side filtering since the API doesn't directly support this
 * @param {string|number} studentId - ID of the student
 * @returns {Promise<Array>} List of purchases for the specified student
 */
export const getPurchasesByStudentId = async (studentId) => {
  try {
    const allPurchases = await getAllTutePurchases();
    return allPurchases.filter(purchase => purchase.studentId.toString() === studentId.toString());
  } catch (error) {
    console.error('Error fetching purchases for student:', error);
    throw error;
  }
};

/**
 * Get purchases by tute ID
 * This is a client-side filtering since the API doesn't directly support this
 * @param {string|number} tuteId - ID of the tute
 * @returns {Promise<Array>} List of purchases for the specified tute
 */
export const getPurchasesByTuteId = async (tuteId) => {
  try {
    const allPurchases = await getAllTutePurchases();
    return allPurchases.filter(purchase => purchase.tuteId.toString() === tuteId.toString());
  } catch (error) {
    console.error('Error fetching purchases for tute:', error);
    throw error;
  }
};

/**
 * Check if a student has purchased a specific tute
 * @param {string|number} studentId - ID of the student
 * @param {string|number} tuteId - ID of the tute
 * @returns {Promise<boolean>} True if the student has purchased the tute, false otherwise
 */
export const hasStudentPurchasedTute = async (studentId, tuteId) => {
  try {
    const studentPurchases = await getPurchasesByStudentId(studentId);
    return studentPurchases.some(purchase => 
      purchase.tuteId.toString() === tuteId.toString() && 
      purchase.status === 'COMPLETED'
    );
  } catch (error) {
    console.error('Error checking if student purchased tute:', error);
    throw error;
  }
};

// Export all methods
export default {
  purchaseTute,
  getAllTutePurchases,
  getTutePurchaseById,
  deleteTutePurchase,
  getPurchasesByStudentId,
  getPurchasesByTuteId,
  hasStudentPurchasedTute
};
