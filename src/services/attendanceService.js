import api from './api';
import { getStudentById } from './studentService';

const BASE_URL = '/attendance';

/**
 * Get all attendance records with full student information
 * @returns {Promise<Array>} Promise that resolves to an array of attendance records with student details
 */
export const getAllAttendanceRecords = async () => {
  try {
    // Get the current role and token
    const userRole = localStorage.getItem('userRole');
    const token = localStorage.getItem('token');
    
    // Always normalize role to uppercase
    const normalizedRole = userRole ? userRole.toUpperCase() : 'TUTOR';
    
    // Add additional headers to ensure authorization works
    const headers = {
      'Authorization': `Bearer ${token}`,
      'X-User-Role': normalizedRole
    };
    
    console.log('Fetching attendance records with role:', normalizedRole);
    
    // Try the endpoint with role parameter first for better compatibility
    try {
      const response = await api.get(`${BASE_URL}?role=${normalizedRole}`, { headers });
      
      // Check if we have valid data 
      if (response.status === 200 && response.data && Array.isArray(response.data)) {
        console.log('Successfully fetched attendance records with role parameter:', response.data.length);
        return await enhanceAttendanceRecordsWithStudentData(response.data);
      }
    } catch (innerError) {
      console.warn('Failed to fetch with role parameter, trying standard endpoint');
    }
    
    // Fall back to standard endpoint
    const response = await api.get(BASE_URL, { headers });
    
    if (response.status === 403) {
      console.warn('Access forbidden (403) when fetching attendance records. Try setting proper role in your account.');
      return [];
    }
    
    // Check if we have valid data 
    if (!response.data || !Array.isArray(response.data)) {
      console.warn('Invalid attendance data received:', response.data);
      return [];
    }
    
    // Enhance records with student data
    return await enhanceAttendanceRecordsWithStudentData(response.data);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    // Return empty array instead of throwing to prevent component crashes
    return [];
  }
};

/**
 * Get attendance record by ID
 * @param {number} id - The attendance ID
 * @returns {Promise<Object>} Promise that resolves to the attendance record
 */
export const getAttendanceById = async (id) => {
  try {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching attendance record ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new attendance record
 * @param {Object} attendance - The attendance record data
 * @returns {Promise<Object>} Promise that resolves to the created attendance record
 */
export const createAttendance = async (attendance) => {
  try {
    // Make sure the date is properly formatted
    if (attendance.date && typeof attendance.date === 'string') {
      // Ensure date is in ISO format
      if (!attendance.date.includes('T')) {
        attendance.date = new Date(attendance.date).toISOString().split('T')[0];
      }
    }
    
    // Add creator ID to request
    const enhancedAttendance = {
      ...attendance,
      createdBy: localStorage.getItem('userId') || undefined
    };
    
    console.log('Sending attendance data to server:', enhancedAttendance);
    const response = await api.post(BASE_URL, enhancedAttendance);
    
    return response.data;
  } catch (error) {
    console.error('Error creating attendance record:', error);
    throw error;
  }
};

/**
 * Update an existing attendance record
 * @param {number} id - The attendance ID
 * @param {Object} attendance - The updated attendance record data
 * @returns {Promise<Object>} Promise that resolves to the updated attendance record
 */
export const updateAttendance = async (id, attendance) => {
  try {
    const response = await api.put(`${BASE_URL}/${id}`, attendance);
    return response.data;
  } catch (error) {
    console.error(`Error updating attendance record ${id}:`, error);
    throw error;
  }
};

/**
 * Delete an attendance record
 * @param {number} id - The attendance ID to delete
 * @returns {Promise<void>}
 */
export const deleteAttendance = async (id) => {
  try {
    await api.delete(`${BASE_URL}/${id}`);
  } catch (error) {
    console.error(`Error deleting attendance record ${id}:`, error);
    throw error;
  }
};

/**
 * Submit bulk attendance records
 * @param {Array<Object>} attendanceRecords - Array of attendance records
 * @returns {Promise<Array>} Promise that resolves to the created attendance records
 */
export const bulkCreateAttendance = async (attendanceRecords) => {
  try {
    // This endpoint would need to be implemented on the backend
    const response = await api.post(`${BASE_URL}/bulk`, attendanceRecords);
    return response.data;
  } catch (error) {
    console.error('Error submitting bulk attendance:', error);
    throw error;
  }
};

/**
 * Get attendance statistics for a date range
 * @param {string} startDate - The start date in ISO format
 * @param {string} endDate - The end date in ISO format
 * @param {number} classId - Optional class ID for filtering
 * @returns {Promise<Object>} Promise that resolves to the attendance statistics
 */
export const getAttendanceStats = async (startDate, endDate, classId = null) => {
  try {
    // This endpoint would need to be implemented on the backend
    const url = classId 
      ? `${BASE_URL}/stats?startDate=${startDate}&endDate=${endDate}&classId=${classId}`
      : `${BASE_URL}/stats?startDate=${startDate}&endDate=${endDate}`;
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance statistics:', error);
    throw error;
  }
};

/**
 * Enhance attendance records with full student information
 * @param {Array} records - Raw attendance records from the API
 * @returns {Promise<Array>} - Enhanced records with student details
 */
const enhanceAttendanceRecordsWithStudentData = async (records) => {
  try {
    if (!records || !Array.isArray(records)) {
      console.warn('Invalid records data provided to enhancer:', records);
      return [];
    }
    
    // Create a map to cache student data and avoid duplicate requests
    const studentCache = new Map();
    
    // Process all records asynchronously
    const enhancedRecords = await Promise.all(records.map(async (record) => {
      if (!record.studentId) {
        console.warn('Attendance record missing studentId:', record);
        return record;
      }
      
      try {
        // Check if we already fetched this student
        if (!studentCache.has(record.studentId)) {
          const studentData = await getStudentById(record.studentId);
          studentCache.set(record.studentId, studentData);
        }
        
        const student = studentCache.get(record.studentId);
        
        // Return enhanced record with student data
        return {
          ...record,
          student: student,
          studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'
        };
      } catch (err) {
        console.warn(`Could not fetch student data for ID ${record.studentId}:`, err);
        return {
          ...record,
          student: null,
          studentName: `Student #${record.studentId}`
        };
      }
    }));
    
    return enhancedRecords;
  } catch (error) {
    console.error('Error enhancing attendance records with student data:', error);
    return records; // Fall back to original records if enhancement fails
  }
};