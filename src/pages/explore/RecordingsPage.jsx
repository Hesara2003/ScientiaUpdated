import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  getAllRecordedLessons
  // Removed searchLessons as it doesn't exist and isn't used
} from '../../services/recordedLessonService';
import { getAllSubjects } from '../../services/subjectService';

export default function RecordingsPage() {
  const [recordingBundles, setRecordingBundles] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [allLessons, setAllLessons] = useState([]); // Store all lessons for filtering
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [lessonsData, subjectsData] = await Promise.all([
          getAllRecordedLessons(),
          getAllSubjects()
        ]);
        
        // Store all lessons for filtering
        setAllLessons(lessonsData || []);
        
        // Convert lessons to bundles format for compatibility
        const convertedBundles = formatLessonsAsBundles(lessonsData);
        
        setRecordingBundles(convertedBundles || mockRecordingBundles);
        setSubjects(subjectsData || mockSubjects);
      } catch (error) {
        console.error("Error fetching data:", error);
        setRecordingBundles(mockRecordingBundles);
        setSubjects(mockSubjects);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Client-side function to filter lessons by subject
  const getLessonsBySubject = (lessons, subjectName) => {
    return lessons.filter(lesson => 
      lesson.subject && lesson.subject.toLowerCase() === subjectName.toLowerCase()
    );
  };

  // Convert recorded lessons to bundles format for backward compatibility
  const formatLessonsAsBundles = (lessons) => {
    const subjectGroups = {};
    
    // Group lessons by subject
    lessons.forEach(lesson => {
      const subject = lesson.subject || 'Other';
      if (!subjectGroups[subject]) {
        subjectGroups[subject] = [];
      }
      subjectGroups[subject].push(lesson);
    });
    
    // Create bundles from subject groups
    return Object.entries(subjectGroups).map(([subject, subjectLessons], index) => {
      const subjectId = subjects.find(s => s.name === subject)?.id || index + 1;
      const tutors = [...new Set(subjectLessons.map(lesson => lesson.tutor))].filter(Boolean);
      const tutorsText = tutors.length > 0 ? tutors[0] : 'Various Tutors';
      const totalDuration = subjectLessons.reduce((total, lesson) => {
        // Parse duration like "1:30:00" to minutes
        const durationParts = (lesson.duration || '0:0').split(':');
        const minutes = durationParts.length > 1 
          ? parseInt(durationParts[0]) * 60 + parseInt(durationParts[1]) 
          : parseInt(durationParts[0]);
        return total + minutes;
      }, 0);
      
      const formattedDuration = `${Math.floor(totalDuration / 60)} hours`;
      
      return {
        id: index + 1,
        title: `${subject} Complete Bundle`,
        subject: subject,
        subjectId: subjectId,
        description: `Complete set of recorded ${subject.toLowerCase()} lessons for self-paced learning`,
        price: 69.99 + (index * 10),
        duration: formattedDuration,
        level: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
        topics: subjectLessons.slice(0, 3).map(lesson => lesson.title),
        bestSeller: subjectLessons.length > 3,
        thumbnail: subjectLessons[0]?.thumbnailUrl || `https://placehold.co/800x600/${getColorForSubject(subject)}/ffffff?text=${encodeURIComponent(subject)}`,
        totalLessons: subjectLessons.length,
        tutor: tutorsText,
        totalStudents: 100 + Math.floor(Math.random() * 400),
        // Store original lessons for reference
        lessons: subjectLessons
      };
    });
  };
  // Helper function to get a color code for a subject
  const getColorForSubject = (subject) => {
    const colors = {
      'Mathematics': '3b82f6',
      'Physics': '8b5cf6',
      'Chemistry': '10b981',
      'Biology': 'ef4444',
      'Computer Science': '6366f1',
      'English Literature': 'f59e0b',
      'History': 'ec4899'
    };
    
    return colors[subject] || '64748b'; // Default gray
  };

  // Filter bundles based on search, subject and level filter
  const filteredBundles = recordingBundles.filter(bundle => {
    const matchesSearch = bundle.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         bundle.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (bundle.lessons && bundle.lessons.some(lesson => 
                           lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           lesson.description.toLowerCase().includes(searchTerm.toLowerCase())
                         ));
    
    const matchesSubject = selectedSubject === 'all' || bundle.subject === selectedSubject;
    const matchesLevel = selectedLevel === 'all' || bundle.level.toLowerCase().includes(selectedLevel.toLowerCase());
    
    return matchesSearch && matchesSubject && matchesLevel;
  });

  // Update subject filter effect - using client-side filtering
  useEffect(() => {
    const updateBundlesBySubject = () => {
      if (selectedSubject === 'all') {
        // If 'all' is selected, use all lessons
        const convertedBundles = formatLessonsAsBundles(allLessons);
        setRecordingBundles(convertedBundles || mockRecordingBundles);
      } else {
        // Filter lessons by selected subject
        const subjectLessons = getLessonsBySubject(allLessons, selectedSubject);
        const convertedBundles = formatLessonsAsBundles(subjectLessons);
        setRecordingBundles(convertedBundles || mockRecordingBundles);
      }
    };

    // Only run this if we have lessons loaded
    if (allLessons && allLessons.length > 0) {
      updateBundlesBySubject();
    }
  }, [selectedSubject, allLessons, subjects]);

  // Sort bundles
  const sortedBundles = [...filteredBundles].sort((a, b) => {
    if (sortBy === 'price-low') {
      return a.price - b.price;
    } else if (sortBy === 'price-high') {
      return b.price - a.price;
    } else if (sortBy === 'duration') {
      // Extract hours from duration string "X hours"
      const durationA = parseInt(a.duration.split(' ')[0]);
      const durationB = parseInt(b.duration.split(' ')[0]);
      return durationB - durationA;
    } else if (sortBy === 'lessons') {
      return b.totalLessons - a.totalLessons;
    } else {
      // Default: sort by popularity (bestseller first, then by total students)
      return (b.bestSeller ? 10000 : 0) + b.totalStudents - ((a.bestSeller ? 10000 : 0) + a.totalStudents);
    }
  });

  // Mock data in case API fails
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
      totalLessons: 25,
      tutor: "Dr. Sarah Johnson",
      totalStudents: 342
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
      totalLessons: 22,
      tutor: "Prof. James Wilson",
      totalStudents: 156
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
      totalLessons: 20,
      tutor: "Ms. Emily Chen",
      totalStudents: 178
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
      totalLessons: 18,
      tutor: "Mr. David Taylor",
      totalStudents: 231
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
      totalLessons: 35,
      tutor: "Dr. Michael Brown",
      totalStudents: 415
    },
    { 
      id: 6, 
      title: "Advanced Mathematics: Real Analysis", 
      subject: "Mathematics",
      subjectId: 1,
      description: "Deep dive into real analysis, limits, and infinite series",
      price: 89.99,
      duration: "22 hours",
      level: "Advanced",
      topics: ["Limits and Continuity", "Series and Sequences", "Metric Spaces"],
      bestSeller: false,
      thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
      totalLessons: 28,
      tutor: "Dr. Sarah Johnson",
      totalStudents: 105
    },
    { 
      id: 7, 
      title: "Beginner's Guide to Chemistry", 
      subject: "Chemistry",
      subjectId: 3,
      description: "Fundamental chemistry concepts explained simply for beginners",
      price: 49.99,
      duration: "12 hours",
      level: "Beginner",
      topics: ["Matter and Elements", "Chemical Bonds", "Basic Reactions"],
      bestSeller: false,
      thumbnail: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
      totalLessons: 15,
      tutor: "Mrs. Amanda Wilson",
      totalStudents: 267
    },
    { 
      id: 8, 
      title: "Shakespeare Comprehensive Study", 
      subject: "English Literature",
      subjectId: 4,
      description: "Detailed analysis of Shakespeare's major works and their historical context",
      price: 69.99,
      duration: "18 hours",
      level: "Intermediate to Advanced",
      topics: ["Tragedies", "Comedies", "Historical Plays", "Sonnets"],
      bestSeller: false,
      thumbnail: "https://images.unsplash.com/photo-1506880135364-e28660dc35fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
      totalLessons: 22,
      tutor: "Mr. David Taylor",
      totalStudents: 183
    }
  ];

  const mockSubjects = [
    { id: 1, name: "Mathematics" },
    { id: 2, name: "Physics" },
    { id: 3, name: "Chemistry" },
    { id: 4, name: "English Literature" },
    { id: 5, name: "Computer Science" }
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
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Recording Bundles
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Access high-quality recorded lessons and study at your own pace with our comprehensive subject bundles.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  placeholder="Search recording bundles..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg 
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select
                id="subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.name}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <select
                id="level"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {filteredBundles.length} results found
            </div>
            
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-2">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border-0 focus:ring-0"
              >
                <option value="popularity">Popularity</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="duration">Duration</option>
              </select>
            </div>
          </div>
        </div>

        {/* Recording Bundles Grid */}
        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : sortedBundles.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {sortedBundles.map((bundle) => (
              <motion.div 
                key={bundle.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                variants={itemVariants}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={bundle.thumbnail} 
                    alt={bundle.title} 
                    className="w-full h-full object-cover"
                  />
                  {bundle.bestSeller && (
                    <div className="absolute top-0 right-0 bg-yellow-400 text-white px-3 py-1 text-xs font-bold">
                      BESTSELLER
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{bundle.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{bundle.description}</p>
                  
                  <div className="flex items-center mb-4">
                    <span className="text-sm text-indigo-600 font-medium">{bundle.subject}</span>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="text-sm text-gray-600">{bundle.level}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {bundle.topics.slice(0, 3).map((topic, index) => (
                      <span key={index} className="bg-indigo-100 px-2 py-1 rounded-full text-indigo-700 text-xs">
                        {topic}
                      </span>
                    ))}
                    {bundle.topics.length > 3 && (
                      <span className="bg-gray-100 px-2 py-1 rounded-full text-gray-700 text-xs">
                        +{bundle.topics.length - 3} more
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm border-t border-gray-100 pt-4">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-indigo-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{bundle.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-indigo-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span>{bundle.totalLessons} Lessons</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-indigo-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{bundle.tutor}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-indigo-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>{bundle.totalStudents} Students</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                    <div className="text-2xl font-bold text-gray-900">${bundle.price}</div>
                    <Link 
                      to={`/explore/subjects/${bundle.subjectId}`}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No recording bundles found</h3>
            <p className="mt-1 text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        )}

        {/* Subscription CTA */}
        <div className="mt-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-xl overflow-hidden">
          <div className="px-6 py-12 sm:p-12 lg:flex lg:items-center lg:justify-between">
            <div className="lg:w-0 lg:flex-1">
              <h2 className="text-2xl font-extrabold text-white sm:text-3xl sm:tracking-tight">
                Get unlimited access to all recordings
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-indigo-100">
                Subscribe to our Premium plan and get access to all recording bundles across all subjects.
              </p>
              <div className="mt-4 flex items-center">
                <span className="text-white text-4xl font-bold">$29.99</span>
                <span className="ml-2 text-indigo-200">/month</span>
              </div>
              <p className="mt-1 text-sm text-indigo-200">Cancel anytime. No commitment required.</p>
            </div>
            <div className="mt-8 lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <Link
                  to="/auth/register"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
                >
                  Start Free Trial
                </Link>
              </div>
              <div className="mt-3 inline-flex rounded-md shadow lg:mt-0 lg:ml-3">
                <Link
                  to="/explore/subjects"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-700 hover:bg-indigo-800"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
