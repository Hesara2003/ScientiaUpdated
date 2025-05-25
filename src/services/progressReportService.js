import api from './api';

/**
 * Add a new progress report
 * Connects to: POST /tutor/progress-reports
 * @param {Object} report - Progress report data object
 * @returns {Promise<Object>} Created report with ID
 */
export const addProgressReport = async (report) => {
  try {
    const response = await api.post('/tutor/progress-reports', report, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error adding progress report:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get all progress reports
 * Connects to: GET /tutor/progress-reports
 * @returns {Promise<Array>} List of progress report objects
 */
export const getAllProgressReports = async () => {
  try {
    const response = await api.get('/tutor/progress-reports', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching progress reports:', error);
    throw error;
  }
};

/**
 * Get a progress report by ID
 * Connects to: GET /tutor/progress-reports/{id}
 * @param {string|number} reportId - ID of the report to retrieve
 * @returns {Promise<Object>} Progress report object
 */
export const getProgressReportById = async (reportId) => {
  try {
    const response = await api.get(`/tutor/progress-reports/${reportId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching progress report details:', error);
    throw error;
  }
};

/**
 * Delete a progress report by ID
 * Connects to: DELETE /tutor/progress-reports/{id}
 * @param {string|number} reportId - ID of the report to delete
 * @returns {Promise<void>} No return value
 */
export const deleteProgressReport = async (reportId) => {
  try {
    await api.delete(`/tutor/progress-reports/${reportId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
  } catch (error) {
    console.error('Error deleting progress report:', error);
    throw error;
  }
};

/**
 * Test function to add a progress report with your JSON format
 * @returns {Promise<Object>} Created report with ID
 */
export const testAddProgressReport = async () => {
  const progressReportData = {
    studentId: 1,
    classEntityId: 2,
    attendancePercentage: 95.0,
    averageScore: 88.5,
    generatedAt: "2025-05-25T14:30:00"
  };

  try {
    console.log('Sending progress report:', progressReportData);
    const result = await addProgressReport(progressReportData);
    console.log('Progress report created successfully:', result);
    return result;
  } catch (error) {
    console.error('Failed to create progress report:', error);
    throw error;
  }
};

// Export all methods
export default {
  addProgressReport,
  getAllProgressReports,
  getProgressReportById,
  deleteProgressReport,
  testAddProgressReport
};
