import api from './api';

export const getAllExams = async () => {
  try {
    const response = await api.get('/exams');
    return response.data;
  } catch (error) {
    console.error('Error fetching exams:', error.response?.data || error.message);
    throw error;
  }
};

export const getExam = async (examId) => {
  try {
    const response = await api.get(`/exams/${examId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching exam with ID ${examId}:`, error.response?.data || error.message);
    throw error;
  }
};

export const createExam = async (examData) => {
  console.log('examService.createExam called with:', examData);

  // Prepare the request payload
  const payload = {
    examName: examData.examName,
    classEntity: { classId: parseInt(examData.classId) },
    tutor: { tutorId: parseInt(examData.tutorId) },
    startTime: examData.startTime.slice(0, 19), // Remove milliseconds
    endTime: examData.endTime.slice(0, 19), // Remove milliseconds
  };

  try {
    console.log('Attempting to create exam with base URL:', import.meta.env.VITE_API_URL || 'http://localhost:8080/');
    console.log('Using payload:', payload);

    const token = localStorage.getItem('token') || localStorage.getItem('authToken') || sessionStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await api.post('/exams', payload, { headers });

    console.log('Exam created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating exam:', error);
    console.error('Error response:', error.response);
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);

    if (!error.response) {
      throw new Error('Cannot connect to backend server. Please ensure the backend is running on http://localhost:8080/');
    }

    throw error;
  }
};

export const updateExam = async (examId, examData) => {
  try {
    const response = await api.put(`/exams/${examId}`, {
      examName: examData.examName,
      classId: parseInt(examData.classId),
      tutorId: parseInt(examData.tutorId),
      startTime: examData.startTime,
      endTime: examData.endTime,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken') || sessionStorage.getItem('token');
      if (token) {
        try {
          const response = await api.put(`/exams/${examId}`, {
            examName: examData.examName,
            classId: parseInt(examData.classId),
            tutorId: parseInt(examData.tutorId),
            startTime: examData.startTime,
            endTime: examData.endTime,
          }, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
          return response.data;
        } catch (retryError) {
          console.error(`Error updating exam with ID ${examId}:`, retryError.response?.data || retryError.message);
          throw retryError;
        }
      }
    }
    console.error(`Error updating exam with ID ${examId}:`, error.response?.data || error.message);
    throw error;
  }
};

export const deleteExam = async (examId) => {
  try {
    const response = await api.delete(`/exams/${examId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken') || sessionStorage.getItem('token');
      if (token) {
        try {
          const response = await api.delete(`/exams/${examId}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
          return response.data;
        } catch (retryError) {
          console.error(`Error deleting exam with ID ${examId}:`, retryError.response?.data || retryError.message);
          throw retryError;
        }
      }
    }
    console.error(`Error deleting exam with ID ${examId}:`, error.response?.data || error.message);
    throw error;
  }
};

export const getExamsByClassId = async (classId) => {
  try {
    const response = await api.get('/exams');
    const allExams = response.data;
    return allExams.filter(exam => exam.classId === parseInt(classId));
  } catch (error) {
    console.error(`Error fetching exams for class ID ${classId}:`, error.response?.data || error.message);
    throw error;
  }
};

export const getExamsByTutorId = async (tutorId) => {
  try {
    const response = await api.get('/exams');
    const allExams = response.data;
    return allExams.filter(exam => exam.tutorId === parseInt(tutorId));
  } catch (error) {
    console.error(`Error fetching exams for tutor ID ${tutorId}:`, error.response?.data || error.message);
    throw error;
  }
};

export const formatExamData = (exam) => {
  return {
    examId: exam.examId,
    examName: exam.examName,
    classId: exam.classId,
    tutorId: exam.tutorId,
    startTime: new Date(exam.startTime),
    endTime: new Date(exam.endTime),
    duration: exam.startTime && exam.endTime
      ? Math.abs(new Date(exam.endTime) - new Date(exam.startTime)) / (1000 * 60)
      : 0,
  };
};