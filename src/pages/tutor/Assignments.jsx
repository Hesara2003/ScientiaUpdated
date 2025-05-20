import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate'); // dueDate, class, submissions

  // Mock data
  useEffect(() => {
    setTimeout(() => {
      setAssignments([
        {
          id: 1,
          title: 'Calculus Problem Set',
          description: 'Complete problems 1-20 from Chapter 5 on Derivatives.',
          class: 'Advanced Mathematics',
          dueDate: '2025-05-20',
          dateAssigned: '2025-05-13',
          submissions: 5,
          totalStudents: 24,
          status: 'active'
        },
        {
          id: 2,
          title: 'Physics Lab Report',
          description: 'Write a lab report on the pendulum experiment conducted in class.',
          class: 'Physics Fundamentals',
          dueDate: '2025-05-22',
          dateAssigned: '2025-05-15',
          submissions: 0,
          totalStudents: 18,
          status: 'active'
        },
        {
          id: 3,
          title: 'Periodic Table Quiz',
          description: 'Online quiz covering the periodic table of elements.',
          class: 'Chemistry Lab',
          dueDate: '2025-05-19',
          dateAssigned: '2025-05-12',
          submissions: 8,
          totalStudents: 16,
          status: 'active'
        },
        {
          id: 4,
          title: 'Linear Equations Homework',
          description: 'Solve the systems of linear equations from the textbook.',
          class: 'Advanced Mathematics',
          dueDate: '2025-05-10',
          dateAssigned: '2025-05-03',
          submissions: 22,
          totalStudents: 24,
          status: 'past'
        },
        {
          id: 5,
          title: 'Newton\'s Laws Quiz',
          description: 'Quiz covering Newton\'s three laws of motion.',
          class: 'Physics Fundamentals',
          dueDate: '2025-05-08',
          dateAssigned: '2025-05-01',
          submissions: 17,
          totalStudents: 18,
          status: 'past'
        },
        {
          id: 6,
          title: 'Chemical Reactions Lab',
          description: 'Lab report on chemical reactions observed in class.',
          class: 'Chemistry Lab',
          dueDate: '2025-05-05',
          dateAssigned: '2025-04-28',
          submissions: 15,
          totalStudents: 16,
          status: 'past'
        },
        {
          id: 7,
          title: 'Organic Chemistry Introduction',
          description: 'Reading assignment and summary questions.',
          class: 'Chemistry Lab',
          dueDate: '2025-05-26',
          dateAssigned: '2025-05-14',
          submissions: 0,
          totalStudents: 16,
          status: 'draft'
        },
        {
          id: 8,
          title: 'Trigonometry Project',
          description: 'Group project on real-world applications of trigonometry.',
          class: 'Advanced Mathematics',
          dueDate: '2025-06-03',
          dateAssigned: '2025-05-16',
          submissions: 0,
          totalStudents: 24,
          status: 'draft'
        }
      ]);
      setLoading(false);
    }, 800);
  }, []);

  // Filter assignments
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          assignment.class.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Sort assignments
  const sortedAssignments = [...filteredAssignments].sort((a, b) => {
    if (sortBy === 'dueDate') {
      return new Date(a.dueDate) - new Date(b.dueDate);
    } else if (sortBy === 'class') {
      return a.class.localeCompare(b.class);
    } else if (sortBy === 'submissions') {
      // Sort by submission percentage
      const aPercentage = (a.submissions / a.totalStudents) * 100;
      const bPercentage = (b.submissions / b.totalStudents) * 100;
      return bPercentage - aPercentage;
    }
    return 0;
  });

  // Format date display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate days remaining/overdue
  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `${diffDays} days remaining`;
    }
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

  return (
    <div className="px-4 py-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Assignments</h1>
        <p className="text-gray-600">Create, manage, and grade assignments for your classes</p>
      </header>

      {/* Filter and search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0">
          <button 
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${filterStatus === 'all' 
              ? 'bg-cyan-600 text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            All Assignments
          </button>
          <button 
            onClick={() => setFilterStatus('active')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${filterStatus === 'active' 
              ? 'bg-green-600 text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            Active
          </button>
          <button 
            onClick={() => setFilterStatus('past')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${filterStatus === 'past' 
              ? 'bg-amber-600 text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            Past
          </button>
          <button 
            onClick={() => setFilterStatus('draft')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${filterStatus === 'draft' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            Drafts
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search assignments..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>

      {/* Sort options */}
      <div className="flex items-center mb-4 bg-gray-50 p-3 rounded-lg">
        <span className="text-sm text-gray-600 mr-2">Sort by:</span>
        <div className="flex space-x-2">
          <button
            onClick={() => setSortBy('dueDate')}
            className={`px-3 py-1 text-sm rounded ${
              sortBy === 'dueDate'
                ? 'bg-cyan-100 text-cyan-800 font-medium'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Due Date
          </button>
          <button
            onClick={() => setSortBy('class')}
            className={`px-3 py-1 text-sm rounded ${
              sortBy === 'class'
                ? 'bg-cyan-100 text-cyan-800 font-medium'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Class
          </button>
          <button
            onClick={() => setSortBy('submissions')}
            className={`px-3 py-1 text-sm rounded ${
              sortBy === 'submissions'
                ? 'bg-cyan-100 text-cyan-800 font-medium'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Submission Status
          </button>
        </div>
      </div>

      {/* Create assignment button */}
      <div className="mb-6 flex justify-end">
        <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Create Assignment
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
              <div className="h-2 bg-gray-200 rounded-full w-full mt-6"></div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {sortedAssignments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No assignments found</h3>
              <p className="text-gray-500">Try adjusting your filters or create a new assignment</p>
            </div>
          ) : (
            sortedAssignments.map(assignment => (
              <motion.div 
                key={assignment.id}
                variants={itemVariants}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">{assignment.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          assignment.status === 'active' ? 'bg-green-100 text-green-800' :
                          assignment.status === 'past' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {assignment.status === 'active' ? 'Active' :
                           assignment.status === 'past' ? 'Past' : 'Draft'}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{assignment.description}</p>
                      
                      <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm">
                        <span className="text-gray-700 flex items-center">
                          <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path>
                          </svg>
                          {assignment.class}
                        </span>
                        
                        <span className="text-gray-700 flex items-center">
                          <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                          Assigned: {formatDate(assignment.dateAssigned)}
                        </span>
                        
                        <span className={`flex items-center ${
                          new Date(assignment.dueDate) < new Date() ? 'text-red-600' : 'text-gray-700'
                        }`}>
                          <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          Due: {formatDate(assignment.dueDate)}
                          {assignment.status !== 'draft' && (
                            <span className={`ml-2 text-xs ${
                              new Date(assignment.dueDate) < new Date() ? 'text-red-600' : 'text-blue-600'
                            }`}>
                              ({getDaysRemaining(assignment.dueDate)})
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-center">
                      {assignment.status !== 'draft' && (
                        <div className="w-32 text-center mb-3">
                          <div className="text-2xl font-bold text-gray-800">
                            {assignment.submissions}/{assignment.totalStudents}
                          </div>
                          <div className="text-xs text-gray-500">Submissions</div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div 
                              className={`h-2 rounded-full ${
                                (assignment.submissions / assignment.totalStudents) >= 0.9 ? 'bg-green-500' :
                                (assignment.submissions / assignment.totalStudents) >= 0.6 ? 'bg-cyan-500' :
                                (assignment.submissions / assignment.totalStudents) >= 0.3 ? 'bg-amber-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${(assignment.submissions / assignment.totalStudents) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      {assignment.status === 'active' && (
                        <button className="w-full px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
                          Grade Submissions
                        </button>
                      )}
                      
                      {assignment.status === 'past' && (
                        <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                          View Results
                        </button>
                      )}
                      
                      {assignment.status === 'draft' && (
                        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          Edit Draft
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2 justify-between">
                    <div className="flex flex-wrap gap-2">
                      <button className="text-gray-600 hover:text-cyan-600 text-sm flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        Edit
                      </button>
                      <button className="text-gray-600 hover:text-cyan-600 text-sm flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                        Duplicate
                      </button>
                      <button className="text-gray-600 hover:text-red-600 text-sm flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                        Delete
                      </button>
                    </div>
                    <button className="text-gray-600 hover:text-cyan-600 text-sm flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      View Details
                    </button>
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
