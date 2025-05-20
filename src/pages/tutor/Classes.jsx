import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllClasses, getClassesByTutorId } from '../../services/classService';

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        // In a real app, you would get the tutor ID from auth context
        // For now, we'll use a mock tutor ID
        const tutorId = 1; // Example tutor ID
        const data = await getClassesByTutorId(tutorId);
        
        // If no classes are returned, use mock data
        if (data && data.length > 0) {
          setClasses(data);
        } else {
          // Mock data for display purposes
          setClasses([
            {
              id: 1,
              name: 'Advanced Mathematics',
              subject: 'Mathematics',
              grade: '11th Grade',
              schedule: 'Monday, Wednesday, Friday - 09:00-10:30',
              room: 'Room 101',
              students: 24,
              status: 'active',
              progress: 65,
              lastClass: '2025-05-14'
            },
            {
              id: 2,
              name: 'Physics Fundamentals',
              subject: 'Physics',
              grade: '10th Grade',
              schedule: 'Tuesday, Thursday - 11:00-12:30',
              room: 'Lab 3',
              students: 18,
              status: 'active',
              progress: 42,
              lastClass: '2025-05-15'
            },
            {
              id: 3,
              name: 'Chemistry Lab',
              subject: 'Chemistry',
              grade: '11th Grade',
              schedule: 'Monday, Wednesday - 14:00-15:30',
              room: 'Chemistry Lab 2',
              students: 16,
              status: 'active',
              progress: 78,
              lastClass: '2025-05-15'
            },
            {
              id: 4,
              name: 'Biology Advanced',
              subject: 'Biology',
              grade: '12th Grade',
              schedule: 'Friday - 13:00-15:00',
              room: 'Biology Lab',
              students: 15,
              status: 'upcoming',
              progress: 0,
              lastClass: null
            },
            {
              id: 5,
              name: 'Organic Chemistry',
              subject: 'Chemistry',
              grade: '12th Grade',
              schedule: 'Monday, Wednesday - 16:00-17:30',
              room: 'Chemistry Lab 1',
              students: 12,
              status: 'completed',
              progress: 100,
              lastClass: '2025-04-30'
            }
          ]);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };
    
    setTimeout(fetchClasses, 800);
  }, []);

  // Filter classes based on active tab and search term
  const filteredClasses = classes.filter(cls => {
    const matchesTab = activeTab === 'all' || cls.status === activeTab;
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          cls.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          cls.grade.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

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

  return (
    <div className="px-4 py-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">My Classes</h1>
        <p className="text-gray-600">Manage and view all your assigned classes</p>
      </header>

      {/* Filter and search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="flex space-x-2">
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'all' 
              ? 'bg-cyan-600 text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            All Classes
          </button>
          <button 
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'active' 
              ? 'bg-cyan-600 text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            Active
          </button>
          <button 
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'upcoming' 
              ? 'bg-cyan-600 text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            Upcoming
          </button>
          <button 
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'completed' 
              ? 'bg-cyan-600 text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            Completed
          </button>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search classes..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="flex justify-between">
                <div className="w-1/3">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
                <div className="w-1/4">
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {filteredClasses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No classes found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            filteredClasses.map(cls => (
              <motion.div 
                key={cls.id} 
                variants={itemVariants}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">{cls.name}</h3>
                        <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                          cls.status === 'active' ? 'bg-green-100 text-green-800' :
                          cls.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {cls.status.charAt(0).toUpperCase() + cls.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">{cls.subject} | {cls.grade}</p>
                      <p className="text-sm text-gray-500 mb-1">{cls.schedule}</p>
                      <p className="text-sm text-gray-500">{cls.room} | {cls.students} students</p>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex flex-col items-end">
                      {cls.status === 'active' && (
                        <button className="mb-3 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors">
                          Start Class
                        </button>
                      )}
                      {cls.status === 'upcoming' && (
                        <button className="mb-3 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                          Prepare Class
                        </button>
                      )}
                      {cls.status === 'completed' && (
                        <button className="mb-3 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                          View Summary
                        </button>
                      )}
                      
                      {cls.status !== 'upcoming' && (
                        <div className="w-48">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Course Progress</span>
                            <span>{cls.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${cls.progress >= 75 ? 'bg-green-500' : cls.progress >= 40 ? 'bg-cyan-500' : 'bg-amber-500'}`} 
                              style={{ width: `${cls.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                    <div className="flex space-x-2">
                      <button className="text-gray-600 hover:text-cyan-600 text-sm flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                        </svg>
                        Students
                      </button>
                      <button className="text-gray-600 hover:text-cyan-600 text-sm flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                        Assignments
                      </button>
                      <button className="text-gray-600 hover:text-cyan-600 text-sm flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                        Reports
                      </button>
                    </div>
                    <div>
                      {cls.lastClass && (
                        <span className="text-xs text-gray-500">
                          Last class: {new Date(cls.lastClass).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      )}
    </div>
  );
}
