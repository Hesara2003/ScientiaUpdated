import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import * as studentService from '../../services/studentService';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch student data
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        // Get students from API
        const studentsData = await studentService.getAllStudents();
        
        // Map API data to component format
        const mappedStudents = studentsData.map(student => ({
          id: student.id || student.studentId,
          name: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
          grade: student.grade || student.yearLevel || '10th Grade',
          classes: student.classes || student.enrolledClasses || [],
          // Generate avatar using initials if no photo URL
          avatar: student.photoUrl || `https://ui-avatars.com/api/?name=${student.firstName}+${student.lastName}&background=random`,
          // Default to 75% if no performance data
          performance: student.performance || student.academicPerformance || 75,
          // Default to 85% if no attendance data
          attendance: student.attendance || student.attendanceRate || 85,
          // Calculate status based on performance
          status: calculateStatus(student.performance || student.academicPerformance || 75)
        }));
        
        setStudents(mappedStudents);
        setError(null);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to load students. Please try again.');
        toast.error('Could not load student data');
        
        // Use mock data as fallback in case of API error
        setStudents(getMockStudentData());
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Calculate status based on performance
  const calculateStatus = (performance) => {
    if (performance >= 90) return 'excellent';
    if (performance >= 75) return 'good';
    if (performance >= 60) return 'average';
    return 'needsHelp';
  };

  // Filtering and sorting logic
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let comparison = 0;
    
    if (sortField === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortField === 'performance') {
      comparison = a.performance - b.performance;
    } else if (sortField === 'attendance') {
      comparison = a.attendance - b.attendance;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
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

  // Helper functions for UI
  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-cyan-100 text-cyan-800';
      case 'average':
        return 'bg-amber-100 text-amber-800';
      case 'needsHelp':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'excellent':
        return 'Excellent';
      case 'good':
        return 'Good';
      case 'average':
        return 'Average';
      case 'needsHelp':
        return 'Needs Help';
      default:
        return status;
    }
  };

  // View student details
  const handleViewStudent = (studentId) => {
    // Navigate to student detail page
    window.location.href = `/tutor/students/${studentId}`;
  };

  // Send message to student
  const handleSendMessage = (student) => {
    toast.success(`Message dialog opened for ${student.name}`);
    // Implement your messaging functionality here
  };

  return (
    <div className="px-4 py-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">My Students</h1>
        <p className="text-gray-600">View and manage students across all your classes</p>
      </header>

      {/* Filters and search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0">
          <button 
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${filterStatus === 'all' 
              ? 'bg-cyan-600 text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            All Students
          </button>
          <button 
            onClick={() => setFilterStatus('excellent')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${filterStatus === 'excellent' 
              ? 'bg-green-600 text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            Excellent
          </button>
          <button 
            onClick={() => setFilterStatus('good')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${filterStatus === 'good' 
              ? 'bg-cyan-600 text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            Good
          </button>
          <button 
            onClick={() => setFilterStatus('average')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${filterStatus === 'average' 
              ? 'bg-amber-600 text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            Average
          </button>
          <button 
            onClick={() => setFilterStatus('needsHelp')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${filterStatus === 'needsHelp' 
              ? 'bg-red-600 text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            Needs Help
          </button>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search students..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>

      {/* Error state */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-sm font-medium text-red-700 hover:text-red-800"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading and content */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                  <div className="w-24 h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      onClick={() => handleSort('name')}
                      className="flex items-center focus:outline-none"
                    >
                      Student
                      {sortField === 'name' && (
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={
                            sortDirection === 'asc' 
                              ? "M5 15l7-7 7 7" 
                              : "M19 9l-7 7-7-7"
                          }></path>
                        </svg>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Classes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      onClick={() => handleSort('performance')}
                      className="flex items-center focus:outline-none"
                    >
                      Performance
                      {sortField === 'performance' && (
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={
                            sortDirection === 'asc' 
                              ? "M5 15l7-7 7 7" 
                              : "M19 9l-7 7-7-7"
                          }></path>
                        </svg>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      onClick={() => handleSort('attendance')}
                      className="flex items-center focus:outline-none"
                    >
                      Attendance
                      {sortField === 'attendance' && (
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={
                            sortDirection === 'asc' 
                              ? "M5 15l7-7 7 7" 
                              : "M19 9l-7 7-7-7"
                          }></path>
                        </svg>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedStudents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                      No students found matching your criteria
                    </td>
                  </tr>
                ) : (
                  sortedStudents.map(student => (
                    <motion.tr 
                      key={student.id} 
                      variants={itemVariants} 
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img 
                              className="h-10 w-10 rounded-full object-cover"
                              src={student.avatar} 
                              alt={student.name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${student.name}&background=random`;
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.grade}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {Array.isArray(student.classes) && student.classes.length > 0 ? (
                            student.classes.map((cls, index) => (
                              <span key={index} className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-semibold text-gray-700 mr-2 mb-1">
                                {typeof cls === 'string' ? cls : cls.name || 'Class'}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400">No classes</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full ${
                                student.performance >= 90 ? 'bg-green-500' : 
                                student.performance >= 75 ? 'bg-cyan-500' : 
                                student.performance >= 60 ? 'bg-amber-500' : 
                                'bg-red-500'
                              }`} 
                              style={{ width: `${student.performance}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-700">{student.performance}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full ${
                                student.attendance >= 90 ? 'bg-green-500' : 
                                student.attendance >= 75 ? 'bg-cyan-500' : 
                                student.attendance >= 60 ? 'bg-amber-500' : 
                                'bg-red-500'
                              }`} 
                              style={{ width: `${student.attendance}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-700">{student.attendance}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(student.status)}`}>
                          {getStatusText(student.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleViewStudent(student.id)}
                          className="text-cyan-600 hover:text-cyan-900 mr-3"
                        >
                          View Profile
                        </button>
                        <button 
                          onClick={() => handleSendMessage(student)}
                          className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-md hover:bg-cyan-200"
                        >
                          Send Message
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Fallback mock data function
function getMockStudentData() {
  return [
    {
      id: 1,
      name: 'Emma Thompson',
      grade: '11th Grade',
      classes: ['Advanced Mathematics', 'Physics Fundamentals'],
      avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
      performance: 92,
      attendance: 98,
      status: 'excellent'
    },
    {
      id: 2,
      name: 'Lucas Rodriguez',
      grade: '10th Grade',
      classes: ['Physics Fundamentals'],
      avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
      performance: 78,
      attendance: 85,
      status: 'good'
    },
    {
      id: 3,
      name: 'Olivia Johnson',
      grade: '11th Grade',
      classes: ['Advanced Mathematics', 'Chemistry Lab'],
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      performance: 65,
      attendance: 72,
      status: 'average'
    },
    {
      id: 4,
      name: 'Ethan Williams',
      grade: '11th Grade',
      classes: ['Chemistry Lab'],
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
      performance: 88,
      attendance: 95,
      status: 'good'
    },
    {
      id: 5,
      name: 'Sophia Chen',
      grade: '10th Grade',
      classes: ['Physics Fundamentals'],
      avatar: 'https://randomuser.me/api/portraits/women/79.jpg',
      performance: 94,
      attendance: 100,
      status: 'excellent'
    },
    {
      id: 6,
      name: 'Noah Garcia',
      grade: '11th Grade',
      classes: ['Advanced Mathematics', 'Chemistry Lab'],
      avatar: 'https://randomuser.me/api/portraits/men/36.jpg',
      performance: 59,
      attendance: 65,
      status: 'needsHelp'
    },
    {
      id: 7,
      name: 'Ava Patel',
      grade: '12th Grade',
      classes: ['Biology Advanced'],
      avatar: 'https://randomuser.me/api/portraits/women/14.jpg',
      performance: 81,
      attendance: 88,
      status: 'good'
    },
    {
      id: 8,
      name: 'James Wilson',
      grade: '10th Grade',
      classes: ['Physics Fundamentals'],
      avatar: 'https://randomuser.me/api/portraits/men/83.jpg',
      performance: 48,
      attendance: 60,
      status: 'needsHelp'
    }
  ];
}
