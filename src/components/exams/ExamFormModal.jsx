import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, BookOpen, User } from 'lucide-react';
import { getAllClasses } from '../../services/classService';
import { getAllTutors } from '../../services/tutorService';

const ExamFormModal = ({ show, onClose, onSubmit, examData }) => {
  const [formData, setFormData] = useState({
    examName: '',
    classId: '',
    tutorId: '',
    startTime: '',
    endTime: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classes, setClasses] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingTutors, setLoadingTutors] = useState(false);

  useEffect(() => {
    const fetchClassesAndTutors = async () => {
      try {
        setLoadingClasses(true);
        const classesData = await getAllClasses();
        setClasses(classesData || []);
      } catch (error) {
        console.error('Error fetching classes:', error);
        setClasses([]);
      } finally {
        setLoadingClasses(false);
      }

      try {
        setLoadingTutors(true);
        const tutorsData = await getAllTutors();
        console.log('Fetched tutors:', tutorsData);
        setTutors(tutorsData || []);
      } catch (error) {
        console.error('Error fetching tutors:', error);
        setTutors([]);
      } finally {
        setLoadingTutors(false);
      }
    };

    if (show) {
      fetchClassesAndTutors();
    }
  }, [show]);

  useEffect(() => {
    console.log('Received examData:', examData);
    if (examData) {
      setFormData({
        examName: examData.examName || '',
        classId: examData.classId ? String(examData.classId) : '',
        tutorId: examData.tutorId ? String(examData.tutorId) : '',
        startTime: examData.startTime ? new Date(examData.startTime).toISOString().slice(0, 16) : '',
        endTime: examData.endTime ? new Date(examData.endTime).toISOString().slice(0, 16) : '',
      });
    } else {
      setFormData({
        examName: '',
        classId: '',
        tutorId: '',
        startTime: '',
        endTime: '',
      });
    }
    setErrors({});
  }, [examData]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.examName.trim()) newErrors.examName = 'Exam name is required';
    if (!formData.classId) newErrors.classId = 'Class is required';
    if (!formData.tutorId) newErrors.tutorId = 'Tutor is required';
    else if (isNaN(parseInt(formData.tutorId))) newErrors.tutorId = 'Invalid tutor selection';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.endTime) newErrors.endTime = 'End time is required';
    if (formData.startTime && formData.endTime && new Date(formData.startTime) >= new Date(formData.endTime)) {
      newErrors.endTime = 'End time must be after start time';
    }
    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    if (!validateForm()) {
      console.log('Validation failed:', errors);
      return;
    }
    setIsSubmitting(true);
    try {
      const formattedData = {
        ...(examData?.id && { id: examData.id }),
        examName: formData.examName.trim(),
        classId: parseInt(formData.classId),
        tutorId: parseInt(formData.tutorId),
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
      };
      console.log('Submitting formatted data:', formattedData);
      
      await onSubmit(formattedData);
      
      console.log('Exam submitted successfully');
      onClose();
    } catch (error) {
      console.error('Error submitting exam:', error);
      setErrors({ submit: `Failed to submit exam: ${error.message || 'Please try again.'}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-indigo-600">
                {examData ? 'Edit Exam' : 'Add New Exam'}
              </h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <BookOpen size={16} className="mr-2 text-indigo-500" />
                  Exam Name
                </label>
                <input
                  type="text"
                  name="examName"
                  value={formData.examName}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-indigo-200 focus:border-indigo-500"
                  placeholder="Enter exam name"
                />
                {errors.examName && (
                  <p className="text-red-500 text-sm mt-1">{errors.examName}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <BookOpen size={16} className="mr-2 text-indigo-500" />
                  Class
                </label>
                <select
                  name="classId"
                  value={formData.classId}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-indigo-200 focus:border-indigo-500"
                  disabled={loadingClasses}
                >
                  <option value="">
                    {loadingClasses ? 'Loading classes...' : 'Select a class'}
                  </option>
                  {classes.map((cls) => (
                    <option key={cls.classId} value={cls.classId}>
                      {cls.className || cls.name || `Class ${cls.classId}`}
                    </option>
                  ))}
                </select>
                {errors.classId && (
                  <p className="text-red-500 text-sm mt-1">{errors.classId}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <User size={16} className="mr-2 text-indigo-500" />
                  Tutor
                </label>
                <select
                  name="tutorId"
                  value={formData.tutorId}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-indigo-200 focus:border-indigo-500"
                  disabled={loadingTutors}
                >
                  <option value="">
                    {loadingTutors ? 'Loading tutors...' : 'Select a tutor'}
                  </option>
                  {tutors.map((tutor) => (
                    <option key={tutor.tutorId} value={tutor.tutorId}>
                      {tutor.firstName && tutor.lastName
                        ? `${tutor.firstName} ${tutor.lastName}`
                        : `Tutor ${tutor.tutorId}`}
                    </option>
                  ))}
                </select>
                {errors.tutorId && (
                  <p className="text-red-500 text-sm mt-1">{errors.tutorId}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Calendar size={16} className="mr-2 text-indigo-500" />
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-indigo-200 focus:border-indigo-500"
                />
                {errors.startTime && (
                  <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Clock size={16} className="mr-2 text-indigo-500" />
                  End Time
                </label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-indigo-200 focus:border-indigo-500"
                />
                {errors.endTime && (
                  <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>
                )}
              </div>

              {errors.submit && (
                <p className="text-red-500 text-sm mt-2">{errors.submit}</p>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 text-white rounded-lg ${
                    isSubmitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : examData ? 'Update Exam' : 'Create Exam'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExamFormModal;