import api from './api';

/**
 * Add a new FAQ
 * Connects to: POST /public/faqs
 * @param {Object} faq - FAQ data object
 * @returns {Promise<Object>} Created FAQ with ID
 */
export const addFaq = async (faq) => {
  try {
    const response = await api.post('/public/faqs', faq);
    return response.data;
  } catch (error) {
    console.error('Error adding FAQ:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get all FAQs
 * Connects to: GET /public/faqs
 * @returns {Promise<Array>} List of FAQ objects
 */
export const getAllFaqs = async () => {
  try {
    const response = await api.get('/public/faqs');
    return response.data;
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    throw error;
  }
};

/**
 * Get a FAQ by ID
 * Connects to: GET /public/faqs/{id}
 * @param {string|number} faqId - ID of the FAQ to retrieve
 * @returns {Promise<Object>} FAQ object
 */
export const getFaqById = async (faqId) => {
  try {
    const response = await api.get(`/public/faqs/${faqId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error(`FAQ with ID ${faqId} not found`);
    }
    console.error('Error fetching FAQ details:', error);
    throw error;
  }
};

/**
 * Delete a FAQ by ID
 * Connects to: DELETE /public/faqs/{id}
 * @param {string|number} faqId - ID of the FAQ to delete
 * @returns {Promise<boolean>} Success indicator
 */
export const deleteFaq = async (faqId) => {
  try {
    await api.delete(`/public/faqs/${faqId}`);
    return true; // Success
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error(`FAQ with ID ${faqId} not found`);
    }
    console.error('Error deleting FAQ:', error);
    throw error;
  }
};

/**
 * Update a FAQ by ID
 * This is a helper method since the controller doesn't explicitly define an update endpoint
 * @param {string|number} faqId - ID of the FAQ to update
 * @param {Object} faqData - Updated FAQ data
 * @returns {Promise<Object>} Updated FAQ object
 */
export const updateFaq = async (faqId, faqData) => {
  try {
    const response = await api.put(`/public/faqs/${faqId}`, faqData);
    return response.data;
  } catch (error) {
    console.error('Error updating FAQ:', error);
    throw error;
  }
};

/**
 * Search FAQs by question or keywords
 * This is a client-side filtering since the API doesn't directly support this
 * @param {string} searchTerm - Text to search for in questions or answers
 * @returns {Promise<Array>} List of FAQs matching the search term
 */
export const searchFaqs = async (searchTerm) => {
  try {
    const allFaqs = await getAllFaqs();
    const term = searchTerm.toLowerCase();
    
    return allFaqs.filter(faq => {
      const question = faq.question?.toLowerCase() || '';
      const answer = faq.answer?.toLowerCase() || '';
      return question.includes(term) || answer.includes(term);
    });
  } catch (error) {
    console.error('Error searching FAQs:', error);
    throw error;
  }
};

/**
 * Get FAQs by category
 * This is a client-side filtering since the API doesn't directly support this
 * @param {string} category - Category to filter by
 * @returns {Promise<Array>} List of FAQs in the specified category
 */
export const getFaqsByCategory = async (category) => {
  try {
    const allFaqs = await getAllFaqs();
    return allFaqs.filter(faq => 
      faq.category?.toLowerCase() === category.toLowerCase()
    );
  } catch (error) {
    console.error('Error fetching FAQs by category:', error);
    throw error;
  }
};

// Export all methods
export default {
  addFaq,
  getAllFaqs,
  getFaqById,
  deleteFaq,
  updateFaq,
  searchFaqs,
  getFaqsByCategory
};
