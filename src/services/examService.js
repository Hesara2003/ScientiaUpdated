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

export const getExam = async (id) => {
  try {
    const response = await api.get(`/exams/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching exam with ID ${id}:`, error);
    throw error;
  }
};

export const createExam = async (examData) => {
  try {
    const response = await api.post('/exams', examData);
    return response.data;
  } catch (error) {
    console.error('Error creating exam:', error);
    throw error;
  }
};

export const updateExam = async (id, examData) => {
  try {
    const response = await api.put(`/exams/${id}`, examData);
    return response.data;
  } catch (error) {
    console.error(`Error updating exam with ID ${id}:`, error);
    throw error;
  }
};

export const deleteExam = async (id) => {
  try {
    const response = await api.delete(`/exams/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting exam with ID ${id}:`, error);
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
    const response = await api.get(`/exams/class/${classId}`);
    return response.data;
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
    const response = await api.get(`/exams/tutor/${tutorId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching exams for tutor ID ${tutorId}:`, error);
    throw error;
  }
};