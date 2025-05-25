import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const AboutSection = () => {
  const navigate = useNavigate();

  const stats = [
    { number: '10,000+', label: 'ලියාපදිංචි සිසුන්' },
    { number: '500+', label: 'ප්‍රවීණ ගුරු' },
    { number: '50+', label: 'පවතින පාඨමාලා' },
    { number: '98%', label: 'සාර්ථකත්ව අනුපාතය' }
  ];

  const features = [
    { icon: '🎯', title: 'පෞද්ගලික අධ්‍යාපනය', description: 'අභිමූඛ අධ්‍යාපන මාර්ග' },
    { icon: '👨‍🏫', title: 'ප්‍රවීණ ගුරු', description: 'කාර්මික විශේෂඥයන්' },
    { icon: '⏰', title: 'සැලකිලිමත් කාලසටහන්', description: 'ඔබේ වේගයට අනුකූලව ඉගෙන ගන්න' },
    { icon: '💬', title: 'අන්තර්ක්‍රියාකාරී පන්ති', description: 'ඉවහල් සෙෂන්' }
  ];

  return (
    <section id="about-us" className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 blur-xl"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-indigo-200 rounded-full opacity-20 blur-xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Scientia ගැන
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            නවෝත්පාදන අධ්‍යාපනය සහ පෞද්ගලික අධ්‍යාපන අත්දැකීම් මඟින් මනසන් ශක්තිමත් කිරීම
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
              <div className="text-2xl md:text-3xl font-bold text-indigo-600 mb-2">{stat.number}</div>
              <div className="text-gray-600 text-sm md:text-base">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                ඔබේ අධ්‍යාපන ගමන පරිවර්තනය කරන්න
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Scientia යනු සියලු වයස් සහ පසුබැසීමේ සිසුන් සඳහා උසස් තත්ත්වයේ අධ්‍යාපනය ලබා දීමට කැපවූ ප්‍රමුඛ අධ්‍යාපන වේදිකාවකි. නවෝත්පාදන ඉගැන්වීමේ ක්‍රම සහ නවීන තාක්ෂණය මඟින් ඉගෙනීම පහසු, ආකර්ෂණීය සහ කාර්යක්ෂම කිරීම අපගේ මෙහෙවර වේ.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                අපි විවිධ පාඨමාලා පවත්වන අතර, ඒවා ප්‍රවීණ ගුරුවරුන් විසින් ඉගැන්වෙයි. අපගේ පෞද්ගලික ආකාරය සෑම සිසුවෙකුටම විශේෂ අවධානය සහ සහාය ලබා දීමේ සහතිකය ලබා දෙයි.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-md border border-white/20 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{feature.icon}</div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{feature.title}</div>
                      <div className="text-gray-600 text-xs">{feature.description}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-12 lg:mt-0"
          >
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                <h3 className="text-2xl font-bold text-white mb-2">ඉගෙනීම ආරම්භ කිරීමට සූදානම්ද?</h3>
                <p className="text-blue-100">
                  අදම අපගේ වර්ධනය වන සමාජය සමඟ එකතු වන්න
                </p>
              </div>
              <div className="p-8">
                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>දින 7ක් නොමිලේ පරීක්ෂණයක්</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>ණය පතක් අවශ්‍ය නොවේ</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>24/7 සහාය ලබා ගත හැක</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/auth/register')}
                    className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg text-white font-semibold transition-all duration-300"
                  >
                    අදම ඉගෙනීම ආරම්භ කරන්න
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(99, 102, 241, 0.05)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/auth/login')}
                    className="w-full py-3 px-6 border-2 border-indigo-200 rounded-xl text-indigo-600 font-semibold hover:border-indigo-300 transition-all duration-300"
                  >
                    දැනටමත් ගිණුමක් තිබේද?
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
