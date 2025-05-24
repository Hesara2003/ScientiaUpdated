import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllExams, formatExamData } from '../../services/examService';

export default function Exams() {
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [pastExams, setPastExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Helper function to determine if an exam is upcoming or past
  const isUpcomingExam = (startTime) => {
    const now = new Date();
    const examDate = new Date(startTime);
    return examDate > now;
  };

  // Transform API exam data to component format
  const transformExamData = (exam) => {
    const formattedExam = formatExamData(exam);
    const isUpcoming = isUpcomingExam(formattedExam.startTime);
    
    if (isUpcoming) {
      return {
        id: formattedExam.examId,
        title: formattedExam.examName,
        course: formattedExam.className || 'Unknown Course',
        date: formattedExam.startTime.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        time: `${formattedExam.startTime.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })} - ${formattedExam.endTime.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}`,
        location: "TBD", // You might want to add location field to your exam entity
        status: "Upcoming",
        tutor: formattedExam.tutorName || 'Unknown Tutor',
        duration: formattedExam.duration,
        syllabus: [
          "To be announced" // You might want to add syllabus field to your exam entity
        ]
      };
    } else {
      return {
        id: formattedExam.examId,
        title: formattedExam.examName,
        course: formattedExam.className || 'Unknown Course',
        date: formattedExam.startTime.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        score: "Pending", // You might want to add score field to your exam entity
        grade: "Pending", // You might want to add grade field to your exam entity
        feedback: "Feedback will be available once graded.", // You might want to add feedback field
        tutor: formattedExam.tutorName || 'Unknown Tutor'
      };
    }
  };

  // Fetch exams from API
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const examsData = await getAllExams();
        console.log('Fetched exams:', examsData);
        
        if (Array.isArray(examsData)) {
          const transformedExams = examsData.map(transformExamData);
          
          // Separate upcoming and past exams
          const upcoming = transformedExams.filter(exam => exam.status === 'Upcoming');
          const past = transformedExams.filter(exam => exam.status !== 'Upcoming');
          
          setUpcomingExams(upcoming);
          setPastExams(past);
        } else {
          console.warn('Exams data is not an array:', examsData);
          setUpcomingExams([]);
          setPastExams([]);
        }
      } catch (err) {
        console.error('Error fetching exams:', err);
        setError('Failed to load exams. Please try again later.');
        // Fallback to empty arrays
        setUpcomingExams([]);
        setPastExams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

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

  // Get days until exam
  const getDaysUntil = (dateString) => {
    const examDate = new Date(dateString);
    const today = new Date();
    const diffTime = examDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="px-4 py-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Exams & Assessments</h1>
        <p className="text-gray-600">View your upcoming exams and past results</p>
      </header>

      {/* Error handling */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error loading exams</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="text-sm text-red-800 underline mt-2"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Upcoming Exams */}
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Upcoming Exams</h2>
            
            {upcomingExams.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No upcoming exams</h3>
                <p className="text-gray-500">You're all caught up for now!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingExams.map(exam => {
                  const daysUntil = getDaysUntil(exam.date);
                  
                  return (
                    <motion.div 
                      key={exam.id}
                      variants={itemVariants}
                      className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedExam(exam)}
                    >
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">{exam.title}</h3>
                            <p className="text-sm text-gray-500">{exam.course}</p>
                            {exam.tutor && (
                              <p className="text-xs text-gray-400">Tutor: {exam.tutor}</p>
                            )}
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            daysUntil <= 3 ? 'bg-red-100 text-red-800' :
                            daysUntil <= 7 ? 'bg-amber-100 text-amber-800' :
                            'bg-indigo-100 text-indigo-800'
                          }`}>
                            {daysUntil === 0 ? 'Today' : 
                            daysUntil === 1 ? 'Tomorrow' : 
                            `In ${daysUntil} days`}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-500">Date</p>
                            <p className="text-sm font-medium text-gray-800">{exam.date}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Time</p>
                            <p className="text-sm font-medium text-gray-800">{exam.time}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-xs text-gray-500">Location</p>
                            <p className="text-sm font-medium text-gray-800">{exam.location}</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-500">
                            {exam.syllabus?.length || 0} topics
                          </div>
                          <button className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm">
                            View Details
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Past Exams */}
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Past Exam Results</h2>
            
            {pastExams.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No past exams</h3>
                <p className="text-gray-500">Your exam history will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {pastExams.map(exam => (
                  <motion.div 
                    key={exam.id}
                    variants={itemVariants}
                    className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedExam(exam)}
                  >
                    <div className="p-5">
                      <div className="mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">{exam.title}</h3>
                        <p className="text-sm text-gray-500">{exam.course}</p>
                        <p className="text-xs text-gray-500 mt-1">{exam.date}</p>
                        {exam.tutor && (
                          <p className="text-xs text-gray-400">Tutor: {exam.tutor}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-end gap-2">
                          <span className="text-xl font-bold">
                            {exam.score === 'Pending' ? 'N/A' : exam.score.split('/')[0]}
                          </span>
                          {exam.score !== 'Pending' && (
                            <span className="text-gray-500 text-sm">/ {exam.score.split('/')[1]}</span>
                          )}
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          exam.grade === 'Pending' ? 'bg-gray-100 text-gray-800' :
                          exam.grade.startsWith('A') ? 'bg-green-100 text-green-800' :
                          exam.grade.startsWith('B') ? 'bg-cyan-100 text-cyan-800' :
                          exam.grade.startsWith('C') ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          Grade: {exam.grade}
                        </span>
                      </div>
                      
                      <button className="w-full px-3 py-2 mt-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm flex justify-center items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        View Feedback
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
      
      {/* Exam Detail Modal */}
      <AnimatePresence>
        {selectedExam && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4">
            <motion.div 
              className="bg-white rounded-xl overflow-hidden max-w-2xl w-full"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">{selectedExam.title}</h3>
                <button 
                  className="p-1 rounded-full hover:bg-gray-100"
                  onClick={() => setSelectedExam(null)}
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className="p-6">
                {selectedExam.status === 'Upcoming' ? (
                  <>
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Exam Information</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Course</p>
                            <p className="text-sm font-medium text-gray-800">{selectedExam.course}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Date</p>
                            <p className="text-sm font-medium text-gray-800">{selectedExam.date}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Time</p>
                            <p className="text-sm font-medium text-gray-800">{selectedExam.time}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Location</p>
                            <p className="text-sm font-medium text-gray-800">{selectedExam.location}</p>
                          </div>
                          {selectedExam.tutor && (
                            <div className="col-span-2">
                              <p className="text-xs text-gray-500">Tutor</p>
                              <p className="text-sm font-medium text-gray-800">{selectedExam.tutor}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Syllabus Coverage</h4>
                      <ul className="bg-gray-50 rounded-lg p-4 space-y-2">
                        {selectedExam.syllabus?.map((topic, index) => (
                          <li key={index} className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span className="text-sm text-gray-800">{topic}</span>
                          </li>
                        )) || (
                          <li className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span className="text-sm text-gray-500">Syllabus details to be announced</span>
                          </li>
                        )}
                      </ul>
                    </div>
                    
                    <div className="mt-6 flex justify-center">
                      <div className="bg-indigo-50 px-4 py-3 rounded-lg text-center w-full">
                        <p className="text-sm text-indigo-800">
                          <span className="font-medium">Study Tip:</span> Make sure to review all topics and practice with sample questions.
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Exam Results</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Course</p>
                            <p className="text-sm font-medium text-gray-800">{selectedExam.course}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Date</p>
                            <p className="text-sm font-medium text-gray-800">{selectedExam.date}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Score</p>
                            <p className="text-sm font-medium text-gray-800">{selectedExam.score}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Grade</p>
                            <p className={`text-sm font-medium ${
                              selectedExam.grade.startsWith('A') ? 'text-green-600' :
                              selectedExam.grade.startsWith('B') ? 'text-cyan-600' :
                              selectedExam.grade.startsWith('C') ? 'text-amber-600' :
                              'text-red-600'
                            }`}>
                              {selectedExam.grade}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Teacher Feedback</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-800">{selectedExam.feedback}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="bg-gray-50 px-6 py-4 flex justify-end">
                <button 
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                  onClick={() => setSelectedExam(null)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
