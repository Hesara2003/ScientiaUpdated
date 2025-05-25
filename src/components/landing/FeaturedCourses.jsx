import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const FeaturedCourses = ({ classes, loading, containerVariants, itemVariants }) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'සියලු පාඨමාලා', icon: '📚' },
    { id: 'mathematics', name: 'ගණිතය', icon: '🔢' },
    { id: 'science', name: 'විද්‍යාව', icon: '🔬' },
    { id: 'languages', name: 'භාෂා', icon: '🗣️' },
    { id: 'technology', name: 'තාක්ෂණය', icon: '💻' }
  ];

  const getDifficultyBadge = (level) => {
    const badges = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    return badges[level] || badges.beginner;
  };

  const getRandomRating = () => (4.0 + Math.random()).toFixed(1);
  const getRandomPrice = () => Math.floor(Math.random() * 100) + 29;
  const getRandomLevel = () => ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)];

  return (
    <section id="featured-courses" className="py-20 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-4">
            <span className="mr-2">🎓</span>
            උසස් ඉගෙනුම් අත්දැකීම
          </div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            විශේෂ පාඨමාලා
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            කර්මාන්ත විශේෂඥයින් විසින් උගන්වන අපගේ ජනප්‍රියතම පාඨමාලා සොයා ගන්න සහ ඔබේ ඉගෙනුම් අරමුණු සාක්ෂාත් කර ගන්න
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-indigo-50 shadow-md'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </motion.button>
          ))}
        </motion.div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 absolute top-0 left-0"></div>
            </div>
            <p className="mt-4 text-gray-600">විශිෂ්ට පාඨමාලා පූරණය වෙමින්...</p>
          </div>
        ) : classes.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {classes.slice(0, 6).map((course, index) => {
              const rating = getRandomRating();
              const price = getRandomPrice();
              const level = getRandomLevel();
              
              return (
                <motion.div 
                  key={course.classId || course.id || index}
                  className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100"
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                >
                  <div className="relative h-48 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 overflow-hidden">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyBadge(level)}`}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <div className="text-2xl font-bold mb-1">
                        {course.subject?.name || course.subject || '📚'}
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-300">
                      {course.className || course.title || 'Comprehensive Learning Course'}
                    </h3>

                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                        {(course.tutor?.firstName || course.tutor?.name || course.instructor || 'T')[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {course.tutor?.firstName || course.tutor?.name || course.instructor || 'Expert Instructor'}
                        </p>
                        <p className="text-xs text-gray-500">Certified Teacher</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {course.schedule || course.timing || 'Flexible Schedule'}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {course.currentEnrollment || Math.floor(Math.random() * 50) + 10} students enrolled
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <div className="flex items-center text-yellow-400 mr-2">
                          {'★'.repeat(5)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{rating}</span>
                        <span className="text-sm text-gray-500 ml-1">({Math.floor(Math.random() * 200) + 50})</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-indigo-600">${price}</div>
                        <div className="text-xs text-gray-500 line-through">${price + 20}</div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Course Progress</span>
                        <span>{course.currentEnrollment || 0}/{course.maxCapacity || 50}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                          style={{ width: `${((course.currentEnrollment || Math.floor(Math.random() * 30) + 10) / (course.maxCapacity || 50)) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/auth/register')}
                      className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      <span className="flex items-center justify-center">
                        Enroll Now
                        <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">පාඨමාලා නොමැත</h3>
            <p className="text-gray-600 text-lg mb-2">අපි ඔබට විශිෂ්ට පාඨමාලා ලබා දීමට කටයුතු කරමින් සිටිමු.</p>
            <p className="text-gray-500 mb-8">කරුණාකර පසුව නැවත පරීක්ෂා කරන්න හෝ වැඩි විස්තර සඳහා අප හා සම්බන්ධ වන්න.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/contact')}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl shadow-lg transition-all duration-300"
            >
              අප හා සම්බන්ධ වන්න
            </motion.button>
          </motion.div>
        )}

        {classes.length > 6 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/courses')}
              className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-2xl shadow-lg hover:shadow-xl border-2 border-indigo-600 hover:bg-indigo-50 transition-all duration-300"
            >
              View All {classes.length} Courses
            </motion.button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCourses;
