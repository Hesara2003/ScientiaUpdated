import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAllTutors } from '../services/tutorService';
import { getAllClasses } from '../services/classService';
import { getAllSubjects } from '../services/subjectService';
import { getAllRecordingBundles } from '../services/recordingService';

export default function LandingPage() {
  const [tutors, setTutors] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [recordingBundles, setRecordingBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubject, setActiveSubject] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();  

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch data in parallel
        const [tutorsData, classesData, subjectsData, bundlesData] = await Promise.all([
          getAllTutors(),
          getAllClasses(),
          getAllSubjects(),
          getAllRecordingBundles()
        ]);
        
        setTutors(tutorsData || []);
        setClasses(classesData || []);
        setSubjects(subjectsData || []);
        setRecordingBundles(bundlesData || []);
        
        // Set the first subject as active by default if subjects exist
        if (subjectsData && subjectsData.length > 0) {
          setActiveSubject(subjectsData[0]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        
        // Use mock data if API fails
        setTutors(mockTutors);
        setClasses(mockClasses);
        setSubjects(mockSubjects);
        setRecordingBundles(mockRecordingBundles);
        
        // Set the first mock subject as active
        setActiveSubject(mockSubjects[0]);
      } finally {
        setLoading(false);
      }
    };

    // Clear any existing user role when landing page is loaded
    localStorage.removeItem('userRole');
    
    fetchData();
  }, []);

  // Helper functions
  const getClassesBySubject = (subjectName) => {
    if (!subjectName) return classes;
    return classes.filter(course => course.subject === subjectName);
  };

  const getTutorsBySubject = (subjectName) => {
    if (!subjectName) return tutors;
    return tutors.filter(tutor => tutor.subject === subjectName);
  };

  const getBundlesBySubject = (subjectId) => {
    if (!subjectId) return recordingBundles;
    return recordingBundles.filter(bundle => bundle.subjectId === subjectId);
  };

  const handleSubjectChange = (subject) => {
    setActiveSubject(subject);
    setActiveTab('overview');
  };

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
  // Mock data in case API fails
  const mockTutors = [
    { id: 1, name: "Dr. Sarah Johnson", subject: "Mathematics", rating: 4.9, image: "https://randomuser.me/api/portraits/women/44.jpg", bio: "PhD in Applied Mathematics with 10+ years of teaching experience" },
    { id: 2, name: "Prof. James Wilson", subject: "Physics", rating: 4.7, image: "https://randomuser.me/api/portraits/men/32.jpg", bio: "Former NASA researcher specializing in quantum mechanics" },
    { id: 3, name: "Ms. Emily Chen", subject: "Chemistry", rating: 4.8, image: "https://randomuser.me/api/portraits/women/66.jpg", bio: "Certified teacher with innovative lab-based teaching methods" },
    { id: 4, name: "Mr. David Taylor", subject: "English Literature", rating: 4.6, image: "https://randomuser.me/api/portraits/men/68.jpg", bio: "Published author with a passion for classic and modern literature" }
  ];

  const mockClasses = [
    { id: 1, title: "Advanced Calculus", tutor: "Dr. Sarah Johnson", schedule: "Mon, Wed 4:00-5:30 PM", startDate: "2023-06-01", capacity: "15/20", subject: "Mathematics", studentCount: 15, maxCapacity: 20 },
    { id: 2, title: "Quantum Physics Fundamentals", tutor: "Prof. James Wilson", schedule: "Tue, Thu 3:30-5:00 PM", startDate: "2023-06-05", capacity: "12/15", subject: "Physics", studentCount: 12, maxCapacity: 15 },
    { id: 3, title: "Organic Chemistry Lab", tutor: "Ms. Emily Chen", schedule: "Fri 2:00-5:00 PM", startDate: "2023-06-02", capacity: "18/25", subject: "Chemistry", studentCount: 18, maxCapacity: 25 },
    { id: 4, title: "Creative Writing Workshop", tutor: "Mr. David Taylor", schedule: "Wed 6:00-8:00 PM", startDate: "2023-06-07", capacity: "8/12", subject: "English Literature", studentCount: 8, maxCapacity: 12 }
  ];
  
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
  
  const mockRecordingBundles = [
    { 
      id: 1, 
      title: "Mathematics Mastery Bundle", 
      subject: "Mathematics",
      subjectId: 1,
      description: "Complete set of recorded calculus and algebra lessons for self-paced learning",
      price: 79.99,
      duration: "20 hours",
      level: "Intermediate to Advanced",
      topics: ["Differential Calculus", "Integral Calculus", "Linear Algebra"],
      bestSeller: true,
      thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
      totalLessons: 25
    },
    { 
      id: 2, 
      title: "Physics Fundamentals", 
      subject: "Physics",
      subjectId: 2,
      description: "Comprehensive physics recordings covering mechanics and thermodynamics",
      price: 89.99,
      duration: "24 hours",
      level: "Beginner to Intermediate",
      topics: ["Classical Mechanics", "Waves and Oscillations", "Thermodynamics"],
      bestSeller: false,
      thumbnail: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
      totalLessons: 22
    },
    { 
      id: 3, 
      title: "Chemistry Essentials", 
      subject: "Chemistry",
      subjectId: 3,
      description: "Key chemistry topics with virtual lab demonstrations",
      price: 69.99,
      duration: "18 hours",
      level: "All Levels",
      topics: ["Organic Chemistry Basics", "Chemical Reactions", "Atomic Structure"],
      bestSeller: false,
      thumbnail: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
      totalLessons: 20
    },
    { 
      id: 4, 
      title: "Literature Analysis Complete Course", 
      subject: "English Literature",
      subjectId: 4,
      description: "In-depth literary analysis techniques and writing skills",
      price: 59.99,
      duration: "15 hours",
      level: "Intermediate",
      topics: ["Literary Criticism", "Narrative Analysis", "Poetry Interpretation"],
      bestSeller: true,
      thumbnail: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
      totalLessons: 18
    },
    { 
      id: 5, 
      title: "Programming Essentials", 
      subject: "Computer Science",
      subjectId: 5,
      description: "Foundational programming concepts with hands-on projects",
      price: 99.99,
      duration: "30 hours",
      level: "Beginner",
      topics: ["Python Programming", "Data Structures", "Algorithms"],
      bestSeller: true,
      thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
      totalLessons: 35
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <motion.div
                className="flex-shrink-0 flex items-center"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  EduLearn Hub
                </span>
              </motion.div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a href="#featured-courses" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                  Courses
                </a>
                <a href="#our-tutors" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                  Tutors
                </a>
                <Link to="/explore" className="text-indigo-600 border-indigo-600 border-b-2 px-3 py-2 text-sm font-medium">
                  Explore
                </Link>
                <a href="#timetable" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                  Timetable
                </a>
                <a href="#about-us" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                  About Us
                </a>
              </div>
            </div>
            <div className="flex items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/auth/login')}
                className="px-4 py-2 text-sm text-white font-medium bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700"
              >
                Sign In
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

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
              Transform Your Learning Journey
            </h1>
            <p className="mt-3 max-w-md mx-auto text-lg text-indigo-100 sm:text-xl md:mt-5 md:max-w-3xl">
              Discover expert tutors and engaging courses designed to help you excel academically.
            </p>
            <div className="mt-10 max-w-md mx-auto sm:flex sm:justify-center md:mt-12">
              <div className="rounded-md shadow">
                <Link
                  to="/auth/register"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  Get Started
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link
                  to="/explore"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-800 hover:bg-indigo-900 md:py-4 md:text-lg md:px-10"
                >
                  Explore Courses
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Featured Courses Section */}
      <section id="featured-courses" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl text-center mb-12">
              Featured Courses
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
                {classes.slice(0, 6).map((course) => (
                  <motion.div 
                    key={course.id}
                    className="bg-gray-50 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    variants={itemVariants}
                  >
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                      <p className="text-gray-600 mb-4">Instructor: {course.tutor}</p>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <svg className="h-5 w-5 text-indigo-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {course.schedule}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <svg className="h-5 w-5 text-indigo-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Starts: {course.startDate}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Capacity: {course.capacity}</span>
                        <button
                          onClick={() => navigate('/auth/register')}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md"
                        >
                          Enroll Now
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Explore More CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-500 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-6">
              Ready to Explore Our Educational Offerings?
            </h2>
            <p className="max-w-2xl mx-auto text-xl text-indigo-100 mb-10">
              Discover our comprehensive range of subjects, meet our expert tutors, browse class schedules, 
              and explore our premium recording bundles.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/explore"
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-indigo-700 bg-white hover:bg-gray-50 shadow-lg"
              >
                Start Exploring
                <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Meet Our Tutors Section */}
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
            ) : (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {tutors.slice(0, 8).map((tutor) => (
                  <motion.div 
                    key={tutor.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    variants={itemVariants}
                  >
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={tutor.image || `https://randomuser.me/api/portraits/${tutor.id % 2 === 0 ? 'men' : 'women'}/${tutor.id * 10 + 10}.jpg`} 
                        alt={tutor.name} 
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{tutor.name}</h3>
                      <p className="text-indigo-600 font-medium text-sm mb-2">{tutor.subject}</p>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{tutor.bio || "Experienced educator passionate about student success."}</p>
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
            )}
          </motion.div>
        </div>
      </section>

      {/* Timetable Section */}
      <section id="timetable" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl text-center mb-12">
              Class Timetable
            </h2>
            
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {classes.map((course) => (
                      <tr key={course.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.tutor}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.schedule}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.startDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.capacity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => navigate('/auth/register')}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded"
                          >
                            Enroll
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* About Us & CTA Section */}
      <section id="about-us" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-6">
                About Our School
              </h2>
              <p className="text-gray-600 mb-6">
                EduLearn Hub is a premier educational platform committed to providing high-quality education to students of all ages and backgrounds. Our mission is to make learning accessible, engaging, and effective through innovative teaching methods and technology.
              </p>
              <p className="text-gray-600 mb-6">
                We offer a diverse range of courses taught by experienced educators who are passionate about student success. Our personalized approach ensures that each student receives the attention and support they need to excel academically.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                <div className="bg-indigo-100 px-3 py-1 rounded-full text-indigo-700 text-sm">Personalized Learning</div>
                <div className="bg-indigo-100 px-3 py-1 rounded-full text-indigo-700 text-sm">Expert Tutors</div>
                <div className="bg-indigo-100 px-3 py-1 rounded-full text-indigo-700 text-sm">Flexible Schedules</div>
                <div className="bg-indigo-100 px-3 py-1 rounded-full text-indigo-700 text-sm">Interactive Classes</div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mt-10 lg:mt-0"
            >
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
                  <p className="text-gray-600 mb-6">
                    Join our growing community of learners today and take the next step in your educational journey.
                  </p>
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/auth/register')}
                      className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-md text-white font-medium"
                    >
                      Create Account
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/auth/login')}
                      className="w-full py-2 px-4 border border-indigo-600 rounded-lg text-indigo-600 font-medium hover:bg-indigo-50"
                    >
                      Sign In
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">EduLearn Hub</h3>
              <p className="text-gray-400 text-sm">
                Empowering students to achieve academic excellence through innovative learning solutions.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#featured-courses" className="hover:text-white">Courses</a></li>
                <li><a href="#our-tutors" className="hover:text-white">Tutors</a></li>
                <li><a href="#timetable" className="hover:text-white">Timetable</a></li>
                <li><a href="#about-us" className="hover:text-white">About Us</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center">
                  <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  info@edulearnhub.com
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +1 (123) 456-7890
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  <motion.svg 
                    className="h-6 w-6" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </motion.svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  <motion.svg 
                    className="h-6 w-6" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-2.239v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </motion.svg>
                </a>
              </div>
              <div className="mt-4">
                <motion.a 
                  href="#" 
                  className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-300"
                  whileHover={{ x: 5 }}
                >
                  <span>Join our newsletter</span>
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </motion.a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-400">© 2025 EduLearn Hub. All rights reserved.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <motion.a 
                  href="#" 
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-300"
                  whileHover={{ y: -2 }}
                >
                  Privacy Policy
                </motion.a>
                <motion.a 
                  href="#" 
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-300"
                  whileHover={{ y: -2 }}
                >
                  Terms of Service
                </motion.a>
                <motion.a 
                  href="#" 
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-300"
                  whileHover={{ y: -2 }}
                >
                  Contact Us
                </motion.a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
