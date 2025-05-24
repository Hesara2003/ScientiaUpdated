import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllClasses, getClassesByTutorId } from '../../services/classService';
import { getTutor, getTutorClasses } from '../../services/tutorService';
import { useAuth } from '../../contexts/AuthContext'; // Assuming you have auth context

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth(); // Get authenticated user

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        
        let data = [];
        
        // If user is authenticated and has tutorId, get their specific classes
        if (user && user.tutorId) {
          data = await getTutorClasses(user.tutorId);
          console.log(`Fetched ${data.length} classes for tutor ID: ${user.tutorId}`);
        } 
        // If user doesn't have tutorId but is authenticated, try to get all classes
        else if (user) {
          data = await getAllClasses();
          console.log(`Fetched ${data.length} total classes`);
        }
        // If no user, don't fetch anything
        else {
          console.warn('No authenticated user found');
          data = [];
        }
        
        // Process classes data - the backend already includes tutor information
        const classesWithTutorNames = data.map((cls) => {
          // Check if tutor data is already included from backend
          if (cls.tutor) {
            return {
              ...cls,
              tutor: {
                tutorId: cls.tutor.tutorId,
                name: `${cls.tutor.firstName} ${cls.tutor.lastName}`,
                email: cls.tutor.email,
                phoneNumber: cls.tutor.phoneNumber,
                bio: cls.tutor.bio
              }
            };
          }
          // Fallback for cases where tutor data might not be included
          return {
            ...cls,
            tutor: {
              tutorId: cls.tutorId || user?.tutorId,
              name: 'Unknown Tutor'
            }
          };
        });
        
        setClasses(classesWithTutorNames || []);
      } catch (error) {
        console.error("Error fetching classes:", error);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch if we have a user
    if (user !== null) {
      fetchClasses();
    }
  }, [user]);

  // Filter classes based on search term only
  const filteredClasses = classes.filter(cls => {
    const matchesSearch = (cls.className?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                          (cls.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (cls.tutor?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  // Show loading if user auth is still being determined
  if (user === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100 px-4 py-6">
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-cyan-600 absolute top-0 left-0"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  px-4 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="relative bg-white rounded-2xl shadow-xl p-8 border border-gray-100 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-500 opacity-10 rounded-full transform translate-x-16 -translate-y-16"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-3">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-3 rounded-xl mr-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">My Classes</h1>
                  <p className="text-gray-600 mt-1">Manage and view all your assigned classes</p>
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Stats and Search Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-6"
        >
          {/* Stats Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-emerald-400 to-cyan-500 p-3 rounded-lg mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{classes.length}</p>
                <p className="text-gray-600 text-sm">Total Classes</p>
              </div>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative lg:w-96">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search classes, descriptions, tutors..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 shadow-sm transition-all duration-200 hover:shadow-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl mr-4"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-10 bg-gray-200 rounded-lg mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredClasses.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100"
              >
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No classes found</h3>
                <p className="text-gray-500 text-lg max-w-md mx-auto">
                  {classes.length === 0 
                    ? "You don't have any classes assigned yet. Contact your administrator to get started." 
                    : "Try adjusting your search criteria to find the classes you're looking for."
                  }
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredClasses.map(cls => (
                  <motion.div 
                    key={cls.classId} 
                    variants={itemVariants}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden"
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="bg-gradient-to-br from-cyan-400 to-blue-500 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-200">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-cyan-700 transition-colors">
                              {cls.className || 'Unnamed Class'}
                            </h3>
                            <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800">
                              <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
                              Active
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="space-y-3 mb-6">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {cls.description || 'No description available'}
                          </p>
                        </div>
                        
                        {cls.tutor && (
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                            <span className="font-medium">Tutor:</span> 
                            <span className="ml-1">{cls.tutor.name || `Tutor ID: ${cls.tutor.tutorId}`}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                            </svg>
                            <span className="font-medium">Price:</span>
                          </div>
                          <span className="text-lg font-bold text-emerald-600">
                            ${cls.price || '0.00'}
                          </span>
                        </div>
                        
                        <div className="text-xs text-gray-400 bg-gray-50 rounded px-2 py-1 inline-block">
                          ID: {cls.classId}
                        </div>
                      </div>
                      
                      {/* Action Button */}
                      <button 
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        onClick={() => console.log('View class details:', cls.classId)}
                      >
                        View Details
                        <svg className="w-4 h-4 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Info Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12"
        >
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl shadow-xl p-6 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full transform translate-x-16 -translate-y-16"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 p-3 rounded-xl mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Need Help?</h3>
                  <p className="text-blue-100">Contact your administrator for class changes or support</p>
                </div>
              </div>
              <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
