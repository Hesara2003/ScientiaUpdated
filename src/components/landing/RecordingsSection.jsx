import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAllRecordedLessons } from '../../services/recordedLessonService';

const RecordingsSection = ({ containerVariants, itemVariants }) => {
  const navigate = useNavigate();
  const [recordedLessons, setRecordedLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecordedLessons = async () => {
      try {
        setLoading(true);
        setError(null);
        const lessons = await getAllRecordedLessons();
        setRecordedLessons(lessons || []);
      } catch (err) {
        console.error('Error fetching recorded lessons:', err);
        setError('Failed to load recorded lessons');
        // Set mock data as fallback
        setRecordedLessons([
          {
            id: 1,
            title: "Advanced Mathematics Bundle",
            subject: "Mathematics",
            description: "Complete calculus and algebra course with 50+ hours of content",
            price: 99,
            duration: "50+ hours",
            totalLessons: 45,
            bestSeller: true,
            rating: 4.8,
            students: 1250
          },
          {
            id: 2,
            title: "Physics Fundamentals",
            subject: "Physics",
            description: "From basic mechanics to advanced quantum physics concepts",
            price: 79,
            duration: "35+ hours",
            totalLessons: 32,
            bestSeller: false,
            rating: 4.6,
            students: 890
          },
          {
            id: 3,
            title: "Chemistry Mastery",
            subject: "Chemistry",
            description: "Organic, inorganic, and physical chemistry made easy",
            price: 89,
            duration: "40+ hours",
            totalLessons: 38,
            bestSeller: false,
            rating: 4.7,
            students: 675
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecordedLessons();
  }, []);

  const getDifficultyColor = (level) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    return colors[level] || colors.beginner;
  };

  const getRandomLevel = () => ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 right-10 w-40 h-40 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 blur-2xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4">
            <span className="mr-2">🎥</span>
            Self-Paced Learning
          </div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Premium Recording Bundles
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Master subjects at your own pace with our comprehensive recorded lesson bundles, 
            featuring expert instruction and lifetime access
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {[
            { number: '500+', label: 'Video Lessons' },
            { number: '50+', label: 'Course Bundles' },
            { number: '10K+', label: 'Students Learning' },
            { number: '4.8★', label: 'Average Rating' }
          ].map((stat, index) => (
            <div key={index} className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-2xl shadow-md border border-white/20">
              <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-1">{stat.number}</div>
              <div className="text-gray-600 text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600 absolute top-0 left-0"></div>
            </div>
            <p className="mt-4 text-gray-600">Loading premium content...</p>
          </div>
        ) : recordedLessons.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {recordedLessons.slice(0, 3).map((lesson, index) => {
              const level = getRandomLevel();
              
              return (
                <motion.div 
                  key={lesson.id || index}
                  className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100"
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                >
                  {/* Video Preview Header */}
                  <div className="relative h-56 bg-gradient-to-br from-purple-500 via-blue-600 to-indigo-700 overflow-hidden">
                    <div className="absolute inset-0 bg-black/30"></div>
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      {lesson.bestSeller && (
                        <span className="px-3 py-1 bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                          🏆 Best Seller
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(level)}`}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-2xl font-bold text-lg shadow-lg">
                      ${lesson.price || '99'}
                    </div>

                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer group-hover:bg-white/30 transition-all duration-300"
                      >
                        <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </motion.div>
                    </div>

                    {/* Subject Tag */}
                    <div className="absolute bottom-4 left-4 text-white">
                      <div className="text-sm opacity-80">Subject</div>
                      <div className="text-xl font-bold">{lesson.subject || 'General'}</div>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Title and Rating */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                        {lesson.title || lesson.bundleName || 'Premium Course Bundle'}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center text-yellow-400">
                            {'★'.repeat(5)}
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {lesson.rating || '4.8'}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({lesson.students || Math.floor(Math.random() * 1000) + 500})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed">
                      {lesson.description || 'Comprehensive course bundle with expert instruction and lifetime access'}
                    </p>

                    {/* Course Details */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {lesson.duration || '35+ hours'}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 7a2 2 0 012-2h10a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        {lesson.totalLessons || lesson.recordingCount || '30'} Lessons
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Lifetime Access
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Certificate
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {['HD Quality', 'Mobile Access', 'Downloadable'].map((feature, idx) => (
                        <span key={idx} className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Action Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/auth/register')}
                      className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      <span className="flex items-center justify-center">
                        Get Bundle Now
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
            <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Recording Bundles Coming Soon</h3>
            <p className="text-gray-600 text-lg mb-8">We're preparing amazing recorded content for you.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/contact')}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-2xl shadow-lg transition-all duration-300"
            >
              Get Notified
            </motion.button>
          </motion.div>
        )}
        
        {/* Enhanced CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Start Learning?
            </h3>
            <p className="text-gray-600 mb-6">
              Join thousands of students mastering subjects through our premium recorded content
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/explore/recordings"
                  className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <span className="mr-2">🎥</span>
                  Browse All Recordings
                  <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/auth/register"
                  className="inline-flex items-center px-8 py-3 border-2 border-purple-200 text-purple-600 font-semibold rounded-2xl hover:bg-purple-50 transition-all duration-300"
                >
                  Start Free Trial
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default RecordingsSection;
