import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as attendanceService from '../../services/attendanceService';
import { getUser } from '../../utils/authUtils';

export default function Attendance() {
  const [selectedChild, setSelectedChild] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('may');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [children, setChildren] = useState([]);
  
  // Months dropdown options
  const months = [
    { value: 'jan', label: 'January' },
    { value: 'feb', label: 'February' },
    { value: 'mar', label: 'March' },
    { value: 'apr', label: 'April' },
    { value: 'may', label: 'May' },
    { value: 'jun', label: 'June' },
    { value: 'jul', label: 'July' },
    { value: 'aug', label: 'August' },
    { value: 'sep', label: 'September' },
    { value: 'oct', label: 'October' },
    { value: 'nov', label: 'November' },
    { value: 'dec', label: 'December' }
  ];

  useEffect(() => {
    const fetchParentData = async () => {
      setLoading(true);
      try {
        // Get current parent user
        const user = getUser();
        if (!user || !user.id) {
          throw new Error('User information not available');
        }

        // Get all attendance records with enhanced student data
        const records = await attendanceService.getAllAttendanceRecords();
        console.log('Fetched attendance records with student data:', records.length);
        
        // Extract unique students from the attendance records to create children list
        const uniqueStudents = new Map();
        records.forEach(record => {
          if (record.student && !uniqueStudents.has(record.student.id)) {
            uniqueStudents.set(record.student.id, {
              id: record.student.id,
              name: `${record.student.firstName} ${record.student.lastName}`.trim() || record.studentName || 'Unknown Student'
            });
          }
        });
        
        // Create children array from unique students
        const childrenData = Array.from(uniqueStudents.values());
        
        // If no children found, provide sample data (for development only)
        if (childrenData.length === 0) {
          console.warn('No student data found in attendance records, using sample data');
          childrenData.push(
            { id: 1, name: "Sarah Johnson" },
            { id: 2, name: "Michael Johnson" }
          );
        }
        
        setChildren(childrenData);
        console.log('Children data:', childrenData);

        // Format data for display using enhanced student data
        const formattedData = records.map(record => {
          return {
            id: record.id,
            date: record.date,
            studentId: record.studentId,
            studentName: record.studentName || 
                       (record.student ? `${record.student.firstName} ${record.student.lastName}`.trim() : 'Unknown Student'),
            course: record.className || record.class?.name || 'Unknown Course',
            status: record.status.charAt(0).toUpperCase() + record.status.slice(1), // Capitalize status
            note: record.notes || record.note || ''
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

    fetchParentData();
  }, []);// Animation variants
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

  // Filter attendance based on selected options
  const filteredAttendance = attendanceData.filter(record => {
    if (selectedChild !== 'all' && record.studentName !== children.find(c => c.id.toString() === selectedChild)?.name) {
      return false;
    }
    return true;
  });

  // Group attendance records by date
  const groupedAttendance = filteredAttendance.reduce((acc, record) => {
    const date = record.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(record);
    return acc;
  }, {});

  // Calculate statistics
  const calculateStats = (studentName) => {
    const studentRecords = attendanceData.filter(record => record.studentName === studentName);
    const total = studentRecords.length;
    const present = studentRecords.filter(record => record.status === 'Present').length;
    const absent = studentRecords.filter(record => record.status === 'Absent').length;
    const late = studentRecords.filter(record => record.status === 'Late').length;
    
    const presentPercentage = total > 0 ? Math.round((present / total) * 100) : 0;
    
    return {
      total,
      present,
      absent,
      late,
      presentPercentage
    };
  };

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
  };    return (
    <div className="px-4 py-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Attendance Records</h1>
        <p className="text-gray-600">Track your children's attendance records and statistics</p>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Child</label>
                  <select
                    value={selectedChild}
                    onChange={(e) => setSelectedChild(e.target.value)}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="all">All Children</option>
                    {children.map(child => (
                      <option key={child.id} value={child.id.toString()}>
                        {child.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full md:w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Month</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    {months.map(month => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats for each child */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {children.map(child => {
                const stats = calculateStats(child.name);
                return (
                  <div 
                    key={child.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                  >
                    <div className="p-6">
                      <h2 className="text-lg font-bold text-gray-800 mb-4">{child.name}'s Attendance</h2>

                      <div className="mb-6">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-gray-600">Attendance Rate</span>
                          <span className="text-sm font-medium text-gray-900">{stats.presentPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-teal-600 h-2.5 rounded-full" 
                            style={{ width: `${stats.presentPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-green-50 p-3 rounded-lg text-center">
                          <div className="text-xl font-bold text-green-600">{stats.present}</div>
                          <div className="text-xs text-green-700">Present</div>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg text-center">
                          <div className="text-xl font-bold text-red-600">{stats.absent}</div>
                          <div className="text-xs text-red-700">Absent</div>
                        </div>
                        <div className="bg-amber-50 p-3 rounded-lg text-center">
                          <div className="text-xl font-bold text-amber-600">{stats.late}</div>
                          <div className="text-xs text-amber-700">Late</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Daily attendance records */}
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Daily Records</h2>

            <div className="space-y-4">
              {Object.entries(groupedAttendance).map(([date, records]) => (
                <div 
                  key={date}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
                    <h3 className="font-medium text-gray-800">{formatDate(date)}</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {records.map(record => (
                      <div key={record.id} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-medium mr-3">
                              {record.studentName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{record.studentName}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                              {record.status}
                            </span>
                          </div>
                        </div>
                        {record.note && (
                          <div className="mt-2 ml-13">
                            <p className="text-sm text-gray-500 ml-13">
                              <span className="font-medium">Note:</span> {record.note}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {Object.keys(groupedAttendance).length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 text-center border border-gray-100">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <p className="text-gray-500">No attendance records found for the selected filters.</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

