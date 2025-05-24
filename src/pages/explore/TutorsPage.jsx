import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAllTutors } from '../../services/tutorService';
import { getAllSubjects } from '../../services/subjectService';

export default function TutorsPage() {
  const [tutors, setTutors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tutorsData, subjectsData] = await Promise.all([
          getAllTutors(),
          getAllSubjects()
        ]);
        
        setTutors(tutorsData || mockTutors);
        setSubjects(subjectsData || mockSubjects);
      } catch (error) {
        console.error("Error fetching data:", error);
        setTutors(mockTutors);
        setSubjects(mockSubjects);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter tutors based on search and subject filter
  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = (tutor.name && tutor.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
                         (tutor.bio && tutor.bio.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (selectedSubject === 'all') return matchesSearch;
    return matchesSearch && tutor.subject === selectedSubject;
  });

  // Mock data in case API fails
  const mockTutors = [
    { id: 1, name: "Dr. Sarah Johnson", subject: "Mathematics", rating: 4.9, image: "https://randomuser.me/api/portraits/women/44.jpg", bio: "PhD in Applied Mathematics with 10+ years of teaching experience" },
    { id: 2, name: "Prof. James Wilson", subject: "Physics", rating: 4.7, image: "https://randomuser.me/api/portraits/men/32.jpg", bio: "Former NASA researcher specializing in quantum mechanics" },
    { id: 3, name: "Ms. Emily Chen", subject: "Chemistry", rating: 4.8, image: "https://randomuser.me/api/portraits/women/66.jpg", bio: "Certified teacher with innovative lab-based teaching methods" },
    { id: 4, name: "Mr. David Taylor", subject: "English Literature", rating: 4.6, image: "https://randomuser.me/api/portraits/men/68.jpg", bio: "Published author with a passion for classic and modern literature" },
    { id: 5, name: "Dr. Michael Brown", subject: "Computer Science", rating: 4.9, image: "https://randomuser.me/api/portraits/men/22.jpg", bio: "Software engineer and educator with expertise in AI and machine learning" },
    { id: 6, name: "Ms. Jennifer Lee", subject: "Mathematics", rating: 4.7, image: "https://randomuser.me/api/portraits/women/33.jpg", bio: "Specializes in making complex mathematical concepts accessible to all students" },
    { id: 7, name: "Dr. Robert Chen", subject: "Physics", rating: 4.8, image: "https://randomuser.me/api/portraits/men/45.jpg", bio: "Theoretical physicist with a talent for explaining difficult concepts" },
    { id: 8, name: "Mrs. Amanda Wilson", subject: "Chemistry", rating: 4.5, image: "https://randomuser.me/api/portraits/women/23.jpg", bio: "Chemistry educator focused on practical applications and lab techniques" }
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
            Meet Our Expert Tutors
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Learn from experienced educators passionate about helping students succeed.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Search tutors..."
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
            
            <div className="flex flex-wrap gap-2">
              <button 
                className={`px-4 py-2 rounded-md text-sm font-medium ${selectedSubject === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setSelectedSubject('all')}
              >
                All Subjects
              </button>
              
              {subjects.map((subject) => (
                <button 
                  key={subject.id}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${selectedSubject === subject.name ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                  onClick={() => setSelectedSubject(subject.name)}
                >
                  {subject.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tutors Grid */}
        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredTutors.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredTutors.map((tutor) => (
              <motion.div 
                key={tutor.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                variants={itemVariants}
              >                <div className="h-48 overflow-hidden">
                  <img 
                    src={tutor.image || (() => {
                      const id = tutor.id || Math.floor(Math.random() * 99) + 1;
                      const validId = typeof id === 'number' ? id : parseInt(id) || 1;
                      return `https://randomuser.me/api/portraits/${validId % 2 === 0 ? 'men' : 'women'}/${(validId * 10) + 10}.jpg`;
                    })()} 
                    alt={tutor.name} 
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      const id = tutor.id || Math.floor(Math.random() * 99) + 1;
                      const validId = typeof id === 'number' ? id : parseInt(id) || 1;
                      e.target.src = `https://randomuser.me/api/portraits/${validId % 2 === 0 ? 'men' : 'women'}/${(validId * 10) + 10}.jpg`;
                    }}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{tutor.name}</h3>
                  <div className="flex items-center mb-3">
                    <span className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2.5 py-0.5 rounded">
                      {tutor.subject}
                    </span>
                    <div className="flex items-center ml-4">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`h-4 w-4 ${i < Math.floor(tutor.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-gray-500 text-sm ml-2">{tutor.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-6 line-clamp-3">{tutor.bio || "Experienced educator passionate about student success."}</p>
                  
                  <div className="flex justify-between items-center">
                    <Link
                      to="/auth/register"
                      className="text-indigo-600 hover:text-indigo-800 font-medium text-sm inline-flex items-center"
                    >
                      View Profile
                      <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </Link>
                    <button
                      onClick={() => window.location.href = '/auth/register'}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md"
                    >
                      Book Session
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No tutors found</h3>
            <p className="mt-1 text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
          </div>
        )}

        {/* Become a Tutor CTA */}
        <div className="mt-16 bg-indigo-700 rounded-lg shadow-xl overflow-hidden">
          <div className="px-6 py-12 sm:px-12 lg:flex lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-white sm:text-3xl sm:tracking-tight">
                Are you passionate about teaching?
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-indigo-200">
                Join our team of expert tutors and help students achieve their academic goals.
              </p>
            </div>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <a
                  href="/auth/register"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
                >
                  Apply to Teach
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
