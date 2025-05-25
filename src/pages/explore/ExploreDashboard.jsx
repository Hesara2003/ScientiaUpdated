import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAllSubjects } from '../../services/subjectService';

export default function ExploreDashboard() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const subjectsData = await getAllSubjects();
        setSubjects(subjectsData || mockSubjects);
      } catch (error) {
        console.error("Error fetching subjects:", error);
        setSubjects(mockSubjects);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Mock data in case API fails
  const mockSubjects = [
    { 
      id: 1, 
      name: "Mathematics", 
      description: "Explore the world of numbers and mathematical concepts from algebra to calculus.", 
      icon: "https://img.icons8.com/color/96/000000/mathematics.png",
      popularTopics: ["Calculus", "Algebra", "Trigonometry", "Statistics"],
      totalClasses: 15
    },
    { 
      id: 2, 
      name: "Physics", 
      description: "Understand the fundamental principles that govern the physical world around us.", 
      icon: "https://img.icons8.com/color/96/000000/physics.png",
      popularTopics: ["Mechanics", "Quantum Physics", "Thermodynamics", "Electromagnetism"],
      totalClasses: 12
    },
    { 
      id: 3, 
      name: "Chemistry", 
      description: "Discover the composition, structure, properties, and reactions of matter.", 
      icon: "https://img.icons8.com/color/96/000000/test-tube.png",
      popularTopics: ["Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry", "Biochemistry"],
      totalClasses: 9
    },
    { 
      id: 4, 
      name: "English Literature", 
      description: "Analyze literary works and develop strong writing and critical thinking skills.", 
      icon: "https://img.icons8.com/color/96/000000/literature.png",
      popularTopics: ["Modern Fiction", "Shakespeare", "Poetry Analysis", "Creative Writing"],
      totalClasses: 8
    },
    { 
      id: 5, 
      name: "Computer Science", 
      description: "Learn programming, algorithms, and computational thinking.", 
      icon: "https://img.icons8.com/color/96/000000/source-code.png",
      popularTopics: ["Python Programming", "Data Structures", "Web Development", "Artificial Intelligence"],
      totalClasses: 20
    }
  ];

  // Animation variants
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

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
              Explore Learning Opportunities
            </h1>
            <p className="mt-3 max-w-md mx-auto text-lg text-indigo-100 sm:text-xl md:mt-5 md:max-w-3xl">
              Discover subjects, expert tutors, and flexible learning options designed to help you excel academically.
            </p>
            <div className="mt-10 max-w-md mx-auto sm:flex sm:justify-center md:mt-12">
              <div className="rounded-md shadow">
                <Link
                  to="/explore/subjects"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  Browse Subjects
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link
                  to="/explore/tutors"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-700 hover:bg-indigo-800 md:py-4 md:text-lg md:px-10"
                >
                  Meet Our Tutors
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Subject Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl text-center mb-12">
              Explore Subjects
            </h2>
            
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {subjects.map((subject) => (
                  <motion.div 
                    key={subject.id}
                    className="bg-gray-50 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                    variants={itemVariants}
                  >
                    <Link to={`/explore/subjects/${subject.id}`} className="block h-full">
                      <div className="p-6 flex flex-col h-full">
                        <div className="flex items-center mb-4">
                          <img src={subject.icon} alt={subject.name} className="w-12 h-12 mr-4" />
                          <h3 className="text-xl font-bold text-gray-900">{subject.name}</h3>
                        </div>
                        <p className="text-gray-600 mb-4 flex-grow">{subject.description}</p>
                        <div className="mt-auto">
                          <div className="flex flex-wrap gap-2 mb-4">
                            {subject.popularTopics && subject.popularTopics.map((topic, index) => (
                              <span key={index} className="bg-indigo-100 px-2 py-1 rounded-full text-indigo-700 text-xs">
                                {topic}
                              </span>
                            ))}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">{subject.totalClasses} Classes Available</span>
                            <span className="text-indigo-600 text-sm font-medium flex items-center">
                              Learn More
                              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                              </svg>
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}

            <div className="mt-12 text-center">
              <Link
                to="/explore/subjects"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                View All Subjects
                <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
              Why Choose Scientia?
            </h2>
            <p className="max-w-2xl mx-auto text-xl text-gray-500">
              Discover the benefits of our comprehensive learning platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="w-12 h-12 rounded-md bg-indigo-500 text-white flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Expert Tutors</h3>
              <p className="text-gray-600">
                Learn from qualified professionals with years of teaching experience and expertise in their fields.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="w-12 h-12 rounded-md bg-indigo-500 text-white flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Flexible Learning</h3>
              <p className="text-gray-600">
                Choose from live classes, recorded sessions, and self-paced options to fit your schedule and learning style.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="w-12 h-12 rounded-md bg-indigo-500 text-white flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Comprehensive Support</h3>
              <p className="text-gray-600">
                Access study materials, practice exercises, and personalized feedback to ensure academic success.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 bg-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-indigo-700 rounded-lg shadow-xl overflow-hidden">
            <div className="px-6 py-12 sm:px-12 lg:flex lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-white sm:text-3xl sm:tracking-tight">
                  Ready to start your learning journey?
                </h2>
                <p className="mt-3 max-w-3xl text-lg text-indigo-200">
                  Sign up today to explore our subjects, meet our tutors, and discover the perfect courses for your educational goals.
                </p>
              </div>
              <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
                <div className="inline-flex rounded-md shadow">
                  <Link
                    to="/auth/register"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
                  >
                    Get Started
                  </Link>
                </div>
                <div className="ml-3 inline-flex rounded-md shadow">
                  <Link
                    to="/explore/subjects"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-800 hover:bg-indigo-900"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
