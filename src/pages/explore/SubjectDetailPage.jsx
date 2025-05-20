import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  getSubjectById, 
  getSubjectTimetable, 
  getSubjectRecordings, 
  getSubjectTutors 
} from '../../services/subjectService';
import { getAllClasses } from '../../services/classService';

export default function SubjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [tutors, setTutors] = useState([]);
  const [classes, setClasses] = useState([]);
  const [recordingBundles, setRecordingBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Use our specialized subject service methods to get related data
        const [subjectData, tutorsData, timetableData, recordingsData] = await Promise.all([
          getSubjectById(id),
          getSubjectTutors(id),
          getSubjectTimetable(id),
          getSubjectRecordings(id)
        ]);
        
        setSubject(subjectData || findMockSubject(id));
        setTutors(tutorsData || mockTutors.filter(tutor => tutor.subject === findMockSubject(id).name));
        setClasses(timetableData || mockClasses.filter(cls => cls.subject === findMockSubject(id).name));
        setRecordingBundles(recordingsData || mockRecordingBundles.filter(bundle => bundle.subjectId === parseInt(id)));
      } catch (error) {
        console.error("Error fetching subject data:", error);
        
        // Use mock data as fallback
        const mockSubject = findMockSubject(id);
        setSubject(mockSubject);
        setTutors(mockTutors.filter(tutor => tutor.subject === mockSubject.name));
        setClasses(mockClasses.filter(cls => cls.subject === mockSubject.name));
        setRecordingBundles(mockRecordingBundles.filter(bundle => bundle.subjectId === parseInt(id)));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const findMockSubject = (subjectId) => {
    return mockSubjects.find(s => s.id === parseInt(subjectId)) || mockSubjects[0];
  };

  // Mock data for fallback
  const mockSubjects = [
    { 
      id: 1, 
      name: "Mathematics", 
      description: "Explore the world of numbers and mathematical concepts from algebra to calculus.", 
      icon: "https://img.icons8.com/color/96/000000/mathematics.png",
      popularTopics: ["Calculus", "Algebra", "Trigonometry", "Statistics"],
      totalClasses: 15,
      longDescription: "Mathematics is the science of numbers, quantities, and shapes and the relations between them. In our courses, you'll develop your analytical and problem-solving skills while exploring topics ranging from basic algebra to advanced calculus. Our expert tutors provide clear explanations and plenty of practice to help you master mathematical concepts and apply them to real-world problems.",
      requirements: ["Basic arithmetic knowledge", "Willingness to practice regularly", "A scientific calculator for advanced courses"],
      outcomes: ["Mastery of mathematical concepts", "Ability to solve complex problems", "Strong foundation for scientific and engineering studies", "Improved logical thinking and analytical skills"]
    },
    { 
      id: 2, 
      name: "Physics", 
      description: "Understand the fundamental principles that govern the physical world around us.", 
      icon: "https://img.icons8.com/color/96/000000/physics.png",
      popularTopics: ["Mechanics", "Quantum Physics", "Thermodynamics", "Electromagnetism"],
      totalClasses: 12,
      longDescription: "Physics is the study of matter, energy, and the interaction between them. Our physics courses cover everything from classical mechanics to modern physics concepts like quantum mechanics and relativity. Through lectures, demonstrations, and hands-on lab exercises, you'll gain a deep understanding of the fundamental laws that govern our universe and develop valuable problem-solving skills applicable to many fields.",
      requirements: ["Basic mathematics knowledge (algebra and trigonometry)", "Interest in scientific concepts", "Calculator for problem-solving exercises"],
      outcomes: ["Understanding of fundamental physical laws", "Ability to apply physics principles to real-world situations", "Strong foundation for engineering and scientific careers", "Improved critical thinking and analytical skills"]
    }
  ];

  const mockTutors = [
    { id: 1, name: "Dr. Sarah Johnson", subject: "Mathematics", rating: 4.9, image: "https://randomuser.me/api/portraits/women/44.jpg", bio: "PhD in Applied Mathematics with 10+ years of teaching experience" },
    { id: 2, name: "Prof. James Wilson", subject: "Physics", rating: 4.7, image: "https://randomuser.me/api/portraits/men/32.jpg", bio: "Former NASA researcher specializing in quantum mechanics" },
    { id: 3, name: "Ms. Emily Chen", subject: "Chemistry", rating: 4.8, image: "https://randomuser.me/api/portraits/women/66.jpg", bio: "Certified teacher with innovative lab-based teaching methods" }
  ];

  const mockClasses = [
    { id: 1, title: "Advanced Calculus", tutor: "Dr. Sarah Johnson", schedule: "Mon, Wed 4:00-5:30 PM", startDate: "2023-06-01", capacity: "15/20", subject: "Mathematics", studentCount: 15, maxCapacity: 20 },
    { id: 2, title: "Linear Algebra Fundamentals", tutor: "Dr. Sarah Johnson", schedule: "Tue, Thu 2:00-3:30 PM", startDate: "2023-06-08", capacity: "12/20", subject: "Mathematics", studentCount: 12, maxCapacity: 20 },
    { id: 3, title: "Quantum Physics Fundamentals", tutor: "Prof. James Wilson", schedule: "Tue, Thu 3:30-5:00 PM", startDate: "2023-06-05", capacity: "12/15", subject: "Physics", studentCount: 12, maxCapacity: 15 }
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
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">Subject not found</h3>
        <p className="mt-1 text-gray-500">The subject you're looking for doesn't exist or has been removed.</p>
        <button 
          onClick={() => navigate('/explore/subjects')}
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Back to Subjects
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center">
            <img src={subject.icon} alt={subject.name} className="w-16 h-16 mr-6 bg-white p-2 rounded-lg shadow-lg" />
            <div>
              <h1 className="text-3xl font-bold">{subject.name}</h1>
              <p className="mt-2 text-indigo-100 text-lg">{subject.description}</p>
            </div>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-3">
            {subject.popularTopics && subject.popularTopics.map((topic, index) => (
              <span key={index} className="bg-indigo-800 bg-opacity-50 px-3 py-1 rounded-full text-white text-sm">
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto">
            <button
              className={`py-4 px-6 focus:outline-none ${activeTab === 'overview' ? 'text-indigo-600 border-b-2 border-indigo-600 font-medium' : 'text-gray-500 hover:text-indigo-600'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`py-4 px-6 focus:outline-none ${activeTab === 'classes' ? 'text-indigo-600 border-b-2 border-indigo-600 font-medium' : 'text-gray-500 hover:text-indigo-600'}`}
              onClick={() => setActiveTab('classes')}
            >
              Classes
            </button>
            <button
              className={`py-4 px-6 focus:outline-none ${activeTab === 'tutors' ? 'text-indigo-600 border-b-2 border-indigo-600 font-medium' : 'text-gray-500 hover:text-indigo-600'}`}
              onClick={() => setActiveTab('tutors')}
            >
              Tutors
            </button>
            <button
              className={`py-4 px-6 focus:outline-none ${activeTab === 'recordings' ? 'text-indigo-600 border-b-2 border-indigo-600 font-medium' : 'text-gray-500 hover:text-indigo-600'}`}
              onClick={() => setActiveTab('recordings')}
            >
              Recordings
            </button>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About this Subject</h2>
              <p className="text-gray-700 mb-6">
                {subject.longDescription || subject.description}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">What You'll Learn</h3>
                  <ul className="space-y-2">
                    {subject.outcomes ? (
                      subject.outcomes.map((outcome, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-600">{outcome}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-600">Information about learning outcomes is not available.</li>
                    )}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                  <ul className="space-y-2">
                    {subject.requirements ? (
                      subject.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-gray-600">{requirement}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-600">No specific requirements for this subject.</li>
                    )}
                  </ul>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Subject Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">{subject.totalClasses}</div>
                    <div className="text-sm text-gray-500">Available Classes</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">{tutors.length}</div>
                    <div className="text-sm text-gray-500">Expert Tutors</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">{recordingBundles.length}</div>
                    <div className="text-sm text-gray-500">Recording Bundles</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">4.8</div>
                    <div className="text-sm text-gray-500">Average Rating</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Upcoming Classes Preview */}
              <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Upcoming Classes</h2>
                  <button 
                    onClick={() => setActiveTab('classes')}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
                
                <div className="space-y-4">
                  {classes.slice(0, 3).map((cls) => (
                    <div key={cls.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                      <h3 className="font-medium text-gray-900">{cls.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">Instructor: {cls.tutor}</p>
                      <div className="flex justify-between mt-2">
                        <span className="text-xs text-gray-500">{cls.schedule}</span>
                        <span className="text-xs text-gray-500">Starts: {cls.startDate}</span>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {cls.studentCount}/{cls.maxCapacity} Students
                        </span>
                        <button
                          onClick={() => navigate('/auth/register')}
                          className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700"
                        >
                          Enroll
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Tutors Preview */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Featured Tutors</h2>
                  <button 
                    onClick={() => setActiveTab('tutors')}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
                
                <div className="space-y-4">
                  {tutors.slice(0, 2).map((tutor) => (
                    <div key={tutor.id} className="flex items-center space-x-4">
                      <img 
                        src={tutor.image} 
                        alt={tutor.name}
                        className="w-12 h-12 rounded-full object-cover" 
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{tutor.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{tutor.bio}</p>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`h-3 w-3 ${i < Math.floor(tutor.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="text-xs text-gray-500 ml-1">{tutor.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Classes Tab */}
        {activeTab === 'classes' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Classes</h2>
              
              {classes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Title</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollment</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {classes.map((cls) => (
                        <tr key={cls.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cls.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.tutor}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.schedule}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.startDate}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                                <div 
                                  className="bg-indigo-600 h-2.5 rounded-full" 
                                  style={{ width: `${(cls.studentCount / cls.maxCapacity) * 100}%` }}
                                ></div>
                              </div>
                              <span>{cls.studentCount}/{cls.maxCapacity}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => navigate('/auth/register')}
                              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded"
                              disabled={cls.studentCount >= cls.maxCapacity}
                            >
                              {cls.studentCount >= cls.maxCapacity ? 'Full' : 'Enroll'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No classes available</h3>
                  <p className="mt-1 text-sm text-gray-500">Check back later for upcoming classes in this subject.</p>
                </div>
              )}
            </div>
            
            <div className="bg-indigo-50 rounded-lg p-6">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Looking for a specific class time?</h3>
                  <p className="text-gray-600 mt-1">We can help you find a class that fits your schedule.</p>
                </div>
                <button
                  onClick={() => navigate('/auth/register')}
                  className="mt-4 md:mt-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md"
                >
                  Request Class
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tutors Tab */}
        {activeTab === 'tutors' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {tutors.length > 0 ? (
              tutors.map((tutor) => (
                <div key={tutor.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={tutor.image} 
                      alt={tutor.name} 
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{tutor.name}</h3>
                    <p className="text-indigo-600 font-medium text-sm mb-3">{tutor.subject} Specialist</p>
                    <p className="text-gray-600 mb-4">{tutor.bio}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`h-5 w-5 ${i < Math.floor(tutor.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-gray-600 ml-2">{tutor.rating} Rating</span>
                      </div>
                      <button
                        onClick={() => navigate('/auth/register')}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No tutors available</h3>
                <p className="mt-1 text-sm text-gray-500">We're currently recruiting tutors for this subject.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Recordings Tab */}
        {activeTab === 'recordings' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Recording Bundles</h2>
              <p className="text-gray-600 mb-6">Access high-quality recorded lessons for flexible self-paced learning</p>
              
              {recordingBundles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {recordingBundles.map((bundle) => (
                    <div key={bundle.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={bundle.thumbnail} 
                          alt={bundle.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{bundle.title}</h3>
                          {bundle.bestSeller && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                              Bestseller
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-4">{bundle.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {bundle.topics.map((topic, index) => (
                            <span key={index} className="bg-indigo-100 px-2 py-1 rounded-full text-indigo-700 text-xs">
                              {topic}
                            </span>
                          ))}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                          <div>
                            <span className="text-gray-500">Level:</span>
                            <p className="font-medium text-gray-900">{bundle.level}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Duration:</span>
                            <p className="font-medium text-gray-900">{bundle.duration}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Lessons:</span>
                            <p className="font-medium text-gray-900">{bundle.totalLessons}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Format:</span>
                            <p className="font-medium text-gray-900">Video + Resources</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                          <div className="text-2xl font-bold text-gray-900">${bundle.price}</div>
                          <button
                            onClick={() => navigate('/auth/register')}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md"
                          >
                            Purchase Access
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No recording bundles available</h3>
                  <p className="mt-1 text-sm text-gray-500">We're currently developing recording bundles for this subject.</p>
                </div>
              )}
            </div>
            
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-8 text-white">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Bundle & Save</h3>
                  <p className="text-indigo-100 mb-1">Purchase all recording bundles for this subject and save 25%.</p>
                  <p className="text-indigo-100">Lifetime access to all current and future recordings for {subject.name}.</p>
                </div>
                <button
                  onClick={() => navigate('/auth/register')}
                  className="mt-6 md:mt-0 px-6 py-3 bg-white text-indigo-600 hover:bg-indigo-50 text-sm font-bold rounded-md shadow-lg"
                >
                  Get Complete Bundle
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
