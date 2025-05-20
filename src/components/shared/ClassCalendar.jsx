import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import portalClassService from '../../services/portalClassService';

/**
 * A reusable calendar view for classes that works across all portals
 */
const ClassCalendar = ({ onClassSelect, filterOptions = {} }) => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('week'); // 'day', 'week', 'month'

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        // Get classes for the current user's role
        const options = {
          ...filterOptions,
          date: selectedDate.toISOString().split('T')[0]
        };
        
        const classData = await portalClassService.getClasses(options, user.role, user.id);
        setClasses(classData);
      } catch (err) {
        setError('Failed to load classes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [selectedDate, user.role, user.id, filterOptions]);

  // Generate days for the calendar based on selected view
  const getDaysForView = () => {
    const days = [];
    const startDate = new Date(selectedDate);
    
    if (calendarView === 'day') {
      days.push(new Date(startDate));
    } 
    else if (calendarView === 'week') {
      // Get to the beginning of the week (Sunday)
      const dayOfWeek = startDate.getDay();
      startDate.setDate(startDate.getDate() - dayOfWeek);
      
      // Add 7 days
      for (let i = 0; i < 7; i++) {
        const day = new Date(startDate);
        day.setDate(day.getDate() + i);
        days.push(day);
      }
    } 
    else if (calendarView === 'month') {
      // Go to the 1st of the month
      startDate.setDate(1);
      
      // Get to the beginning of the week for this 1st
      const dayOfWeek = startDate.getDay();
      startDate.setDate(startDate.getDate() - dayOfWeek);
      
      // Add days to show a 6-week calendar (42 days)
      for (let i = 0; i < 42; i++) {
        const day = new Date(startDate);
        day.setDate(day.getDate() + i);
        days.push(day);
      }
    }
    
    return days;
  };
  
  // Navigate to previous period
  const goToPrevious = () => {
    const newDate = new Date(selectedDate);
    if (calendarView === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (calendarView === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (calendarView === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setSelectedDate(newDate);
  };
  
  // Navigate to next period
  const goToNext = () => {
    const newDate = new Date(selectedDate);
    if (calendarView === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (calendarView === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (calendarView === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };
  
  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric'
    });
  };

  // Get classes for a specific date
  const getClassesForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return classes.filter(cls => {
      const classDate = new Date(cls.startTime);
      return classDate.toISOString().split('T')[0] === dateString;
    });
  };

  // Get appropriate title for the calendar view
  const getCalendarTitle = () => {
    if (calendarView === 'day') {
      return formatDate(selectedDate);
    } else if (calendarView === 'week') {
      const days = getDaysForView();
      return `${formatDate(days[0])} - ${formatDate(days[6])}`;
    } else {
      return selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {/* Calendar Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <button 
            onClick={() => setCalendarView('day')}
            className={`px-3 py-1 rounded ${calendarView === 'day' ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}
          >
            Day
          </button>
          <button 
            onClick={() => setCalendarView('week')}
            className={`px-3 py-1 rounded ${calendarView === 'week' ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}
          >
            Week
          </button>
          <button 
            onClick={() => setCalendarView('month')}
            className={`px-3 py-1 rounded ${calendarView === 'month' ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}
          >
            Month
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <button onClick={goToPrevious} className="p-1 rounded hover:bg-gray-200">
            &lt;
          </button>
          <h3 className="font-medium">{getCalendarTitle()}</h3>
          <button onClick={goToNext} className="p-1 rounded hover:bg-gray-200">
            &gt;
          </button>
        </div>
        
        <button 
          onClick={() => setSelectedDate(new Date())}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          Today
        </button>
      </div>

      {/* Calendar Content */}
      {loading ? (
        <div className="p-4 text-center">Loading classes...</div>
      ) : error ? (
        <div className="p-4 text-center text-red-500">{error}</div>
      ) : (
        <div className={`grid ${calendarView === 'month' ? 'grid-cols-7' : 'grid-cols-1'} gap-2`}>
          {/* Display day headers for week and month views */}
          {calendarView !== 'day' && (
            <>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-medium p-2 bg-gray-100">
                  {day}
                </div>
              ))}
            </>
          )}
          
          {/* Display days with classes */}
          {getDaysForView().map((date, index) => {
            const dayClasses = getClassesForDate(date);
            const isToday = new Date().toDateString() === date.toDateString();
            const isCurrentMonth = date.getMonth() === selectedDate.getMonth();
            
            return (
              <div 
                key={index}
                className={`
                  ${calendarView === 'month' ? 'min-h-[100px]' : 'min-h-[200px]'}
                  p-2 border rounded
                  ${isToday ? 'bg-blue-50 border-blue-300' : 'border-gray-200'}
                  ${!isCurrentMonth && calendarView === 'month' ? 'bg-gray-50 text-gray-400' : ''}
                `}
              >
                <div className="text-right font-semibold mb-1">
                  {date.getDate()}
                </div>
                
                <div className="space-y-1">
                  {dayClasses.map(cls => (
                    <div 
                      key={cls.id}
                      onClick={() => onClassSelect(cls)}
                      className={`
                        p-1 rounded text-xs cursor-pointer
                        ${cls.tutorId === user.id ? 'bg-green-100 border-l-4 border-green-500' : 'bg-blue-100 border-l-4 border-blue-500'}
                      `}
                    >
                      <div className="font-medium truncate">{cls.name}</div>
                      <div className="text-gray-600">
                        {new Date(cls.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  ))}
                  
                  {dayClasses.length === 0 && calendarView !== 'month' && (
                    <div className="text-gray-400 text-center text-sm">
                      No classes
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClassCalendar;