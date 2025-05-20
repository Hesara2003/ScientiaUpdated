import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as attendanceService from '../../services/attendanceService';
import * as studentService from '../../services/studentService';
import { getUser, ensureConsistentRole, getAuthHeaders } from '../../utils/authUtils';

export default function Attendance() {
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [classes, setClasses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAttendance, setNewAttendance] = useState({
    studentId: "",
    classId: "",
    date: new Date().toISOString().split('T')[0],
    status: "present", 
    notes: ""
  });
  const [students, setStudents] = useState([]); // State for student list
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 80
      }
    }
  };

  useEffect(() => {
    const fetchTutorData = async () => {
      setLoading(true);
      try {
        // Get current tutor user
        const user = getUser();
        if (!user || !user.id) {
          throw new Error('User information not available');
        }

        // Fetch classes taught by this tutor
        // In a real implementation, you would need an API endpoint for this
        // For now, using placeholder data until API is available
        const classesData = [
          { id: 1, name: "Advanced Mathematics", subject: "Mathematics" },
          { id: 2, name: "Physics for Engineers", subject: "Physics" },
          { id: 3, name: "Organic Chemistry", subject: "Chemistry" }
        ];
        setClasses(classesData);

        // Get all attendance records with enhanced student data
        const records = await attendanceService.getAllAttendanceRecords();
        console.log('Fetched attendance records with student data:', records.length);
        
        // Safety check to ensure records is an array
        const recordsArray = Array.isArray(records) ? records : [];
        
        // Filter records for classes taught by this tutor
        const classIds = classesData.map(cls => cls.id);
        const filteredRecords = recordsArray.filter(record => 
          classIds.includes(record.classId)
        );
        
        // Format data for display, using the enhanced student information
        const formattedData = filteredRecords.map(record => {
          const className = classesData.find(c => c.id === record.classId)?.name || 'Unknown Class';
          
          // Safely access student data with fallbacks
          const studentName = record.studentName || 
                    (record.student ? `${record.student.firstName} ${record.student.lastName}`.trim() : `Student #${record.studentId}`);
          
          return {
            id: record.id,
            date: record.date || new Date().toISOString().split('T')[0],
            className: className,
            studentName: studentName,
            studentId: record.studentId,
            student: record.student || null, // Include complete student object
            status: record.status ? (record.status.charAt(0).toUpperCase() + record.status.slice(1)) : 'Unknown', // Capitalize status
            notes: record.notes || ''
          };
        });
        
        setAttendanceData(formattedData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching attendance data:', err);
        setError('Failed to load attendance data. Please try again later.');
        setLoading(false);
      }
    };

    fetchTutorData();
  }, []);

  // Fetch students for the dropdown
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Get all students using our service
        const studentsData = await studentService.getAllStudents();
        console.log('Fetched students:', studentsData.length);
        setStudents(studentsData);
      } catch (err) {
        console.error('Error fetching students:', err);
        // Use sample data if API fails
        setStudents([
          { id: 1, firstName: 'John', lastName: 'Doe' },
          { id: 2, firstName: 'Jane', lastName: 'Smith' },
          { id: 3, firstName: 'Michael', lastName: 'Johnson' },
          { id: 4, firstName: 'Sarah', lastName: 'Williams' },
        ]);
      }
    };

    fetchStudents();
  }, []);
  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    try {
      const attendanceData = { ...newAttendance };
      
      // Make sure we're using student ID properly
      if (!attendanceData.studentId) {
        throw new Error("Student ID is required");
      }
        // Get current user info and add it to attendance record
      const user = getUser();
      
      // Ensure consistent role
      const userRole = ensureConsistentRole('tutor');
      
      attendanceData.tutorId = user?.id || localStorage.getItem('userId');
      attendanceData.createdBy = user?.id || localStorage.getItem('userId');
      attendanceData.userRole = userRole;
      
      // Create the attendance record
      const createdRecord = await attendanceService.createAttendance(attendanceData);
      console.log('Created attendance record:', createdRecord);
      
      // Reset the form and close modal
      setShowAddModal(false);
      setNewAttendance({
        studentId: "",
        classId: "",
        date: new Date().toISOString().split('T')[0],
        status: "present", 
        notes: ""
      });
        // Refetch attendance data with full student information
      setLoading(true);
      const records = await attendanceService.getAllAttendanceRecords();
      
      // Safety check - ensure records is an array
      const recordsArray = Array.isArray(records) ? records : [];
      
      // Filter and format data similar to useEffect
      const classIds = classes.map(cls => cls.id);
      const filteredRecords = recordsArray.filter(record => 
        classIds.includes(record.classId)
      );
      
      const formattedData = filteredRecords.map(record => {
        const className = classes.find(c => c.id === record.classId)?.name || 'Unknown Class';
        
        // Safely access student properties
        const student = record.student || {};
        const studentName = record.studentName || 
                  (student ? `${student.firstName || ''} ${student.lastName || ''}`.trim() : `Student #${record.studentId}`);
        
        return {
          id: record.id,
          date: record.date || new Date().toISOString().split('T')[0],
          className: className,
          studentName: studentName,
          studentId: record.studentId,
          student: student,
          status: record.status ? (record.status.charAt(0).toUpperCase() + record.status.slice(1)) : 'Unknown',
          notes: record.notes || ''
        };
      });
      
      setAttendanceData(formattedData);
      setLoading(false);
    } catch (err) {
      console.error('Error submitting attendance:', err);
      setError('Failed to submit attendance: ' + (err.message || 'Please try again.'));
    }
  };

  // Filter attendance based on selected options
  const filteredAttendance = attendanceData.filter(record => {
    if (selectedClass !== 'all') {
      const selectedClassObj = classes.find(c => c.id && c.id.toString() === selectedClass);
      if (!selectedClassObj || record.className !== selectedClassObj.name) {
        return false;
      }
    }
    
    // Filter by selected date
    const recordDate = new Date(record.date).toDateString();
    const filterDate = new Date(selectedDate).toDateString();
    if (recordDate !== filterDate) {
      return false;
    }
    
    return true;
  });

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-800';
      case 'Absent':
        return 'bg-red-100 text-red-800';
      case 'Late':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="px-4 py-6">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Attendance Management</h1>
          <p className="text-gray-600">Track and manage student attendance for your classes</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-teal-600 text-white font-medium rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          Record Attendance
        </button>
      </header>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Filters */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >                    <option value="all">All Classes</option>
                    {classes.map((cls, index) => (
                      <option key={cls.id || `class-filter-${index}`} value={cls.id ? cls.id.toString() : ''}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full md:w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Attendance Data */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAttendance.length > 0 ? (
                      filteredAttendance.map(record => (
                        <tr key={record.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{record.studentName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{record.className}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(record.date)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{record.notes}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-teal-600 hover:text-teal-900 mr-3">Edit</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                          No attendance records found for the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Add Attendance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div 
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Record Attendance</h3>
                
                <form onSubmit={handleAttendanceSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                    <select
                      value={newAttendance.studentId}
                      onChange={(e) => setNewAttendance({...newAttendance, studentId: e.target.value})}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                    >                      <option value="">Select a student</option>
                      {students.map((student, index) => (
                        <option key={student.id || `student-${index}`} value={student.id ? student.id.toString() : ''}>
                          {student.firstName} {student.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                    <select
                      value={newAttendance.classId}
                      onChange={(e) => setNewAttendance({...newAttendance, classId: e.target.value})}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                    >                      <option value="">Select a class</option>
                      {classes.map((cls, index) => (
                        <option key={cls.id || `class-${index}`} value={cls.id ? cls.id.toString() : ''}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={newAttendance.date}
                      onChange={(e) => setNewAttendance({...newAttendance, date: e.target.value})}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={newAttendance.status}
                      onChange={(e) => setNewAttendance({...newAttendance, status: e.target.value})}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={newAttendance.notes}
                      onChange={(e) => setNewAttendance({...newAttendance, notes: e.target.value})}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      rows="3"
                    ></textarea>
                  </div>
                  
                  <div className="sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
