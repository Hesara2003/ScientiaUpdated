import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FaqWidget from '../../components/common/FaqWidget';

export default function Home() {
  const [children, setChildren] = useState([]);
  const [upcomingPayments, setUpcomingPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // In a real application, you would fetch this data from an API
  useEffect(() => {
    // Simulating API call with setTimeout
    setTimeout(() => {
      setChildren([
        { 
          id: 1, 
          name: "Sarah Johnson", 
          grade: "8th Grade",
          attendance: "95%",
          nextClass: "Mathematics - 10:00 AM",
          avatar: "S"
        },
        { 
          id: 2, 
          name: "Michael Johnson", 
          grade: "5th Grade",
          attendance: "92%",
          nextClass: "Science - 11:30 AM",
          avatar: "M"
        }
      ]);

      setUpcomingPayments([
        { id: 1, description: "Term 2 Tuition Fee", amount: "$1,200", dueDate: "May 30, 2025", status: "Due Soon" },
        { id: 2, description: "Science Lab Fee", amount: "$150", dueDate: "Jun 05, 2025", status: "Upcoming" }
      ]);

      setNotifications([
        { id: 1, message: "Sarah's Mathematics test scheduled for tomorrow", date: "Today, 09:15 AM", type: "urgent" },
        { id: 2, message: "Michael's Science project due next week", date: "Yesterday, 02:30 PM", type: "reminder" },
        { id: 3, message: "Parent-Teacher meeting next Friday", date: "May 12, 2025, 11:20 AM", type: "info" }
      ]);

      setLoading(false);
    }, 800);
  }, []);
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

  // Helper function to determine payment status color
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'Due Soon':
        return 'bg-amber-100 text-amber-800';
      case 'Upcoming':
        return 'bg-teal-100 text-teal-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to determine notification type icon and color
  const getNotificationTypeStyles = (type) => {
    switch (type) {
      case 'urgent':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-600',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          )
        };
      case 'reminder':
        return {
          bgColor: 'bg-amber-100',
          textColor: 'text-amber-600',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          )
        };
      case 'info':
      default:
        return {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-600',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          )
        };
    }
  };

  return (
    <div className="px-4 py-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Parent Dashboard</h1>
        <p className="text-gray-600">Welcome! Here's an overview of your children's activities</p>
      </header>

      {loading ? (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Children Section */}
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">My Children</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {children.map(child => (
                <motion.div 
                  key={child.id}
                  variants={itemVariants}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-5">
                    <div className="flex items-start space-x-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-r from-teal-500 to-green-500 flex items-center justify-center text-white text-xl font-medium">
                        {child.avatar}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800">{child.name}</h3>
                        <p className="text-sm text-gray-500">{child.grade}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Attendance</p>
                        <p className="text-base font-medium text-gray-800">{child.attendance}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Next Class</p>
                        <p className="text-base font-medium text-gray-800">{child.nextClass}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <button className="px-4 py-2 bg-white border border-gray-300 text-teal-600 rounded-md hover:bg-teal-50 text-sm flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Payments Section */}
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Upcoming Payments</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {upcomingPayments.map(payment => (
                <motion.div 
                  key={payment.id}
                  variants={itemVariants}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{payment.description}</h3>
                        <p className="text-sm text-gray-500">Due: {payment.dueDate}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getPaymentStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-800">{payment.amount}</span>
                      <button className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm">
                        Pay Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Notifications Section */}
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Notifications</h2>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {notifications.map((notification, index) => {
                const { bgColor, textColor, icon } = getNotificationTypeStyles(notification.type);
                
                return (
                  <React.Fragment key={notification.id}>
                    <div className="p-4 flex items-start space-x-4">
                      <div className={`p-2 rounded-full ${bgColor} ${textColor} flex-shrink-0`}>
                        {icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.date}</p>
                      </div>
                    </div>
                    {index < notifications.length - 1 && <div className="border-b border-gray-100"></div>}
                  </React.Fragment>
                );
              })}

              {notifications.length > 0 && (
                <div className="p-3 bg-gray-50 text-center">
                  <button className="text-teal-600 text-sm font-medium hover:text-teal-800">
                    View All Notifications
                  </button>
                </div>              )}            </div>
          </motion.div>
          
          {/* FAQs Section */}
          <motion.div variants={itemVariants} className="mt-6">
            <FaqWidget category="Parent" limit={3} title="Helpful FAQs for Parents" />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
