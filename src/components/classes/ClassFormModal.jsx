import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { createClass, updateClass } from '../../services/classService';
import { getAllSubjects } from '../../services/subjectService';

const ClassFormModal = ({ show, onClose, onSubmit, classData }) => {  const initialFormData = {
    className: '',
    subject: '',
    teacher: '',
    schedule: '',
    location: '',
    startDate: '',
    endDate: '',
    maxStudents: '',
    description: '',
    status: 'active'
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const data = await getAllSubjects();
        setSubjects(data || []);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (classData) {
      const formattedData = { ...classData };
      if (formattedData.startDate) {
        const startDate = new Date(formattedData.startDate);
        formattedData.startDate = startDate.toISOString().split('T')[0];
      }
      if (formattedData.endDate) {
        const endDate = new Date(formattedData.endDate);
        formattedData.endDate = endDate.toISOString().split('T')[0];
      }
      setFormData(formattedData);
    } else {
      setFormData(initialFormData);
    }
  }, [classData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.className?.trim()) {
      newErrors.className = 'Class name is required';
    }
    
    if (!formData.subject?.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.teacher?.trim()) {
      newErrors.teacher = 'Teacher name is required';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (formData.startDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    if (formData.maxStudents && (isNaN(formData.maxStudents) || Number(formData.maxStudents) <= 0)) {
      newErrors.maxStudents = 'Max students must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const processedFormData = {
        ...formData,
        maxStudents: formData.maxStudents ? Number(formData.maxStudents) : null
      };
      
      onSubmit(processedFormData);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {classData ? 'Edit Class' : 'Add New Class'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="className">
                Class Name *
              </label>
              <input
                type="text"
                id="className"
                name="className"
                value={formData.className || ''}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors.className ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter class name"
              />
              {errors.className && <p className="text-red-500 text-xs mt-1">{errors.className}</p>}
            </div>            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="subject">
                Subject *
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject || ''}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors.subject ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select a subject</option>
                {loading ? (
                  <option value="" disabled>Loading subjects...</option>
                ) : (
                  subjects.map(subject => (
                    <option key={subject.id} value={subject.name}>
                      {subject.name}
                    </option>
                  ))
                )}
              </select>
              {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="teacher">
              Teacher *
            </label>
            <input
              type="text"
              id="teacher"
              name="teacher"
              value={formData.teacher || ''}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg ${errors.teacher ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter teacher name"
            />
            {errors.teacher && <p className="text-red-500 text-xs mt-1">{errors.teacher}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startDate">
                Start Date *
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate || ''}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors.startDate ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endDate">
                End Date *
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate || ''}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors.endDate ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="schedule">
                Schedule
              </label>
              <input
                type="text"
                id="schedule"
                name="schedule"
                value={formData.schedule || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg border-gray-300"
                placeholder="e.g., Mon, Wed, Fri 10:00-11:30"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg border-gray-300"
                placeholder="e.g., Room 101"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="maxStudents">
                Max Students
              </label>
              <input
                type="number"
                id="maxStudents"
                name="maxStudents"
                value={formData.maxStudents || ''}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors.maxStudents ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter maximum number of students"
                min="1"
              />
              {errors.maxStudents && <p className="text-red-500 text-xs mt-1">{errors.maxStudents}</p>}
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status || 'active'}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg border-gray-300"
              >
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg border-gray-300"
              rows="4"
              placeholder="Enter class description"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {classData ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

ClassFormModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  classData: PropTypes.object
};

export default ClassFormModal;