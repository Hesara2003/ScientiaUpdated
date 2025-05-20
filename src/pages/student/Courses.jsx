import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getAllClasses } from '../../services/classService';
import SubjectBrowser from '../../components/subjects/SubjectBrowser';

export default function Courses() {
  const [courses, setCourses] = useState([]);  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('materials');  
  const [currentView, setCurrentView] = useState('enrolled'); // 'enrolled' or 'browse'// Fetch courses using the class service
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // Get all classes from the API
        const classes = await getAllClasses();
        
        // If classes are returned from the API, transform them to match our UI needs
        if (classes && classes.length > 0) {
          setCourses(classes.map(cls => ({
            id: cls.id,
            title: cls.name || 'Untitled Course',
            teacher: cls.tutorName || 'Unknown Teacher',
            schedule: cls.schedule || 'Schedule not available',
            progress: cls.progress || 0,
            image: "https://source.unsplash.com/random/400x200/?education",
            description: cls.description || 'No description available',
            materials: [],
            assignments: []
          })));
        } else {
          // Otherwise, use mock data
          setCourses([
            {
              id: 1,
              title: "Advanced Mathematics",
              teacher: "Dr. Robert Chen",
              schedule: "Mon, Wed, Fri - 10:00 AM",
              progress: 68,
              image: "https://source.unsplash.com/random/400x200/?math",
              description: "This course covers advanced topics in mathematics including calculus, linear algebra, and differential equations.",
              materials: [
                { title: "Calculus Textbook", type: "PDF", date: "2025-02-10" },
                { title: "Linear Algebra Notes", type: "PDF", date: "2025-03-15" },
                { title: "Formula Sheet", type: "PDF", date: "2025-04-05" }
              ],
              assignments: [
                { title: "Problem Set 6", dueDate: "2025-05-15", status: "Submitted" },
                { title: "Problem Set 7", dueDate: "2025-05-20", status: "Pending" },
            { title: "Midterm Project", dueDate: "2025-05-30", status: "Pending" }
          ]
        },
        {
          id: 2,
          title: "Physics 101",
          teacher: "Prof. Sarah Williams",
          schedule: "Tue, Thu - 11:30 AM",
          progress: 75,
          image: "https://source.unsplash.com/random/400x200/?physics",
          description: "An introductory course to physics covering mechanics, thermodynamics, and wave phenomena.",
          materials: [
            { title: "Physics Fundamentals Textbook", type: "PDF", date: "2025-02-12" },
            { title: "Lab Manual", type: "PDF", date: "2025-03-20" },
            { title: "Lecture Slides", type: "PPT", date: "2025-04-10" }
          ],
          assignments: [
            { title: "Lab Report 3", dueDate: "2025-05-12", status: "Submitted" },
            { title: "Lab Report 4", dueDate: "2025-05-19", status: "Pending" },
            { title: "Midterm Exam", dueDate: "2025-05-25", status: "Pending" }
          ]
        },
        {
          id: 3,
          title: "English Literature",
          teacher: "Ms. Angela Davis",
          schedule: "Mon, Thu - 2:00 PM",
          progress: 90,
          image: "https://source.unsplash.com/random/400x200/?books",
          description: "A survey of major works of English literature from the Renaissance to the modern period.",
          materials: [
            { title: "Anthology of English Literature", type: "PDF", date: "2025-02-15" },
            { title: "Shakespeare's Collected Works", type: "PDF", date: "2025-03-25" },
            { title: "Literary Analysis Guide", type: "PDF", date: "2025-04-15" }
          ],
          assignments: [
            { title: "Essay on Shakespeare", dueDate: "2025-05-10", status: "Submitted" },
            { title: "Poetry Analysis", dueDate: "2025-05-18", status: "Submitted" },
            { title: "Final Essay Draft", dueDate: "2025-05-22", status: "Pending" }
          ]
        }
      ]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching courses:', error);
        // Use mock data in case of error
        setCourses([
          {
            id: 1,
            title: "Advanced Mathematics",
            teacher: "Dr. Robert Chen",
            schedule: "Mon, Wed, Fri - 10:00 AM",
            progress: 68,
            image: "https://source.unsplash.com/random/400x200/?math",
            description: "This course covers advanced topics in mathematics including calculus, linear algebra, and differential equations.",
            materials: [],
            assignments: []
          }
        ]);
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Filter courses based on search term
  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.teacher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
        stiffness: 80
      }
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <div className="px-4 py-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">My Courses</h1>
        <p className="text-gray-600">View your enrolled courses and access course materials</p>
      </header>

      {/* Search bar */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search courses..."
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 w-full md:w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredCourses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No courses found</h3>
              <p className="text-gray-500">Try adjusting your search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map(course => (
                <motion.div 
                  key={course.id}
                  variants={itemVariants}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedCourse(course)}
                >
                  <div className="relative">
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-0 right-0 m-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        course.progress >= 90 ? 'bg-green-100 text-green-800' :
                        course.progress >= 70 ? 'bg-cyan-100 text-cyan-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {course.progress}% Complete
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-lg">{course.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{course.teacher}</p>
                    <p className="text-gray-500 text-xs mt-1">{course.schedule}</p>
                    
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${
                          course.progress >= 90 ? 'bg-green-600' :
                          course.progress >= 70 ? 'bg-cyan-600' :
                          'bg-amber-600'
                        }`} style={{ width: `${course.progress}%` }}></div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4">                      <div className="text-xs text-gray-500">
                        {course.assignments && course.assignments.filter(a => a.status === 'Pending').length} pending assignments
                      </div>
                      <Link to={`/explore/classes/${course.id}`} className="px-3 py-1 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 text-sm">
                        View Course
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Course Detail Modal */}
      <AnimatePresence>
        {selectedCourse && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4">
            <motion.div 
              className="bg-white rounded-xl overflow-hidden max-w-4xl w-full"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="relative">
                <img 
                  src={selectedCourse.image} 
                  alt={selectedCourse.title}
                  className="w-full h-56 object-cover"
                />
                
                <button 
                  className="absolute top-4 right-4 bg-black bg-opacity-60 rounded-full p-2 text-white hover:bg-opacity-80"
                  onClick={() => setSelectedCourse(null)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedCourse.title}</h2>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <span>Instructor: {selectedCourse.teacher}</span>
                  <span className="mx-2">•</span>
                  <span>{selectedCourse.schedule}</span>
                </div>
                
                <p className="text-gray-700 mb-6">{selectedCourse.description}</p>
                
                <div className="flex mb-6">
                  <button 
                    className={`px-4 py-2 font-medium text-sm rounded-t-lg ${activeTab === 'materials' ? 'bg-cyan-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                    onClick={() => setActiveTab('materials')}
                  >
                    Course Materials
                  </button>
                  <button 
                    className={`px-4 py-2 font-medium text-sm rounded-t-lg ml-2 ${activeTab === 'assignments' ? 'bg-cyan-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                    onClick={() => setActiveTab('assignments')}
                  >
                    Assignments
                  </button>
                </div>
                
                {activeTab === 'materials' && (
                  <div className="bg-white border border-gray-200 rounded-lg">
                    {!selectedCourse.materials || selectedCourse.materials.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">No materials available</div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {selectedCourse.materials.map((material, index) => (
                          <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-center">
                              <div className="p-2 bg-cyan-100 rounded-lg mr-3">
                                <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{material.title}</p>
                                <p className="text-xs text-gray-500">Added {formatDate(material.date)}</p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded mr-3">{material.type}</span>
                              <button className="p-1.5 hover:bg-gray-100 rounded-full">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'assignments' && (
                  <div className="bg-white border border-gray-200 rounded-lg">
                    {!selectedCourse.assignments || selectedCourse.assignments.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">No assignments available</div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {selectedCourse.assignments.map((assignment, index) => (
                          <div key={index} className="p-4 hover:bg-gray-50">
                            <div className="flex justify-between items-center">
                              <h3 className="font-medium text-gray-800">{assignment.title}</h3>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                assignment.status === 'Submitted' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {assignment.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Due: {formatDate(assignment.dueDate)}</p>
                            
                            {assignment.status === 'Pending' && (
                              <div className="mt-3">
                                <button className="px-3 py-1.5 bg-cyan-600 text-white text-sm rounded-md hover:bg-cyan-700">
                                  Submit Assignment
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
