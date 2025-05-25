import api from './api';
import { getStudentById } from './studentService';

const BASE_URL = '/attendance';

/**
 * Get all attendance records with full student information
 * @returns {Promise<Array>} Promise that resolves to an array of attendance records with student details
 */
export const getAllAttendanceRecords = async () => {
  try {
    const userRole = localStorage.getItem('userRole');
    const token = localStorage.getItem('token');
    
    const normalizedRole = userRole ? userRole.toUpperCase() : 'TUTOR';
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'X-User-Role': normalizedRole
    };
    
    console.log('Fetching attendance records with role:', normalizedRole);
    
    const response = await api.get(BASE_URL, { headers });
    
    if (response.status === 403) {
      console.warn('Access forbidden (403) when fetching attendance records. Try setting proper role in your account.');
      return [];
    }
    
    console.log('Raw attendance response:', response.data);
    
    if (!response.data || !Array.isArray(response.data)) {
      console.warn('Invalid attendance data received:', response.data);
      return [];
    }
    
    const enhancedRecords = await enhanceAttendanceRecordsWithStudentData(response.data);
    console.log('Enhanced attendance records:', enhancedRecords);
    return enhancedRecords;
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    console.error('Error response:', error.response?.data);
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
    const attendanceData = {
      student: { studentId: attendance.studentId },
      classEntity: attendance.classId ? { classId: attendance.classId } : null,
      status: attendance.status || 'Present',
      date: attendance.date ? new Date(attendance.date).toISOString() : new Date().toISOString(),
      notes: attendance.notes || ''
    };
    
    console.log('Sending attendance data to server:', attendanceData);
    const response = await api.post(BASE_URL, attendanceData);
    
    console.log('Server response for created attendance:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating attendance record:', error);
    console.error('Error details:', error.response?.data);
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
    const attendanceData = {
      attendanceId: id,
      student: { studentId: attendance.studentId },
      classEntity: attendance.classId ? { classId: attendance.classId } : null,
      status: attendance.status,
      date: attendance.date ? new Date(attendance.date).toISOString() : null
    };
    
    const response = await api.put(`${BASE_URL}/${id}`, attendanceData);
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
    const formattedRecords = attendanceRecords.map(record => ({
      student: { studentId: record.studentId },
      classEntity: record.classId ? { classId: record.classId } : null,
      status: record.status || 'Present',
      date: record.date ? new Date(record.date).toISOString() : new Date().toISOString()
    }));
    
    const response = await api.post(`${BASE_URL}/bulk`, formattedRecords);
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
    
    const studentCache = new Map();
    
    const enhancedRecords = await Promise.all(records.map(async (record) => {
      const studentId = record.student?.studentId || record.studentId;
      
      if (!studentId) {
        console.warn('Attendance record missing studentId:', record);
        return {
          ...record,
          studentId: null,
          student: null,
          studentName: 'Unknown Student'
        };
      }
      
      try {
        if (!studentCache.has(studentId)) {
          const studentData = await getStudentById(studentId);
          studentCache.set(studentId, studentData);
        }
        
        const student = studentCache.get(studentId);
        
        return {
          ...record,
          studentId: studentId,
          student: student,
          studentName: student ? `${student.firstName} ${student.lastName}` : `Student #${studentId}`,
          // Add class information if available
          classId: record.classEntity?.classId || record.classId,
          className: record.classEntity?.className || null
        };
      } catch (err) {
        console.warn(`Could not fetch student data for ID ${studentId}:`, err);
        return {
          ...record,
          studentId: studentId,
          student: null,
          studentName: `Student #${studentId}`,
          classId: record.classEntity?.classId || record.classId,
          className: record.classEntity?.className || null
        };
      }
    }));
    
    return enhancedRecords;
  } catch (error) {
    console.error('Error enhancing attendance records with student data:', error);
    return records; 
  }
};