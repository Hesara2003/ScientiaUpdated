import api from './api';

/**
 * Add a new progress report
 * Connects to: POST /tutor/progress-reports
 * @param {Object} report - Progress report data object
 * @returns {Promise<Object>} Created report with ID
 */
export const addProgressReport = async (report) => {
  try {
    const response = await api.post('/tutor/progress-reports', report);
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
    const response = await api.get('/tutor/progress-reports');
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
    const response = await api.get(`/tutor/progress-reports/${reportId}`);
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
 * @returns {Promise<boolean>} Success indicator
 */
export const deleteProgressReport = async (reportId) => {
  try {
    await api.delete(`/tutor/progress-reports/${reportId}`);
    return true; // Success
  } catch (error) {
    console.error('Error deleting progress report:', error);
    throw error;
  }
};

/**
 * Get reports by student ID
 * This is a client-side filtering since the API doesn't directly support this
 * @param {string|number} studentId - ID of the student
 * @returns {Promise<Array>} List of progress reports for the specified student
 */
export const getReportsByStudentId = async (studentId) => {
  try {
    const allReports = await getAllProgressReports();
    return allReports.filter(report => report.studentId.toString() === studentId.toString());
  } catch (error) {
    console.error('Error fetching progress reports for student:', error);
    throw error;
  }
};

/**
 * Get reports by tutor ID
 * This is a client-side filtering since the API doesn't directly support this
 * @param {string|number} tutorId - ID of the tutor
 * @returns {Promise<Array>} List of progress reports created by the specified tutor
 */
export const getReportsByTutorId = async (tutorId) => {
  try {
    const allReports = await getAllProgressReports();
    return allReports.filter(report => report.tutorId.toString() === tutorId.toString());
  } catch (error) {
    console.error('Error fetching progress reports by tutor:', error);
    throw error;
  }
};

/**
 * Get reports by subject ID
 * This is a client-side filtering since the API doesn't directly support this
 * @param {string|number} subjectId - ID of the subject
 * @returns {Promise<Array>} List of progress reports for the specified subject
 */
export const getReportsBySubjectId = async (subjectId) => {
  try {
    const allReports = await getAllProgressReports();
    return allReports.filter(report => report.subjectId.toString() === subjectId.toString());
  } catch (error) {
    console.error('Error fetching progress reports for subject:', error);
    throw error;
  }
};

/**
 * Get latest reports for each student
 * Returns the most recent progress report for each student
 * @returns {Promise<Array>} List of the most recent progress report for each student
 */
export const getLatestReportsForStudents = async () => {
  try {
    const allReports = await getAllProgressReports();
    
    // Group reports by student ID
    const reportsByStudent = allReports.reduce((acc, report) => {
      const studentId = report.studentId.toString();
      if (!acc[studentId]) {
        acc[studentId] = [];
      }
      acc[studentId].push(report);
      return acc;
    }, {});
    
    // Get the latest report for each student
    return Object.values(reportsByStudent).map(studentReports => {
      return studentReports.sort((a, b) => {
        return new Date(b.reportDate) - new Date(a.reportDate);
      })[0]; // Return the most recent report
    });
  } catch (error) {
    console.error('Error fetching latest progress reports:', error);
    throw error;
  }
};

// Export all methods
export default {
  addProgressReport,
  getAllProgressReports,
  getProgressReportById,
  deleteProgressReport,
  getReportsByStudentId,
  getReportsByTutorId,
  getReportsBySubjectId,
  getLatestReportsForStudents
};
