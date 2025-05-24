import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navigation = () => {
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <motion.div
              className="flex-shrink-0 flex items-center"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                EduLearn Hub
              </span>
            </motion.div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a href="#featured-courses" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                Courses
              </a>
              <a href="#our-tutors" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                Tutors
              </a>
              <a href="#exams-section" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                Exams
              </a>
              <div className="relative group">
                <button className="text-indigo-600 border-indigo-600 border-b-2 px-3 py-2 text-sm font-medium flex items-center">
                  Explore
                  <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <Link to="/explore" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">All Explore</Link>
                    <Link to="/explore/subjects" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">Subjects</Link>
                    <Link to="/explore/tutors" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">Tutors</Link>
                    <Link to="/explore/recordings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">Recordings</Link>
                    <Link to="/explore/exams" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">Exams</Link>
                    <Link to="/explore/timetable" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">Timetable</Link>
                    <Link to="/explore/faq" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">FAQ</Link>
                    <Link to="/explore/about" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">About</Link>
                  </div>
                </div>
              </div>
              <a href="#timetable" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                Schedule
              </a>
              <a href="#about-us" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                About
              </a>
            </div>
          </div>
          <div className="flex items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/auth/login')}
              className="px-4 py-2 text-sm text-white font-medium bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700"
            >
              Sign In
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
