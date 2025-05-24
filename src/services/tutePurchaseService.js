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

/**
 * Get all purchased tute IDs for a student
 * @param {string|number} studentId - ID of the student
 * @returns {Promise<Array>} Array of tute IDs purchased by the student
 */
export const getPurchasedTuteIds = async (studentId) => {
  try {
    const studentPurchases = await getPurchasesByStudentId(studentId);
    return studentPurchases
      .filter(purchase => purchase.status === 'COMPLETED')
      .map(purchase => purchase.tuteId);
  } catch (error) {
    console.error('Error fetching purchased tute IDs:', error);
    throw error;
  }
};

/**
 * Get purchases by parent ID (getting purchases for all children of a parent)
 * @param {string|number} parentId - ID of the parent
 * @param {Array} studentIds - Array of student IDs who are children of the parent
 * @returns {Promise<Array>} List of purchases for all children of the parent
 */
export const getPurchasesByParentId = async (parentId, studentIds) => {
  try {
    const allPurchases = await getAllTutePurchases();
    return allPurchases.filter(purchase => 
      studentIds.includes(purchase.studentId.toString())
    );
  } catch (error) {
    console.error('Error fetching purchases for parent:', error);
    throw error;
  }
};

// Cart functionality

/**
 * Get cart items from local storage
 * @param {string|number} userId - ID of the user (student or parent)
 * @returns {Array} Array of cart items
 */
export const getCartItems = (userId) => {
  const cartKey = `tuteCart_${userId}`;
  const cartItems = localStorage.getItem(cartKey);
  return cartItems ? JSON.parse(cartItems) : [];
};

/**
 * Add item to cart
 * @param {string|number} userId - ID of the user (student or parent)
 * @param {Object} tute - Tutorial to add to cart
 * @param {string|number} studentId - ID of the student (same as userId for students, child ID for parents)
 * @returns {Array} Updated cart items
 */
export const addToCart = (userId, tute, studentId) => {
  const cartKey = `tuteCart_${userId}`;
  const cartItems = getCartItems(userId);
  
  // Check if already in cart
  const existingItemIndex = cartItems.findIndex(item => 
    item.tuteId === tute.id && item.studentId === studentId
  );
  
  if (existingItemIndex >= 0) {
    return cartItems; // Already in cart
  }
  
  const newItem = {
    tuteId: tute.id,
    title: tute.title,
    price: tute.price,
    studentId: studentId,
    addedAt: new Date().toISOString()
  };
  
  const updatedCart = [...cartItems, newItem];
  localStorage.setItem(cartKey, JSON.stringify(updatedCart));
  
  return updatedCart;
};

/**
 * Remove item from cart
 * @param {string|number} userId - ID of the user (student or parent)
 * @param {string|number} tuteId - ID of the tutorial to remove
 * @param {string|number} studentId - ID of the student
 * @returns {Array} Updated cart items
 */
export const removeFromCart = (userId, tuteId, studentId) => {
  const cartKey = `tuteCart_${userId}`;
  const cartItems = getCartItems(userId);
  
  const updatedCart = cartItems.filter(item => 
    !(item.tuteId === tuteId && item.studentId === studentId)
  );
  
  localStorage.setItem(cartKey, JSON.stringify(updatedCart));
  
  return updatedCart;
};

/**
 * Clear cart
 * @param {string|number} userId - ID of the user (student or parent)
 */
export const clearCart = (userId) => {
  const cartKey = `tuteCart_${userId}`;
  localStorage.removeItem(cartKey);
  return [];
};

/**
 * Calculate cart total
 * @param {string|number} userId - ID of the user (student or parent)
 * @returns {number} Total price of items in cart
 */
export const getCartTotal = (userId) => {
  const cartItems = getCartItems(userId);
  return cartItems.reduce((total, item) => total + parseFloat(item.price), 0);
};

/**
 * Process payment for cart items (dummy implementation)
 * @param {string|number} userId - ID of the user (student or parent)
 * @param {Object} paymentDetails - Payment details object with card info
 * @returns {Promise<Object>} Payment result
 */
export const processPayment = async (userId, paymentDetails) => {
  try {
    // Simulate API call for payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, you would call a payment gateway API here
    const cartItems = getCartItems(userId);
    const total = getCartTotal(userId);
    
    // For demo purposes, we'll consider the payment successful
    const paymentResult = {
      success: true,
      transactionId: `TRANS-${Date.now()}`,
      amount: total,
      date: new Date().toISOString(),
      items: cartItems
    };
    
    // Clear cart after successful payment
    clearCart(userId);
    
    return paymentResult;
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
};

/**
 * Checkout and create purchases for all cart items
 * @param {string|number} userId - ID of the user (student or parent)
 * @param {Object} paymentResult - Result from payment processing
 * @returns {Promise<Array>} Array of created purchase objects
 */
export const checkoutCart = async (userId, paymentResult) => {
  try {
    const cartItems = paymentResult.items;
    const purchases = [];
    
    // Create purchase records for each cart item
    for (const item of cartItems) {
      const purchaseData = {
        studentId: item.studentId,
        tuteId: item.tuteId,
        price: item.price,
        purchaseDate: new Date().toISOString(),
        status: 'COMPLETED',
        transactionId: paymentResult.transactionId
      };
      
      const purchase = await purchaseTute(purchaseData);
      purchases.push(purchase);
    }
    
    return purchases;
  } catch (error) {
    console.error('Error checking out cart:', error);
    throw error;
  }
};

// Update the default export to include new methods
export default {
  purchaseTute,
  getAllTutePurchases,
  getTutePurchaseById,
  deleteTutePurchase,
  getPurchasesByStudentId,
  getPurchasesByTuteId,
  hasStudentPurchasedTute,
  getPurchasedTuteIds,
  getPurchasesByParentId,
  getCartItems,
  addToCart,
  removeFromCart,
  clearCart,
  getCartTotal,
  processPayment,
  checkoutCart
};
