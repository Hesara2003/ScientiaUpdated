import api from './api'; // Assuming the API config is in an api.js file

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

export const bulkDeleteTutors = async (ids) => {
  try {
    const response = await api.post('/tutors/bulk-delete', { ids });
    return response.data;
  } catch (error) {
    console.error('Error bulk deleting tutors:', error);
    throw error;
  }
};