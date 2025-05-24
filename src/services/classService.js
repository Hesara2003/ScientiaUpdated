import api from './api';
import { callAdminApi, refreshApiToken } from '../utils/apiUtils';
import { safeArray } from '../utils/dataValidation';

// For DEV mode check
const isDev = () => {
  try {
    return import.meta.env.DEV === true;
  } catch (e) {
    return process.env.NODE_ENV === 'development';
  }
};

export const getAllClasses = async () => {
  try {
    await refreshApiToken();
    const response = await api.get('/classes');
    
    // Handle potential null or non-array response
    if (!response.data) {
      console.warn('No data returned for getAllClasses');
      return [];
    }
    
    const classesData = Array.isArray(response.data) ? response.data : [];
    
    if (!Array.isArray(response.data)) {
      console.warn(`Expected array but got ${typeof response.data} for getAllClasses`);
    }
    
    // Return raw backend data without additional normalization
    console.log(`Retrieved ${classesData.length} classes total`);
    return classesData;
  } catch (error) {
    console.error('Error fetching classes:', error);
    return []; // Return empty array instead of throwing
  }
};

export const getClassById = async (classId) => {
  try {
    await refreshApiToken();
    const response = await api.get(`/classes/${classId}`);
    
    if (!response.data) {
      console.warn(`No data returned for class ${classId}`);
      return null;
    }
    
    // Return raw backend data
    return response.data;
  } catch (error) {
    console.error(`Error fetching class ${classId}:`, error);
    return null; // Return null instead of throwing
  }
};

// These functions are not supported by your backend
export const getStudentsInClass = async (classId) => {
  console.warn('getStudentsInClass is not supported by the current backend');
  return [];
};

export const createClass = async (classData) => {
  try {
    await refreshApiToken();
    
    // Transform to match backend ClassEntity structure
    const backendData = {
      className: classData.className || classData.name,
      description: classData.description || '',
      tutor: classData.tutorId ? { tutorId: classData.tutorId } : null,
      price: classData.price ? parseFloat(classData.price) : 0
    };
    
    const response = await api.post('/classes', backendData);
    return response.data;
  } catch (error) {
    console.error('Error creating class:', error);
    throw error;
  }
};

// These functions are not supported by your backend
export const assignStudentToClass = async (classId, studentId) => {
  console.warn('assignStudentToClass is not supported by the current backend');
  throw new Error('Function not supported by current backend');
};

export const removeStudentFromClass = async (classId, studentId) => {
  console.warn('removeStudentFromClass is not supported by the current backend');
  throw new Error('Function not supported by current backend');
};

// Alias function for ClassDetailView.jsx
export const enrollStudentInClass = assignStudentToClass;

// Alias function for ClassDetailView.jsx
export const getEnrolledStudents = getStudentsInClass;

// Get classes by tutor ID - using your repository method
export const getClassesByTutorId = async (tutorId) => {
  try {
    await refreshApiToken();
    // Since there's no direct endpoint, filter from all classes
    const allClasses = await getAllClasses();
    return allClasses.filter(cls => cls.tutor && cls.tutor.tutorId === tutorId);
  } catch (error) {
    console.error(`Error fetching classes for tutor ${tutorId}:`, error);
    throw error;
  }
};

export const bulkEnrollStudents = async (studentId, classIds) => {
  console.warn('bulkEnrollStudents is not supported by the current backend');
  throw new Error('Function not supported by current backend');
};

// Update an existing class
export const updateClass = async (classId, classData) => {
  try {
    await refreshApiToken();
    
    // Transform to match backend ClassEntity structure
    const backendData = {
      classId: classId,
      className: classData.className || classData.name,
      description: classData.description || '',
      tutor: classData.tutorId ? { tutorId: classData.tutorId } : null,
      price: classData.price ? parseFloat(classData.price) : 0
    };
    
    const response = await api.put(`/classes/${classId}`, backendData);
    return response.data;
  } catch (error) {
    console.error(`Error updating class ${classId}:`, error);
    throw error;
  }
};

// Delete a class
export const deleteClass = async (classId) => {
  try {
    await refreshApiToken();
    await api.delete(`/classes/${classId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting class ${classId}:`, error);
    throw error;
  }
};

export const getClassesForStudent = async (studentId) => {
  console.warn('getClassesForStudent is not supported by the current backend');
  return [];
};

/**
 * Minimal normalization to ensure consistent field access
 * Maps backend ClassEntity fields to what frontend expects
 */
export const normalizeClassData = (classData) => {
  if (!classData) return null;
  
  return {
    // Backend fields
    classId: classData.classId,
    className: classData.className,
    description: classData.description,
    tutor: classData.tutor,
    price: classData.price,
    
    // Map to frontend expected fields for compatibility
    id: classData.classId,
    name: classData.className,
    tutorId: classData.tutor?.tutorId || null,
    tutorName: classData.tutor?.name || null
  };
};

// For backward compatibility with imports that use 'import classService from...'
const classService = {
  getAllClasses,
  getClassById,
  getStudentsInClass,
  createClass,
  assignStudentToClass,
  removeStudentFromClass,
  enrollStudentInClass,
  getEnrolledStudents,
  bulkEnrollStudents,
  getClassesByTutorId,
  updateClass,
  deleteClass,
  getClassesForStudent,
  normalizeClassData
};

export default classService;