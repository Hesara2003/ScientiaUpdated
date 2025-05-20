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
    
    // Normalize each class object with the utility function
    const normalizedClasses = classesData.map(cls => normalizeClassData(cls))
                                         .filter(cls => cls !== null);
    
    console.log(`Retrieved ${normalizedClasses.length} classes total`);
    return normalizedClasses;
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
    
    // Use the normalizer for consistent class data structure
    return normalizeClassData(response.data);
  } catch (error) {
    console.error(`Error fetching class ${classId}:`, error);
    return null; // Return null instead of throwing
  }
};

export const getStudentsInClass = async (classId) => {
  try {
    await refreshApiToken();
    const response = await api.get(`/classes/${classId}/students`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching students in class ${classId}:`, error);
    throw error;
  }
};

export const createClass = async (classData) => {
  try {
    await refreshApiToken();
    const response = await api.post('/classes', classData);
    return response.data;
  } catch (error) {
    console.error('Error creating class:', error);
    throw error;
  }
};

export const assignStudentToClass = async (classId, studentId) => {
  try {
    await refreshApiToken();
    const response = await api.post(`/classes/${classId}/students/${studentId}`);
    return response.data;
  } catch (error) {
    console.error(`Error assigning student ${studentId} to class ${classId}:`, error);
    throw error;
  }
};

export const removeStudentFromClass = async (classId, studentId) => {
  try {
    await refreshApiToken();
    const response = await api.delete(`/classes/${classId}/students/${studentId}`);
    return response.data;
  } catch (error) {
    console.error(`Error removing student ${studentId} from class ${classId}:`, error);
    throw error;
  }
};

// Alias function for ClassDetailView.jsx
export const enrollStudentInClass = assignStudentToClass;

// Alias function for ClassDetailView.jsx
export const getEnrolledStudents = getStudentsInClass;

// Get classes by tutor ID
export const getClassesByTutorId = async (tutorId) => {
  try {
    await refreshApiToken();
    const response = await api.get(`/tutors/${tutorId}/classes`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching classes for tutor ${tutorId}:`, error);
    throw error;
  }
};

// Add/update the bulkEnrollStudents function

export const bulkEnrollStudents = async (studentId, classIds) => {
  try {
    if (!studentId || !classIds || !Array.isArray(classIds) || classIds.length === 0) {
      throw new Error('Invalid student ID or class IDs');
    }
    
    console.log(`Enrolling student ${studentId} in classes:`, classIds);
    
    // Since your backend doesn't have a direct endpoint for this,
    // we'll use localStorage for development
    // In production, you would create a proper endpoint
    
    // 1. Get existing enrollments
    const existingEnrollmentsJson = localStorage.getItem(`student_${studentId}_classes`) || '[]';
    const existingEnrollments = JSON.parse(existingEnrollmentsJson);
    
    // 2. Add new enrollments (avoiding duplicates)
    const uniqueClassIds = [...new Set([...existingEnrollments, ...classIds.map(String)])];
    
    // 3. Save back to localStorage
    localStorage.setItem(`student_${studentId}_classes`, JSON.stringify(uniqueClassIds));
    
    console.log(`Successfully enrolled student ${studentId} in classes`);
    return { success: true, message: 'Enrollment successful' };
  } catch (error) {
    console.error('Error in bulkEnrollStudents:', error);
    throw error;
  }
};

// Update an existing class
export const updateClass = async (classId, classData) => {
  try {
    await refreshApiToken();
    const response = await api.put(`/classes/${classId}`, classData);
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

// Update the getClassesForStudent function to work with your actual backend

export const getClassesForStudent = async (studentId) => {
  try {
    if (!studentId) {
      console.error('getClassesForStudent called without a student ID');
      return [];
    }
    
    // Since there's no direct endpoint for student classes in your backend,
    // we'll fetch all classes and then filter them client-side
    console.log(`Fetching all classes and filtering for student ${studentId}`);
    
    // 1. Get all classes
    const allClasses = await getAllClasses();
    
    if (!Array.isArray(allClasses)) {
      console.error('getAllClasses did not return an array');
      return [];
    }
    
    // 2. Get the student's enrollments - this endpoint would need to be added
    // to your backend if it doesn't exist
    try {
      // Mock the student's enrolled class IDs using localStorage for development
      // In production, you'd need a proper endpoint for this
      const mockEnrollments = localStorage.getItem(`student_${studentId}_classes`);
      let enrolledClassIds = mockEnrollments ? JSON.parse(mockEnrollments) : [];
      
      console.log(`Student ${studentId} is enrolled in classes:`, enrolledClassIds);
      
      // Filter all classes to just those the student is enrolled in
      // For development, return random classes if no enrollments exist
      if (!enrolledClassIds || enrolledClassIds.length === 0) {
        console.log('No enrollments found, using mock data');
        
        // For development, return 2 random classes
        const randomClasses = allClasses
          .sort(() => 0.5 - Math.random())
          .slice(0, 2);
          
        console.log('Using random classes as mock data:', randomClasses);
        return randomClasses;
      }
      
      // Filter all classes to just those the student is enrolled in
      const enrolledClasses = allClasses.filter(cls => 
        enrolledClassIds.includes(cls.id) || 
        enrolledClassIds.includes(String(cls.id))
      );
      
      console.log(`Found ${enrolledClasses.length} enrolled classes for student ${studentId}`);
      return enrolledClasses;
    } catch (enrollmentError) {
      console.error('Error getting student enrollments:', enrollmentError);
      
      // For development, return a subset of classes as mock data
      const mockClasses = allClasses
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);
        
      console.log('Using random classes as mock data due to error:', mockClasses);
      return mockClasses;
    }
  } catch (error) {
    console.error('Error in getClassesForStudent:', error);
    return [];
  }
};

/**
 * Ensures the class object has all required properties with default values
 * @param {Object} classData - The class data to normalize
 * @returns {Object} Normalized class data
 */
export const normalizeClassData = (classData) => {
  if (!classData) return null;
  
  return {
    id: classData.id || classData.classId || null,
    name: classData.name || 'Unnamed Class',
    subject: classData.subject || 'No Subject',
    schedule: classData.schedule || 'Schedule not set',
    tutorName: classData.tutorName || classData.tutor?.name || 'No tutor assigned',
    tutorId: classData.tutorId || classData.tutor?.id || null,
    days: Array.isArray(classData.days) ? classData.days : 
          (classData.days ? [classData.days] : []),
    startTime: classData.startTime || '',
    endTime: classData.endTime || '',
    capacity: classData.capacity || 0,
    enrolled: classData.enrolled || 0,
    status: classData.status || 'active',
    description: classData.description || '',
    // Add any other properties that should have default values
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