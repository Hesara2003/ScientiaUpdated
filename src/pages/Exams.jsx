import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllExams, createExam, deleteExam } from '../services/examService';
import ExamFormModal from '../components/exams/ExamFormModal';
import { Button } from '../components/Button';
import { ExamCard } from '../components/ExamCard';
import Layout from '../components/Layout';

const mockExams = [
  {
    id: 'm1',
    subject: 'Mathematics',
    date: '2025-05-15',
    time: '09:00 AM',
    duration: 120,
    maxMarks: 100,
  },
  {
    id: 'm2',
    subject: 'Physics',
    date: '2025-05-18',
    time: '10:30 AM',
    duration: 90,
    maxMarks: 75,
  },
  {
    id: 'm3',
    subject: 'Computer Science',
    date: '2025-05-20',
    time: '01:00 PM',
    duration: 150,
    maxMarks: 100,
  },
  {
    id: 'm4',
    subject: 'English Literature',
    date: '2025-05-22',
    time: '11:00 AM',
    duration: 120,
    maxMarks: 80,
  },
  {
    id: 'm5',
    subject: 'Biology',
    date: '2025-05-25',
    time: '09:30 AM',
    duration: 120,
    maxMarks: 90,
  },
];

const Exams = () => {
  const THEME = {
    primary: '#4F46E5',    // Indigo
    secondary: '#10B981',  // Emerald
    accent: '#8B5CF6',     // Violet
    warning: '#F59E0B',    // Amber
    danger: '#EF4444',     // Red
    success: '#10B981',    // Green
    info: '#3B82F6',       // Blue
    light: '#F3F4F6',      // Gray-100
    dark: '#1F2937',       // Gray-800
    gradient: {
      primary: 'from-indigo-600 to-purple-600',
      secondary: 'from-cyan-500 to-blue-500',
      accent: 'from-purple-600 to-pink-600'
    }
  };

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentExam, setCurrentExam] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [useMockData, setUseMockData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');

  const fetchExams = async () => {
    setLoading(true);
    try {
      const data = await getAllExams();
      if (data.length === 0) {
        setExams(mockExams);
        setUseMockData(true);
      } else {
        setExams(data);
        setUseMockData(false);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching exams:', err);
      setExams(mockExams);
      setUseMockData(true);
      setError('Failed to fetch exams. Showing mock data for visualization.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleCreateExam = async (examData) => {
    try {
      await createExam(examData);
      setShowModal(false);
      setNotification({
        message: 'Exam created successfully!',
        type: 'success'
      });
      fetchExams();
    } catch (err) {
      setNotification({
        message: 'Failed to create exam. Please try again.',
        type: 'error'
      });
      console.error('Error creating exam:', err);
    }

    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  const handleDeleteExam = async (id) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await deleteExam(id);
        setNotification({
          message: 'Exam deleted successfully!',
          type: 'success'
        });
        fetchExams();
      } catch (err) {
        setNotification({
          message: 'Failed to delete exam. Please try again.',
          type: 'error'
        });
        console.error('Error deleting exam:', err);
      }

      setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    }
  };

  const openModal = (exam = null) => {
    setCurrentExam(exam);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentExam(null);
  };

  const handleSubmit = (examData) => {
    if (currentExam) {
      console.log('Update exam:', examData);
    } else {
      handleCreateExam(examData);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSubject === 'all' || exam.subject.toLowerCase() === filterSubject.toLowerCase();
    return matchesSearch && matchesFilter;
  });
  const subjects = ['all', ...new Set(exams.map(exam => exam.subject.toLowerCase()))];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1, y: 0,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="relative mb-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl transform -skew-y-1">
              <div className="absolute top-0 left-0 w-40 h-40 bg-blue-100 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-blob"></div>
              <div className="absolute top-5 right-0 w-40 h-40 bg-purple-100 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-blob animation-delay-2000"></div>
              <div className="absolute bottom-5 left-20 w-40 h-40 bg-pink-100 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-blob animation-delay-4000"></div>
            </div>
            <div className="relative z-10 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                      </svg>
                    </div>
                    <h1 className="ml-4 text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                      Exam Management
                      <span className="ml-3 px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full inline-flex items-center">
                        <span className="w-2 h-2 bg-indigo-600 rounded-full mr-1"></span>
                        {exams.length} Exams
                      </span>
                    </h1>
                  </div>
                  <p className="text-gray-600 mt-1 ml-16">Schedule, manage and track all exams in one place</p>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl shadow-md transition-all flex items-center gap-2 w-full md:w-auto justify-center font-medium"
                  onClick={() => openModal()}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add New Exam
                </motion.button>
              </div>
            </div>
          </div>          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="bg-white p-6 rounded-2xl shadow-lg mb-6 border border-gray-100"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <input 
                  type="text" 
                  className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 shadow-sm leading-5 focus:outline-none focus:ring focus:ring-indigo-200 focus:border-indigo-500 transition-all"
                  placeholder="Search by subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-sm text-gray-400">
                  {searchTerm && `${filteredExams.length} results`}
                </div>
              </div>
              
              <div className="flex items-center">
                <label htmlFor="filter" className="mr-3 text-sm font-medium text-gray-700">Subject:</label>
                <div className="relative">
                  <select 
                    id="filter" 
                    className="appearance-none block pl-4 pr-10 py-3 border border-gray-200 rounded-xl bg-gray-50/50 shadow-sm focus:outline-none focus:ring focus:ring-indigo-200 focus:border-indigo-500 transition-all"
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                  >
                    <option value="all">All Subjects</option>
                    {subjects.filter(subject => subject !== 'all').map((subject, index) => (
                      <option key={index} value={subject}>
                        {subject.charAt(0).toUpperCase() + subject.slice(1)}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.03, backgroundColor: "#F3F4F6" }}
                whileTap={{ scale: 0.97 }}
                onClick={fetchExams} 
                className="bg-gray-100 text-gray-700 py-3 px-6 rounded-xl shadow-sm transition-all flex items-center gap-2 w-full md:w-auto justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Refresh
              </motion.button>
            </div>
          </motion.div>          <AnimatePresence>
            {notification.message && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-4 mb-6 rounded-xl shadow-md border ${
                  notification.type === 'success'
                    ? 'bg-green-50 border-green-100'
                    : 'bg-red-50 border-red-100'
                }`}
              >
                <div className="flex items-center">
                  {notification.type === 'success' ? (
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                  <div className="ml-3 flex-1">
                    <p className={`text-sm font-medium ${notification.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                      {notification.message}
                    </p>
                  </div>
                  <button 
                    onClick={() => setNotification({ message: '', type: '' })}
                    className={`${notification.type === 'success' ? 'text-green-500 hover:text-green-700' : 'text-red-500 hover:text-red-700'}`}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-red-50 border border-red-100 p-6 rounded-xl mb-6 shadow-md"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-red-700 font-medium">{error}</p>
                    {useMockData && (
                      <p className="text-red-600 text-sm mt-1">Showing mock exam data for visualization purposes.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>          {loading ? (
            <div className="flex flex-col justify-center items-center bg-white p-16 rounded-2xl shadow-xl border border-gray-100">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-100"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 absolute top-0 left-0"></div>
              </div>
              <p className="mt-6 text-gray-600 text-lg font-medium animate-pulse">Loading exams...</p>
            </div>
          ) : filteredExams.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-xl text-center p-16 border border-gray-100"
            >
              <div className="mx-auto h-24 w-24 rounded-full bg-gray-50 flex items-center justify-center mb-6">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 7h6m-6 4h6m-6-8h6"></path>
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No exams found</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">No exams found matching your search criteria. Try adjusting your filters or add a new exam.</p>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2.5 px-5 rounded-lg shadow-md transition-all font-medium"
                onClick={() => {
                  setSearchTerm("");
                  setFilterSubject("all");
                }}
              >
                Clear filters
              </motion.button>
            </motion.div>          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >              {filteredExams.map((exam) => (
                <motion.div 
                  key={exam.id} 
                  variants={itemVariants}
                  whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 border border-gray-100"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-90"></div>
                    <div className="relative z-10 p-5 flex justify-between items-center">
                      <h3 className="text-xl font-bold text-white truncate">{exam.subject}</h3>
                      <span className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white rounded-md text-xs font-medium">
                        {exam.maxMarks} marks
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500"></div>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center text-gray-700">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <div className="text-xs text-gray-500 uppercase font-medium">Date</div>
                          <div className="font-semibold">{formatDate(exam.date)}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-gray-700">
                        <div className="p-2 bg-purple-50 rounded-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <div className="text-xs text-gray-500 uppercase font-medium">Start Time</div>
                          <div className="font-semibold">{exam.time}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-gray-700">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <div className="text-xs text-gray-500 uppercase font-medium">Duration</div>
                          <div className="font-semibold">{exam.duration} minutes</div>
                        </div>
                      </div>
                      
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>
                            <span className="text-sm text-gray-600 font-medium">
                              {new Date(exam.date) > new Date() ? 'Upcoming' : 'Completed'}
                            </span>
                          </div>
                          
                          <div className="flex space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal(exam)}
                              className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-all flex items-center"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                              </svg>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDeleteExam(exam.id)}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all flex items-center"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent font-medium">
              © {new Date().getFullYear()} Sciencia Education Exam Management System
            </div>
          </motion.div>
        </div>
      </div>

      <ExamFormModal
        show={showModal}
        onClose={closeModal}
        onSubmit={handleSubmit}
        examData={currentExam}
      />

    </>
  );
};

export default Exams;