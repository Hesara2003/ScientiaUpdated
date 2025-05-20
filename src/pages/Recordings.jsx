import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Recordings() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState("recording");
  const [uploadData, setUploadData] = useState({
    title: "",
    description: "",
    subject: "",
    course: "",
    tutor: "",
    recordingDate: "",
    type: "video", 
    file: null,
    url: "",
    accessLevel: "all" 
  });

  const subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "English", "History"];
  
  const contentTypes = ["Video", "Document", "Presentation", "Quiz", "Assignment"];

  const [tutors, setTutors] = useState([]);

  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real application, you would fetch all this data from your API
        // For now we'll use mock data
        
        // Fetch recordings
        try {
          const recordingsResponse = await axios.get("http://localhost:8080/recordings");
          setRecordings(recordingsResponse.data);
        } catch (err) {
          console.log("Using mock recordings data");
          setRecordings([
            {
              id: 1,
              title: "Introduction to Calculus",
              description: "Fundamental concepts of limits, derivatives and integrals",
              subject: "Mathematics",
              course: "Advanced Mathematics",
              tutor: "Dr. Smith",
              recordingDate: "2025-04-10",
              uploadDate: "2025-04-11",
              duration: "1:15:20",
              type: "Video",
              url: "https://example.com/recordings/calculus-intro.mp4",
              thumbnail: "https://placehold.co/600x400/3b82f6/ffffff?text=Calculus",
              views: 145,
              accessLevel: "all"
            },
            {
              id: 2,
              title: "Newton's Laws of Motion",
              description: "Detailed explanation of all three laws with examples",
              subject: "Physics",
              course: "Physics for Engineers",
              tutor: "Dr. Johnson",
              recordingDate: "2025-04-08",
              uploadDate: "2025-04-09",
              duration: "52:40",
              type: "Video",
              url: "https://example.com/recordings/newton-laws.mp4",
              thumbnail: "https://placehold.co/600x400/8b5cf6/ffffff?text=Physics",
              views: 120,
              accessLevel: "premium"
            },
            {
              id: 3,
              title: "Organic Chemistry Basics",
              description: "Introduction to organic compounds and nomenclature",
              subject: "Chemistry",
              course: "Organic Chemistry",
              tutor: "Prof. Williams",
              recordingDate: "2025-04-05",
              uploadDate: "2025-04-07",
              duration: "1:05:15",
              type: "Video",
              url: "https://example.com/recordings/organic-chem.mp4",
              thumbnail: "https://placehold.co/600x400/10b981/ffffff?text=Chemistry",
              views: 98,
              accessLevel: "all"
            },
            {
              id: 4,
              title: "Introduction to Web Development",
              description: "HTML, CSS and JavaScript basics",
              subject: "Computer Science",
              course: "Web Development",
              tutor: "Mr. Brown",
              recordingDate: "2025-04-12",
              uploadDate: "2025-04-13",
              duration: "1:30:00",
              type: "Video",
              url: "https://example.com/recordings/web-dev.mp4",
              thumbnail: "https://placehold.co/600x400/6366f1/ffffff?text=WebDev",
              views: 210,
              accessLevel: "all"
            }
          ]);
        }
        
        try {
          const materialsResponse = await axios.get("http://localhost:8080/study-materials");
          setMaterials(materialsResponse.data);
        } catch (err) {
          console.log("Using mock materials data");
          setMaterials([
            {
              id: 1,
              title: "Calculus Formula Sheet",
              description: "Comprehensive formula sheet for calculus",
              subject: "Mathematics",
              course: "Advanced Mathematics",
              tutor: "Dr. Smith",
              uploadDate: "2025-04-02",
              type: "Document",
              fileType: "PDF",
              size: "1.2 MB",
              url: "https://example.com/materials/calculus-formulas.pdf",
              thumbnail: "https://placehold.co/600x400/3b82f6/ffffff?text=PDF",
              downloads: 87,
              accessLevel: "all"
            },
            {
              id: 2,
              title: "Physics Problem Set",
              description: "Practice problems for Newton's Laws",
              subject: "Physics",
              course: "Physics for Engineers",
              tutor: "Dr. Johnson",
              uploadDate: "2025-04-08",
              type: "Document",
              fileType: "PDF",
              size: "2.4 MB",
              url: "https://example.com/materials/physics-problems.pdf",
              thumbnail: "https://placehold.co/600x400/8b5cf6/ffffff?text=PDF",
              downloads: 65,
              accessLevel: "all"
            },
            {
              id: 3,
              title: "Cell Structure Presentation",
              description: "Detailed slides on cell structure and function",
              subject: "Biology",
              course: "Molecular Biology",
              tutor: "Dr. Davis",
              uploadDate: "2025-04-10",
              type: "Presentation",
              fileType: "PPTX",
              size: "5.8 MB",
              url: "https://example.com/materials/cell-structure.pptx",
              thumbnail: "https://placehold.co/600x400/f59e0b/ffffff?text=PPT",
              downloads: 54,
              accessLevel: "premium"
            },
            {
              id: 4,
              title: "JavaScript Fundamentals Quiz",
              description: "Self-assessment quiz on JavaScript basics",
              subject: "Computer Science",
              course: "Web Development",
              tutor: "Mr. Brown",
              uploadDate: "2025-04-11",
              type: "Quiz",
              fileType: "HTML",
              size: "0.8 MB",
              url: "https://example.com/materials/js-quiz.html",
              thumbnail: "https://placehold.co/600x400/6366f1/ffffff?text=Quiz",
              downloads: 42,
              accessLevel: "all"
            },
            {
              id: 5,
              title: "Essay Writing Guidelines",
              description: "Comprehensive guide on structuring academic essays",
              subject: "English",
              course: "Literature Analysis",
              tutor: "Ms. Wilson",
              uploadDate: "2025-04-03",
              type: "Document",
              fileType: "DOCX",
              size: "1.5 MB",
              url: "https://example.com/materials/essay-guide.docx",
              thumbnail: "https://placehold.co/600x400/ef4444/ffffff?text=DOC",
              downloads: 76,
              accessLevel: "all"
            }
          ]);
        }
        
        try {
          const tutorsResponse = await axios.get("http://localhost:8080/tutors");
          setTutors(tutorsResponse.data);
        } catch (err) {
          console.log("Using mock tutors data");
          setTutors([
            { id: 1, name: "Dr. Smith", subjects: ["Mathematics", "Physics"] },
            { id: 2, name: "Dr. Johnson", subjects: ["Physics"] },
            { id: 3, name: "Prof. Williams", subjects: ["Chemistry"] },
            { id: 4, name: "Dr. Davis", subjects: ["Biology"] },
            { id: 5, name: "Mr. Brown", subjects: ["Computer Science"] },
            { id: 6, name: "Ms. Wilson", subjects: ["English"] },
            { id: 7, name: "Prof. Taylor", subjects: ["History"] }
          ]);
        }
        
        try {
          const coursesResponse = await axios.get("http://localhost:8080/courses");
          setCourses(coursesResponse.data);
        } catch (err) {
          console.log("Using mock courses data");
          setCourses([
            { id: 1, name: "Advanced Mathematics", subject: "Mathematics" },
            { id: 2, name: "Physics for Engineers", subject: "Physics" },
            { id: 3, name: "Organic Chemistry", subject: "Chemistry" },
            { id: 4, name: "Molecular Biology", subject: "Biology" },
            { id: 5, name: "Web Development", subject: "Computer Science" },
            { id: 6, name: "Literature Analysis", subject: "English" },
            { id: 7, name: "Modern World History", subject: "History" }
          ]);
        }

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try refreshing the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const combinedContent = [...recordings.map(r => ({ ...r, contentCategory: 'recording' })), 
                           ...materials.map(m => ({ ...m, contentCategory: 'material' }))]
    .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

  const filteredContent = combinedContent.filter(item => {
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !item.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.tutor.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    if (filterSubject !== "all" && item.subject !== filterSubject) {
      return false;
    }
    
    if (filterType !== "all") {
      if (filterType === "recordings" && item.contentCategory !== "recording") {
        return false;
      }
      if (filterType === "materials" && item.contentCategory !== "material") {
        return false;
      }
      if (!["recordings", "materials"].includes(filterType) && item.type !== filterType) {
        return false;
      }
    }
    
    return true;
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadData({ ...uploadData, file });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUploadData({ ...uploadData, [name]: value });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    
    try {
      setLoading(true);
      
      const newItem = {
        id: Date.now(),
        title: uploadData.title,
        description: uploadData.description,
        subject: uploadData.subject,
        course: uploadData.course,
        tutor: uploadData.tutor,
        recordingDate: uploadData.recordingDate || new Date().toISOString().split('T')[0],
        uploadDate: new Date().toISOString().split('T')[0],
        type: uploadData.type,
        accessLevel: uploadData.accessLevel,
        url: uploadData.url || URL.createObjectURL(uploadData.file),
      };
      
      if (uploadType === "recording") {
        newItem.duration = "0:00";
        newItem.thumbnail = `https://placehold.co/600x400/3b82f6/ffffff?text=${uploadData.title}`;
        newItem.views = 0;
        setRecordings([newItem, ...recordings]);
      } else {
        newItem.fileType = uploadData.file ? uploadData.file.name.split('.').pop().toUpperCase() : "PDF";
        newItem.size = uploadData.file ? `${Math.round(uploadData.file.size / 1024 / 1024 * 10) / 10} MB` : "1.0 MB";
        newItem.thumbnail = `https://placehold.co/600x400/10b981/ffffff?text=${newItem.fileType}`;
        newItem.downloads = 0;
        setMaterials([newItem, ...materials]);
      }
      
      setUploadData({
        title: "",
        description: "",
        subject: "",
        course: "",
        tutor: "",
        recordingDate: "",
        type: "video",
        file: null,
        url: "",
        accessLevel: "all"
      });
      setUploadModalOpen(false);
      
    } catch (err) {
      console.error("Error uploading:", err);
      alert("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getContentIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'video':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
          </svg>
        );
      case 'document':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        );
      case 'presentation':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
          </svg>
        );
      case 'quiz':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
          </svg>
        );
      case 'assignment':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
          </svg>
        );
    }
  };

  const getAccessLevelBadge = (accessLevel) => {
    switch (accessLevel) {
      case 'premium':
        return "bg-yellow-100 text-yellow-800";
      case 'specific-course':
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  if (loading && combinedContent.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Learning Resources</h1>
        <p className="text-gray-600">Manage class recordings and study materials for students</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setUploadType("recording");
              setUploadModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              ></path>
            </svg>
            Upload Recording
          </button>

          <button
            onClick={() => {
              setUploadType("material");
              setUploadModalOpen(true);
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
            </svg>
            Add Material
          </button>
        </div>

        <div className="flex space-x-2">
          <button
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              ></path>
            </svg>
            Manage Access
          </button>

          <button
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              ></path>
            </svg>
            Send Notification
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search recordings and materials..."
                className="w-full border border-gray-300 rounded-md pl-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
          </div>

          <div className="w-full md:w-48">
            <select
              className="w-full border border-gray-300 rounded-md py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
            >
              <option value="all">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-48">
            <select
              className="w-full border border-gray-300 rounded-md py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="recordings">Recordings</option>
              <option value="materials">Study Materials</option>
              <option value="Video">Videos</option>
              <option value="Document">Documents</option>
              <option value="Presentation">Presentations</option>
              <option value="Quiz">Quizzes</option>
              <option value="Assignment">Assignments</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredContent.map((item) => (
          <div
            key={`${item.contentCategory}-${item.id}`}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              {item.contentCategory === 'recording' && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                  {item.duration}
                </div>
              )}
              <div className="absolute top-2 right-2">
                <span 
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getAccessLevelBadge(item.accessLevel)}`}
                >
                  {item.accessLevel === 'all' ? 'All' : item.accessLevel === 'premium' ? 'Premium' : 'Course Only'}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-800 line-clamp-1">{item.title}</h3>
                <div 
                  className={`text-xs px-2 py-1 rounded ${
                    item.contentCategory === 'recording' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {item.contentCategory === 'recording' ? 'Recording' : item.type}
                </div>
              </div>
              
              <p className="text-sm text-blue-600 mb-1">{item.subject}</p>
              <p className="text-sm text-gray-600 mb-1">{item.course}</p>
              <p className="text-sm text-gray-700 mb-4 line-clamp-2">{item.description}</p>
              
              <div className="flex justify-between items-center mb-3">
                <div className="text-sm text-gray-500 flex items-center">
                  <svg 
                    className="w-4 h-4 mr-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  {item.tutor}
                </div>
                <div className="text-sm text-gray-500 flex items-center">
                  <svg 
                    className="w-4 h-4 mr-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  {item.contentCategory === 'recording' 
                    ? new Date(item.recordingDate).toLocaleDateString() 
                    : new Date(item.uploadDate).toLocaleDateString()}
                </div>
              </div>
              
              <div className="flex justify-between">
                <div className="text-sm text-gray-500">
                  {item.contentCategory === 'recording' 
                    ? <span>{item.views} views</span>
                    : <span>{item.downloads} downloads • {item.size}</span>}
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                  </button>
                  <button className="text-red-600 hover:text-red-800">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredContent.length === 0 && (
          <div className="col-span-full bg-white rounded-lg shadow-md p-6 text-center">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              ></path>
            </svg>
            <h3 className="text-lg font-medium text-gray-800 mb-1">No Content Found</h3>
            <p className="text-gray-600 mb-4">
              No recordings or materials match your current filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterSubject("all");
                setFilterType("all");
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {uploadModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-bold text-gray-800">
                {uploadType === "recording" ? "Upload Class Recording" : "Add Study Material"}
              </h3>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpload}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={uploadData.title}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <select
                      name="subject"
                      value={uploadData.subject}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={uploadData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course
                    </label>
                    <select
                      name="course"
                      value={uploadData.course}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Course</option>
                      {courses
                        .filter(course => !uploadData.subject || course.subject === uploadData.subject)
                        .map((course) => (
                          <option key={course.id} value={course.name}>
                            {course.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tutor
                    </label>
                    <select
                      name="tutor"
                      value={uploadData.tutor}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Tutor</option>
                      {tutors
                        .filter(tutor => !uploadData.subject || tutor.subjects.includes(uploadData.subject))
                        .map((tutor) => (
                          <option key={tutor.id} value={tutor.name}>
                            {tutor.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content Type
                    </label>
                    <select
                      name="type"
                      value={uploadData.type}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {uploadType === "recording" ? (
                        <option value="Video">Video</option>
                      ) : (
                        <>
                          <option value="Document">Document</option>
                          <option value="Presentation">Presentation</option>
                          <option value="Quiz">Quiz</option>
                          <option value="Assignment">Assignment</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Access Level
                    </label>
                    <select
                      name="accessLevel"
                      value={uploadData.accessLevel}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="all">All Students</option>
                      <option value="premium">Premium Students</option>
                      <option value="specific-course">Course Students Only</option>
                    </select>
                  </div>
                </div>

                {uploadType === "recording" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recording Date
                    </label>
                    <input
                      type="date"
                      name="recordingDate"
                      value={uploadData.recordingDate}
                      onChange={handleInputChange}
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Method
                  </label>
                  <div className="flex space-x-4">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="file-upload"
                        name="upload-method"
                        className="h-4 w-4 text-blue-600"
                        defaultChecked
                      />
                      <label htmlFor="file-upload" className="ml-2 text-sm text-gray-700">
                        File Upload
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="external-url"
                        name="upload-method"
                        className="h-4 w-4 text-blue-600"
                      />
                      <label htmlFor="external-url" className="ml-2 text-sm text-gray-700">
                        External URL
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md border border-dashed border-gray-300">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      ></path>
                    </svg>
                    <div className="mt-2">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-700">
                          {uploadType === "recording" 
                            ? "Upload recording video or audio file" 
                            : "Upload study material file"}
                        </span>
                        <input
                          id="file-upload"
                          name="file"
                          type="file"
                          accept={uploadType === "recording" ? "video/*,audio/*" : "*/*"}
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {uploadType === "recording" 
                        ? "MP4, WEBM, MP3 or other video/audio formats" 
                        : "PDF, DOCX, PPTX or other document formats"}
                    </p>
                    {uploadData.file && (
                      <p className="mt-2 text-sm text-blue-600">
                        Selected: {uploadData.file.name}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    External URL (Optional)
                  </label>
                  <input
                    type="url"
                    name="url"
                    value={uploadData.url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/my-recording.mp4"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                >
                  {uploadType === "recording" ? "Upload Recording" : "Add Material"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="text-center text-sm text-gray-500 mt-8">
        <p>Showing {filteredContent.length} of {combinedContent.length} resources</p>
      </div>
    </div>
  );
}