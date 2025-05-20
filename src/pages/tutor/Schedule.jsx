import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Schedule() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('week'); // 'day', 'week', 'month'

  // Mock data for the calendar
  useEffect(() => {
    setTimeout(() => {
      const mockEvents = [
        {
          id: 1,
          title: 'Advanced Mathematics',
          start: new Date(2025, 4, 18, 9, 0), // May 18, 2025, 9:00 AM
          end: new Date(2025, 4, 18, 10, 30),
          location: 'Room 101',
          type: 'class'
        },
        {
          id: 2,
          title: 'Physics Fundamentals',
          start: new Date(2025, 4, 18, 11, 0),
          end: new Date(2025, 4, 18, 12, 30),
          location: 'Lab 3',
          type: 'class'
        },
        {
          id: 3,
          title: 'Chemistry Lab',
          start: new Date(2025, 4, 18, 14, 0),
          end: new Date(2025, 4, 18, 15, 30),
          location: 'Chemistry Lab 2',
          type: 'class'
        },
        {
          id: 4,
          title: 'Department Meeting',
          start: new Date(2025, 4, 19, 13, 0),
          end: new Date(2025, 4, 19, 14, 0),
          location: 'Conference Room A',
          type: 'meeting'
        },
        {
          id: 5,
          title: 'Student Consultation - Emma Thompson',
          start: new Date(2025, 4, 19, 15, 0),
          end: new Date(2025, 4, 19, 15, 30),
          location: 'Office 305',
          type: 'consultation'
        },
        {
          id: 6,
          title: 'Advanced Mathematics',
          start: new Date(2025, 4, 20, 9, 0),
          end: new Date(2025, 4, 20, 10, 30),
          location: 'Room 101',
          type: 'class'
        },
        {
          id: 7,
          title: 'Physics Fundamentals',
          start: new Date(2025, 4, 20, 11, 0),
          end: new Date(2025, 4, 20, 12, 30),
          location: 'Lab 3',
          type: 'class'
        },
        {
          id: 8,
          title: 'Chemistry Lab',
          start: new Date(2025, 4, 20, 14, 0),
          end: new Date(2025, 4, 20, 15, 30),
          location: 'Chemistry Lab 2',
          type: 'class'
        },
        {
          id: 9,
          title: 'Parent-Teacher Conference',
          start: new Date(2025, 4, 21, 16, 0),
          end: new Date(2025, 4, 21, 18, 0),
          location: 'Main Hall',
          type: 'event'
        }
      ];
      
      // Set current date to match our mock data for demo purposes
      setSelectedDate(new Date(2025, 4, 18));
      setEvents(mockEvents);
      setLoading(false);
    }, 800);
  }, []);

  // Helper to get the days of the current week
  const getWeekDays = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    
    const monday = new Date(date);
    monday.setDate(diff);
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(monday);
      currentDay.setDate(monday.getDate() + i);
      weekDays.push(currentDay);
    }
    
    return weekDays;
  };

  // Helper to check if a date is today
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  // Helper to check if a date is the selected date
  const isSelected = (date) => {
    return date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear();
  };

  // Get events for the selected date
  const getDayEvents = (date) => {
    return events.filter(event => 
      event.start.getDate() === date.getDate() &&
      event.start.getMonth() === date.getMonth() &&
      event.start.getFullYear() === date.getFullYear()
    ).sort((a, b) => a.start - b.start);
  };

  // Navigation helpers
  const navigatePrevious = () => {
    const newDate = new Date(selectedDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setSelectedDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(selectedDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  const navigateToday = () => {
    setSelectedDate(new Date(2025, 4, 18)); // For demo, we'll use our mock date
  };

  // Format time display
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get color based on event type
  const getEventColor = (type) => {
    switch (type) {
      case 'class':
        return 'bg-cyan-100 border-cyan-300 text-cyan-800';
      case 'meeting':
        return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'consultation':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'event':
        return 'bg-amber-100 border-amber-300 text-amber-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Schedule</h1>
        <p className="text-gray-600">Manage your classes, meetings, and appointments</p>
      </header>

      {/* Calendar navigation */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={navigateToday}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            Today
          </button>
          
          <div className="flex items-center">
            <button 
              onClick={navigatePrevious}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            
            <h2 className="text-lg font-semibold mx-2">
              {view === 'day' && selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              {view === 'week' && (
                <>
                  {getWeekDays(selectedDate)[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {getWeekDays(selectedDate)[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </>
              )}
              {view === 'month' && selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            
            <button 
              onClick={navigateNext}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setView('day')}
            className={`px-4 py-2 rounded-lg ${view === 'day' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
          >
            Day
          </button>
          <button 
            onClick={() => setView('week')}
            className={`px-4 py-2 rounded-lg ${view === 'week' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
          >
            Week
          </button>
          <button 
            onClick={() => setView('month')}
            className={`px-4 py-2 rounded-lg ${view === 'month' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
          >
            Month
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6 animate-pulse">
          <div className="flex space-x-2 mb-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex-1">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-20 bg-gray-200 rounded mb-2"></div>
                <div className="h-20 bg-gray-200 rounded mb-2"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {view === 'week' && (
            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="grid grid-cols-7 border-b border-gray-200">
                {getWeekDays(selectedDate).map((date, index) => (
                  <div 
                    key={index}
                    className={`p-4 text-center ${isToday(date) ? 'bg-cyan-50' : ''}`}
                  >
                    <p className="text-sm text-gray-500">{date.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                    <button 
                      className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center text-sm font-medium mt-1
                        ${isSelected(date) ? 'bg-cyan-600 text-white' : isToday(date) ? 'bg-cyan-100 text-cyan-800' : 'hover:bg-gray-100'}`}
                      onClick={() => {
                        setSelectedDate(date);
                        setView('day');
                      }}
                    >
                      {date.getDate()}
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="divide-y divide-gray-200">
                {getWeekDays(selectedDate).map((date, dateIndex) => {
                  const dayEvents = getDayEvents(date);
                  return dayEvents.length > 0 ? (
                    <div key={dateIndex} className={`p-3 ${isToday(date) ? 'bg-cyan-50/50' : ''}`}>
                      <div className="text-xs font-medium text-gray-500 mb-2 px-2">
                        {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                      
                      <div className="space-y-2">
                        {dayEvents.map(event => (
                          <div 
                            key={event.id}
                            className={`p-2 rounded-lg border ${getEventColor(event.type)} text-sm flex justify-between items-center`}
                          >
                            <div>
                              <div className="font-medium">{event.title}</div>
                              <div className="text-xs">{formatTime(event.start)} - {formatTime(event.end)} | {event.location}</div>
                            </div>
                            <button className="p-1 hover:bg-white/50 rounded">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            </motion.div>
          )}
          
          {view === 'day' && (
            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-cyan-50/50">
                <h3 className="text-lg font-medium">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </h3>
              </div>
              
              <div className="p-4">
                {getDayEvents(selectedDate).length === 0 ? (
                  <div className="py-12 text-center">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No events scheduled</h3>
                    <p className="text-gray-500">Enjoy your free time or add a new event</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getDayEvents(selectedDate).map(event => (
                      <div 
                        key={event.id}
                        className={`p-4 rounded-lg border ${getEventColor(event.type)}`}
                      >
                        <div className="flex justify-between">
                          <div>
                            <div className="text-lg font-medium">{event.title}</div>
                            <div className="text-sm mt-1">{formatTime(event.start)} - {formatTime(event.end)}</div>
                            <div className="flex items-center text-sm mt-2">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              </svg>
                              {event.location}
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button className="p-2 hover:bg-white/50 rounded">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                              </svg>
                            </button>
                            <button className="p-2 hover:bg-white/50 rounded">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        {event.type === 'class' && (
                          <div className="mt-4 pt-4 border-t border-cyan-200 flex justify-between">
                            <div className="space-x-2">
                              <button className="px-3 py-1.5 bg-white text-cyan-700 rounded-md hover:bg-cyan-50 border border-cyan-200">
                                View Lesson Plan
                              </button>
                              <button className="px-3 py-1.5 bg-white text-cyan-700 rounded-md hover:bg-cyan-50 border border-cyan-200">
                                Class Materials
                              </button>
                            </div>
                            <button className="px-3 py-1.5 bg-cyan-600 text-white rounded-md hover:bg-cyan-700">
                              Start Class
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between">
                <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Export Schedule
                </button>
                <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add Event
                </button>
              </div>
            </motion.div>
          )}
          
          {view === 'month' && (
            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="grid grid-cols-7 gap-px bg-gray-200">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
                
                {/* Here we would generate a proper month view with correct dates */}
                {/* This is a simplified placeholder version */}
                {Array.from({ length: 35 }).map((_, index) => {
                  const date = new Date(selectedDate);
                  date.setDate(index - 5); // Arbitrary offset just for demo
                  
                  return (
                    <div 
                      key={index}
                      className={`bg-white p-2 min-h-[100px] ${isToday(date) ? 'bg-cyan-50' : ''}`}
                    >
                      <div className="text-right">
                        <span className={`text-sm inline-flex w-7 h-7 items-center justify-center rounded-full
                          ${isSelected(date) ? 'bg-cyan-600 text-white' : isToday(date) ? 'bg-cyan-100 text-cyan-800' : 'text-gray-700'}`}>
                          {date.getDate()}
                        </span>
                      </div>
                      
                      <div className="mt-2 space-y-1">
                        {getDayEvents(date).slice(0, 2).map(event => (
                          <div 
                            key={event.id}
                            className={`px-2 py-1 rounded text-xs truncate ${getEventColor(event.type)}`}
                          >
                            {formatTime(event.start)} {event.title}
                          </div>
                        ))}
                        
                        {getDayEvents(date).length > 2 && (
                          <div className="text-xs text-gray-500 px-2">
                            +{getDayEvents(date).length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
