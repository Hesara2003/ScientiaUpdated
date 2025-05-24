import api from './api';

/**
 * Get all subjects
 * Connects to: GET /subjects
 * @returns {Promise<Array>} List of subject objects
 */
export const getAllSubjects = async () => {
  try {
    const response = await api.get('/subjects');
    return response.data;
  } catch (error) {
    console.error('Error fetching subjects:', error);
    throw error;
  }
};

/**
 * Get a subject by ID
 * Connects to: GET /subjects/{id}
 * @param {string|number} id - The ID of the subject to retrieve
 * @returns {Promise<Object>} Subject object with id, name, description, grade
 */
export const getSubjectById = async (id) => {
  try {
    const response = await api.get(`/subjects/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching subject with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get timetable for a subject
 * Connects to: GET /subjects/{id}/timetable
 * @param {string|number} id - The ID of the subject
 * @returns {Promise<Array<string>>} List of timetable strings for the subject
 */
export const getSubjectTimetable = async (id) => {
  try {
    const response = await api.get(`/subjects/${id}/timetable`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching timetable for subject with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get recordings for a subject
 * Connects to: GET /subjects/{id}/recordings
 * @param {string|number} id - The ID of the subject
 * @returns {Promise<Array<string>>} List of recording strings for the subject
 */
export const getSubjectRecordings = async (id) => {
  try {
    const response = await api.get(`/subjects/${id}/recordings`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching recordings for subject with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new subject
 * Connects to: POST /subjects
 * @param {Object} subjectData - The subject data {name, description, grade}
 * @returns {Promise<Object>} Created subject object
 */
export const createSubject = async (subjectData) => {
  try {
    const response = await api.post('/subjects', subjectData);
    return response.data;
  } catch (error) {
    console.error('Error creating subject:', error);
    throw error;
  }
};

/**
 * Update an existing subject
 * Connects to: PUT /subjects/{id}
 * @param {string|number} id - The ID of the subject to update
 * @param {Object} subjectData - The updated subject data {name, description, grade}
 * @returns {Promise<Object>} Updated subject object
 */
export const updateSubject = async (id, subjectData) => {
  try {
    const response = await api.put(`/subjects/${id}`, subjectData);
    return response.data;
  } catch (error) {
    console.error(`Error updating subject with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a subject
 * Connects to: DELETE /subjects/{id}
 * @param {string|number} id - The ID of the subject to delete
 * @returns {Promise<void>} No response body (void from backend)
 */
export const deleteSubject = async (id) => {
  try {
    await api.delete(`/subjects/${id}`);
    // Backend returns void, so no response data to return
  } catch (error) {
    console.error(`Error deleting subject with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get tutors for a specific subject
 * Connects to: GET /subjects/{id}/tutors
 * @param {string|number} id - The ID of the subject
 * @returns {Promise<Array<string>>} List of tutor names teaching the subject
 */
export const getSubjectTutors = async (id) => {
  try {
    const response = await api.get(`/subjects/${id}/tutors`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tutors for subject with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get all subjects with their associated tutors
 * Client-side utility that combines data from getAllSubjects and getSubjectTutors
 * @returns {Promise<Array>} List of subjects with tutors included
 */
export const getSubjectsWithTutors = async () => {
  try {
    const subjects = await getAllSubjects();
    
    // For each subject, fetch its tutors
    const subjectsWithTutors = await Promise.all(
      subjects.map(async (subject) => {
        try {
          const tutors = await getSubjectTutors(subject.id);
          return { ...subject, tutors };
        } catch (error) {
          console.error(`Error fetching tutors for subject ${subject.id}:`, error);
          return { ...subject, tutors: [] };
        }
      })
    );
    
    return subjectsWithTutors;
  } catch (error) {
    console.error('Error fetching subjects with tutors:', error);
    throw error;
  }
};

/**
 * Filter subjects by grade level
 * Client-side utility for filtering subjects
 * @param {Array} subjects - List of subjects to filter
 * @param {string} grade - Grade level to filter by
 * @returns {Array} Filtered list of subjects
 */
export const filterSubjectsByGrade = (subjects, grade) => {
  if (!grade || grade === 'all') return subjects;
  return subjects.filter(subject => subject.grade === grade);
};

/**
 * Search subjects by name or description
 * Client-side utility for searching subjects
 * @param {Array} subjects - List of subjects to search
 * @param {string} query - Search query
 * @returns {Array} Filtered list of subjects matching the search query
 */
export const searchSubjects = (subjects, query) => {
  if (!query) return subjects;
  
  const lowercaseQuery = query.toLowerCase();
  return subjects.filter(subject => 
    subject.name.toLowerCase().includes(lowercaseQuery) || 
    (subject.description && subject.description.toLowerCase().includes(lowercaseQuery))
  );
};

// Default export with all methods
export default {
  getAllSubjects,
  getSubjectById,
  getSubjectTimetable,
  getSubjectRecordings,
  createSubject,
  updateSubject,
  deleteSubject,
  getSubjectTutors,
  getSubjectsWithTutors,
  filterSubjectsByGrade,
  searchSubjects
};
