import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import userService from '../../services/userService';
import { toast } from 'react-hot-toast';
import { debugData, debugHttpError } from '../../utils/debugUtils';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [recentRegistrations, setRecentRegistrations] = useState([]);  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Set user role in localStorage if not already set (ensures admin role is used)
        if (!localStorage.getItem('userRole')) {
          localStorage.setItem('userRole', 'admin');
        }
        
        // Get all students first as a fallback
        const allStudents = await userService.getAllStudents();
        
        // Debug the response
        debugData('StudentManagement - allStudents response', allStudents);
        
        // Ensure we always have an array
        if (!Array.isArray(allStudents)) {
          console.warn('getAllStudents did not return an array', allStudents);
          setStudents([]);
        } else {
          setStudents(allStudents);
          console.log(`Loaded ${allStudents.length} students`);
        }
        
        // Try to get recent registrations with improved error handling
        try {
          const recentStudents = await userService.getRecentRegistrations(30, 'student');
          
          // Debug the response
          debugData('StudentManagement - recentRegistrations response', recentStudents);
          
          // Ensure we always have an array
          if (!Array.isArray(recentStudents)) {
            console.warn('getRecentRegistrations did not return an array:', recentStudents);
            setRecentRegistrations([]);
          } else {
            setRecentRegistrations(recentStudents);
            console.log(`Loaded ${recentStudents.length} recent registrations`);
          }
        } catch (regError) {
          // Use our enhanced error debugging
          debugHttpError(regError, 'Recent Registrations API');
          console.error('Error fetching recent registrations:', regError);            
          // Fallback is now handled by the service with mock data
        }
      } catch (error) {
        toast.error("Failed to load students");
        console.error('Error details:', error);
        
        // Set empty arrays as fallback
        setStudents([]);
        setRecentRegistrations([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Ensure students is always an array before filtering
  const studentArray = Array.isArray(students) ? students : [];
  
  // Filter students based on search term
  const filteredStudents = studentArray.filter(student => {
    if (!student) return false;
    const fullName = `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase();
    const email = (student.email || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return fullName.includes(search) || email.includes(search);
  });

  return (
    <div className="px-4 py-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Student Management</h1>
        <p className="text-gray-600">Manage all registered students and assign them to classes</p>
      </header>      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Students</h3>
          <p className="text-3xl font-bold text-blue-600">{studentArray.length}</p>
        </motion.div>
        
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-2">New Registrations (30 days)</h3>
          <p className="text-3xl font-bold text-green-600">{Array.isArray(recentRegistrations) ? recentRegistrations.length : 0}</p>
        </motion.div>
        
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Unassigned Students</h3>
          <p className="text-3xl font-bold text-amber-600">
            {/* This would require additional API logic to track unassigned students */}
            {studentArray.filter(s => s && !s.assignedToClass).length || 0}
          </p>
        </motion.div>
      </div>

      {/* Recent Registrations */}
      {Array.isArray(recentRegistrations) && recentRegistrations.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Student Registrations</h2>
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
                      Registered On
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentRegistrations.map((student) => (
                    <tr key={student?.id || Math.random().toString()} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {student?.firstName || ''} {student?.lastName || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{student?.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {student?.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link 
                          to={`/admin/students/${student?.id || ''}`}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          View
                        </Link>
                        <Link 
                          to={`/admin/students/${student?.id || ''}/assign`}
                          className="text-green-600 hover:text-green-900"
                        >
                          Assign to Class
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Students
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

      {/* All Students Table */}
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
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">Loading students...</p>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No students found matching your search.
                  </td>
                </tr>
              ) : (                filteredStudents.map((student) => (
                  <tr key={student?.id || Math.random().toString()} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          {student?.profileImage ? (
                            <img 
                              src={student.profileImage} 
                              alt={`${student?.firstName || ''} ${student?.lastName || ''}`}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <span className="text-gray-500 text-sm">
                              {student?.firstName?.[0] || ''}{student?.lastName?.[0] || ''}
                            </span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student?.firstName || ''} {student?.lastName || ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{student?.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{student?.phone || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${student?.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {student?.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {student?.enrolledClasses?.length || 0} classes
                      </div>                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link 
                        to={`/admin/students/${student?.id || ''}`}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        View
                      </Link>
                      <Link 
                        to={`/admin/students/${student?.id || ''}/assign`}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        Assign
                      </Link>
                      <button 
                        onClick={() => {
                          /* Add logic to open edit modal */
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
    </div>
  );
};

export default StudentManagement;