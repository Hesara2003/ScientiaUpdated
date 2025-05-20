import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  getAllSubjects, 
  getSubjectsWithTutors, 
  filterSubjectsByGrade, 
  searchSubjects 
} from '../../services/subjectService';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get subjects with their tutors in a single call
        const subjectsData = await getSubjectsWithTutors();
        setSubjects(subjectsData || mockSubjects);
      } catch (error) {
        console.error("Error fetching subjects:", error);
        setSubjects(mockSubjects);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  // Filter subjects based on search and category filter
  const filteredSubjects = searchSubjects(
    filterSubjectsByGrade(subjects, selectedFilter === 'all' ? null : selectedFilter),
    searchTerm
  );

  // Mock data in case API fails
  const mockSubjects = [
    { 
      id: 1, 
      name: "Mathematics", 
      description: "Explore the world of numbers and mathematical concepts from algebra to calculus.", 
      icon: "https://img.icons8.com/color/96/000000/mathematics.png",
      popularTopics: ["Calculus", "Algebra", "Trigonometry", "Statistics"],
      totalClasses: 15
    },
    { 
      id: 2, 
      name: "Physics", 
      description: "Understand the fundamental principles that govern the physical world around us.", 
      icon: "https://img.icons8.com/color/96/000000/physics.png",
      popularTopics: ["Mechanics", "Quantum Physics", "Thermodynamics", "Electromagnetism"],
      totalClasses: 12
    },
    { 
      id: 3, 
      name: "Chemistry", 
      description: "Discover the composition, structure, properties, and reactions of matter.", 
      icon: "https://img.icons8.com/color/96/000000/test-tube.png",
      popularTopics: ["Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry", "Biochemistry"],
      totalClasses: 9
    },
    { 
      id: 4, 
      name: "English Literature", 
      description: "Analyze literary works and develop strong writing and critical thinking skills.", 
      icon: "https://img.icons8.com/color/96/000000/literature.png",
      popularTopics: ["Modern Fiction", "Shakespeare", "Poetry Analysis", "Creative Writing"],
      totalClasses: 8
    },
    { 
      id: 5, 
      name: "Computer Science", 
      description: "Learn programming, algorithms, and computational thinking.", 
      icon: "https://img.icons8.com/color/96/000000/source-code.png",
      popularTopics: ["Python Programming", "Data Structures", "Web Development", "Artificial Intelligence"],
      totalClasses: 20
    },
    { 
      id: 6, 
      name: "History", 
      description: "Study past events and their impact on human civilization and society.", 
      icon: "https://img.icons8.com/color/96/000000/historic-ship.png",
      popularTopics: ["Ancient Civilizations", "World Wars", "Modern History", "Cultural History"],
      totalClasses: 7
    },
    { 
      id: 7, 
      name: "Biology", 
      description: "Explore living organisms, their structures, functions, growth, and evolution.", 
      icon: "https://img.icons8.com/color/96/000000/dna-helix.png",
      popularTopics: ["Cell Biology", "Genetics", "Ecology", "Human Anatomy"],
      totalClasses: 10
    },
    { 
      id: 8, 
      name: "Economics", 
      description: "Understand how societies allocate resources and make decisions in markets.", 
      icon: "https://img.icons8.com/color/96/000000/economic-improvement.png",
      popularTopics: ["Microeconomics", "Macroeconomics", "International Trade", "Financial Economics"],
      totalClasses: 8
    }
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
            Explore Our Subjects
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Discover a wide range of subjects taught by expert tutors. Find the perfect learning path for your educational journey.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Search subjects..."
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
            
            <div className="flex space-x-2">
              <button 
                className={`px-4 py-2 rounded-md text-sm font-medium ${selectedFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setSelectedFilter('all')}
              >
                All
              </button>
              <button 
                className={`px-4 py-2 rounded-md text-sm font-medium ${selectedFilter === 'popular' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setSelectedFilter('popular')}
              >
                Popular
              </button>
              <button 
                className={`px-4 py-2 rounded-md text-sm font-medium ${selectedFilter === 'science' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setSelectedFilter('science')}
              >
                Sciences
              </button>
              <button 
                className={`px-4 py-2 rounded-md text-sm font-medium ${selectedFilter === 'math' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setSelectedFilter('math')}
              >
                Mathematics
              </button>
              <button 
                className={`px-4 py-2 rounded-md text-sm font-medium ${selectedFilter === 'humanities' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setSelectedFilter('humanities')}
              >
                Humanities
              </button>
            </div>
          </div>
        </div>

        {/* Subjects Grid */}
        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredSubjects.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredSubjects.map((subject) => (
              <motion.div 
                key={subject.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                variants={itemVariants}
              >
                <Link to={`/explore/subjects/${subject.id}`} className="block h-full">
                  <div className="p-6 flex flex-col h-full">
                    <div className="flex items-center mb-4">
                      <img src={subject.icon} alt={subject.name} className="w-12 h-12 mr-4" />
                      <h3 className="text-xl font-bold text-gray-900">{subject.name}</h3>
                    </div>
                    <p className="text-gray-600 mb-4 flex-grow">{subject.description}</p>
                    <div className="mt-auto">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {subject.popularTopics && subject.popularTopics.map((topic, index) => (
                          <span key={index} className="bg-indigo-100 px-2 py-1 rounded-full text-indigo-700 text-xs">
                            {topic}
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">{subject.totalClasses} Classes Available</span>
                        <span className="text-indigo-600 text-sm font-medium flex items-center">
                          Explore
                          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No subjects found</h3>
            <p className="mt-1 text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
          </div>
        )}
      </div>
    </div>
  );
}
