import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  getAllRecordedLessons,
  addRecordedLesson,
  deleteRecordedLesson,
  getRecordedLessonById
} from '../../services/recordedLessonService';
import { toast } from 'react-hot-toast';

export default function Recordings() {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [error, setError] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    videoUrl: ''
  });

  // Function to extract thumbnail from video URL
  const getVideoThumbnail = (url) => {
    if (!url) return null;

    // YouTube thumbnail extraction
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`;
    }

    // Vimeo thumbnail extraction
    const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      // For Vimeo, we'll use a placeholder or you could implement Vimeo API call
      return `https://vumbnail.com/${vimeoMatch[1]}.jpg`;
    }

    // For other video URLs, return null to show placeholder
    return null;
  };

  // Component for video thumbnail with fallback
  const VideoThumbnail = ({ videoUrl, title, height = "h-48" }) => {
    const [thumbnailError, setThumbnailError] = useState(false);
    const [thumbnailLoading, setThumbnailLoading] = useState(true);
    const thumbnailUrl = getVideoThumbnail(videoUrl);

    const handleThumbnailError = () => {
      setThumbnailError(true);
      setThumbnailLoading(false);
    };

    const handleThumbnailLoad = () => {
      setThumbnailLoading(false);
    };

    if (!thumbnailUrl || thumbnailError) {
      return (
        <div className={`w-full ${height} bg-gray-200 flex items-center justify-center`}>
          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
          </svg>
        </div>
      );
    }

    return (
      <div className={`relative w-full ${height}`}>
        {thumbnailLoading && (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
          </div>
        )}
        <img
          src={thumbnailUrl}
          alt={title}
          className={`w-full ${height} object-cover ${thumbnailLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
          onError={handleThumbnailError}
          onLoad={handleThumbnailLoad}
        />
      </div>
    );
  };

  // Fetch all recorded lessons
  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = async () => {
    setLoading(true);
    setError(null);
    try {
      const lessons = await getAllRecordedLessons();
      setRecordings(lessons);
    } catch (err) {
      console.error('Error fetching recordings:', err);
      setError('Failed to load recordings. Please try again later.');
      toast.error('Failed to load recordings');
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

      const lessonData = {
        title: uploadData.title,
        description: uploadData.description,
        videoUrl: uploadData.videoUrl,
        uploadDate: new Date().toISOString()
      };

      await addRecordedLesson(lessonData);
      toast.success('New recording added successfully!');
      setUploadModalOpen(false);
      setUploadData({
        title: '',
        description: '',
        videoUrl: ''
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

  // Filter recordings
  const filteredRecordings = recordings.filter(recording => 
    recording.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recording.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date display
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50">
      <div className="px-6 py-8">
        {/* Enhanced Header */}
        <motion.header 
          className="mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Class Recordings
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Manage and share your class recordings with beautiful previews and easy organization
            </p>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
          </div>
        </motion.header>

        {/* Enhanced Search and Action Bar */}
        <motion.div 
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search recordings..."
              className="block w-full pl-12 pr-4 py-3 border-0 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <motion.button 
            onClick={() => setUploadModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-medium hover:from-cyan-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Add Recording
          </motion.button>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-2/3 mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-200 rounded-lg flex-1"></div>
                    <div className="h-8 bg-gray-200 rounded-lg w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-red-100"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-red-500 mb-6">
              <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
            <button 
              onClick={fetchRecordings}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium hover:from-red-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Try Again
            </button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredRecordings.length === 0 ? (
              <motion.div 
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="text-gray-400 mb-6">
                  <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No recordings yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">Start building your library by adding your first class recording</p>
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-medium hover:from-cyan-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Add Your First Recording
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredRecordings.map(recording => (
                  <motion.div 
                    key={recording.id}
                    variants={itemVariants}
                    className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden border border-white/20 hover:border-cyan-200 transition-all duration-300"
                    whileHover={{ y: -5 }}
                  >
                    <div className="relative overflow-hidden">
                      <VideoThumbnail videoUrl={recording.videoUrl} title={recording.title} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="absolute bottom-4 left-4 right-4 flex justify-center">
                          <button 
                            onClick={() => setSelectedRecording(recording)}
                            className="p-3 bg-white/90 backdrop-blur-sm rounded-full text-gray-800 hover:bg-white transform transition-all duration-200 hover:scale-110 shadow-lg"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      {/* Duration badge */}
                      <div className="absolute top-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-xs rounded-lg">
                        Video
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-cyan-600 transition-colors">
                        {recording.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {recording.description || 'No description available'}
                      </p>
                      
                      <div className="flex items-center text-xs text-gray-500 mb-4">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        {formatDate(recording.uploadDate)}
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => setSelectedRecording(recording)}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-600 rounded-lg hover:from-cyan-100 hover:to-blue-100 text-sm font-medium transition-all duration-200 border border-cyan-200/50"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => handleDeleteRecording(recording.id)}
                          className="px-4 py-2 bg-gradient-to-r from-red-50 to-pink-50 text-red-600 rounded-lg hover:from-red-100 hover:to-pink-100 text-sm font-medium transition-all duration-200 border border-red-200/50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Enhanced Upload Modal */}
        {uploadModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              className="bg-white/95 backdrop-blur-sm rounded-2xl max-w-2xl w-full p-8 shadow-2xl border border-white/20"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  Add New Recording
                </h2>
                <p className="text-gray-600">Share your knowledge with the world</p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={uploadData.title}
                    onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                    className="w-full p-4 border-0 rounded-xl bg-gray-50 focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all duration-200"
                    placeholder="Enter an engaging title for your recording"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={uploadData.description}
                    onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
                    className="w-full p-4 border-0 rounded-xl bg-gray-50 focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all duration-200 resize-none"
                    rows="4"
                    placeholder="Describe what students will learn from this recording"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Video URL *</label>
                  <input
                    type="url"
                    value={uploadData.videoUrl}
                    onChange={(e) => setUploadData({...uploadData, videoUrl: e.target.value})}
                    className="w-full p-4 border-0 rounded-xl bg-gray-50 focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all duration-200"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  <p className="text-sm text-gray-500 mt-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Supports YouTube, Vimeo, and other video platforms
                  </p>
                </div>

                {uploadData.videoUrl && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Preview</label>
                    <div className="w-full h-40 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden">
                      <VideoThumbnail videoUrl={uploadData.videoUrl} title={uploadData.title} height="h-full" />
                    </div>
                  </motion.div>
                )}
              </div>
              
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setUploadModalOpen(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddRecording}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-medium hover:from-cyan-700 hover:to-blue-700 transition-all duration-200 shadow-lg"
                >
                  Add Recording
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Enhanced Video Preview Modal */}
        {selectedRecording && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              className="bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden max-w-5xl w-full shadow-2xl border border-white/20"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="relative">
                <div className="w-full h-96 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                  <div className="w-full h-full">
                    <VideoThumbnail videoUrl={selectedRecording.videoUrl} title={selectedRecording.title} height="h-full" />
                  </div>
                </div>
                
                <button 
                  className="absolute top-6 right-6 bg-black/60 backdrop-blur-sm rounded-full p-3 text-white hover:bg-black/80 transition-all duration-200 group"
                  onClick={() => setSelectedRecording(null)}
                >
                  <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className="p-8">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">{selectedRecording.title}</h2>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span>{formatDate(selectedRecording.uploadDate)}</span>
                  </div>
                  
                  <p className="text-gray-700 text-lg leading-relaxed">
                    {selectedRecording.description || 'No description available'}
                  </p>
                </div>
                
                <div className="flex gap-4">
                  <a 
                    href={selectedRecording.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-medium hover:from-cyan-700 hover:to-blue-700 transition-all duration-200 shadow-lg flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                    Watch Video
                  </a>
                  <button 
                    onClick={() => handleDeleteRecording(selectedRecording.id)}
                    className="px-6 py-3 bg-gradient-to-r from-red-50 to-pink-50 text-red-600 rounded-xl font-medium hover:from-red-100 hover:to-pink-100 transition-all duration-200 border border-red-200/50 flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    Delete Recording
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
