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
 * @returns {Promise<void>}
 */
export const deleteRecordedLesson = async (lessonId) => {
  try {
    await api.delete(`/tutor/recorded-lessons/${lessonId}`);
  } catch (error) {
    console.error('Error deleting recorded lesson:', error);
    throw error;
  }
};

/**
 * Get lessons by subject ID
 * @param {string|number} subjectId - ID of the subject
 * @returns {Promise<Array>} List of lessons for the specified subject
 */
export const getLessonsBySubjectId = async (subjectId) => {
  try {
    const allLessons = await getAllRecordedLessons();
    return allLessons.filter(lesson => 
      lesson.subject && lesson.subject.id && 
      lesson.subject.id.toString() === subjectId.toString()
    );
  } catch (error) {
    console.error('Error fetching lessons for subject:', error);
    throw error;
  }
};

/**
 * Search lessons by title, description, or subject
 * @param {string} searchTerm - Search term to filter lessons
 * @returns {Promise<Array>} Filtered list of lessons
 */
export const searchLessons = async (searchTerm) => {
  try {
    const allLessons = await getAllRecordedLessons();
    if (!searchTerm || searchTerm.trim() === '') {
      return allLessons;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return allLessons.filter(lesson => 
      lesson.title?.toLowerCase().includes(lowerSearchTerm) ||
      lesson.description?.toLowerCase().includes(lowerSearchTerm) ||
      lesson.subject?.toLowerCase().includes(lowerSearchTerm)
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
  getLessonsBySubjectId,
  searchLessons
};
