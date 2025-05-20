import api from './api';

/**
 * Add a new recorded lesson
 * Connects to: POST /tutor/recorded-lessons
 * @param {Object} lesson - Recorded lesson data object
 * @returns {Promise<Object>} Created lesson with ID
 */
export const addRecordedLesson = async (lesson) => {
  try {
    const response = await api.post('/tutor/recorded-lessons', lesson);
    return response.data;
  } catch (error) {
    console.error('Error adding recorded lesson:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get all recorded lessons
 * Connects to: GET /tutor/recorded-lessons
 * @returns {Promise<Array>} List of recorded lesson objects
 */
export const getAllRecordedLessons = async () => {
  try {
    const response = await api.get('/tutor/recorded-lessons');
    return response.data;
  } catch (error) {
    console.error('Error fetching recorded lessons:', error);
    throw error;
  }
};

/**
 * Get a recorded lesson by ID
 * Connects to: GET /tutor/recorded-lessons/{id}
 * @param {string|number} lessonId - ID of the lesson to retrieve
 * @returns {Promise<Object>} Recorded lesson object
 */
export const getRecordedLessonById = async (lessonId) => {
  try {
    const response = await api.get(`/tutor/recorded-lessons/${lessonId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recorded lesson details:', error);
    throw error;
  }
};

/**
 * Delete a recorded lesson by ID
 * Connects to: DELETE /tutor/recorded-lessons/{id}
 * @param {string|number} lessonId - ID of the lesson to delete
 * @returns {Promise<boolean>} Success indicator
 */
export const deleteRecordedLesson = async (lessonId) => {
  try {
    await api.delete(`/tutor/recorded-lessons/${lessonId}`);
    return true; // Success
  } catch (error) {
    console.error('Error deleting recorded lesson:', error);
    throw error;
  }
};

/**
 * Get lessons by tutor ID
 * This is a client-side filtering since the API doesn't directly support this
 * @param {string|number} tutorId - ID of the tutor
 * @returns {Promise<Array>} List of lessons created by the specified tutor
 */
export const getLessonsByTutorId = async (tutorId) => {
  try {
    const allLessons = await getAllRecordedLessons();
    return allLessons.filter(lesson => lesson.tutorId.toString() === tutorId.toString());
  } catch (error) {
    console.error('Error fetching lessons by tutor:', error);
    throw error;
  }
};

/**
 * Get lessons by subject ID
 * This is a client-side filtering since the API doesn't directly support this
 * @param {string|number} subjectId - ID of the subject
 * @returns {Promise<Array>} List of lessons for the specified subject
 */
export const getLessonsBySubjectId = async (subjectId) => {
  try {
    const allLessons = await getAllRecordedLessons();
    return allLessons.filter(lesson => lesson.subjectId.toString() === subjectId.toString());
  } catch (error) {
    console.error('Error fetching lessons by subject:', error);
    throw error;
  }
};

/**
 * Search lessons by title or description
 * @param {string} searchTerm - Search term to match against lesson titles and descriptions
 * @returns {Promise<Array>} List of matching lessons
 */
export const searchLessons = async (searchTerm) => {
  try {
    const allLessons = await getAllRecordedLessons();
    const term = searchTerm.toLowerCase();
    
    return allLessons.filter(lesson => 
      lesson.title.toLowerCase().includes(term) || 
      (lesson.description && lesson.description.toLowerCase().includes(term))
    );
  } catch (error) {
    console.error('Error searching lessons:', error);
    throw error;
  }
};

// Export all methods
export default {
  addRecordedLesson,
  getAllRecordedLessons,
  getRecordedLessonById,
  deleteRecordedLesson,
  getLessonsByTutorId,
  getLessonsBySubjectId,
  searchLessons
};
