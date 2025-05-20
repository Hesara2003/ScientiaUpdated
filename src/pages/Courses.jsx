import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import ClassFormModal from '../components/classes/ClassFormModal';
import Layout from '../components/Layout';
import { getAllClasses, createClass, updateClass, deleteClass } from '../services/classService';

const Courses = () => {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'className', direction: 'asc' });
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [viewType, setViewType] = useState('grid'); 
  const [showModal, setShowModal] = useState(false);
  const [currentClass, setCurrentClass] = useState(null);
  const [useMockData, setUseMockData] = useState(false);

  const classImages = [
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1610563166150-b34df4f3bcd6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1603484477859-abe6a73f9366?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1621442371774-821775c71aae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
  ];

  // Subject categories
  const categories = [
    { id: 'mathematics', name: 'Mathematics' },
    { id: 'science', name: 'Science' },
    { id: 'english', name: 'English' },
    { id: 'social-studies', name: 'Social Studies' },
    { id: 'computer', name: 'Computer Science' },
    { id: 'languages', name: 'Languages' },
  ];

  const mockClasses = [
    { 
      classId: 'm1', 
      className: 'Advanced Mathematics',
      subject: 'mathematics',
      teacher: 'Dr. Alan Turing',
      enrolledStudents: 28,
      maxStudents: 30,
      status: 'active',
      startDate: '2025-01-15',
      endDate: '2025-06-30',
      schedule: 'Mon, Wed, Fri 10:00 AM - 11:30 AM',
      location: 'Room 101',
      description: 'Advanced topics in mathematics including calculus, linear algebra, and statistics',
      image: classImages[0]
    },
    { 
      classId: 'm2', 
      className: 'Physics I',
      subject: 'science',
      teacher: 'Dr. Marie Curie',
      enrolledStudents: 32,
      maxStudents: 35,
      status: 'active',
      startDate: '2025-01-15',
      endDate: '2025-06-30',
      schedule: 'Tue, Thu 9:00 AM - 11:00 AM',
      location: 'Physics Lab',
      description: 'Introduction to classical mechanics, thermodynamics, and wave phenomena',
      image: classImages[1]
    },
    { 
      classId: 'm3', 
      className: 'World Literature',
      subject: 'english',
      teacher: 'Prof. Jane Austen',
      enrolledStudents: 25,
      maxStudents: 30,
      status: 'active',
      startDate: '2025-01-15',
      endDate: '2025-06-30',
      schedule: 'Mon, Wed 1:00 PM - 2:30 PM',
      location: 'Humanities Building, Room 203',
      description: 'Survey of world literature from ancient to modern times',
      image: classImages[2]
    },
    { 
      classId: 'm4', 
      className: 'Introduction to Programming',
      subject: 'computer',
      teacher: 'Prof. Ada Lovelace',
      enrolledStudents: 40,
      maxStudents: 40,
      status: 'active',
      startDate: '2025-01-15',
      endDate: '2025-06-30',
      schedule: 'Tue, Thu 2:00 PM - 3:30 PM',
      location: 'Computer Lab',
      description: 'Fundamental concepts of programming using Python',
      image: classImages[3]
    },
    { 
      classId: 'm5', 
      className: 'World History: Ancient Civilizations',
      subject: 'social-studies',
      teacher: 'Dr. Howard Carter',
      enrolledStudents: 0,
      maxStudents: 35,
      status: 'upcoming',
      startDate: '2025-07-10',
      endDate: '2025-12-20',
      schedule: 'Mon, Wed, Fri 9:00 AM - 10:00 AM',
      location: 'Room 305',
      description: 'Survey of ancient civilizations and their contributions to human development',
      image: classImages[4]
    },
    { 
      classId: 'm6', 
      className: 'Spanish I',
      subject: 'languages',
      teacher: 'Prof. Miguel Cervantes',
      enrolledStudents: 22,
      maxStudents: 25,
      status: 'active',
      startDate: '2025-01-15',
      endDate: '2025-06-30',
      schedule: 'Tue, Thu 11:00 AM - 12:30 PM',
      location: 'Language Lab',
      description: 'Introduction to Spanish language and culture',
      image: classImages[5]
    }
  ];

  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      const data = await getAllClasses();
      
      if (!data || data.length === 0) {
        setClasses(mockClasses);
        setUseMockData(true);
      } else {
        const classesWithImages = data.map((cls, index) => ({
          ...cls,
          image: classImages[index % classImages.length]
        }));
        setClasses(classesWithImages);
        setUseMockData(false);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('Failed to fetch classes. Showing mock data for visualization.');
      setClasses(mockClasses);
      setUseMockData(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleCreateClass = async (classData) => {
    try {
      setIsLoading(true);
      const newClass = await createClass(classData);
      
      const classWithImage = {
        ...newClass,
        image: classImages[Math.floor(Math.random() * classImages.length)]
      };
      
      setClasses([...classes, classWithImage]);
      setShowModal(false);
      toast.success('Class created successfully!');
    } catch (err) {
      console.error('Error creating class:', err);
      toast.error('Failed to create class. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateClass = async (classData) => {
    try {
      setIsLoading(true);
      const updatedClass = await updateClass(classData.classId, classData);
      
      const updatedWithImage = {
        ...updatedClass,
        image: classes.find(c => c.classId === updatedClass.classId)?.image || 
               classImages[Math.floor(Math.random() * classImages.length)]
      };
      
      setClasses(classes.map(cls => 
        cls.classId === updatedClass.classId ? updatedWithImage : cls
      ));
      
      setShowModal(false);
      toast.success('Class updated successfully!');
    } catch (err) {
      console.error('Error updating class:', err);
      toast.error('Failed to update class. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClass = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        setIsLoading(true);
        await deleteClass(id);
        setClasses(classes.filter(cls => cls.classId !== id));
        toast.success('Class deleted successfully!');
      } catch (err) {
        console.error('Error deleting class:', err);
        toast.error('Failed to delete class. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = (classData) => {
    if (currentClass) {
      handleUpdateClass(classData);
    } else {
      handleCreateClass(classData);
    }
  };

  const openModal = (classData = null) => {
    setCurrentClass(classData);
    setShowModal(true);
  };

  const closeModal = () => {
    setCurrentClass(null);
    setShowModal(false);
  };

  const getFilteredClasses = () => {
    return classes
      .filter(cls => {
        const matchesSearch = 
          cls.className.toLowerCase().includes(searchTerm.toLowerCase()) || 
          cls.teacher.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = filterCategory === 'all' || cls.subject === filterCategory;
        
        const matchesStatus = filterStatus === 'all' || cls.status === filterStatus;
        
        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">Active</span>;
      case 'upcoming':
        return <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Upcoming</span>;
      case 'completed':
        return <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Completed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">Cancelled</span>;
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const getCategoryColor = (categoryId) => {
    const colorMap = {
      'mathematics': 'bg-indigo-100 text-indigo-800',
      'science': 'bg-green-100 text-green-800',
      'english': 'bg-yellow-100 text-yellow-800',
      'social-studies': 'bg-red-100 text-red-800',
      'computer': 'bg-blue-100 text-blue-800',
      'languages': 'bg-purple-100 text-purple-800',
    };
    return colorMap[categoryId] || 'bg-gray-100 text-gray-800';
  };

  const getSummaryStats = () => {
    const activeCount = classes.filter(cls => cls.status === 'active').length;
    const upcomingCount = classes.filter(cls => cls.status === 'upcoming').length;
    const completedCount = classes.filter(cls => cls.status === 'completed').length;
    
    const totalStudents = classes.reduce((sum, cls) => sum + (cls.enrolledStudents || 0), 0);
    const totalCapacity = classes.reduce((sum, cls) => sum + (cls.maxStudents || 0), 0);
    
    const categoryDistribution = categories.map(category => ({
      ...category,
      count: classes.filter(cls => cls.subject === category.id).length
    }));

    return {
      activeCount,
      upcomingCount,
      completedCount,
      totalStudents,
      totalCapacity,
      categoryDistribution
    };
  };

  const toggleSelectClass = (classId) => {
    if (selectedClasses.includes(classId)) {
      setSelectedClasses(selectedClasses.filter(id => id !== classId));
    } else {
      setSelectedClasses([...selectedClasses, classId]);
    }
  };

  const selectAllClasses = () => {
    if (selectedClasses.length === filteredClasses.length) {
      setSelectedClasses([]);
    } else {
      setSelectedClasses(filteredClasses.map(cls => cls.classId));
    }
  };

  const stats = getSummaryStats();
  const filteredClasses = getFilteredClasses();

  if (isLoading && classes.length === 0) {
    return (

        <div className="py-8 px-4 flex justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
            <p className="text-gray-500">Loading course data...</p>
          </div>
        </div>

    );
  }

  return (

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-6 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <svg className="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
              Course Management
            </h1>
            <p className="mt-1 text-lg text-gray-600">Browse and manage all courses, instructors, and schedules.</p>
          </div>

          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <motion.div 
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Total Courses</p>
                    <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <span>{stats.activeCount} active, {stats.upcomingCount} upcoming</span>
                </div>
              </motion.div>

              <motion.div 
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <span>Enrolled across all courses</span>
                </div>
              </motion.div>

              <motion.div 
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Total Capacity</p>
                    <p className="text-2xl font-bold text-indigo-600">{stats.totalCapacity}</p>
                  </div>
                  <div className="bg-indigo-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <span>Across {classes.length} courses</span>
                </div>
              </motion.div>

              <motion.div 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-xl shadow-sm text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-blue-100">Quick Actions</p>
                    <p className="text-lg font-bold">Manage Courses</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </div>
                <div className="mt-6">
                  <button 
                    onClick={() => openModal()}
                    className="bg-white/20 hover:bg-white/30 text-white text-sm py-2 px-4 rounded-lg transition-colors w-full"
                  >
                    Create New Course
                  </button>
                </div>
              </motion.div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-xl mb-6 shadow-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                  {useMockData && (
                    <p className="mt-1 text-xs text-red-600">Using mock data for visualization purposes.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="bg-white p-4 rounded-xl mb-6 shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border-gray-300 rounded-md text-sm"
                  placeholder="Search by course name or instructor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col md:flex-row gap-3">
                <div className="inline-flex items-center space-x-2">
                  <label className="text-sm text-gray-500 whitespace-nowrap">Category:</label>
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="inline-flex items-center space-x-2">
                  <label className="text-sm text-gray-500 whitespace-nowrap">Status:</label>
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2 border-l border-gray-200 pl-3">
                  <button 
                    className={`p-2 rounded ${viewType === 'grid' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-blue-600'}`}
                    onClick={() => setViewType('grid')}
                    title="Grid View"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button 
                    className={`p-2 rounded ${viewType === 'list' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-blue-600'}`}
                    onClick={() => setViewType('list')}
                    title="List View"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {viewType === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClasses.length > 0 ? (
                filteredClasses.map((cls) => (
                  <motion.div
                    key={cls.classId}
                    className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 flex flex-col h-full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <div className="relative h-48 bg-gray-200">
                      <img 
                        src={cls.image} 
                        alt={cls.className} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 flex space-x-2">
                        {getStatusBadge(cls.status)}
                      </div>
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-md ${getCategoryColor(cls.subject)}`}>
                          {getCategoryName(cls.subject)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-5 flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{cls.className}</h3>
                          <p className="text-sm text-gray-500 mb-2">ID: {cls.classId}</p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{cls.description}</p>
                      
                      <div className="flex items-center mb-3">
                        <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-sm text-gray-700">{cls.teacher}</span>
                      </div>
                      
                      <div className="flex items-center mb-3">
                        <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="text-sm text-gray-700">{cls.enrolledStudents || 0} / {cls.maxStudents || '∞'} Students</span>
                      </div>
                      
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div className="text-sm text-gray-700">
                          {formatDate(cls.startDate)} - {formatDate(cls.endDate)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">{cls.location || 'No location'}</span>
                        <div className="flex space-x-2">
                          <button 
                            className="p-1 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
                            title="View details"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button 
                            className="p-1 text-indigo-600 hover:text-indigo-800 rounded-full hover:bg-indigo-50"
                            title="Edit"
                            onClick={() => openModal(cls)}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
                            title="Delete"
                            onClick={() => handleDeleteClass(cls.classId)}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center bg-white rounded-xl shadow-sm">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No courses found</h3>
                  <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
                  <div className="mt-6">
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setFilterCategory('all');
                        setFilterStatus('all');
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Clear filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {viewType === 'list' && (
            <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            checked={selectedClasses.length === filteredClasses.length && filteredClasses.length > 0}
                            onChange={selectAllClasses}
                          />
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('className')}>
                        <div className="flex items-center space-x-1">
                          <span>Course</span>
                          {sortConfig.key === 'className' && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sortConfig.direction === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                            </svg>
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('teacher')}>
                        <div className="flex items-center space-x-1">
                          <span>Instructor</span>
                          {sortConfig.key === 'teacher' && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sortConfig.direction === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                            </svg>
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('subject')}>
                        <div className="flex items-center space-x-1">
                          <span>Category</span>
                          {sortConfig.key === 'subject' && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sortConfig.direction === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                            </svg>
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('enrolledStudents')}>
                        <div className="flex items-center space-x-1">
                          <span>Students</span>
                          {sortConfig.key === 'enrolledStudents' && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sortConfig.direction === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                            </svg>
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('status')}>
                        <div className="flex items-center space-x-1">
                          <span>Status</span>
                          {sortConfig.key === 'status' && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sortConfig.direction === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                            </svg>
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredClasses.length > 0 ? (
                      filteredClasses.map((cls) => (
                        <tr key={cls.classId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                checked={selectedClasses.includes(cls.classId)}
                                onChange={() => toggleSelectClass(cls.classId)}
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden">
                                <img 
                                  src={cls.image} 
                                  alt={cls.className}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{cls.className}</div>
                                <div className="text-xs text-gray-500">ID: {cls.classId}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{cls.teacher}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-md ${getCategoryColor(cls.subject)}`}>
                              {getCategoryName(cls.subject)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              {cls.enrolledStudents || 0} / {cls.maxStudents || '∞'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(cls.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-900">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button 
                                className="text-indigo-600 hover:text-indigo-900"
                                onClick={() => openModal(cls)}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button 
                                className="text-red-600 hover:text-red-900"
                                onClick={() => handleDeleteClass(cls.classId)}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <svg className="h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <p className="text-gray-500 text-base">No courses found matching your criteria</p>
                            <button 
                              className="mt-4 text-sm text-blue-600 hover:text-blue-800"
                              onClick={() => {
                                setSearchTerm('');
                                setFilterCategory('all');
                                setFilterStatus('all');
                              }}
                            >
                              Clear filters
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {filteredClasses.length > 0 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredClasses.length}</span> of{' '}
                        <span className="font-medium">{filteredClasses.length}</span> courses
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <a
                          href="#"
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                          </svg>
                        </a>
                        <a
                          href="#"
                          aria-current="page"
                          className="z-10 bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                        >
                          1
                        </a>
                        <a
                          href="#"
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </a>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
        <ClassFormModal
          show={showModal}
          onClose={closeModal}
          onSubmit={handleSubmit}
          classData={currentClass}
        />
      </div>
  );
};

export default Courses;