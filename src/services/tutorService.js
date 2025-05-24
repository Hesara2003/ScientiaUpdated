import api from './api'; // Assuming the API config is in an api.js file

// Basic tutor CRUD operations
export const getAllTutors = async () => {
  try {
    const response = await api.get('/tutors');
    return response.data;
  } catch (error) {
    console.error('Error fetching tutors:', error);
    throw error;
  }
};

export const getTutor = async (id) => {
  try {
    const response = await api.get(`/tutors/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tutor with ID ${id}:`, error);
    throw error;
  }
};

export const createTutor = async (tutorData) => {
  try {
    const response = await api.post('/tutors', tutorData);
    return response.data;
  } catch (error) {
    console.error('Error creating tutor:', error);
    throw error;
  }
};

export const updateTutor = async (id, tutorData) => {
  try {
    const response = await api.put(`/tutors/${id}`, tutorData);
    return response.data;
  } catch (error) {
    console.error(`Error updating tutor with ID ${id}:`, error);
    throw error;
  }
};

export const deleteTutor = async (id) => {
  try {
    const response = await api.delete(`/tutors/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting tutor with ID ${id}:`, error);
    throw error;
  }
};

// Bulk delete tutors (client-side implementation)
export const bulkDeleteTutors = async (tutorIds) => {
  try {
    const deletePromises = tutorIds.map(id => deleteTutor(id));
    const results = await Promise.allSettled(deletePromises);
    
    const successful = results.filter(result => result.status === 'fulfilled');
    const failed = results.filter(result => result.status === 'rejected');
    
    if (failed.length > 0) {
      console.warn(`Failed to delete ${failed.length} tutors:`, failed);
    }
    
    return {
      successful: successful.length,
      failed: failed.length,
      total: tutorIds.length
    };
  } catch (error) {
    console.error('Error in bulk delete operation:', error);
    throw error;
  }
};

// Tutor classes management
export const getTutorClasses = async (tutorId) => {
  try {
    const response = await api.get(`/tutors/${tutorId}/classes`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching classes for tutor ${tutorId}:`, error);
    throw error;
  }
};

export const getTutorClass = async (tutorId, classId) => {
  try {
    const response = await api.get(`/tutors/${tutorId}/classes/${classId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching class ${classId} for tutor ${tutorId}:`, error);
    throw error;
  }
};

export const createTutorClass = async (tutorId, classData) => {
  try {
    const response = await api.post(`/tutors/${tutorId}/classes`, classData);
    return response.data;
  } catch (error) {
    console.error(`Error creating class for tutor ${tutorId}:`, error);
    throw error;
  }
};

export const updateTutorClass = async (tutorId, classId, classData) => {
  try {
    const response = await api.put(`/tutors/${tutorId}/classes/${classId}`, classData);
    return response.data;
  } catch (error) {
    console.error(`Error updating class ${classId} for tutor ${tutorId}:`, error);
    throw error;
  }
};

export const deleteTutorClass = async (tutorId, classId) => {
  try {
    const response = await api.delete(`/tutors/${tutorId}/classes/${classId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting class ${classId} for tutor ${tutorId}:`, error);
    throw error;
  }
};