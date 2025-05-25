import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const HeroSection = () => {
  const floatingCards = [
    { icon: '📚', title: 'ප්‍රවීණ පාඨමාලා', position: 'top-20 left-10' },
    { icon: '🎯', title: 'පුද්ගලායනය කළ', position: 'top-32 right-16' },
    { icon: '⭐', title: 'තරු 5 ශ්‍රේණිගත', position: 'bottom-32 left-16' },
    { icon: '🚀', title: 'ඉක්මන් ඉගෙනීම', position: 'bottom-20 right-10' }
  ];

  const stats = [
    { number: '10K+', label: 'සිසුන්' },
    { number: '500+', label: 'පාඨමාලා' },
    { number: '98%', label: 'සාර්ථකත්ව අනුපාතය' }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-48 h-48 bg-blue-300/10 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute bottom-32 left-32 w-56 h-56 bg-purple-300/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-indigo-300/10 rounded-full blur-2xl"></div>
      </div>

      {floatingCards.map((card, index) => (
        <motion.div
          key={index}
          className={`absolute hidden lg:block ${card.position} z-10`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: [0, -10, 0]
          }}
          transition={{ 
            duration: 0.6, 
            delay: index * 0.2,
            y: {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        >
          <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-xl">
            <div className="text-2xl mb-2">{card.icon}</div>
            <div className="text-white text-sm font-medium">{card.title}</div>
          </div>
        </motion.div>
      ))}

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-8"
          >
            <span className="mr-2">🎉</span>
            සෑම සතියකම නව පාඨමාලා එකතු කරයි
          </motion.div>

          <motion.h1 
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            ඔබගේ අධ්‍යාපන
            <br />
            <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
              ගමන පරිවර්තනය කරන්න
            </span>
          </motion.h1>

          <motion.p 
            className="mt-6 max-w-3xl mx-auto text-xl text-blue-100 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            ඔබට අධ්‍යාපනික වශයෙන් විශිෂ්ට වීමට උපකාර කිරීම සඳහා නිර්මාණය කරන ලද විශේෂඥ ගුරුවරුන් සහ ආකර්ෂණීය පාඨමාලා සොයා ගන්න.
            Scientia සමඟ ඔවුන්ගේ වෘත්තීය ජීවිතය පරිවර්තනය කර ඇති දහස් ගණන් ඉගෙනුම් ලබන්නන්ට සම්බන්ධ වන්න.
          </motion.p>

          <motion.div
            className="flex justify-center space-x-8 my-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-white">{stat.number}</div>
                <div className="text-blue-200 text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Link
                to="/auth/register"
                className="group relative w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-indigo-700 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  නොමිලේ ආරම්භ කරන්න
                  <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Link
                to="/explore"
                className="group w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl hover:bg-white/20 transition-all duration-300"
              >
                <span className="flex items-center">
                  <svg className="mr-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V4z" clipRule="evenodd" />
                  </svg>
                  පාඨමාලා ගවේෂණය කරන්න
                </span>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-16 flex flex-wrap justify-center items-center gap-8 opacity-80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="flex items-center text-white/80 text-sm">
              <div className="flex -space-x-2 mr-3">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-red-400 rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-teal-400 rounded-full border-2 border-white"></div>
              </div>
              සිසුන් 10,000+ විශ්වාස කරයි
            </div>
            <div className="flex items-center text-white/80 text-sm">
              <span className="text-yellow-300 mr-2">⭐⭐⭐⭐⭐</span>
              4.9/5 ශ්‍රේණිගත කිරීම
            </div>
          </motion.div>

          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <motion.div 
              className="flex flex-col items-center text-white/80 py-2"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <span className="text-sm mb-2 font-medium tracking-wide backdrop-blur-sm px-3 py-1 rounded-full bg-white/10">ගවේෂණය කිරීමට අනුචලනය කරන්න</span>
              <motion.div
                className="bg-white/20 backdrop-blur-md rounded-full p-2 border border-white/30 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300"
                animate={{ 
                  y: [0, 8, 0],
                  boxShadow: [
                    "0 0 0 0 rgba(129, 140, 248, 0)",
                    "0 0 0 10px rgba(129, 140, 248, 0.2)",
                    "0 0 0 0 rgba(129, 140, 248, 0)"
                  ]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  boxShadow: {
                    duration: 2,
                    repeat: Infinity
                  }
                }}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </motion.div>
            </motion.div>
          </motion.div>
          
          {/* Decorative waves at the bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden z-10">
            <svg className="absolute bottom-0 w-full h-24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
              <path fill="rgba(255, 255, 255, 0.03)" fillOpacity="1" d="M0,128L48,144C96,160,192,192,288,186.7C384,181,480,139,576,138.7C672,139,768,181,864,181.3C960,181,1056,139,1152,122.7C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
            <svg className="absolute bottom-0 w-full h-16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
              <path fill="rgba(255, 255, 255, 0.05)" fillOpacity="1" d="M0,256L48,240C96,224,192,192,288,181.3C384,171,480,181,576,176C672,171,768,149,864,149.3C960,149,1056,171,1152,176C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>
          
          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white/20"
                style={{
                  width: Math.random() * 6 + 2,
                  height: Math.random() * 6 + 2,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, Math.random() * -30 - 10],
                  opacity: [0, 0.5, 0]
                }}
                transition={{
                  duration: Math.random() * 2 + 2,
                  repeat: Infinity,
                  repeatType: "loop",
                  delay: Math.random() * 5
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
