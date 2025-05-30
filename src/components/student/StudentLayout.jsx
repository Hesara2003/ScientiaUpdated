import { Link, useLocation, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

export default function StudentLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  useEffect(() => {
    // Verify and validate the user role when the component mounts
    const storedRole = localStorage.getItem('userRole');
    if (storedRole !== 'student') {
      console.log('Student layout loaded but user role is:', storedRole);
      // Role is stored but doesn't match - we'll let the ProtectedRoute handle this
    } else {
      console.log('Student layout loaded for verified student user');
    }
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  const handleLogout = () => {
    // Use the authService logout to properly clear everything
    try {
      // Import the logout function dynamically to avoid circular dependencies
      const { logout } = require('../../services/authService');
      logout();
    } catch (e) {
      // Fallback in case of import issues
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('lastRegisteredRole');
    }
    window.location.href = '/auth/login';
  };

  const navItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({ 
      opacity: 1, 
      x: 0,
      transition: { 
        delay: i * 0.05,
        duration: 0.4,
        ease: "easeOut" 
      }
    })
  };

  const logoVariants = {
    hover: { 
      scale: 1.05,
      rotate: [0, -2, 2, -2, 0],
      transition: { duration: 0.5 } 
    }
  };

  const navCategories = [    {
      name: "Main",
      items: [
        { path: '/student', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { path: '/student/courses', label: 'My Courses', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
        { path: '/student/fee-reminders', label: 'Fee Reminders', icon: <MonetizationOnIcon /> },
      ]
    },
    {
      name: "Academics",
      items: [
        { path: '/student/attendance', label: 'Attendance', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { path: '/student/exams', label: 'Exams & Assessments', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
        { path: '/student/progress', label: 'Academic Progress', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
      ]
    },    {
      name: "Resources",
      items: [
       // { path: '/student/materials', label: 'Learning Materials', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
        //{ path: '/student/assignments', label: 'Assignments', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
        { path: '/student/recordings', label: 'Class Recordings', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
        { path: '/student/tutorials', label: 'Browse Tutorials', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
        { path: '/student/my-tutorials', label: 'My Tutorials', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
      ]
    }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 -z-10"></div>
      
      {/* Sidebar for desktop */}
      <motion.aside 
        className={`hidden md:flex md:flex-col ${collapsed ? 'w-20' : 'w-72'} bg-white shadow-lg relative z-10 transition-all duration-300`}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        {/* Sidebar background decoration */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-blue-50/50 opacity-50"></div>
        <div className="absolute top-0 right-0 w-1/2 h-1/3 bg-gradient-to-br from-indigo-100/20 to-purple-200/20 rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/3 bg-gradient-to-tr from-blue-100/20 to-purple-200/20 rounded-tr-full"></div>
        
        {/* Sidebar content - relative to appear above the background */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Header with logo */}
          <div className="p-4 border-b border-gray-100/80 flex items-center justify-between">
            <motion.div 
              className="flex items-center"
              variants={logoVariants}
              whileHover="hover"
            >
              <Link to="/student" className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
                </div>
                {!collapsed && (
                  <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent ml-3">
                    Sciencia
                  </span>
                )}
              </Link>
            </motion.div>
            
            {/* Toggle collapse button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCollapsed(!collapsed)}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d={collapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} 
                />
              </svg>
            </motion.button>
          </div>
          
          {/* Navigation */}
          <div className={`mt-5 px-4 flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent ${collapsed ? 'px-2' : 'px-4'}`}>
            {navCategories.map((category, categoryIndex) => (
              <div key={category.name} className={`mb-6 ${collapsed ? '' : ''}`}>
                {!collapsed && (
                  <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-2 ml-4">
                    {category.name}
                  </h3>
                )}
                <div className="space-y-1">
                  {category.items.map((item, i) => (
                    <motion.div
                      key={item.path}
                      custom={i + categoryIndex * 5}
                      variants={navItemVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <Link 
                        to={item.path} 
                        className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-xl transition-all duration-200 group ${
                          isActive(item.path) 
                            ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 font-medium shadow-sm' 
                            : 'text-gray-600 hover:bg-indigo-50/50 hover:text-indigo-600'
                        }`}
                        title={collapsed ? item.label : ''}
                      >
                        <div className="flex items-center">
                          <div className={`${isActive(item.path) 
                            ? 'bg-indigo-100 text-indigo-600' 
                            : 'bg-gray-100 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                            } rounded-lg p-2 transition-colors`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d={item.icon}></path>
                            </svg>
                          </div>
                          
                          {!collapsed && (
                            <span className="ml-3 text-sm">{item.label}</span>
                          )}
                        </div>
                        
                        {isActive(item.path) && !collapsed && (
                          <motion.div 
                            className="w-1.5 h-5 bg-indigo-600 rounded-full"
                            layoutId="activeIndicator"
                          />
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* User Profile & Login */}
          <div className={`mt-auto p-4 border-t border-gray-100/80 ${collapsed ? 'flex justify-center' : ''}`}>
            {collapsed ? (
              <motion.div 
                className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center cursor-pointer shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </motion.div>
            ) : (
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-800">John Doe</p>
                  <p className="text-xs text-gray-500">Student</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="ml-auto p-2 text-gray-400 hover:text-gray-600"
                  title="Logout"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </motion.aside>
      
      {/* Mobile sidebar */}
      <div className="md:hidden">
        {/* Mobile header */}
        <div className={`fixed top-0 left-0 right-0 z-30 bg-white ${scrolled ? 'shadow-md' : ''} transition-shadow duration-300`}>
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
              <Link to="/student" className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent ml-2">
                  Sciencia
                </span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="p-2 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile sidebar drawer */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div 
                className="fixed inset-0 bg-black/50 z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
              />
              
              <motion.div
                className="fixed top-0 left-0 bottom-0 w-72 bg-white z-50 overflow-y-auto"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                      </svg>
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent ml-3">
                      Sciencia
                    </span>
                  </div>
                  
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                
                <div className="px-4 py-5">
                  {navCategories.map((category) => (
                    <div key={category.name} className="mb-6">
                      <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-3 px-3">
                        {category.name}
                      </h3>
                      <div className="space-y-1">
                        {category.items.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm ${
                              isActive(item.path)
                                ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 font-medium"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center">
                              <div className={`${
                                isActive(item.path)
                                  ? "bg-indigo-100 text-indigo-600"
                                  : "bg-gray-100 text-gray-500"
                              } rounded-lg p-2 mr-3`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d={item.icon}></path>
                                </svg>
                              </div>
                              {item.label}
                            </div>
                            {isActive(item.path) && (
                              <div className="w-1.5 h-5 bg-indigo-600 rounded-full" />
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-auto p-4 border-t border-gray-100">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-800">John Doe</p>
                      <p className="text-xs text-gray-500">Student</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="ml-auto p-2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Main scrollable area */}
        <main className="flex-1 overflow-y-auto pt-16 md:pt-0 pb-6">
          {/* Content */}
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
