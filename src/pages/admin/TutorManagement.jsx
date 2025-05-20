import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import userService from '../../services/userService';
import { toast } from 'react-hot-toast';

const TutorManagement = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingTutor, setIsAddingTutor] = useState(false);
  const [newTutor, setNewTutor] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    specialization: '',
  });
  
  useEffect(() => {
    const fetchTutors = async () => {
      try {
        setLoading(true);
        const data = await userService.getAllTutors();
        setTutors(data);
      } catch (error) {
        toast.error("Failed to load tutors");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTutors();
  }, []);

  // Filter tutors based on search term
  const filteredTutors = tutors.filter(tutor => {
    const fullName = `${tutor.firstName} ${tutor.lastName}`.toLowerCase();
    const email = (tutor.email || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return fullName.includes(search) || email.includes(search);
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTutor(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTutor = async (e) => {
    e.preventDefault();
    
    try {
      const createdTutor = await userService.createTutor(newTutor);
      
      toast.success("Tutor added successfully");
      setTutors(prev => [...prev, createdTutor]);
      
      // Reset form
      setNewTutor({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        specialization: '',
      });
      
      // Close form
      setIsAddingTutor(false);
    } catch (error) {
      toast.error("Failed to add tutor");
      console.error(error);
    }
  };

  return (
    <div className="px-4 py-6">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tutor Management</h1>
          <p className="text-gray-600">Add and manage tutors for your classes</p>
        </div>
        <button
          onClick={() => setIsAddingTutor(true)}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
        >
          Add Tutor
        </button>
      </header>

      {/* Statistics Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Tutors</h3>
          <p className="text-3xl font-bold text-blue-600">{tutors.length}</p>
        </motion.div>
        
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Active Tutors</h3>
          <p className="text-3xl font-bold text-green-600">
            {tutors.filter(t => t.active).length}
          </p>
        </motion.div>
        
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Classes Taught</h3>
          <p className="text-3xl font-bold text-amber-600">
            {/* Sum up all classes taught by tutors */}
            {tutors.reduce((sum, tutor) => sum + (tutor.classesCount || 0), 0)}
          </p>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Tutors
            </label>
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Tutors Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specialization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Classes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">Loading tutors...</p>
                  </td>
                </tr>
              ) : filteredTutors.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    No tutors found matching your search.
                  </td>
                </tr>
              ) : (
                filteredTutors.map((tutor) => (
                  <tr key={tutor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          {tutor.profileImage ? (
                            <img 
                              src={tutor.profileImage} 
                              alt={`${tutor.firstName} ${tutor.lastName}`}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <span className="text-gray-500 text-sm">
                              {tutor.firstName?.[0]}{tutor.lastName?.[0]}
                            </span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {tutor.firstName} {tutor.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{tutor.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{tutor.phone || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{tutor.specialization || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${tutor.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {tutor.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {tutor.classesCount || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link 
                        to={`/admin/tutors/${tutor.id}`}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        View
                      </Link>
                      <Link 
                        to={`/admin/tutors/${tutor.id}/assign`}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        Assign Classes
                      </Link>
                      <button
                        onClick={() => {
                          /* Add edit functionality */
                        }}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Tutor Modal */}
      {isAddingTutor && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add New Tutor</h3>
                    
                    <form onSubmit={handleAddTutor}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                            First Name
                          </label>
                          <input
                            id="firstName"
                            name="firstName"
                            type="text"
                            required
                            value={newTutor.firstName}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name
                          </label>
                          <input
                            id="lastName"
                            name="lastName"
                            type="text"
                            required
                            value={newTutor.lastName}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={newTutor.email}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                          Password
                        </label>
                        <input
                          id="password"
                          name="password"
                          type="password"
                          required
                          value={newTutor.password}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Minimum 8 characters. The tutor can change this later.
                        </p>
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={newTutor.phone}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                          Specialization
                        </label>
                        <input
                          id="specialization"
                          name="specialization"
                          type="text"
                          value={newTutor.specialization}
                          onChange={handleInputChange}
                          placeholder="e.g. Mathematics, Science, Languages"
                          className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                        <button
                          type="submit"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                        >
                          Add Tutor
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddingTutor(false)}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorManagement;