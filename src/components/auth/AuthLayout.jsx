import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AuthLayout() {
  const navigate = useNavigate();
    const handleGoHome = () => {
    // Clear ALL authentication data when going back to home
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
    localStorage.removeItem('lastRegisteredRole');
    localStorage.removeItem('studentVisited');
    localStorage.removeItem('userData');
    localStorage.removeItem('userId');
    
    // Set a flag to indicate we want to show the landing page
    localStorage.setItem('showLandingPage', 'true');
    
    // Call the navigate after a small delay to ensure any auth state updates
    setTimeout(() => {
      navigate('/');
    }, 10);
  };

  const handleBackToHome = () => {
    // Set flag for App.jsx to know we want the landing page
    localStorage.setItem('showLandingPage', 'true');
    
    // Clear any auth state that might be causing redirect loops
    // Uncomment the next lines if you want to log out when going back to home
    // localStorage.removeItem('token');
    // localStorage.removeItem('userRole');
    // localStorage.removeItem('userData');
    
    // Navigate to root
    navigate('/');
  };
  
  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Return to home link */}
      <button 
        onClick={handleGoHome}
        className="absolute top-4 left-4 flex items-center text-white bg-indigo-600 bg-opacity-90 hover:bg-opacity-100 px-3 py-1.5 rounded-lg z-10 transition-all text-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Home
      </button>
      
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-b-3xl opacity-90 z-0" />
      
      {/* Animated background shapes - reduced size */}
      <motion.div 
        className="absolute top-20 left-10 w-48 h-48 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 z-0"
        animate={{ 
          x: [0, 20, 0], 
          y: [0, 20, 0],
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 20,
          ease: "easeInOut" 
        }}
      />
      
      <motion.div 
        className="absolute bottom-20 right-10 w-56 h-56 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 z-0"
        animate={{ 
          x: [0, -15, 0], 
          y: [0, 15, 0],
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 15,
          ease: "easeInOut" 
        }}
      />
      
      <motion.div 
        className="absolute top-40 right-20 w-40 h-40 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 z-0"
        animate={{ 
          x: [0, -20, 0], 
          y: [0, 20, 0],
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 17,
          ease: "easeInOut",
          delay: 2
        }}
      />
      
      <div className="relative w-full max-w-5xl flex flex-col md:flex-row gap-4 z-10 h-auto max-h-[90vh]">
        {/* Left sidebar with information - more compact */}
        <motion.div
          className="hidden md:flex flex-col w-1/3 text-white p-6 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 shadow-xl overflow-auto"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="mb-6">
            <motion.div
              className="w-14 h-14 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mb-4"
              initial={{ rotateY: -90 }}
              animate={{ rotateY: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </motion.div>
            <motion.h2
              className="text-xl font-bold mb-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              School Management System
            </motion.h2>
            <motion.p
              className="text-blue-100 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              The comprehensive solution for educational institutions
            </motion.p>
          </div>
          
          <motion.div 
            className="space-y-4 overflow-y-auto flex-grow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {[{
              title: "Easy Management",
              desc: "Streamline your administrative tasks with our intuitive interface",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              )
            },
            {
              title: "Student Tracking",
              desc: "Monitor student performance and attendance with detailed analytics",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )
            },
            {
              title: "Secure Access",
              desc: "Role-based access control keeps your data safe and accessible",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )
            }].map((feature, index) => (
              <motion.div 
                key={index} 
                className="flex items-start gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.2 }}
              >
                <div className="mt-1 bg-white bg-opacity-20 p-2 rounded-lg">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-medium text-lg">{feature.title}</h3>
                  <p className="text-blue-100 text-sm">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div 
            className="mt-4 pt-3 border-t border-blue-400 border-opacity-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <p className="text-xs text-blue-100">Need help? Contact support@schoolms.com</p>
          </motion.div>
        </motion.div>
        
        {/* Main content area - more compact */}
        <motion.div
          className="flex-1 bg-white rounded-xl shadow-xl p-6 relative z-10 border border-gray-100 overflow-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ maxHeight: "calc(90vh - 40px)" }}
        >
          <div className="text-center mb-4">
            <motion.div 
              className="mx-auto mb-3 bg-indigo-600 w-14 h-14 flex items-center justify-center rounded-full shadow-md"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </motion.div>
            <motion.h1 
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              School Management System
            </motion.h1>
            <motion.p
              className="text-gray-500 text-sm mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.7 }}
            >
              Welcome back! Please sign in to continue
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="relative overflow-y-auto"
          >
            <Outlet />
          </motion.div>
        </motion.div>
      </div>
      
      <div className="absolute bottom-2 text-center text-gray-500 text-xs w-full">
        <div className="flex justify-center gap-4 mb-1">
          <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Help</a>
        </div>
        © {new Date().getFullYear()} School Management System
      </div>
    </div>
  );
}
