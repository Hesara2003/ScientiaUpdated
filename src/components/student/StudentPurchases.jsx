import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { getAllTutePurchases } from '../../services/tutePurchaseService';
import { getAllRecordedLessonPurchases } from '../../services/recordedLessonPurchaseService';
import { getTuteById } from '../../services/tuteService';
import AuthContext from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const StudentPurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, tutes, lessons
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (currentUser?.id) {
      loadPurchases();
    }
  }, [currentUser]);

  const loadPurchases = async () => {
    try {
      // Load tutorial purchases
      const tutePurchases = await getAllTutePurchases();
      const studentTutePurchases = tutePurchases.filter(p => 
        p.studentId.toString() === currentUser.id.toString()
      );

      // Load lesson purchases
      const lessonPurchases = await getAllRecordedLessonPurchases();
      const studentLessonPurchases = lessonPurchases.filter(p => 
        p.studentId.toString() === currentUser.id.toString()
      );

      // Combine and format purchases
      const allPurchases = [
        ...studentTutePurchases.map(p => ({ ...p, type: 'tutorial' })),
        ...studentLessonPurchases.map(p => ({ ...p, type: 'lesson' }))
      ];

      // Sort by purchase date (newest first)
      allPurchases.sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));

      setPurchases(allPurchases);
    } catch (error) {
      console.error('Error loading purchases:', error);
      toast.error('Failed to load purchase history');
    } finally {
      setLoading(false);
    }
  };

  // Filter purchases based on type
  const filteredPurchases = purchases.filter(purchase => {
    if (filter === 'all') return true;
    if (filter === 'tutes') return purchase.type === 'tutorial';
    if (filter === 'lessons') return purchase.type === 'lesson';
    return true;
  });

  const getStatusBadge = (status) => {
    const statusColors = {
      'COMPLETED': 'bg-green-100 text-green-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'FAILED': 'bg-red-100 text-red-800',
      'CANCELLED': 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || statusColors['PENDING']}`}>
        {status}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    if (type === 'tutorial') {
      return (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
        </svg>
      );
    } else {
      return (
        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            My Purchase History
          </h1>
          <p className="text-gray-600">View all your tutorial and lesson purchases</p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div 
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-lg">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Purchases ({purchases.length})
            </button>
            <button
              onClick={() => setFilter('tutes')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                filter === 'tutes'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tutorials ({purchases.filter(p => p.type === 'tutorial').length})
            </button>
            <button
              onClick={() => setFilter('lessons')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                filter === 'lessons'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Lessons ({purchases.filter(p => p.type === 'lesson').length})
            </button>
          </div>
        </motion.div>

        {/* Purchase List */}
        {filteredPurchases.length === 0 ? (
          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <svg className="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Purchases Found</h3>
            <p className="text-gray-600 mb-6">You haven't made any purchases yet.</p>
            <a
              href="/student/tutes"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              Browse Tutorials
            </a>
          </motion.div>
        ) : (
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {filteredPurchases.map((purchase, index) => (
              <motion.div
                key={purchase.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start space-x-4 mb-4 lg:mb-0">
                    <div className="p-3 bg-gray-100 rounded-full">
                      {getTypeIcon(purchase.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {purchase.type === 'tutorial' ? 'Tutorial Purchase' : 'Lesson Purchase'}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {purchase.type === 'tutorial' ? `Tutorial ID: ${purchase.tuteId}` : `Lesson ID: ${purchase.lessonId}`}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Purchase Date: {new Date(purchase.purchaseDate).toLocaleDateString()}</span>
                        <span>Amount: ${purchase.amount}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {getStatusBadge(purchase.status)}
                    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-200">
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StudentPurchases;