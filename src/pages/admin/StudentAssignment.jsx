import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import userService from '../../services/userService';
import classService from '../../services/classService';
import { debugObject, safeArray } from '../../utils/dataValidation';

const StudentAssignment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [student, setStudent] = useState(null);
  const [allClasses, setAllClasses] = useState([]);
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get the student ID from URL params
        const studentId = id;
        if (!studentId) {
          toast.error('Missing student ID');
          setError('No student ID provided');
          setLoading(false);
          return;
        }
        
        // Fetch student data with better error handling
        let studentData;
        try {
          studentData = await userService.getUserById(studentId);
          
          // Debug the response
          console.log('Student data response:', studentData);
          
          // Check if student data was found
          if (!studentData || Object.keys(studentData).length === 0) {
            console.warn(`No data found for student ID: ${studentId}`);
            // Instead of throwing, create fallback data
            studentData = {
              id: studentId,
              firstName: 'Unknown',
              lastName: 'Student',
              studentId: studentId,
              status: 'active'
            };
            setStudent(studentData);
            // Use toast.error instead of toast.warning
            toast.error('Student data could not be found');
          } else {
            // Set student data when valid
            setStudent(studentData);
          }
        } catch (studentError) {
          console.error('Error fetching student data:', studentError);
          
          // Create fallback student data
          const fallbackStudentData = {
            id: studentId,
            firstName: 'Unknown',
            lastName: 'Student',
            studentId: studentId,
            status: 'active'
          };
          
          // Use fallback data and show error to user
          setStudent(fallbackStudentData);
          // Use toast.error instead of toast.warning since warning isn't available
          toast.error('Using limited student info - some data could not be loaded');
        }
        try {
          console.log('Attempting to fetch class data for student:', studentId);
          
          // Fetch enrolled classes with proper error handling
          const enrolledClasses = await classService.getClassesForStudent(studentId);
          
          // Log the raw response for debugging
          console.log('Raw student enrolled classes response:', enrolledClasses);
          
          // Ensure we have an array to work with
          const safeEnrolledClasses = Array.isArray(enrolledClasses) ? enrolledClasses : [];
          console.log('Student enrolled classes (normalized):', safeEnrolledClasses);
          
          setEnrolledClasses(safeEnrolledClasses);
          
          // Fetch all available classes
          console.log('Fetching all available classes');
          const allClasses = await classService.getAllClasses();
          const safeAllClasses = Array.isArray(allClasses) ? allClasses : [];
          
          // Filter out classes the student is already enrolled in
          console.log('Filtering available classes');
          const enrolledIds = new Set(safeEnrolledClasses.map(c => String(c.id)));
          const availableClasses = safeAllClasses.filter(c => !enrolledIds.has(String(c.id)));
          
          console.log(`Found ${availableClasses.length} available classes after filtering`);
          setAvailableClasses(availableClasses);
        } catch (classError) {
          console.error('Error fetching class data:', classError);
          toast.error('Could not load class information');
          setEnrolledClasses([]);
          setAvailableClasses([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to load data');
        toast.error(`Error loading data: ${error.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleClassSelection = (classId) => {
    setSelectedClasses(prev => {
      if (prev.includes(classId)) {
        return prev.filter(id => id !== classId);
      } else {
        return [...prev, classId];
      }
    });
  };  const handleAssign = async () => {
    if (selectedClasses.length === 0) {
      toast.error('Please select at least one class to assign');
      return;
    }
    
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      // Validate student ID
      if (!id) {
        throw new Error('Missing student ID');
      }
      
      // Validate selected classes
      const validClassIds = safeArray(selectedClasses).filter(classId => classId);
      if (validClassIds.length === 0) {
        throw new Error('No valid class IDs selected');
      }
      
      debugObject('Classes to Enroll', validClassIds);
      console.log(`Enrolling student ${id} in ${validClassIds.length} classes`);
      
      // Use the bulk enroll API to assign student to multiple classes
      await classService.bulkEnrollStudents(id, validClassIds);
      
      toast.success(`Student successfully assigned to ${validClassIds.length} classes`);
      navigate(`/admin/students`);
    } catch (error) {
      console.error('Error assigning student to classes:', error);
      debugObject('Assignment Error', error);
      
      let errorMessage = 'Failed to assign student to classes';
      
      // Provide more specific error messages
      if (error.message) {
        errorMessage = `Assignment failed: ${error.message}`;
      } else if (error.response) {
        // Handle specific HTTP error codes
        if (error.response.status === 404) {
          errorMessage = 'Student or class not found';
        } else if (error.response.status === 400) {
          errorMessage = 'Invalid data for class assignment';
        } else if (error.response.status === 403) {
          errorMessage = 'Not authorized to assign classes to this student';
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Filter available classes based on search term
  const filteredClasses = availableClasses.filter(cls => {
    const className = cls.name ? cls.name.toLowerCase() : '';
    const subject = cls.subject ? cls.subject.toLowerCase() : '';
    const search = searchTerm.toLowerCase();
    
    return className.includes(search) || subject.includes(search);
  });

  if (loading && !student) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-blue-500">Loading student data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <button
              className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
              onClick={() => navigate('/admin/students')}
            >
              Go back to Students
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Assign to Classes</h1>
        {student && (
          <p className="text-gray-600">
            Assign {student.firstName} {student.lastName} to classes
          </p>
        )}
      </header>

      {/* Student Info Card */}
      {student && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 mb-8"
        >
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
              {student.firstName?.[0]}{student.lastName?.[0]}
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-bold text-gray-800">
                {student.firstName} {student.lastName}
              </h2>
              <p className="text-gray-600">{student.email}</p>
              <div className="mt-2">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  student.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {student.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Current Enrollments */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Currently Enrolled Classes</h2>
        
        {enrolledClasses.length === 0 ? (
          <p className="text-gray-500 italic">Not enrolled in any classes yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tutor
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enrolledClasses.map((cls) => (
                  <tr key={cls.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{cls.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{cls.subject}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {cls.schedule || 'Schedule not set'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {cls.tutorName || 'No tutor assigned'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Available Classes */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Available Classes</h2>
          
          <div className="w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search classes..."
              className="w-full border border-gray-300 rounded-md py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        {availableClasses.length === 0 ? (
          <p className="text-gray-500 italic">No available classes found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Select
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tutor
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClasses.map((cls) => (
                  <tr key={cls.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox"
                        checked={selectedClasses.includes(cls.id)}
                        onChange={() => handleClassSelection(cls.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{cls.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{cls.subject}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {cls.schedule || 'Schedule not set'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {cls.tutorName || 'No tutor assigned'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => navigate('/admin/students')}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          Cancel
        </button>
        <button
          onClick={handleAssign}
          disabled={selectedClasses.length === 0 || loading}
          className={`px-4 py-2 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            (selectedClasses.length === 0 || loading) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Assigning...' : 'Assign to Classes'}
        </button>
      </div>
    </div>
  );
};

export default StudentAssignment;
