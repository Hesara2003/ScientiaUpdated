import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAllTutes } from '../../services/tuteService';
import { addToCart, getPurchasedTuteIds } from '../../services/tutePurchaseService';
import AuthContext from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const TuteList = () => {
  const [tutes, setTutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasedTuteIds, setPurchasedTuteIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    loadTutes();
    if (currentUser?.id) {
      checkPurchasedTutes();
    }
  }, [currentUser]);

  const loadTutes = async () => {
    try {
      const tutesData = await getAllTutes();
      setTutes(tutesData);
    } catch (error) {
      console.error('Error loading tutes:', error);
      toast.error('Failed to load tutorials');
    } finally {
      setLoading(false);
    }
  };

  const checkPurchasedTutes = async () => {
    try {
      const purchasedIds = await getPurchasedTuteIds(currentUser.id);
      setPurchasedTuteIds(purchasedIds);
    } catch (error) {
      console.error('Error checking purchased tutes:', error);
    }
  };

  const handleAddToCart = async (tute) => {
    console.log('handleAddToCart called with:', tute); // Debug log
    try {

    
      console.log('Redirecting to payment gateway'); // Debug log
      
      // Navigate to payment gateway without any data
      navigate('/student/payment');
      
    } catch (error) {
      console.error('Error processing purchase:', error);
      toast.error('Failed to process purchase request');
    }
  };

  // Filter tutes based on search and subject
  const filteredTutes = tutes.filter(tute => {
    const matchesSearch = tute.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tute.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === '' || tute.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  // Get unique subjects for filter
  const subjects = [...new Set(tutes.map(tute => tute.subject))].filter(Boolean);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
          {/* Header skeleton */}
          <div className="text-center mb-12">
            <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-80 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-96 mx-auto animate-pulse"></div>
          </div>
          
          {/* Search skeleton */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl flex-1 animate-pulse"></div>
            <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-48 animate-pulse"></div>
          </div>
          
          {/* Cards skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-1/2 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-2/3 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded-lg w-1/3 mb-4"></div>
                  <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* Enhanced Header */}
        <motion.header 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Premium Tutorials
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover expert-crafted tutorials to accelerate your learning journey
            </p>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
          </div>
        </motion.header>

        {/* Enhanced Search and Filter Bar */}
        <motion.div 
          className="flex flex-col lg:flex-row gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search tutorials..."
              className="block w-full pl-12 pr-4 py-3 border-0 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Subject Filter */}
          <div className="relative">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="appearance-none bg-white/80 backdrop-blur-sm border-0 rounded-xl px-4 py-3 pr-10 shadow-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-gray-900 min-w-48"
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        {(searchTerm || selectedSubject) && (
          <motion.div 
            className="mb-6 text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Found {filteredTutes.length} tutorial{filteredTutes.length !== 1 ? 's' : ''}
            {searchTerm && ` matching "${searchTerm}"`}
            {selectedSubject && ` in ${selectedSubject}`}
          </motion.div>
        )}

        {/* Enhanced Tutorial Grid */}
        {filteredTutes.length === 0 ? (
          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-gray-400 mb-6">
              <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Tutorials Found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm || selectedSubject ? 'Try adjusting your search criteria or browse all tutorials.' : 'No tutorials are available at the moment. Check back soon!'}
            </p>
            {(searchTerm || selectedSubject) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSubject('');
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
              >
                Clear Filters
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredTutes.map(tute => {
              const isPurchased = purchasedTuteIds.includes(tute.id);
              
              return (
                <motion.div 
                  key={tute.id} 
                  variants={itemVariants}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden border border-white/20 hover:border-blue-200 transition-all duration-300"
                  whileHover={{ y: -5 }}
                >
                  {/* Tutorial Image/Icon */}
                  <div className="h-48 bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-20 h-20 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                      </svg>
                    </div>
                    
                    {/* Subject Badge */}
                    <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm text-blue-600 text-sm font-medium rounded-full">
                      {tute.subject}
                    </div>
                    
                    {/* Purchased Badge */}
                    {isPurchased && (
                      <div className="absolute top-4 right-4 px-3 py-1 bg-green-500/90 backdrop-blur-sm text-white text-sm font-medium rounded-full flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Owned
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {tute.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                      {tute.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        ${parseFloat(tute.price).toFixed(2)}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Tutorial
                      </div>
                    </div>
                    
                    {isPurchased ? (
                      <Link
                        to={`/student/tutes/${tute.id}`}
                        className="block w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold text-center hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          Start Learning
                        </div>
                      </Link>
                    ) : (
                      <button 
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Button clicked for tute:', tute.title); // Debug log
                          handleAddToCart(tute);
                        }}
                        type="button"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 22V12h6v10"></path>
                          </svg>
                          Buy Now
                        </div>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TuteList;