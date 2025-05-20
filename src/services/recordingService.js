import api from './api';

export const getAllRecordingBundles = async () => {
  try {
    const response = await api.get('/recordings/bundles');
    return response.data;
  } catch (error) {
    console.error('Error fetching recording bundles:', error);
    throw error;
  }
};

export const getRecordingBundlesBySubject = async (subjectId) => {
  try {
    const response = await api.get(`/recordings/bundles/subject/${subjectId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching recording bundles for subject ID ${subjectId}:`, error);
    throw error;
  }
};

export const getRecordingBundleDetails = async (bundleId) => {
  try {
    const response = await api.get(`/recordings/bundles/${bundleId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching recording bundle details for ID ${bundleId}:`, error);
    throw error;
  }
};
