import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getStudentById } from '../../services/studentService';
import { getPurchasedTuteIds } from '../../services/tutePurchaseService';
import { getPurchasedLessonIds } from '../../services/recordedLessonPurchaseService';
import { getStudentFees } from '../../services/feeService';
import AuthContext from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
  const [stats, setStats] = useState({
    purchasedTutes: 0,
    purchasedLessons: 0,
    pendingFees: 0,
    totalSpent: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (currentUser?.id) {
      loadDashboardData();
    }
  }, [currentUser]);

  const loadDashboardData = async () => {
    try {
      // Load student profile
      const studentData = await getStudentById(currentUser.id);
      setStudent(studentData);

      // Load purchased tutorials
      const purchasedTutes = await getPurchasedTuteIds(currentUser.id);
      
      // Load purchased lessons
      const purchasedLessons = await getPurchasedLessonIds(currentUser.id);
      
      // Load fees
      const fees = await getStudentFees(currentUser.id);
      const pendingFees = fees.filter(fee => fee.status === 'pending').length;
      
      setStats({
        purchasedTutes: purchasedTutes.length,
        purchasedLessons: purchasedLessons.length,
        pendingFees: pendingFees,
        totalSpent: 0 // Calculate from purchase history
      });

      // Set recent activity (mock data for now)
      setRecentActivity([
        { id: 1, type: 'purchase', description: 'Purchased Mathematics Tutorial', date: new Date() },
        { id: 2, type: 'lesson', description: 'Completed Physics Lesson 1', date: new Date() },
        { id: 3, type: 'profile', description: 'Updated profile information', date: new Date() }
      ]);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* Welcome Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
              {student?.firstName?.[0]}{student?.lastName?.[0]}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {student?.firstName}!
              </h1>
              <p className="text-gray-600">Here's what's happening with your learning journey</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div 
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tutorials Owned</p>
                <p className="text-2xl font-bold text-gray-900">{stats.purchasedTutes}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full mr-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Lessons Purchased</p>
                <p className="text-2xl font-bold text-gray-900">{stats.purchasedLessons}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full mr-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Fees</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingFees}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Grade</p>
                <p className="text-2xl font-bold text-gray-900">{student?.grade || 'N/A'}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {/* Quick Actions Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/student/profile"
                className="p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl text-center hover:from-blue-200 hover:to-blue-300 transition-all duration-200"
              >
                <svg className="w-8 h-8 text-blue-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <p className="text-sm font-medium text-blue-700">Edit Profile</p>
              </Link>

              <Link
                to="/student/tutes"
                className="p-4 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl text-center hover:from-purple-200 hover:to-purple-300 transition-all duration-200"
              >
                <svg className="w-8 h-8 text-purple-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
                <p className="text-sm font-medium text-purple-700">Browse Tutorials</p>
              </Link>

              <Link
                to="/student/purchases"
                className="p-4 bg-gradient-to-r from-green-100 to-green-200 rounded-xl text-center hover:from-green-200 hover:to-green-300 transition-all duration-200"
              >
                <svg className="w-8 h-8 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                </svg>
                <p className="text-sm font-medium text-green-700">My Purchases</p>
              </Link>

              <Link
                to="/student/fees"
                className="p-4 bg-gradient-to-r from-red-100 to-red-200 rounded-xl text-center hover:from-red-200 hover:to-red-300 transition-all duration-200"
              >
                <svg className="w-8 h-8 text-red-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
                <p className="text-sm font-medium text-red-700">View Fees</p>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map(activity => (
                <div key={activity.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-full mr-3 ${
                    activity.type === 'purchase' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'lesson' ? 'bg-purple-100 text-purple-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.date.toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentDashboard;