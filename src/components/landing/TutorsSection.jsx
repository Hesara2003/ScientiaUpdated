import React from 'react';
import { motion } from 'framer-motion';

const TutorsSection = ({ tutors, loading, containerVariants, itemVariants }) => {
  return (
    <section id="our-tutors" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl text-center mb-12">
            Meet Our Expert Tutors
          </h2>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : tutors.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {tutors.slice(0, 8).map((tutor) => (
                <motion.div 
                  key={tutor.tutorId || tutor.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  variants={itemVariants}
                >                  <div className="h-48 overflow-hidden">
                    <img 
                      src={tutor.profilePicture || tutor.image || (() => {
                        const id = tutor.tutorId || tutor.id || Math.floor(Math.random() * 99) + 1;
                        const validId = typeof id === 'number' ? id : parseInt(id) || 1;
                        return `https://randomuser.me/api/portraits/${validId % 2 === 0 ? 'men' : 'women'}/${(validId % 50) + 10}.jpg`;
                      })()} 
                      alt={`${tutor.firstName || tutor.name} ${tutor.lastName || ''}`} 
                      className="w-full h-full object-cover object-center"
                      onError={(e) => {
                        const id = tutor.tutorId || tutor.id || Math.floor(Math.random() * 99) + 1;
                        const validId = typeof id === 'number' ? id : parseInt(id) || 1;
                        e.target.src = `https://randomuser.me/api/portraits/${validId % 2 === 0 ? 'men' : 'women'}/${(validId % 50) + 10}.jpg`;
                      }}
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {tutor.firstName && tutor.lastName ? `${tutor.firstName} ${tutor.lastName}` : tutor.name || 'Tutor Name'}
                    </h3>
                    <p className="text-indigo-600 font-medium text-sm mb-2">
                      {tutor.subject?.subjectName || tutor.subject?.name || tutor.subject || 'Subject Specialist'}
                    </p>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {tutor.bio || tutor.description || "Experienced educator passionate about student success."}
                    </p>
                    <div className="flex items-center">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`h-4 w-4 ${i < Math.floor(tutor.rating || 4.5) ? 'text-yellow-400' : 'text-gray-300'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-gray-500 text-sm ml-2">{tutor.rating || "4.5"}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No tutors available at the moment.</p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default TutorsSection;
