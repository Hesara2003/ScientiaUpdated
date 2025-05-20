import React, { useState, useEffect } from 'react';
import { 
  getAllSubjects, 
  createSubject, 
  updateSubject, 
  deleteSubject 
} from '../../services/subjectService';

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    grade: '',
    popularTopics: [],
    requirements: [],
    outcomes: []
  });
  
  // Fetch subjects when component mounts
  useEffect(() => {
    fetchSubjects();
  }, []);
  
  // Fetch all subjects
  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const data = await getAllSubjects();
      setSubjects(data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle array inputs (comma-separated)
  const handleArrayInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value.split(',').map(item => item.trim())
    });
  };
  
  // Open modal for creating a new subject
  const handleOpenCreateModal = () => {
    setCurrentSubject(null);
    setFormData({
      name: '',
      description: '',
      icon: '',
      grade: '',
      popularTopics: [],
      requirements: [],
      outcomes: []
    });
    setIsModalOpen(true);
  };
  
  // Open modal for editing an existing subject
  const handleOpenEditModal = (subject) => {
    setCurrentSubject(subject);
    setFormData({
      name: subject.name,
      description: subject.description,
      icon: subject.icon || '',
      grade: subject.grade || '',
      popularTopics: subject.popularTopics || [],
      requirements: subject.requirements || [],
      outcomes: subject.outcomes || []
    });
    setIsModalOpen(true);
  };
  
  // Submit form - create or update subject
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentSubject) {
        // Update existing subject
        await updateSubject(currentSubject.id, formData);
      } else {
        // Create new subject
        await createSubject(formData);
      }
      
      // Refresh subjects list
      fetchSubjects();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving subject:", error);
    }
  };
  
  // Delete a subject
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await deleteSubject(id);
        // Refresh subjects list
        fetchSubjects();
      } catch (error) {
        console.error("Error deleting subject:", error);
      }
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Subject Management</h1>
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Add Subject
        </button>
      </div>
      
      {/* Subjects Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Description
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Grade
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Topics
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {subjects.length > 0 ? (
              subjects.map((subject) => (
                <tr key={subject.id} className="hover:bg-gray-50">
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">
                    <div className="flex items-center">
                      {subject.icon && (
                        <div className="flex-shrink-0 h-10 w-10 mr-3">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={subject.icon}
                            alt={subject.name}
                          />
                        </div>
                      )}
                      <div>
                        <p className="text-gray-900 whitespace-no-wrap font-medium">{subject.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{subject.description?.substring(0, 100)}...</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{subject.grade || 'All Levels'}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">
                    <div className="flex flex-wrap gap-1">
                      {subject.popularTopics?.slice(0, 3).map((topic, index) => (
                        <span 
                          key={index} 
                          className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full"
                        >
                          {topic}
                        </span>
                      ))}
                      {subject.popularTopics?.length > 3 && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                          +{subject.popularTopics.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 text-sm text-center">
                    <button
                      onClick={() => handleOpenEditModal(subject)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(subject.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-5 py-5 border-b border-gray-200 text-sm text-center">
                  No subjects found. Click 'Add Subject' to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Subject Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-lg max-w-md mx-auto p-6 w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {currentSubject ? 'Edit Subject' : 'Add New Subject'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Subject Name*
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                  Description*
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows="3"
                  required
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="icon">
                  Icon URL
                </label>
                <input
                  id="icon"
                  name="icon"
                  type="text"
                  value={formData.icon}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="grade">
                  Grade Level
                </label>
                <select
                  id="grade"
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="">All Levels</option>
                  <option value="elementary">Elementary</option>
                  <option value="middle">Middle School</option>
                  <option value="high">High School</option>
                  <option value="college">College</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="popularTopics">
                  Popular Topics (comma-separated)
                </label>
                <input
                  id="popularTopics"
                  name="popularTopics"
                  type="text"
                  value={formData.popularTopics.join(', ')}
                  onChange={handleArrayInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="requirements">
                  Requirements (comma-separated)
                </label>
                <input
                  id="requirements"
                  name="requirements"
                  type="text"
                  value={formData.requirements.join(', ')}
                  onChange={handleArrayInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="outcomes">
                  Learning Outcomes (comma-separated)
                </label>
                <input
                  id="outcomes"
                  name="outcomes"
                  type="text"
                  value={formData.outcomes.join(', ')}
                  onChange={handleArrayInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {currentSubject ? 'Update Subject' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
