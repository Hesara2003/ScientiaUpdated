import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const RecordingsSection = ({ recordingBundles, loading, containerVariants, itemVariants }) => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
              Premium Recording Bundles
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Learn at your own pace with our comprehensive recorded lesson bundles
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : recordingBundles.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {recordingBundles.slice(0, 3).map((bundle) => (
                <motion.div 
                  key={bundle.bundleId || bundle.id}
                  className="bg-gray-50 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
                  variants={itemVariants}
                >
                  <div className="relative">
                    <img 
                      src={bundle.thumbnail || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60`}
                      alt={bundle.title || bundle.bundleName}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60`;
                      }}
                    />
                    {bundle.bestSeller && (
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-400 to-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Best Seller
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm font-bold">
                      ${bundle.price || 'TBA'}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{bundle.title || bundle.bundleName}</h3>
                    <p className="text-indigo-600 font-medium text-sm mb-2">{bundle.subject || 'General'}</p>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{bundle.description || 'Comprehensive course bundle'}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {bundle.duration || 'Variable'}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 7a2 2 0 012-2h10a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        {bundle.totalLessons || bundle.recordingCount || 'Multiple'} Lessons
                      </span>
                    </div>
                    
                    <button
                      onClick={() => navigate('/auth/register')}
                      className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-md transition-all duration-200"
                    >
                      Get Bundle
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No recording bundles available at the moment.</p>
            </div>
          )}
          
          <div className="text-center mt-10">
            <Link
              to="/explore/recordings"
              className="inline-flex items-center px-6 py-3 border border-indigo-600 text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 transition-colors duration-200"
            >
              Browse All Recordings
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default RecordingsSection;
