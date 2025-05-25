import api from './api';

// Basic tutor CRUD operations
export const getAllTutors = async () => {
  try {
    const response = await api.get('/tutors');
    const tutors = response.data
      .filter(tutor => tutor.tutorId && (tutor.firstName || tutor.lastName)) // Exclude invalid tutors
      .map(tutor => ({
        tutorId: tutor.tutorId,
        firstName: tutor.firstName,
        lastName: tutor.lastName,
        email: tutor.email,
        phoneNumber: tutor.phoneNumber,
        bio: tutor.bio
      }));
    console.log('Mapped tutors:', tutors); // Debug
    return tutors;
  } catch (error) {
    console.error('Error fetching tutors:', error.response?.data || error.message);
    throw error;
  }
};

export const getTutor = async (id) => {
  try {
    const response = await api.get(`/tutors/${id}`);
    const tutor = {
      tutorId: response.data.tutorId,
      firstName: response.data.firstName,
      lastName: response.data.lastName,
      email: response.data.email,
      phoneNumber: response.data.phoneNumber,
      bio: response.data.bio
    };
    console.log('Fetched tutor:', tutor); // Debug
    return tutor;
  } catch (error) {
    console.error(`Error fetching tutor with ID ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

export const createTutor = async (tutorData) => {
  try {
    const response = await api.post('/tutors', tutorData);
    const tutor = {
      tutorId: response.data.tutorId,
      firstName: response.data.firstName,
      lastName: response.data.lastName,
      email: response.data.email,
      phoneNumber: response.data.phoneNumber,
      bio: response.data.bio
    };
    console.log('Created tutor:', tutor); // Debug
    return tutor;
  } catch (error) {
    console.error('Error creating tutor:', error.response?.data || error.message);
    throw error;
  }
};

export const updateTutor = async (id, tutorData) => {
  try {
    const response = await api.put(`/tutors/${id}`, tutorData);
    const tutor = {
      tutorId: response.data.tutorId,
      firstName: response.data.firstName,
      lastName: response.data.lastName,
      email: response.data.email,
      phoneNumber: response.data.phoneNumber,
      bio: response.data.bio
    };
    console.log('Updated tutor:', tutor); // Debug
    return tutor;
  } catch (error) {
    console.error(`Error updating tutor with ID ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

export const deleteTutor = async (id) => {
  try {
    await api.delete(`/tutors/${id}`);
    console.log(`Deleted tutor with ID ${id}`); // Debug
    return { success: true };
  } catch (error) {
    console.error(`Error deleting tutor with ID ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

// Bulk delete tutors
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
    console.error('Error in bulk delete operation:', error.response?.data || error.message);
    throw error;
  }
};

// Tutor classes management
export const getTutorClasses = async (tutorId) => {
  try {
    const response = await api.get(`/tutors/${tutorId}/classes`);
    console.log(`Fetched classes for tutor ${tutorId}:`, response.data); // Debug
    return response.data;
  } catch (error) {
    console.error(`Error fetching classes for tutor ${tutorId}:`, error.response?.data || error.message);
    throw error;
  }
};

export const getTutorClass = async (tutorId, classId) => {
  try {
    const response = await api.get(`/tutors/${tutorId}/classes/${classId}`);
    console.log(`Fetched class ${classId} for tutor ${tutorId}:`, response.data); // Debug
    return response.data;
  } catch (error) {
    console.error(`Error fetching class ${classId} for tutor ${tutorId}:`, error.response?.data || error.message);
    throw error;
  }
};

export const createTutorClass = async (tutorId, classData) => {
  try {
    const response = await api.post(`/tutors/${tutorId}/classes`, classData);
    console.log(`Created class for tutor ${tutorId}:`, response.data); // Debug
    return response.data;
  } catch (error) {
    console.error(`Error creating class for tutor ${tutorId}:`, error.response?.data || error.message);
    throw error;
  }
};

export const updateTutorClass = async (tutorId, classId, classData) => {
  try {
    const response = await api.put(`/tutors/${tutorId}/classes/${classId}`, classData);
    console.log(`Updated class ${classId} for tutor ${tutorId}:`, response.data); // Debug
    return response.data;
  } catch (error) {
    console.error(`Error updating class ${classId} for tutor ${tutorId}:`, error.response?.data || error.message);
    throw error;
  }
};

export const deleteTutorClass = async (tutorId, classId) => {
  try {
    await api.delete(`/tutors/${tutorId}/classes/${classId}`);
    console.log(`Deleted class ${classId} for tutor ${tutorId}`); // Debug
    return { success: true };
  } catch (error) {
    console.error(`Error deleting class ${classId} for tutor ${tutorId}:`, error.response?.data || error.message);
    throw error;
  }
};