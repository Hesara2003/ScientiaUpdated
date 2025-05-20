import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getParentById } from '../../services/parentService';
import { getParentStudents } from '../../services/parentStudentService';

export default function Children() {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [parentInfo, setParentInfo] = useState(null);
  // In a real app, this would come from authentication
  const parentId = localStorage.getItem('userId') || 'SamanthaP';
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get parent info
        const parent = await getParentById(parentId);
        setParentInfo(parent);
        
        // Get children data - use parent.id not parentId since that might be a username
        const childrenData = await getParentStudents(parent?.id || parentId);
        // Check if we have valid data
        if (Array.isArray(childrenData) && childrenData.length > 0) {
          // Enhance with additional data if needed
          const enhancedData = childrenData.map(child => ({
            id: child.id || child.studentId,
            studentId: child.studentId,
            name: child.name || child.studentName || 'Student ' + child.studentId,
            grade: child.grade || 'Grade not specified',
            age: child.age || 'N/A',
            teacherName: child.teacherName || 'Not assigned',
            courses: child.courses || [],
            attendance: child.attendance || 'N/A',
            performance: child.performance || 3,
            recentGrades: child.recentGrades || [
              { subject: "Mathematics", grade: "B+", score: "87/100" },
              { subject: "Science", grade: "A-", score: "90/100" }
            ],
            upcomingAssignments: child.upcomingAssignments || [
              { title: "Assignment 1", dueDate: "May 20, 2025" }
            ]
          }));
          
          setChildren(enhancedData);
        } else {
          // Set mock data as fallback
          setChildren([
            { 
              id: 1, 
              name: "Sarah Johnson", 
              grade: "8th Grade",
              age: 13,
              teacherName: "Ms. Williams",
              courses: ["Mathematics", "Science", "English", "History", "Art"],
              attendance: "95%",
              performance: 4,
              recentGrades: [
                { subject: "Mathematics", grade: "A", score: "92/100" },
                { subject: "Science", grade: "A-", score: "89/100" }
              ],
              upcomingAssignments: [
                { title: "Math Problem Set", dueDate: "May 18, 2025" },
                { title: "Science Lab Report", dueDate: "May 20, 2025" }
              ]
            },
            {
              id: 2,
              name: "Michael Johnson",
              grade: "6th Grade",
              age: 11,
              teacherName: "Mr. Davis",
              courses: ["Mathematics", "Science", "English", "Geography", "Music"],
              attendance: "92%",
              performance: 3,
              recentGrades: [
                { subject: "Mathematics", grade: "B+", score: "87/100" },
                { subject: "Science", grade: "A", score: "91/100" }
              ],
              upcomingAssignments: [
                { title: "Math Worksheet", dueDate: "May 17, 2025" },
                { title: "Science Project", dueDate: "May 24, 2025" }
              ]
            }
          ]);
        }
      } catch (err) {
        console.error('Error fetching children data:', err);
        setError('Failed to load your children\'s information. Please try again later.');
        
        // Set fallback data on error
        setChildren([
          { 
            id: 1, 
            name: "Sarah Johnson", 
            grade: "8th Grade",
            age: 13,
            teacherName: "Ms. Williams",
            courses: ["Mathematics", "Science", "English", "History", "Art"],
            attendance: "95%",
            performance: 4,
            recentGrades: [
              { subject: "Mathematics", grade: "A", score: "92/100" },
              { subject: "Science", grade: "A-", score: "89/100" }
            ],
            upcomingAssignments: [
              { title: "Math Problem Set", dueDate: "May 18, 2025" },
              { title: "Science Lab Report", dueDate: "May 20, 2025" }
            ]
          },
          {
            id: 2,
            name: "Michael Johnson",
            grade: "6th Grade",
            age: 11,
            teacherName: "Mr. Davis",
            courses: ["Mathematics", "Science", "English", "Geography", "Music"],
            attendance: "92%",
            performance: 3,
            recentGrades: [
              { subject: "Mathematics", grade: "B+", score: "87/100" },
              { subject: "Science", grade: "A", score: "91/100" }
            ],
            upcomingAssignments: [
              { title: "Math Worksheet", dueDate: "May 17, 2025" },
              { title: "Science Project", dueDate: "May 24, 2025" }
            ]
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [parentId]);
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

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.2
      }
    }
  };
  // Helper function to determine grade color
  const getGradeColor = (grade) => {
    if (!grade) return 'bg-gray-100 text-gray-800';
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800';
    if (grade.startsWith('B')) return 'bg-cyan-100 text-cyan-800';
    if (grade.startsWith('C')) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="px-4 py-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">My Children</h1>
        <p className="text-gray-600">View and manage information about your children</p>
      </header>

      {loading ? (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {children.map(child => (
              <motion.div 
                key={child.id}
                variants={itemVariants}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-500 to-green-500 flex items-center justify-center text-white text-xl font-medium">
                      {child.name ? child.name.charAt(0) : '?'}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800">{child.name || 'Unknown Student'}</h3>
                      <p className="text-sm text-gray-500">{child.grade || 'N/A'} | Age: {child.age || 'N/A'}</p>
                      <p className="text-sm text-gray-500 mt-1">Teacher: {child.teacherName || 'Not Assigned'}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Courses</h4>
                    <div className="flex flex-wrap gap-2">
                      {child.courses && Array.isArray(child.courses) ? child.courses.map((course, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium"
                        >
                          {course}
                        </span>
                      )) : (
                        <span className="text-sm text-gray-500">No courses registered</span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Attendance</p>
                      <p className="text-base font-medium text-gray-800">{child.attendance || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Recent Performance</p>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg 
                            key={star} 
                            className={`w-4 h-4 ${star <= 4 ? 'text-yellow-400' : 'text-gray-300'}`} 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedChild(child)} 
                    className="w-full px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm flex justify-center items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    View Full Profile
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Child Detail Modal */}
      <AnimatePresence>
        {selectedChild && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4">
            <motion.div 
              className="bg-white rounded-xl overflow-hidden max-w-3xl w-full"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">{selectedChild.name}'s Profile</h3>
                <button 
                  className="p-1 rounded-full hover:bg-gray-100"
                  onClick={() => setSelectedChild(null)}
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Personal Information</h4>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Grade</p>
                          <p className="text-sm font-medium text-gray-800">{selectedChild.grade}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Age</p>
                          <p className="text-sm font-medium text-gray-800">{selectedChild.age} years</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Teacher</p>
                          <p className="text-sm font-medium text-gray-800">{selectedChild.teacherName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Attendance</p>
                          <p className="text-sm font-medium text-gray-800">{selectedChild.attendance}</p>
                        </div>
                      </div>
                    </div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Recent Grades</h4>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="divide-y divide-gray-100">
                        {selectedChild.recentGrades && selectedChild.recentGrades.length > 0 ? (
                          selectedChild.recentGrades.map((grade, index) => (
                            <div key={index} className="py-2 flex items-center justify-between">
                              <span className="text-sm text-gray-800">{grade.subject}</span>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">{grade.score}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getGradeColor(grade.grade)}`}>
                                  {grade.grade}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-3 text-center text-gray-500 text-sm">No grade information available</div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Courses</h4>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex flex-wrap gap-2">
                        {selectedChild.courses && selectedChild.courses.length > 0 ? (
                          selectedChild.courses.map((course, index) => (
                            <span 
                              key={index} 
                              className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium"
                            >
                              {course}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">No courses registered</span>
                        )}
                      </div>
                    </div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Upcoming Assignments</h4>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="divide-y divide-gray-100">
                        {selectedChild.upcomingAssignments && Array.isArray(selectedChild.upcomingAssignments) ? (
                          selectedChild.upcomingAssignments.map((assignment, index) => (
                            <div key={index} className="py-2 flex items-center justify-between">
                              <span className="text-sm text-gray-800">{assignment.title}</span>
                              <span className="text-xs text-gray-500">Due: {assignment.dueDate}</span>
                            </div>
                          ))
                        ) : (
                          <div className="py-3 text-center text-gray-500 text-sm">No upcoming assignments</div>
                        )}
                      </div>
                    </div>
                    <div className="mt-6 flex justify-center">
                      <div className="bg-teal-50 px-4 py-3 rounded-lg text-center w-full">
                        <p className="text-sm text-teal-800">
                          <span className="font-medium">Note:</span> Schedule a meeting with {selectedChild.teacherName} for more detailed progress reports.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                <button 
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                  onClick={() => setSelectedChild(null)}
                >
                  Close
                </button>
                <button 
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm"
                >
                  Contact Teacher
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

