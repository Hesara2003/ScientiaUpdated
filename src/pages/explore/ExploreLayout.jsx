import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ExploreLayout() {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <motion.div
                className="flex-shrink-0 flex items-center"
                whileHover={{ scale: 1.05 }}
              >
                <Link to="/explore" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  EduLearn Hub
                </Link>
              </motion.div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link 
                  to="/explore/subjects" 
                  className={`${location.pathname.includes('/subjects') ? 'text-indigo-600 border-indigo-600 border-b-2' : 'text-gray-700 hover:text-indigo-600'} px-3 py-2 text-sm font-medium`}
                >
                  Subjects
                </Link>
                <Link 
                  to="/explore/tutors" 
                  className={`${location.pathname.includes('/tutors') ? 'text-indigo-600 border-indigo-600 border-b-2' : 'text-gray-700 hover:text-indigo-600'} px-3 py-2 text-sm font-medium`}
                >
                  Tutors
                </Link>
                <Link 
                  to="/explore/timetable" 
                  className={`${location.pathname.includes('/timetable') ? 'text-indigo-600 border-indigo-600 border-b-2' : 'text-gray-700 hover:text-indigo-600'} px-3 py-2 text-sm font-medium`}
                >
                  Timetable
                </Link>
                <Link 
                  to="/explore/recordings" 
                  className={`${location.pathname.includes('/recordings') ? 'text-indigo-600 border-indigo-600 border-b-2' : 'text-gray-700 hover:text-indigo-600'} px-3 py-2 text-sm font-medium`}
                >
                  Recordings
                </Link>                <Link 
                  to="/explore/faqs" 
                  className={`${location.pathname.includes('/faqs') ? 'text-indigo-600 border-indigo-600 border-b-2' : 'text-gray-700 hover:text-indigo-600'} px-3 py-2 text-sm font-medium`}
                >
                  FAQs
                </Link>
                <Link 
                  to="/explore/about" 
                  className={`${location.pathname.includes('/about') ? 'text-indigo-600 border-indigo-600 border-b-2' : 'text-gray-700 hover:text-indigo-600'} px-3 py-2 text-sm font-medium`}
                >
                  About Us
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/auth/login'}
                className="px-4 py-2 text-sm text-indigo-600 font-medium border border-indigo-600 rounded-lg hover:bg-indigo-50"
              >
                Sign In
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/auth/register'}
                className="px-4 py-2 text-sm text-white font-medium bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700"
              >
                Register
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">EduLearn Hub</h3>
              <p className="text-gray-400 text-sm">
                Empowering students to achieve academic excellence through innovative learning solutions.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/explore/subjects" className="hover:text-white">Subjects</Link></li>
                <li><Link to="/explore/tutors" className="hover:text-white">Tutors</Link></li>
                <li><Link to="/explore/timetable" className="hover:text-white">Timetable</Link></li>
                <li><Link to="/explore/recordings" className="hover:text-white">Recordings</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center">
                  <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  info@scientia.com
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +1 (123) 456-7890
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  <motion.svg 
                    className="h-6 w-6" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </motion.svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  <motion.svg 
                    className="h-6 w-6" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-2.239v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </motion.svg>
                </a>
              </div>
              <div className="mt-4">
                <motion.a 
                  href="#" 
                  className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-300"
                  whileHover={{ x: 5 }}
                >
                  <span>Join our newsletter</span>
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </motion.a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-400">© 2025 EduLearn Hub. All rights reserved.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <motion.a 
                  href="#" 
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-300"
                  whileHover={{ y: -2 }}
                >
                  Privacy Policy
                </motion.a>
                <motion.a 
                  href="#" 
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-300"
                  whileHover={{ y: -2 }}
                >
                  Terms of Service
                </motion.a>
                <motion.a 
                  href="#" 
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-300"
                  whileHover={{ y: -2 }}
                >
                  Contact Us
                </motion.a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
