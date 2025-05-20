import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as attendanceService from '../../services/attendanceService';
import { getUser } from '../../utils/authUtils';

export default function Attendance() {
  const [selectedMonth, setSelectedMonth] = useState('may');
  const [attendanceData, setAttendanceData] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
    const fetchAttendanceData = async () => {
      setLoading(true);
      try {
        // Get current user
        const user = getUser();
        if (!user || !user.id) {
          throw new Error('User information not available');
        }

        // Get all attendance records (now enhanced with student data)
        const records = await attendanceService.getAllAttendanceRecords();
        
        // Filter records for the current student
        const studentRecords = records.filter(record => {
          // Try multiple ways to match the current user with attendance records
          return (
            record.studentId === user.id || 
            record.student?.id === user.id ||
            (record.student?.username && user.sub && record.student.username === user.sub)
          );
        });
        
        console.log('Found attendance records for current student:', studentRecords.length);
        
        // Format data for display
        const formattedData = studentRecords.map(record => ({
          id: record.id,
          date: record.date,
          course: record.className || record.class?.name || 'Unknown Course',
          status: record.status.charAt(0).toUpperCase() + record.status.slice(1), // Capitalize status
          note: record.notes || record.note || '',
          // Include student info
          studentName: record.studentName || `${record.student?.firstName || ''} ${record.student?.lastName || ''}`.trim() || 'Unknown Student'
        }));
        
        setAttendanceData(formattedData);
        setStats(calculateStats(formattedData));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching attendance data:', err);
        setError('Failed to load attendance data. Please try again later.');
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  // Calculate statistics per course
  const calculateStats = (data) => {
    const courses = [...new Set(data.map(record => record.course))];
    
    return courses.map(course => {
      const courseRecords = data.filter(record => record.course === course);
      const total = courseRecords.length;
      const present = courseRecords.filter(record => record.status === 'Present').length;
      const absent = courseRecords.filter(record => record.status === 'Absent').length;
      const late = courseRecords.filter(record => record.status === 'Late').length;
      
      const presentPercentage = total > 0 ? Math.round((present / total) * 100) : 0;
      
      return {
        course,
        total,
        present,
        absent,
        late,
        presentPercentage
      };
    });
  };

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
  return (
    <div className="px-4 py-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">My Attendance</h1>
        <p className="text-gray-600">View your attendance records for all courses</p>
      </header>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div>
          {/* Summary Cards Loading State */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            ))}
          </div>
          
          {/* Table Loading State */}
          <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse mb-8">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Month Selector */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="max-w-xs">
              <label htmlFor="month-select" className="block text-sm font-medium text-gray-700 mb-1">
                Select Month
              </label>
              <select
                id="month-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
          
          {/* Attendance Summary */}
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Attendance Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((courseStat, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">{courseStat.course}</h3>
                  
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Attendance Rate</span>
                    <span className={`font-semibold ${
                      courseStat.presentPercentage >= 90 ? 'text-green-600' : 
                      courseStat.presentPercentage >= 80 ? 'text-indigo-600' : 
                      'text-red-600'
                    }`}>
                      {courseStat.presentPercentage}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className={`h-2 rounded-full ${
                        courseStat.presentPercentage >= 90 ? 'bg-green-600' : 
                        courseStat.presentPercentage >= 80 ? 'bg-indigo-600' : 
                        'bg-red-600'
                      }`}
                      style={{ width: `${courseStat.presentPercentage}%` }}
                    ></div>
                  </div>
                  
                  <div className="space-y-2 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Days Present</span>
                      <span className="text-sm font-medium">{courseStat.present}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Days Absent</span>
                      <span className="text-sm font-medium">{courseStat.absent}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Days Late</span>
                      <span className="text-sm font-medium">{courseStat.late}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* Attendance Details */}
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Attendance Details</h2>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendanceData.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(row.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {row.course}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            row.status === 'Present' ? 'bg-green-100 text-green-800' : 
                            row.status === 'Late' ? 'bg-amber-100 text-amber-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {row.note || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
