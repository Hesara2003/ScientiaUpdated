import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Home() {
  const [todayClasses, setTodayClasses] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [studentStats, setStudentStats] = useState({
    total: 0,
    active: 0,
    attention: 0
  });
  const [loading, setLoading] = useState(true);

  // In a real application, you would fetch this data from an API
  useEffect(() => {
    // Simulating API call with setTimeout
    setTimeout(() => {
      setTodayClasses([
        { id: 1, name: 'Advanced Mathematics', time: '09:00 - 10:30', room: 'Room 101', students: 24 },
        { id: 2, name: 'Physics Fundamentals', time: '11:00 - 12:30', room: 'Lab 3', students: 18 },
        { id: 3, name: 'Chemistry Lab', time: '14:00 - 15:30', room: 'Chemistry Lab 2', students: 16 }
      ]);
      
      setUpcomingAssignments([
        { id: 1, title: 'Calculus Problem Set', class: 'Advanced Mathematics', dueDate: '2025-05-20', submissions: 5, total: 24 },
        { id: 2, title: 'Physics Lab Report', class: 'Physics Fundamentals', dueDate: '2025-05-22', submissions: 0, total: 18 },
        { id: 3, title: 'Periodic Table Quiz', class: 'Chemistry Lab', dueDate: '2025-05-19', submissions: 8, total: 16 }
      ]);
      
      setStudentStats({
        total: 58,
        active: 52,
        attention: 6
      });
      
      setLoading(false);
    }, 800);
  }, []);

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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome back, Professor</h1>
        <p className="text-gray-600">Here's what's happening today</p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Stats overview */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-gradient-to-br from-cyan-50 to-sky-50 rounded-xl shadow-sm p-6 border border-sky-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Total Students</h3>
                <span className="p-2 bg-cyan-100 rounded-lg">
                  <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-800 mt-2">{studentStats.total}</p>
              <p className="text-sm text-gray-600 mt-1">Across 3 different classes</p>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl shadow-sm p-6 border border-emerald-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Active Students</h3>
                <span className="p-2 bg-emerald-100 rounded-lg">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-800 mt-2">{studentStats.active}</p>
              <p className="text-sm text-gray-600 mt-1">{Math.round((studentStats.active / studentStats.total) * 100)}% attendance rate</p>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl shadow-sm p-6 border border-amber-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Need Attention</h3>
                <span className="p-2 bg-amber-100 rounded-lg">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-800 mt-2">{studentStats.attention}</p>
              <p className="text-sm text-gray-600 mt-1">Students with low performance</p>
            </div>
          </motion.div>

          {/* Today's Classes */}
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Today's Classes</h2>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {todayClasses.map((classItem) => (
                      <tr key={classItem.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{classItem.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{classItem.time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{classItem.room}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{classItem.students} students</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-cyan-600 hover:text-cyan-900 mr-3">Details</button>
                          <button className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-md hover:bg-cyan-200">Start Class</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* Upcoming Assignments */}
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Upcoming Assignments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingAssignments.map((assignment) => (
                <div key={assignment.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">{assignment.title}</h3>
                        <p className="text-sm text-gray-500">{assignment.class}</p>
                      </div>
                      <span className="bg-cyan-100 text-cyan-800 text-xs px-2 py-1 rounded-md">
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Submissions</span>
                        <span className="text-sm font-medium text-gray-700">{assignment.submissions}/{assignment.total}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-cyan-600 h-2 rounded-full" style={{ width: `${(assignment.submissions/assignment.total)*100}%` }}></div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 mr-2">
                        View Details
                      </button>
                      <button className="px-3 py-1 bg-cyan-600 text-white rounded-md hover:bg-cyan-700">
                        Grade
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
