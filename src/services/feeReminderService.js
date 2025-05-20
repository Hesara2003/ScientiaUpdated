import api from './api';

/**
 * Add a new fee reminder
 * Connects to: POST /tutor/fee-reminders
 * @param {Object} reminder - Fee reminder data object
 * @returns {Promise<Object>} Created fee reminder with ID
 */
export const addReminder = async (reminder) => {
  try {
    // Enhanced validation with more specific error messages
    if (reminder.studentId === undefined || reminder.studentId === null || reminder.studentId === "") {
      throw new Error("Student ID is required");
    }
    
    // Ensure studentId is a valid number greater than zero
    const studentId = parseInt(reminder.studentId, 10);
    if (isNaN(studentId) || studentId <= 0) {
      throw new Error("Student ID must be a valid number");
    }
    
    if (reminder.amount === undefined || reminder.amount === null || reminder.amount === "") {
      throw new Error("Amount is required");
    }
    
    // Ensure amount is a valid number greater than zero
    const amount = parseFloat(reminder.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error("Amount must be a valid number greater than zero");
    }
    
    // Check due date
    if (!reminder.dueDate) {
      throw new Error("Due date is required");
    }
    
    // Ensure date is a valid date
    const dueDate = new Date(reminder.dueDate);
    if (isNaN(dueDate.getTime())) {
      throw new Error("Invalid due date format");
    }
    
    // Build a clean payload with explicit type conversion
    const payload = {
      studentId: studentId,
      amount: amount,
      dueDate: dueDate.toISOString(),
      message: reminder.message || "",
      resolved: Boolean(reminder.resolved)
    };
    
    console.log("Final validated payload being sent:", payload);
      const response = await api.post('/tutor/fee-reminders', payload);
    
    // Validate response data
    if (!response.data) {
      console.error("Server returned empty response");
      throw new Error("Server returned empty response");
    }
    
    // Validate that response has expected fields
    const responseData = response.data;
    if (!responseData.id && !responseData.reminderId) {
      console.error("Server response missing ID field:", responseData);
      throw new Error("Invalid server response: missing ID");
    }
    
    // If the response doesn't contain studentId, add it from our payload
    if (!responseData.studentId && responseData.id) {
      console.warn("Server response missing studentId, adding from request payload");
      responseData.studentId = payload.studentId;
    }
    
    console.log("Validated server response:", responseData);
    return responseData;
  } catch (error) {
    console.error('Error adding fee reminder:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get all fee reminders
 * Connects to: GET /tutor/fee-reminders
 * @returns {Promise<Array>} List of fee reminder objects
 */
export const getAllReminders = async () => {
  try {
    const response = await api.get('/tutor/fee-reminders');
    return response.data;
  } catch (error) {
    console.error('Error fetching fee reminders:', error);
    throw error;
  }
};

/**
 * Get a fee reminder by ID
 * Connects to: GET /tutor/fee-reminders/{id}
 * @param {string|number} reminderId - ID of the fee reminder to retrieve
 * @returns {Promise<Object>} Fee reminder object
 */
export const getReminderById = async (reminderId) => {
  try {
    const response = await api.get(`/tutor/fee-reminders/${reminderId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error(`Fee reminder with ID ${reminderId} not found`);
    }
    console.error('Error fetching fee reminder details:', error);
    throw error;
  }
};

/**
 * Delete a fee reminder by ID
 * Connects to: DELETE /tutor/fee-reminders/{id}
 * @param {string|number} reminderId - ID of the fee reminder to delete
 * @returns {Promise<boolean>} Success indicator
 */
export const deleteReminder = async (reminderId) => {
  try {
    await api.delete(`/tutor/fee-reminders/${reminderId}`);
    return true; // Success
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error(`Fee reminder with ID ${reminderId} not found`);
    }
    console.error('Error deleting fee reminder:', error);
    throw error;
  }
};

/**
 * Get fee reminders by student ID
 * This is a client-side filtering since the API doesn't directly support this
 * @param {string|number} studentId - ID of the student
 * @returns {Promise<Array>} List of fee reminders for the specified student
 */
export const getRemindersByStudentId = async (studentId) => {
  try {
    const allReminders = await getAllReminders();
    return allReminders.filter(reminder => 
      reminder.studentId && studentId && 
      reminder.studentId.toString() === studentId.toString()
    );
  } catch (error) {
    console.error('Error fetching fee reminders for student:', error);
    throw error;
  }
};

/**
 * Get active fee reminders
 * This is a client-side filtering for reminders that are not yet completed/resolved
 * @returns {Promise<Array>} List of active fee reminders
 */
export const getActiveReminders = async () => {
  try {
    const allReminders = await getAllReminders();
    return allReminders.filter(reminder => !reminder.resolved);
  } catch (error) {
    console.error('Error fetching active fee reminders:', error);
    throw error;
  }
};

/**
 * Mark a fee reminder as resolved
 * This is a helper method since the controller doesn't explicitly define an update endpoint
 * @param {string|number} reminderId - ID of the reminder to update
 * @param {boolean} resolved - Whether the reminder is resolved
 * @returns {Promise<Object>} Updated fee reminder object
 */
export const markReminderResolved = async (reminderId, resolved = true) => {
  try {
    // First get the current reminder data
    const reminder = await getReminderById(reminderId);
    
    // Update the resolved status
    reminder.resolved = resolved;
    
    // Use the PUT endpoint directly
    const response = await api.put(`/tutor/fee-reminders/${reminderId}`, reminder);
    return response.data;
  } catch (error) {
    console.error('Error updating fee reminder status:', error);
    throw error;
  }
};

// Export all methods
const feeReminderService = {
  addReminder,
  getAllReminders,
  getReminderById,
  deleteReminder,
  getRemindersByStudentId,
  getActiveReminders,
  markReminderResolved
};

export default feeReminderService;
