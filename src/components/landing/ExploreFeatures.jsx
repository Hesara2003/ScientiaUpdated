import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ExploreFeatures = ({ containerVariants, itemVariants }) => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const features = [
    {
      id: 'subjects',
      title: 'Browse Subjects',
      description: 'Explore our comprehensive range of subjects from Mathematics to Literature with detailed course information.',
      icon: '📚',
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      link: '/explore/subjects',
      stats: '50+ Subjects'
    },
    {
      id: 'tutors',
      title: 'Meet Our Tutors',
      description: 'Connect with experienced educators and find the perfect tutor to guide your academic journey.',
      icon: '👨‍🏫',
      gradient: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      link: '/explore/tutors',
      stats: '500+ Tutors'
    },
    {
      id: 'recordings',
      title: 'Premium Recordings',
      description: 'Access our library of recorded lessons and comprehensive course bundles for self-paced learning.',
      icon: '🎥',
      gradient: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      link: '/explore/recordings',
      stats: '1000+ Videos'
    },
    {
      id: 'timetable',
      title: 'Class Schedule',
      description: 'View detailed class timetables and find the perfect schedule that fits your availability.',
      icon: '📅',
      gradient: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      link: '/explore/timetable',
      stats: 'Flexible Times'
    },
    {
      id: 'faq',
      title: 'FAQ & Support',
      description: 'Find answers to common questions and get the help you need to make the most of our platform.',
      icon: '❓',
      gradient: 'from-teal-500 to-cyan-500',
      bgColor: 'bg-teal-50',
      iconColor: 'text-teal-600',
      link: '/explore/faq',
      stats: '24/7 Support'
    },
    {
      id: 'about',
      title: 'About Scientia',
      description: 'Learn about our mission, values, and commitment to providing quality education for all students.',
      icon: 'ℹ️',
      gradient: 'from-indigo-500 to-blue-500',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      link: '/explore/about',
      stats: 'Our Story'
    }
  ];

  return (
    <section className="relative py-20 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-6">
            <span className="mr-2">🌟</span>
            Comprehensive Learning Platform
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Explore Our Educational
            <br />
            <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
              Universe
            </span>
          </h2>
          <p className="max-w-3xl mx-auto text-xl text-blue-100 leading-relaxed">
            Discover comprehensive learning resources, expert tutors, interactive schedules, 
            and premium content designed for your academic success and career growth.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={feature.id}
              variants={itemVariants}
              onHoverStart={() => setHoveredCard(feature.id)}
              onHoverEnd={() => setHoveredCard(null)}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group"
            >
              <Link to={feature.link} className="block h-full">
                <div className="relative h-full bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20 transition-all duration-500 group-hover:shadow-3xl">
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  
                  {/* Floating Icon Background */}
                  <div className="absolute top-6 right-6 opacity-10 text-6xl group-hover:scale-110 transition-transform duration-500">
                    {feature.icon}
                  </div>

                  <div className="relative p-8 h-full flex flex-col">
                    {/* Icon and Stats */}
                    <div className="flex items-start justify-between mb-6">
                      <motion.div 
                        className={`flex items-center justify-center w-16 h-16 ${feature.bgColor} rounded-2xl shadow-lg`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.8 }}
                      >
                        <span className="text-3xl">{feature.icon}</span>
                      </motion.div>
                      <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${feature.gradient} text-white text-xs font-semibold shadow-md`}>
                        {feature.stats}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-grow">
                      <h3 className={`text-2xl font-bold text-gray-900 mb-3 group-hover:${feature.iconColor} transition-colors duration-300`}>
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed mb-6">
                        {feature.description}
                      </p>
                    </div>

                    {/* Action Area */}
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold ${feature.iconColor} group-hover:text-gray-900 transition-colors duration-300`}>
                          Learn More
                        </span>
                        <motion.div
                          className={`w-10 h-10 rounded-full bg-gradient-to-r ${feature.gradient} flex items-center justify-center shadow-lg`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <svg className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </motion.div>
                      </div>
                    </div>

                    {/* Hover Effect Overlay */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`}
                      initial={false}
                      animate={{ 
                        opacity: hoveredCard === feature.id ? 0.05 : 0 
                      }}
                    />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Start Learning?</h3>
            <p className="text-blue-100 mb-6">
              Join thousands of students who have transformed their academic journey with Scientia
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/explore"
                  className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <span className="mr-2">🚀</span>
                  Explore All Features
                  <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/auth/register"
                  className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all duration-300"
                >
                  Get Started Free
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ExploreFeatures;
