import api from './api';

/**
 * Add a new fee reminder
 * Connects to: POST /tutor/fee-reminders
 * @param {Object} reminder - Fee reminder data object
 * @returns {Promise<Object>} Created fee reminder with ID
 */
export const addReminder = async (reminder) => {
  try {
    // Check if user is authenticated
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      throw new Error("Authentication required. Please log in.");
    }

    // Validate required fields based on backend model
    if (!reminder.student || !reminder.student.id) {
      throw new Error("Student is required");
    }
    
    if (!reminder.reminderDate) {
      throw new Error("Reminder date is required");
    }
    
    // Ensure date is a valid date
    const reminderDate = new Date(reminder.reminderDate);
    if (isNaN(reminderDate.getTime())) {
      throw new Error("Invalid reminder date format");
    }
    
    // Build payload according to backend model
    const payload = {
      student: {
        id: reminder.student.id
      },
      reminderDate: reminderDate.toISOString(),
      message: reminder.message || ""
    };
    
    console.log("Final validated payload being sent:", payload);
    console.log("Authentication token present:", !!token);
    
    const response = await api.post('/tutor/fee-reminders', payload);
    
    if (!response.data) {
      console.error("Server returned empty response");
      throw new Error("Server returned empty response");
    }
    
    console.log("Server response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding fee reminder:', error);
    
    // Handle specific error cases
    if (error.response?.status === 403) {
      const errorMessage = "Access denied. Please ensure you are logged in as a tutor.";
      console.error("403 Forbidden:", errorMessage);
      throw new Error(errorMessage);
    } else if (error.response?.status === 401) {
      const errorMessage = "Authentication failed. Please log in again.";
      console.error("401 Unauthorized:", errorMessage);
      // Optionally redirect to login
      // window.location.href = '/auth/login';
      throw new Error(errorMessage);
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    
    throw error;
  }
};

/**
 * Update a fee reminder
 * Connects to: PUT /tutor/fee-reminders/{id}
 * @param {string|number} reminderId - ID of the fee reminder to update
 * @param {Object} reminder - Updated fee reminder data
 * @returns {Promise<Object>} Updated fee reminder object
 */
export const updateReminder = async (reminderId, reminder) => {
  try {
    // Check authentication
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      throw new Error("Authentication required. Please log in.");
    }

    // Build payload according to backend model
    const payload = {
      student: {
        id: reminder.student.id
      },
      reminderDate: new Date(reminder.reminderDate).toISOString(),
      message: reminder.message || ""
    };
    
    const response = await api.put(`/tutor/fee-reminders/${reminderId}`, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating fee reminder:', error);
    
    if (error.response?.status === 403) {
      throw new Error("Access denied. You can only update your own reminders.");
    } else if (error.response?.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    }
    
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
    // Check authentication
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      throw new Error("Authentication required. Please log in.");
    }

    const response = await api.get('/tutor/fee-reminders');
    return response.data;
  } catch (error) {
    console.error('Error fetching fee reminders:', error);
    
    if (error.response?.status === 403) {
      throw new Error("Access denied. Please ensure you are logged in as a tutor.");
    } else if (error.response?.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    }
    
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
    } else if (error.response?.status === 403) {
      throw new Error("Access denied. You can only view your own reminders.");
    } else if (error.response?.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
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
    } else if (error.response?.status === 403) {
      throw new Error("Access denied. You can only delete your own reminders.");
    } else if (error.response?.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    }
    console.error('Error deleting fee reminder:', error);
    throw error;
  }
};

/**
 * Get fee reminders by student ID
 * Client-side filtering since backend doesn't have specific endpoint
 * @param {string|number} studentId - ID of the student
 * @returns {Promise<Array>} List of fee reminders for the specified student
 */
export const getRemindersByStudentId = async (studentId) => {
  try {
    const allReminders = await getAllReminders();
    return allReminders.filter(reminder => 
      reminder.student && reminder.student.id && 
      reminder.student.id.toString() === studentId.toString()
    );
  } catch (error) {
    console.error('Error fetching fee reminders for student:', error);
    throw error;
  }
};

// Export all methods
const feeReminderService = {
  addReminder,
  updateReminder,
  getAllReminders,
  getReminderById,
  deleteReminder,
  getRemindersByStudentId
};

export default feeReminderService;
