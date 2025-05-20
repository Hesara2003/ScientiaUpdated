import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import FaqWidget from '../../components/common/FaqWidget';

export default function Home() {
  const [currentCourses, setCurrentCourses] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [courseStats, setCourseStats] = useState({
    totalCourses: 0,
    completedAssignments: 0,
    pendingAssignments: 0
  });
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState(() => {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    return user.firstName || 'Student';
  });

  // In a real application, you would fetch this data from an API
  useEffect(() => {
    // Simulating API call with setTimeout
    setTimeout(() => {
      setCurrentCourses([
        { 
          id: 1, 
          name: "Advanced Mathematics", 
          progress: 68,
          nextClass: "Today, 10:00 AM",
          instructor: "Dr. Robert Chen",
          assignment: "Problem Set 7 due on May 20"
        },
        { 
          id: 2, 
          name: "Physics 101", 
          progress: 75,
          nextClass: "Tomorrow, 11:30 AM",
          instructor: "Prof. Sarah Williams",
          assignment: "Lab Report due on May 19"
        },
        { 
          id: 3, 
          name: "English Literature", 
          progress: 90,
          nextClass: "Thursday, 2:00 PM",
          instructor: "Ms. Angela Davis",
          assignment: "Essay draft due on May 22"
        }
      ]);
      
      setUpcomingExams([
        { id: 1, subject: "Advanced Mathematics", date: "May 25, 2025", time: "09:00 AM - 11:00 AM", location: "Hall A" },
        { id: 2, subject: "Physics 101", date: "May 27, 2025", time: "01:00 PM - 03:00 PM", location: "Science Lab" }
      ]);
      
      setAnnouncements([
        { id: 1, message: "Campus will be closed on May 20 for maintenance", date: "Posted today" },
        { id: 2, message: "Library extended hours during finals week", date: "Posted yesterday" },
        { id: 3, message: "Career fair scheduled for June 5", date: "Posted on May 10" }
      ]);
      
      setCourseStats({
        totalCourses: 3,
        completedAssignments: 5,
        pendingAssignments: 3
      });
      
      setLoading(false);
    }, 800);
  }, []);

  // Show welcome message when student first logs in
  useEffect(() => {
    const isFirstVisit = !localStorage.getItem('studentVisited');
    if (isFirstVisit) {
      localStorage.setItem('studentVisited', 'true');
    }
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
    <div className="p-4 space-y-6">
      {/* Welcome Banner for Student */}
      <motion.div 
        className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg text-white p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome to your Student Dashboard, {studentName}!</h1>
            <p className="mt-2 text-blue-100">
              Access your courses, assignments, exams, and track your academic progress all in one place.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 md:mt-0 bg-white text-indigo-600 font-medium py-2 px-4 rounded-lg shadow-md hover:bg-blue-50 transition-colors"
            onClick={() => window.location.href = '/student/courses'}
          >
            View My Courses
          </motion.button>
        </div>
      </motion.div>

      {/* Grid Layout for Dashboard */}
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
                <h3 className="text-lg font-semibold text-gray-800">Total Courses</h3>
                <span className="p-2 bg-cyan-100 rounded-lg">
                  <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-800 mt-2">{courseStats.totalCourses}</p>
              <p className="text-sm text-gray-600 mt-1">Enrolled this semester</p>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl shadow-sm p-6 border border-emerald-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Completed</h3>
                <span className="p-2 bg-emerald-100 rounded-lg">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-800 mt-2">{courseStats.completedAssignments}</p>
              <p className="text-sm text-gray-600 mt-1">Assignments completed</p>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl shadow-sm p-6 border border-amber-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Pending</h3>
                <span className="p-2 bg-amber-100 rounded-lg">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-800 mt-2">{courseStats.pendingAssignments}</p>
              <p className="text-sm text-gray-600 mt-1">Assignments due soon</p>
            </div>
          </motion.div>

          {/* Current Courses */}
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">My Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {currentCourses.map((course) => (
                <div key={course.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">{course.name}</h3>
                        <p className="text-sm text-gray-500">Instructor: {course.instructor}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-md ${
                        course.progress >= 90 ? 'bg-green-100 text-green-800' :
                        course.progress >= 70 ? 'bg-cyan-100 text-cyan-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {course.progress}% Complete
                      </span>
                    </div>
                    
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full ${
                          course.progress >= 90 ? 'bg-green-600' :
                          course.progress >= 70 ? 'bg-cyan-600' :
                          'bg-amber-600'
                        }`} style={{ width: `${course.progress}%` }}></div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">Next class: {course.nextClass}</p>
                      <p className="text-sm text-gray-600 mt-1">{course.assignment}</p>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <button className="px-3 py-1 bg-cyan-600 text-white rounded-md hover:bg-cyan-700">
                        View Course
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Upcoming Exams & Announcements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upcoming Exams */}
            <motion.div variants={itemVariants}>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Upcoming Exams</h2>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {upcomingExams.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-gray-500">No upcoming exams scheduled</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {upcomingExams.map((exam) => (
                      <div key={exam.id} className="p-4 hover:bg-gray-50">
                        <h3 className="font-medium text-gray-900">{exam.subject}</h3>
                        <p className="text-sm text-gray-500 mt-1">{exam.date} • {exam.time}</p>
                        <p className="text-sm text-gray-500">{exam.location}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Announcements */}
            <motion.div variants={itemVariants}>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Announcements</h2>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {announcements.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-gray-500">No announcements at this time</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {announcements.map((announcement) => (
                      <div key={announcement.id} className="p-4 hover:bg-gray-50">
                        <p className="text-gray-900">{announcement.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{announcement.date}</p>
                      </div>
                    ))}
                  </div>
                )}              </div>
            </motion.div>
          </div>
          
          {/* FAQs Section */}
          <motion.div variants={itemVariants} className="mt-6">
            <FaqWidget category="Student" limit={3} title="Helpful FAQs for Students" />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
