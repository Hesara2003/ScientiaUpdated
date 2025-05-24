import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const SubjectsPreview = ({ subjects = [], classes = [], loading = false, getClassesBySubject }) => {
  // Define animation variants locally if not passed as props
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
        stiffness: 80,
        damping: 15
      }
    }
  };

  // Internal helper function with safety checks
  const getSubjectClassCount = (subjectName) => {
    if (getClassesBySubject && typeof getClassesBySubject === 'function') {
      return getClassesBySubject(subjectName).length;
    }
    
    if (!classes || !Array.isArray(classes) || !subjectName) return 0;
    return classes.filter(course => 
      course.subject === subjectName || 
      (course.subject && course.subject.name === subjectName)
    ).length;
  };

  // Generate a safe image URL
  const getSubjectIcon = (subject) => {
    if (subject.icon) return subject.icon;
    
    // Use a simple book icon as fallback instead of dynamic URLs
    return `https://img.icons8.com/color/48/000000/book.png`;
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
              Popular Subjects
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our most popular subjects with expert tutors and comprehensive course materials
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : subjects.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {subjects.slice(0, 5).map((subject) => (
                <motion.div 
                  key={subject.subjectId || subject.id || Math.random()}
                  variants={itemVariants}
                >
                  <Link 
                    to={`/explore/subjects/${subject.subjectId || subject.id}`}
                    className="block group"
                  >
                    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                      <div className="p-6 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                          <img 
                            src={getSubjectIcon(subject)} 
                            alt={subject.subjectName || subject.name || 'Subject'}
                            className="w-8 h-8"
                            onError={(e) => {
                              e.target.src = `https://img.icons8.com/color/48/000000/book.png`;
                            }}
                          />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                          {subject.subjectName || subject.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {subject.description || 'Comprehensive course materials and expert instruction'}
                        </p>
                        <div className="text-xs text-indigo-600 font-medium">
                          {getSubjectClassCount(subject.subjectName || subject.name)} Classes Available
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No subjects available at the moment.</p>
            </div>
          )}
          
          <div className="text-center mt-10">
            <Link
              to="/explore/subjects"
              className="inline-flex items-center px-6 py-3 border border-indigo-600 text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 transition-colors duration-200"
            >
              View All Subjects
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

export default SubjectsPreview;
