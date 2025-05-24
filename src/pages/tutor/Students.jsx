import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import * as studentService from '../../services/studentService';
import * as attendanceService from '../../services/attendanceService';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  // Fetch student data with real attendance
  useEffect(() => {
    const fetchStudentsWithAttendance = async () => {
      setLoading(true);
      try {
        // Get students and attendance data concurrently
        const [studentsData, attendanceRecords] = await Promise.all([
          studentService.getAllStudents(),
          attendanceService.getAllAttendanceRecords()
        ]);
        
        console.log('Students data:', studentsData);
        console.log('Attendance records:', attendanceRecords);
        
        // Calculate attendance rates for each student
        const attendanceMap = calculateAttendanceRates(attendanceRecords);
        
        // Map API data to component format with real attendance
        const mappedStudents = studentsData.map(student => {
          const studentId = student.id || student.studentId;
          const attendanceData = attendanceMap.get(studentId) || { rate: 0, total: 0, present: 0 };
          
          return {
            id: studentId,
            name: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
            grade: student.grade || student.yearLevel || '10th Grade',
            classes: student.classes || student.enrolledClasses || [],
            // Generate avatar using initials if no photo URL
            avatar: student.photoUrl || `https://ui-avatars.com/api/?name=${student.firstName}+${student.lastName}&background=random`,
            // Default to 75% if no performance data
            performance: student.performance || student.academicPerformance || 75,
            // Use real attendance data
            attendance: Math.round(attendanceData.rate),
            attendanceDetails: attendanceData,
            // Calculate status based on performance
            status: calculateStatus(student.performance || student.academicPerformance || 75)
          };
        });
        
        setStudents(mappedStudents);
        setError(null);
        toast.success(`Loaded ${mappedStudents.length} students with real attendance data`);
      } catch (err) {
        console.error('Error fetching students with attendance:', err);
        setError('Failed to load students and attendance data. Please try again.');
        toast.error('Could not load student data');
        
        // Use mock data as fallback in case of API error
        setStudents(getMockStudentData());
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsWithAttendance();
  }, []);

  // Calculate attendance rates from attendance records
  const calculateAttendanceRates = (attendanceRecords) => {
    const attendanceMap = new Map();
    
    if (!Array.isArray(attendanceRecords)) {
      console.warn('Invalid attendance records:', attendanceRecords);
      return attendanceMap;
    }
    
    // Group attendance records by student
    const studentAttendance = {};
    
    attendanceRecords.forEach(record => {
      const studentId = record.studentId || record.student?.studentId;
      
      if (!studentId) {
        console.warn('Attendance record missing studentId:', record);
        return;
      }
      
      if (!studentAttendance[studentId]) {
        studentAttendance[studentId] = {
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0
        };
      }
      
      studentAttendance[studentId].total++;
      
      // Count different attendance statuses
      const status = (record.status || '').toLowerCase();
      switch (status) {
        case 'present':
          studentAttendance[studentId].present++;
          break;
        case 'absent':
          studentAttendance[studentId].absent++;
          break;
        case 'late':
          studentAttendance[studentId].late++;
          studentAttendance[studentId].present++; // Late still counts as present
          break;
        case 'excused':
          studentAttendance[studentId].excused++;
          break;
        default:
          // Default to present if status is unclear
          studentAttendance[studentId].present++;
          break;
      }
    });
    
    // Calculate attendance rates
    Object.entries(studentAttendance).forEach(([studentId, data]) => {
      const rate = data.total > 0 ? (data.present / data.total) * 100 : 0;
      attendanceMap.set(parseInt(studentId), {
        rate: rate,
        total: data.total,
        present: data.present,
        absent: data.absent,
        late: data.late,
        excused: data.excused
      });
    });
    
    console.log('Calculated attendance rates:', attendanceMap);
    return attendanceMap;
  };

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

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100
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

  // Get attendance details tooltip
  const getAttendanceTooltip = (student) => {
    const details = student.attendanceDetails;
    if (!details || details.total === 0) {
      return 'No attendance records';
    }
    return `Total: ${details.total} | Present: ${details.present} | Absent: ${details.absent} | Late: ${details.late}`;
  };

  // Enhanced loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="animate-pulse">
        <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      
      {/* Filters skeleton */}
      <div className="flex space-x-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-10 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
        ))}
      </div>
      
      {/* Table skeleton */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center space-x-4 animate-pulse">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="w-32 h-3 bg-gray-200 rounded-full"></div>
              <div className="w-24 h-8 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Enhanced student card component
  const StudentCard = ({ student }) => (
    <motion.div
      variants={cardVariants}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-cyan-200 transition-all duration-300 overflow-hidden group"
    >
      <div className="p-6">
        {/* Card header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img 
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-gray-100 group-hover:ring-cyan-200 transition-all duration-300"
                src={student.avatar} 
                alt={student.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${student.name}&background=random`;
                }}
              />
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                student.attendance >= 90 ? 'bg-green-500' : 
                student.attendance >= 75 ? 'bg-cyan-500' : 
                student.attendance >= 60 ? 'bg-amber-500' : 'bg-red-500'
              }`}>
                {student.attendance}%
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-cyan-700 transition-colors">
                {student.name}
              </h3>
              <p className="text-sm text-gray-500">{student.grade}</p>
            </div>
          </div>
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(student.status)}`}>
            {getStatusText(student.status)}
          </span>
        </div>

        {/* Performance metrics */}
        <div className="space-y-3 mb-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">Performance</span>
              <span className="text-sm text-gray-600">{student.performance}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  student.performance >= 90 ? 'bg-gradient-to-r from-green-400 to-green-600' : 
                  student.performance >= 75 ? 'bg-gradient-to-r from-cyan-400 to-cyan-600' : 
                  student.performance >= 60 ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 
                  'bg-gradient-to-r from-red-400 to-red-600'
                }`} 
                style={{ width: `${student.performance}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">Attendance</span>
              <span className="text-sm text-gray-600">{student.attendance}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  student.attendance >= 90 ? 'bg-gradient-to-r from-green-400 to-green-600' : 
                  student.attendance >= 75 ? 'bg-gradient-to-r from-cyan-400 to-cyan-600' : 
                  student.attendance >= 60 ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 
                  'bg-gradient-to-r from-red-400 to-red-600'
                }`} 
                style={{ width: `${student.attendance}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Classes */}
        <div className="mb-4">
          <span className="text-sm font-medium text-gray-700 mb-2 block">Classes</span>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(student.classes) && student.classes.length > 0 ? (
              student.classes.slice(0, 2).map((cls, index) => (
                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-cyan-50 to-cyan-100 text-cyan-800 border border-cyan-200">
                  {typeof cls === 'string' ? cls : cls.name || 'Class'}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-400">No classes assigned</span>
            )}
            {student.classes && student.classes.length > 2 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                +{student.classes.length - 2} more
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button 
            onClick={() => handleViewStudent(student.id)}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white text-sm font-medium rounded-lg hover:from-cyan-600 hover:to-cyan-700 transition-all duration-200 transform hover:scale-105"
          >
            View Profile
          </button>
          <button 
            onClick={() => handleSendMessage(student)}
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a9.952 9.952 0 01-4.824-1.217L3 22l1.217-5.176A9.952 9.952 0 013 12C3 7.582 6.582 4 12 4s8 3.582 8 8z"></path>
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-6">
      {/* Enhanced header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              My Students
            </h1>
            <p className="text-gray-600 flex items-center">
              <svg className="w-5 h-5 mr-2 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
              View and manage students across all your classes
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
              className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {viewMode === 'table' ? (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                </svg>
              )}
              {viewMode === 'table' ? 'Grid View' : 'Table View'}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Enhanced filters and search */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Status filters */}
            <div className="flex flex-wrap gap-3">
            {[
              {
                key: 'all',
                label: 'All Students',
                icon: '👥',
                color: 'gray'
              },
              {
                key: 'excellent',
                label: 'Excellent',
                icon: '⭐',
                color: 'green'
              },
              {
                key: 'good',
                label: 'Good',
                icon: '👍',
                color: 'cyan'
              },
              {
                key: 'average',
                label: 'Average',
                icon: '📊',
                color: 'amber'
              },
              {
                key: 'needsHelp',
                label: 'Needs Help',
                icon: '🆘',
                color: 'red'
              }
            ].map(filter => (
                <button 
                  key={filter.key}
                  onClick={() => setFilterStatus(filter.key)}
                  className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                    filterStatus === filter.key
                      ? `bg-gradient-to-r from-${filter.color}-500 to-${filter.color}-600 text-white shadow-lg`
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{filter.icon}</span>
                  {filter.label}
                  {filterStatus === filter.key && (
                    <span className="ml-2 bg-white bg-opacity-20 rounded-full px-2 py-0.5 text-xs">
                      {filter.key === 'all' ? students.length : sortedStudents.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search students..."
                className="pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:bg-white transition-all duration-200 w-full lg:w-80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Error state */}
      {error && !loading && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-6 shadow-sm"
        >
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 text-sm font-medium text-red-800 hover:text-red-900 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Content */}
      {loading ? (
        <LoadingSkeleton />
      ) : viewMode === 'grid' ? (
        // Grid view
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {sortedStudents.length === 0 ? (
            <div className="col-span-full">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center"
              >
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </motion.div>
            </div>
          ) : (
            sortedStudents.map(student => (
              <StudentCard key={student.id} student={student} />
            ))
          )}
        </motion.div>
      ) : (
        // Enhanced table view
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  {/* Enhanced table headers with better styling */}
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <button 
                      onClick={() => handleSort('name')}
                      className="flex items-center group hover:text-cyan-600 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      Student
                      {sortField === 'name' && (
                        <svg className="w-4 h-4 ml-2 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={
                            sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"
                          }></path>
                        </svg>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Classes
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <button 
                      onClick={() => handleSort('performance')}
                      className="flex items-center group hover:text-cyan-600 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                      </svg>
                      Performance
                      {sortField === 'performance' && (
                        <svg className="w-4 h-4 ml-2 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={
                            sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"
                          }></path>
                        </svg>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <button 
                      onClick={() => handleSort('attendance')}
                      className="flex items-center group hover:text-cyan-600 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                      </svg>
                      Attendance (Real Data)
                      {sortField === 'attendance' && (
                        <svg className="w-4 h-4 ml-2 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={
                            sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"
                          }></path>
                        </svg>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedStudents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                        </svg>
                        <p className="text-lg font-medium text-gray-900 mb-2">No students found</p>
                        <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedStudents.map(student => (
                    <motion.tr 
                      key={student.id} 
                      variants={itemVariants} 
                      className="hover:bg-gradient-to-r hover:from-cyan-50 hover:to-transparent transition-all duration-200 group"
                    >
                      {/* Enhanced table cells with better styling */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="relative flex-shrink-0">
                            <img 
                              className="h-12 w-12 rounded-xl object-cover ring-2 ring-gray-100 group-hover:ring-cyan-200 transition-all duration-200"
                              src={student.avatar} 
                              alt={student.name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${student.name}&background=random`;
                              }}
                            />
                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                              student.performance >= 90 ? 'bg-green-500' : 
                              student.performance >= 75 ? 'bg-cyan-500' : 
                              student.performance >= 60 ? 'bg-amber-500' : 'bg-red-500'
                            }`}>
                              ✓
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900 group-hover:text-cyan-700 transition-colors">
                              {student.name}
                            </div>
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
                              className={`h-2 rounded-full transition-all duration-500 ${
                                student.performance >= 90 ? 'bg-gradient-to-r from-green-400 to-green-600' : 
                                student.performance >= 75 ? 'bg-gradient-to-r from-cyan-400 to-cyan-600' : 
                                student.performance >= 60 ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 
                                'bg-gradient-to-r from-red-400 to-red-600'
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
                              className={`h-2 rounded-full transition-all duration-500 ${
                                student.attendance >= 90 ? 'bg-gradient-to-r from-green-400 to-green-600' : 
                                student.attendance >= 75 ? 'bg-gradient-to-r from-cyan-400 to-cyan-600' : 
                                student.attendance >= 60 ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 
                                'bg-gradient-to-r from-red-400 to-red-600'
                              }`} 
                              style={{ width: `${student.attendance}%` }}
                            ></div>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-700">{student.attendance}%</span>
                            {student.attendanceDetails && student.attendanceDetails.total > 0 && (
                              <span className="text-xs text-gray-500" title={getAttendanceTooltip(student)}>
                                {student.attendanceDetails.present}/{student.attendanceDetails.total} sessions
                              </span>
                            )}
                          </div>
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
