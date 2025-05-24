import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const TutorsSection = ({ tutors, loading, containerVariants, itemVariants }) => {
  const navigate = useNavigate();
  const [hoveredTutor, setHoveredTutor] = useState(null);

  const getSubjectIcon = (subject) => {
    const subjectName = (subject?.subjectName || subject?.name || subject || '').toLowerCase();
    const iconMap = {
      'mathematics': '🔢',
      'math': '🔢',
      'physics': '⚛️',
      'chemistry': '🧪',
      'biology': '🧬',
      'english': '📖',
      'literature': '📚',
      'history': '📜',
      'geography': '🗺️',
      'computer science': '💻',
      'programming': '💻',
      'art': '🎨',
      'music': '🎵',
      'science': '🔬'
    };

    for (const [key, icon] of Object.entries(iconMap)) {
      if (subjectName.includes(key)) {
        return icon;
      }
    }
    return '👨‍🏫';
  };

  const getExperienceLevel = () => {
    const levels = ['5+ Years', '3+ Years', '10+ Years', '7+ Years', '2+ Years'];
    return levels[Math.floor(Math.random() * levels.length)];
  };

  const getRandomSpecialties = () => {
    const specialties = [
      'Exam Preparation', 'Individual Tutoring', 'Group Sessions', 
      'Online Teaching', 'Homework Help', 'Test Prep', 'Advanced Topics'
    ];
    return specialties.slice(0, 2 + Math.floor(Math.random() * 2));
  };

  return (
    <section id="our-tutors" className="py-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 right-20 w-40 h-40 bg-indigo-200 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-32 h-32 bg-purple-200 rounded-full opacity-20 blur-2xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-4">
            <span className="mr-2">👩‍🏫</span>
            ප්‍රවීණ අධ්‍යාපනඥයින්
          </div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            අපගේ විශේෂඥ ගුරුවරුන් හමුවන්න
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            ඔබේ අධ්‍යාපනික ඉලක්ක සපුරා ගැනීමට කැපවී සිටින, 
            ඔවුන්ගේ ක්ෂේත්‍රයන්හි වසර ගණනාවක අත්දැකීම් සහිත උද්‍යෝගිමත් අධ්‍යාපනඥයින්ගෙන් ඉගෙන ගන්න
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
            { number: `${tutors.length}+`, label: 'විශේෂඥ ගුරුවරුන්' },
            { number: '98%', label: 'සාර්ථකත්ව අනුපාතය' },
            { number: '15+', label: 'ආවරණය කරන විෂයයන්' },
            { number: '4.9★', label: 'සාමාන්‍ය ශ්‍රේණිගත කිරීම' }
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
            <p className="mt-4 text-gray-600">අපගේ පුදුම ගුරුවරුන් පූරණය වෙමින්...</p>
          </div>
        ) : tutors.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {tutors.slice(0, 8).map((tutor, index) => {
              const experience = getExperienceLevel();
              const specialties = getRandomSpecialties();
              
              return (
                <motion.div 
                  key={tutor.tutorId || tutor.id || index}
                  className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 cursor-pointer"
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  onHoverStart={() => setHoveredTutor(tutor.id)}
                  onHoverEnd={() => setHoveredTutor(null)}
                  onClick={() => navigate('/auth/register')}
                >
                  {/* Profile Image */}
                  <div className="relative h-56 overflow-hidden">
                    <motion.img 
                      src={tutor.profilePicture || tutor.image || (() => {
                        const id = tutor.tutorId || tutor.id || Math.floor(Math.random() * 99) + 1;
                        const validId = typeof id === 'number' ? id : parseInt(id) || 1;
                        return `https://randomuser.me/api/portraits/${validId % 2 === 0 ? 'men' : 'women'}/${(validId % 50) + 10}.jpg`;
                      })()} 
                      alt={`${tutor.firstName || tutor.name} ${tutor.lastName || ''}`} 
                      className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                      whileHover={{ scale: 1.1 }}
                      onError={(e) => {
                        const id = tutor.tutorId || tutor.id || Math.floor(Math.random() * 99) + 1;
                        const validId = typeof id === 'number' ? id : parseInt(id) || 1;
                        e.target.src = `https://randomuser.me/api/portraits/${validId % 2 === 0 ? 'men' : 'women'}/${(validId % 50) + 10}.jpg`;
                      }}
                    />
                    
                    {/* Subject Badge */}
                    <div className="absolute top-4 left-4">
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-2 shadow-lg">
                        <span className="text-lg">{getSubjectIcon(tutor.subject)}</span>
                        <span className="text-sm font-semibold text-gray-800">
                          {tutor.subject?.subjectName || tutor.subject?.name || tutor.subject || 'Subject'}
                        </span>
                      </div>
                    </div>

                    {/* Online Status */}
                    <div className="absolute top-4 right-4">
                      <div className="w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-lg"></div>
                    </div>

                    {/* Experience Badge */}
                    <div className="absolute bottom-4 right-4">
                      <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                        {experience}
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Name and Rating */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors duration-300">
                        {tutor.firstName && tutor.lastName ? `${tutor.firstName} ${tutor.lastName}` : tutor.name || 'Expert Tutor'}
                      </h3>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <motion.svg 
                                key={i} 
                                className={`h-4 w-4 ${i < Math.floor(tutor.rating || 4.5) ? 'text-yellow-400' : 'text-gray-300'}`} 
                                xmlns="http://www.w3.org/2000/svg" 
                                viewBox="0 0 20 20" 
                                fill="currentColor"
                                whileHover={{ scale: 1.2 }}
                                transition={{ delay: i * 0.1 }}
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </motion.svg>
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-700">{tutor.rating || "4.8"}</span>
                        </div>
                        <span className="text-sm text-gray-500">({Math.floor(Math.random() * 100) + 50} reviews)</span>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {tutor.bio || tutor.description || "Experienced educator passionate about student success and academic excellence."}
                    </p>

                    {/* Specialties */}
                    <div className="mb-4">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Specialties</div>
                      <div className="flex flex-wrap gap-1">
                        {specialties.map((specialty, idx) => (
                          <span key={idx} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-indigo-600">{Math.floor(Math.random() * 100) + 50}</div>
                        <div className="text-xs text-gray-600">Students</div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-indigo-600">${Math.floor(Math.random() * 30) + 25}/hr</div>
                        <div className="text-xs text-gray-600">Rate</div>
                      </div>
                    </div>

                    {/* Contact Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/auth/register');
                      }}
                    >
                      <span className="flex items-center justify-center">
                        ගුරුවරයා අමතන්න
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
            <div className="w-24 h-24 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">ගුරුවරුන් නොමැත</h3>
            <p className="text-gray-600 text-lg mb-8">අපගේ කණ්ඩායමට සම්බන්ධ වීමට පුදුම ගුරුවරුන් බඳවා ගනිමින් සිටිමු.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/contact')}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl shadow-lg transition-all duration-300"
            >
              අප අමතන්න
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
              ඔබේ උපදේශකයා සොයා ගැනීමට සූදානම්ද?
            </h3>
            <p className="text-gray-600 mb-6">
              ඔබේ ඉගෙනුම් විලාසය සහ අධ්‍යයන ඉලක්ක තේරුම් ගන්නා විශේෂඥ අධ්‍යාපනඥයින් සමඟ සම්බන්ධ වන්න
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/auth/register')}
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <span className="mr-2">👩‍🏫</span>
                    සියලුම ගුරුවරුන් පිරික්සන්න
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
                අදම ඉගෙනීම අරඹන්න
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TutorsSection;
