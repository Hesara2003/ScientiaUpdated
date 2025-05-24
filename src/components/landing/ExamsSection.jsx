import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ExamsSection = ({ exams, loading, containerVariants, itemVariants }) => {
  const navigate = useNavigate();

  return (
    <section id="exams-section" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
              Upcoming Exams
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Stay informed about upcoming exams and assessment schedules
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : exams.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {exams.slice(0, 6).map((exam) => (
                <motion.div 
                  key={exam.examId}
                  className="bg-gray-50 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
                  variants={itemVariants}
                >
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{exam.examName}</h3>
                    <p className="text-indigo-600 font-medium text-sm mb-2">
                      Class: {exam.classEntity?.className || 'General'}
                    </p>
                    <p className="text-gray-600 text-sm mb-4">
                      Instructor: {exam.tutor?.firstName || exam.tutor?.name || 'TBA'}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Start: {new Date(exam.startTime).toLocaleString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        End: {new Date(exam.endTime).toLocaleString()}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => navigate('/auth/register')}
                      className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-md transition-all duration-200"
                    >
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No exams scheduled at the moment.</p>
            </div>
          )}
          
          <div className="text-center mt-10">
            <Link
              to="/explore/exams"
              className="inline-flex items-center px-6 py-3 border border-indigo-600 text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 transition-colors duration-200"
            >
              View All Exams
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

export default ExamsSection;
