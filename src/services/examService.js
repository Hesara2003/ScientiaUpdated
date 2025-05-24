import api from './api';

export const getAllExams = async () => {
  try {
    const response = await api.get('/exams');
    return response.data;
  } catch (error) {
    console.error('Error fetching exams:', error);
    throw error;
  }
};

export const getExam = async (examId) => {
  try {
    const response = await api.get(`/exams/${examId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching exam with ID ${examId}:`, error);
    throw error;
  }
};

export const createExam = async (examData) => {
  try {
    // Get auth token from localStorage or wherever you store it
    const token = localStorage.getItem('token') || localStorage.getItem('authToken') || sessionStorage.getItem('token');
    
    // Transform data to match backend expectations
    const formattedExamData = {
      examName: examData.examName,
      classEntity: { classId: parseInt(examData.classId) },
      tutor: { tutorId: parseInt(examData.tutorId) },
      startTime: examData.startTime,
      endTime: examData.endTime
    };
    
    console.log('Creating exam with data:', formattedExamData);
    console.log('Using token:', token ? 'Token present' : 'No token found');
    
    const response = await api.post('/exams', formattedExamData, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating exam:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

export const updateExam = async (examId, examData) => {
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken') || sessionStorage.getItem('token');
    
    // Transform data to match backend expectations
    const formattedExamData = {
      examId: parseInt(examId),
      examName: examData.examName,
      classEntity: { classId: parseInt(examData.classId) },
      tutor: { tutorId: parseInt(examData.tutorId) },
      startTime: examData.startTime,
      endTime: examData.endTime
    };
    
    const response = await api.put(`/exams/${examId}`, formattedExamData, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error updating exam with ID ${examId}:`, error);
    throw error;
  }
};

export const deleteExam = async (examId) => {
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken') || sessionStorage.getItem('token');
    
    const response = await api.delete(`/exams/${examId}`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error deleting exam with ID ${examId}:`, error);
    throw error;
  }
};

/**
 * Get exams by class ID
 * @param {number} classId - The class ID
 * @returns {Promise<Array>} - List of exams for the class
 */
export const getExamsByClassId = async (classId) => {
  try {
    // Since your repository doesn't have custom methods, filter on frontend
    const response = await api.get('/exams');
    const allExams = response.data;
    
    // Filter exams by classId
    const classExams = allExams.filter(exam => 
      exam.classEntity && exam.classEntity.classId === parseInt(classId)
    );
    
    return classExams;
  } catch (error) {
    console.error(`Error fetching exams for class ID ${classId}:`, error);
    throw error;
  }
};

/**
 * Get exams by tutor ID
 * @param {number} tutorId - The tutor ID
 * @returns {Promise<Array>} - List of exams assigned to the tutor
 */
export const getExamsByTutorId = async (tutorId) => {
  try {
    // Since your repository doesn't have custom methods, filter on frontend
    const response = await api.get('/exams');
    const allExams = response.data;
    
    // Filter exams by tutorId
    const tutorExams = allExams.filter(exam => 
      exam.tutor && exam.tutor.tutorId === parseInt(tutorId)
    );
    
    return tutorExams;
  } catch (error) {
    console.error(`Error fetching exams for tutor ID ${tutorId}:`, error);
    throw error;
  }
};

/**
 * Helper function to format exam data for display
 * @param {Object} exam - Raw exam data from backend
 * @returns {Object} - Formatted exam data
 */
export const formatExamData = (exam) => {
  return {
    examId: exam.examId,
    examName: exam.examName,
    classId: exam.classEntity?.classId,
    className: exam.classEntity?.className,
    tutorId: exam.tutor?.tutorId,
    tutorName: exam.tutor?.name,
    startTime: new Date(exam.startTime),
    endTime: new Date(exam.endTime),
    duration: exam.startTime && exam.endTime ? 
      Math.abs(new Date(exam.endTime) - new Date(exam.startTime)) / (1000 * 60) : 0 // duration in minutes
  };
};