import { Link, useLocation, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

export default function TutorLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
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

  const navCategories = [
    {
      name: "Core",
      items: [
        { path: '/tutor', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { path: '/tutor/schedule', label: 'Schedule', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
      ]
    },    {
      name: "Teaching",
      items: [
        { path: '/tutor/classes', label: 'My Classes', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
        { path: '/tutor/subjects', label: 'My Subjects', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
        { path: '/tutor/students', label: 'Students', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
        { path: '/tutor/attendance', label: 'Attendance', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
        { path: '/tutor/assignments', label: 'Assignments', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
      ]
    },
    {
      name: "Resources",
      items: [
        { path: '/tutor/materials', label: 'Materials', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
        { path: '/tutor/recordings', label: 'Recordings', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
        { path: '/tutor/messages', label: 'Messages', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
        { path: '/tutor/tutorials', label: 'Tutorials', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },        //{ path: '/tutor/tutorial-sales', label: 'Tutorial Sales', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
        { path: '/tutor/fee-reminders', label: 'Fee Reminders', icon: 'M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zM11 1v2M11 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 11h2M21 11h2M4.22 17.78l1.42-1.42M18.36 5.64l1.42-1.42' },
      ]
    }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <div className="fixed inset-0 bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 -z-10"></div>
      
      {/* Sidebar for desktop */}
      <motion.aside 
        className={`hidden md:flex md:flex-col ${collapsed ? 'w-20' : 'w-72'} bg-white shadow-lg relative z-10 transition-all duration-300`}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        {/* Sidebar background decoration */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-50/50 to-blue-50/50 opacity-50"></div>
        <div className="absolute top-0 right-0 w-1/2 h-1/3 bg-gradient-to-br from-cyan-100/20 to-sky-200/20 rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/3 bg-gradient-to-tr from-blue-100/20 to-sky-200/20 rounded-tr-full"></div>
        
        {/* Sidebar content - relative to appear above the background */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Header with logo */}
          <div className="p-4 border-b border-gray-100/80 flex items-center justify-between">
            <motion.div 
              className="flex items-center"
              variants={logoVariants}
              whileHover="hover"
            >
              <Link to="/tutor" className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
                </div>
                {!collapsed && (
                  <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent ml-3">
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
                            ? 'bg-gradient-to-r from-cyan-50 to-sky-50 text-cyan-600 font-medium shadow-sm' 
                            : 'text-gray-600 hover:bg-cyan-50/50 hover:text-cyan-600'
                        }`}
                        title={collapsed ? item.label : ''}
                      >
                        <div className="flex items-center">
                          <div className={`${isActive(item.path) 
                            ? 'bg-cyan-100 text-cyan-600' 
                            : 'bg-gray-100 text-gray-500 group-hover:bg-cyan-100 group-hover:text-cyan-600'
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
                            className="w-1.5 h-5 bg-cyan-600 rounded-full"
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
                className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center cursor-pointer shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </motion.div>
            ) : (
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center mr-3 shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Tutor User</div>
                  <motion.button 
                    className="text-xs text-cyan-600 hover:text-cyan-800 flex items-center"
                    whileHover={{ x: 2 }}
                    onClick={handleLogout}
                  >
                    Sign out
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            )}
          </div>
          
          {!collapsed && (
            <div className="p-4 text-xs text-center text-gray-500 border-t border-gray-100/80">
              <p>&copy; {new Date().getFullYear()} Sciencia Institute</p>
            </div>
          )}
        </div>
      </motion.aside>
      
      {/* Mobile header with hamburger */}
      <motion.header 
        className="md:hidden fixed top-0 inset-x-0 h-16 bg-white/90 backdrop-blur-md shadow-sm z-50 flex items-center justify-between px-4"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <motion.div 
          className="flex items-center"
          variants={logoVariants}
          whileHover="hover"
        >
          <Link to="/tutor" className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg flex items-center justify-center mr-2 shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Sciencia</span>
          </Link>
        </motion.div>
        
        <motion.button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-cyan-600 focus:outline-none"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {sidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            )}
          </svg>
        </motion.button>
      </motion.header>
      
      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div 
              className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            
            <motion.aside 
              className="fixed top-0 left-0 h-full w-72 bg-white z-50 md:hidden pt-16 shadow-xl"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-50/50 to-blue-50/50 opacity-50"></div>
              <div className="absolute top-0 right-0 w-1/2 h-1/3 bg-gradient-to-br from-cyan-100/20 to-sky-200/20 rounded-bl-full"></div>
              <div className="absolute bottom-0 left-0 w-1/2 h-1/3 bg-gradient-to-tr from-blue-100/20 to-sky-200/20 rounded-tr-full"></div>
              
              <nav className="mt-2 px-3 relative z-10">
                {navCategories.map((category) => (
                  <div key={category.name} className="mb-6">
                    <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-2 ml-4">
                      {category.name}
                    </h3>
                    <div className="space-y-1">
                      {category.items.map((item) => (
                        <Link 
                          key={item.path}
                          to={item.path} 
                          className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                            isActive(item.path) 
                              ? 'bg-gradient-to-r from-cyan-50 to-sky-50 text-cyan-600 font-medium shadow-sm' 
                              : 'text-gray-600 hover:bg-cyan-50/50 hover:text-cyan-600'
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <div className="flex items-center">
                            <div className={`${isActive(item.path) 
                              ? 'bg-cyan-100 text-cyan-600' 
                              : 'bg-gray-100 text-gray-500'
                              } rounded-lg p-2`}>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d={item.icon}></path>
                              </svg>
                            </div>
                            <span className="ml-3 text-sm">{item.label}</span>
                          </div>
                          
                          {isActive(item.path) && (
                            <div className="w-1.5 h-5 bg-cyan-600 rounded-full"></div>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
                
                <div className="mt-8 px-4 pb-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center mr-3 shadow-md">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">Tutor User</div>
                      <button className="text-xs text-cyan-600 hover:text-cyan-800" onClick={handleLogout}>Sign out</button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-center text-gray-500 mt-4">
                    &copy; {new Date().getFullYear()} Sciencia Institute
                  </p>
                </div>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`flex flex-col flex-1 overflow-y-auto transition-all duration-300 ${collapsed ? 'md:ml-20' : 'md:ml-72'}`}>
        <motion.main 
          className="flex-grow p-4 md:p-6 pt-20 md:pt-6 max-w-7xl mx-auto w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          key={location.pathname}
        >
          <Outlet />
        </motion.main>

        {/* Footer */}
        <motion.footer 
          className="bg-white/80 backdrop-blur-md border-t border-gray-200 p-4 md:p-6 text-center text-sm text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          &copy; {new Date().getFullYear()} Sciencia Institute. All rights reserved.
        </motion.footer>
      </div>
    </div>
  );
}
