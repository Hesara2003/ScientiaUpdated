import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const SubjectsPreview = ({ subjects = [], classes = [], loading = false, getClassesBySubject }) => {
  const navigate = useNavigate();
  const [hoveredSubject, setHoveredSubject] = useState(null);

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
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
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

  // Enhanced subject icon mapping with Sinhala subject names
  const getSubjectIcon = (subject) => {
    const subjectName = (subject.subjectName || subject.name || '').toLowerCase();
    const iconMap = {
      'ගණිතය': '🔢', // ගණිතය
      'math': '🔢', // ගණිතය
      'physics': '⚛️', // භෞතික විද්‍යාව
      'chemistry': '🧪', // රසායන විද්‍යාව
      'biology': '🧬', // ජීව විද්‍යාව
      'english': '📖', // ඉංග්‍රීසි
      'literature': '📚', // සාහිත්‍යය
      'history': '📜', // ඉතිහාසය
      'geography': '🗺️', // භූගෝල විද්‍යාව
      'computer science': '💻', // පරිගණක විද්‍යාව
      'programming': '💻', // ක්‍රමලේඛන
      'art': '🎨', // කලාව
      'music': '🎵', // සංගීතය
      'science': '🔬', // විද්‍යාව
      'social studies': '🌍', // සමාජ අධ්‍යයනය
      'economics': '💰', // ආර්ථික විද්‍යාව
      'business': '💼', // ව්‍යාපාර
      'psychology': '🧠', // මනෝ විද්‍යාව
      'philosophy': '🤔', // දර්ශනය
      'language': '🗣️' // භාෂාව
    };

    for (const [key, icon] of Object.entries(iconMap)) {
      if (subjectName.includes(key)) {
        return icon;
      }
    }
    return '📚'; // Default fallback
  };

  const getSubjectGradient = (index) => {
    const gradients = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-teal-500 to-blue-500',
      'from-yellow-500 to-orange-500',
      'from-pink-500 to-rose-500'
    ];
    return gradients[index % gradients.length];
  };

  const handleSubjectClick = (subject) => {
    // For landing page, redirect to register to encourage sign-up
    navigate('/auth/register', { 
      state: { 
        redirectTo: `/explore/subjects/${subject.subjectId || subject.id}`,
        message: 'Sign up to explore our comprehensive subjects and courses!'
      }
    });
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200 rounded-full opacity-20 blur-2xl"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-4">
            <span className="mr-2">📚</span>
            විස්තීරණ ඉගෙනීම
          </div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            ජනප්‍රිය විෂයයන්
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            විශේෂඥ උපදේශකයින්, පුළුල් පාඨමාලා, 
සහ අන්තර්ක්‍රියාකාරී ඉගෙනුම් අත්දැකීම් සමඟ අපගේ වඩාත් ජනප්‍රිය විෂයයන් සොයා ගන්න.
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
            { number: `${subjects.length}+`, label: 'Subjects Available' },
            { number: `${classes.length}+`, label: 'Total Classes' },
            { number: '500+', label: 'Expert Tutors' },
            { number: '98%', label: 'Success Rate' }
          ].map((stat, index) => (
            <div key={index} className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-2xl shadow-md border border-white/20">
              <div className="text-2xl md:text-3xl font-bold text-indigo-600 mb-1">{stat.number}</div>
              <div className="text-gray-600 text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 absolute top-0 left-0"></div>
            </div>
            <p className="mt-4 text-gray-600">Loading subjects...</p>
          </div>
        ) : subjects.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {subjects.slice(0, 5).map((subject, index) => (
              <motion.div 
                key={subject.subjectId || subject.id || Math.random()}
                variants={itemVariants}
                onHoverStart={() => setHoveredSubject(subject.id)}
                onHoverEnd={() => setHoveredSubject(null)}
                whileHover={{ y: -8, scale: 1.05 }}
                className="group cursor-pointer"
                onClick={() => handleSubjectClick(subject)}
              >
                <div className="relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100">
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${getSubjectGradient(index)} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  
                  {/* Floating Background Icon */}
                  <div className="absolute top-4 right-4 text-6xl opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                    {getSubjectIcon(subject)}
                  </div>

                  <div className="relative p-8 text-center">
                    {/* Subject Icon */}
                    <motion.div 
                      className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${getSubjectGradient(index)} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl`}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.8 }}
                    >
                      <span className="text-3xl text-white">
                        {getSubjectIcon(subject)}
                      </span>
                    </motion.div>

                    {/* Subject Name */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors duration-300">
                      {subject.subjectName || subject.name}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {subject.description || 'Comprehensive course materials and expert instruction available'}
                    </p>

                    {/* Class Count Badge */}
                    <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${getSubjectGradient(index)} text-white text-sm font-semibold shadow-md group-hover:shadow-lg transition-shadow duration-300`}>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      {getSubjectClassCount(subject.subjectName || subject.name)} Classes
                    </div>

                    {/* Hover Arrow */}
                    <motion.div
                      className="absolute bottom-4 right-4 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      whileHover={{ scale: 1.1 }}
                    >
                      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
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
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Subjects Available</h3>
            <p className="text-gray-600 text-lg mb-8">We're preparing amazing subjects for you.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/contact')}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl shadow-lg transition-all duration-300"
            >
              Contact Us
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
              
ඉගෙනීම ආරම්භ කිරීමට සූදානම්ද?

            </h3>
            <p className="text-gray-600 mb-6">
             අපගේ සියලුම විෂයයන් ගවේෂණය කර ඔබේ අධ්‍යයන ගමනට සුදුසු පරිපූර්ණ පාඨමාලා සොයා ගන්න.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/auth/register')}
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <span className="mr-2">🚀</span>
                සියලුම විෂයයන් බලන්න
                <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/auth/register')}
                className="inline-flex items-center px-8 py-3 border-2 border-indigo-200 text-indigo-600 font-semibold rounded-2xl hover:bg-indigo-50 transition-all duration-300"
              >
                නොමිලේ ආරම්භ කරන්න
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SubjectsPreview;
