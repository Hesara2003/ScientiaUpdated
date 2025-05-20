import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  getAllRecordedLessons,
  addRecordedLesson,
  deleteRecordedLesson,
  getLessonsByTutorId
} from '../../services/recordedLessonService';
import { toast } from 'react-hot-toast';

export default function Recordings() {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [error, setError] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    subjectId: '',
    videoUrl: '',
    thumbnailUrl: '',
    isPublic: false
  });

  // The tutor ID would typically come from authentication
  const tutorId = localStorage.getItem('userId') || '1';

  // Fetch recorded lessons by tutor ID
  useEffect(() => {
    fetchRecordings();
  }, [tutorId]);

  const fetchRecordings = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get lessons for this specific tutor
      const tutorLessons = await getLessonsByTutorId(tutorId);
      setRecordings(tutorLessons);
    } catch (err) {
      console.error('Error fetching recordings:', err);
      setError('Failed to load recordings. Please try again later.');
      
      // Fallback to mock data for development/demo purposes
      setRecordings([
        {
          id: 1,
          title: 'Calculus - Introduction to Derivatives',
          description: 'Lecture covering the basic concepts of derivatives and their applications.',
          thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400&q=60',
          duration: '48:22',
          date: '2025-05-08',
          views: 24,
          class: 'Advanced Mathematics',
          shared: true,
          public: false,
          url: 'https://example.com/recordings/derivatives'
        },
        {
          id: 2,
          title: 'Calculus - Integration Techniques',
          description: 'Advanced methods for solving complex integration problems.',
          thumbnail: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400&q=60',
          duration: '52:15',
          date: '2025-05-10',
          views: 21,
          class: 'Advanced Mathematics',
          shared: true,
          public: false,
          url: 'https://example.com/recordings/integration'
        },
        {
          id: 3,
          title: 'Newton\'s Laws of Motion',
          description: 'Comprehensive explanation of Newton\'s three laws of motion with demonstrations.',
          thumbnail: 'https://images.unsplash.com/photo-1610465299993-e6675c9f9efa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400&q=60',
          duration: '45:37',
          date: '2025-05-12',
          views: 18,
          class: 'Physics Fundamentals',
          shared: true,
          public: false,
          url: 'https://example.com/recordings/newton'
        },
        {
          id: 4,
          title: 'Pendulum Lab - Setup and Analysis',
          description: 'Guide to setting up the pendulum lab and analyzing the results.',
          thumbnail: 'https://images.unsplash.com/photo-1583307709855-88ec8bdb495c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400&q=60',
          duration: '34:49',
          date: '2025-05-15',
          views: 16,
          class: 'Physics Fundamentals',
          shared: false,
          public: false,
          url: 'https://example.com/recordings/pendulum'
        },
        {
          id: 5,
          title: 'Introduction to Periodic Table',
          description: 'Overview of the periodic table and element properties.',
          thumbnail: 'https://images.unsplash.com/photo-1532153955177-f59af40d6472?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400&q=60',
          duration: '41:12',
          date: '2025-05-13',
          views: 16,
          class: 'Chemistry Lab',
          shared: true,
          public: true,
          url: 'https://example.com/recordings/periodic-table'
        },
        {
          id: 6,
          title: 'Chemical Reactions Demo',
          description: 'Demonstration of different types of chemical reactions with safety guidelines.',
          thumbnail: 'https://images.unsplash.com/photo-1616713982839-2160e378e06c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400&q=60',
          duration: '38:54',
          date: '2025-05-14',
          views: 14,
          class: 'Chemistry Lab',
          shared: true,
          public: false,
          url: 'https://example.com/recordings/chemical-reactions'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a new recording
  const handleAddRecording = async () => {
    try {
      if (!uploadData.title || !uploadData.videoUrl) {
        toast.error('Please fill in at least title and video URL');
        return;
      }

      // Add the tutor ID to the data
      const lessonData = {
        ...uploadData,
        tutorId: tutorId,
        createdAt: new Date().toISOString()
      };

      await addRecordedLesson(lessonData);
      toast.success('New recording added successfully!');
      setUploadModalOpen(false);
      setUploadData({
        title: '',
        description: '',
        subjectId: '',
        videoUrl: '',
        thumbnailUrl: '',
        isPublic: false
      });
      
      // Refresh the recordings list
      fetchRecordings();
    } catch (err) {
      console.error('Error adding new recording:', err);
      toast.error('Failed to add recording. Please try again.');
    }
  };

  // Handle deleting a recording
  const handleDeleteRecording = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recording?')) {
      return;
    }
    
    try {
      await deleteRecordedLesson(id);
      toast.success('Recording deleted successfully');
      // Remove from state
      setRecordings(recordings.filter(rec => rec.id !== id));
      if (selectedRecording && selectedRecording.id === id) {
        setSelectedRecording(null);
      }
    } catch (err) {
      console.error('Error deleting recording:', err);
      toast.error('Failed to delete recording. Please try again.');
    }
  };

  // Get unique classes for filter
  const getUniqueClasses = () => {
    const classes = recordings.map(recording => recording.class);
    return [...new Set(classes)].filter(Boolean);
  };

  // Filter recordings
  const filteredRecordings = recordings.filter(recording => {
    const matchesSearch = recording.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          recording.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'all' || recording.class === filterClass;
    return matchesSearch && matchesClass;
  });

  // Format date display
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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Class Recordings</h1>
        <p className="text-gray-600">Manage and share your class recordings with students</p>
      </header>

      {/* Filter and search bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0">
          <button 
            onClick={() => setFilterClass('all')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${filterClass === 'all' 
              ? 'bg-cyan-600 text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            All Classes
          </button>
          {getUniqueClasses().map((className) => (
            <button 
              key={className}
              onClick={() => setFilterClass(className)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${filterClass === className 
                ? 'bg-cyan-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              {className}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search recordings..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>

      {/* Upload button */}
      <div className="mb-6 flex justify-end">
        <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
          </svg>
          Record New Session
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
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
          {filteredRecordings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No recordings found</h3>
              <p className="text-gray-500">Try adjusting your filters or record a new session</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecordings.map(recording => (
                <motion.div 
                  key={recording.id}
                  variants={itemVariants}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative group">
                    <img 
                      src={recording.thumbnail} 
                      alt={recording.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setSelectedRecording(recording)}
                        className="p-3 bg-white rounded-full text-gray-800 hover:bg-cyan-100 transform transition-transform group-hover:scale-110"
                      >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </button>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      {recording.duration}
                    </div>
                    
                    {recording.shared && (
                      <div className="absolute top-2 left-2 bg-cyan-100 text-cyan-800 text-xs px-2 py-1 rounded-full">
                        Shared
                      </div>
                    )}
                    
                    {recording.public && (
                      <div className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Public
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 text-lg mb-1">{recording.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{recording.description}</p>
                    
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <div>
                        {formatDate(recording.date)} • {recording.views} views
                      </div>
                      <div className="flex">
                        <button className="p-1.5 hover:bg-gray-100 rounded-full">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded-full">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                          </svg>
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded-full">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Video preview modal */}
      {selectedRecording && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4">
          <motion.div 
            className="bg-white rounded-xl overflow-hidden max-w-4xl w-full"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="relative">
              <div className="aspect-w-16 aspect-h-9 bg-black">
                {/* This would be a real video player in production */}
                <div className="w-full h-full flex items-center justify-center">
                  <img 
                    src={selectedRecording.thumbnail} 
                    alt={selectedRecording.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="p-4 bg-white rounded-full">
                      <svg className="w-12 h-12 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              <button 
                className="absolute top-4 right-4 bg-black bg-opacity-60 rounded-full p-2 text-white hover:bg-opacity-80"
                onClick={() => setSelectedRecording(null)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedRecording.title}</h2>
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <span>{formatDate(selectedRecording.date)}</span>
                <span className="mx-2">•</span>
                <span>{selectedRecording.duration}</span>
                <span className="mx-2">•</span>
                <span>{selectedRecording.views} views</span>
              </div>
              
              <p className="text-gray-700 mb-6">{selectedRecording.description}</p>
              
              <div className="flex flex-wrap gap-3 justify-between">
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 flex items-center">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                    </svg>
                    Download
                  </button>
                  <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                    </svg>
                    Share
                  </button>
                  <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    Edit
                  </button>
                </div>
                
                <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
