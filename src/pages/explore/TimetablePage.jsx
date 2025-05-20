import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAllClasses } from '../../services/classService';
import { getAllSubjects } from '../../services/subjectService';

export default function TimetablePage() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDay, setSelectedDay] = useState('all');
  const [view, setView] = useState('list'); // 'list' or 'calendar'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [classesData, subjectsData] = await Promise.all([
          getAllClasses(),
          getAllSubjects()
        ]);
        
        setClasses(classesData || mockClasses);
        setSubjects(subjectsData || mockSubjects);
      } catch (error) {
        console.error("Error fetching data:", error);
        setClasses(mockClasses);
        setSubjects(mockSubjects);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper to get day of week from schedule
  const getDayFromSchedule = (schedule) => {
    if (!schedule) return [];
    
    const days = [];
    if (schedule.includes('Mon')) days.push('Monday');
    if (schedule.includes('Tue')) days.push('Tuesday');
    if (schedule.includes('Wed')) days.push('Wednesday');
    if (schedule.includes('Thu')) days.push('Thursday');
    if (schedule.includes('Fri')) days.push('Friday');
    if (schedule.includes('Sat')) days.push('Saturday');
    if (schedule.includes('Sun')) days.push('Sunday');
    
    return days;
  };

  // Filter classes based on subject and day filters
  const filteredClasses = classes.filter(cls => {
    const matchesSubject = selectedSubject === 'all' || cls.subject === selectedSubject;
    
    if (selectedDay === 'all') return matchesSubject;
    
    const days = getDayFromSchedule(cls.schedule);
    return matchesSubject && days.includes(selectedDay);
  });

  // Group classes by day for calendar view
  const classesByDay = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
  };

  filteredClasses.forEach(cls => {
    const days = getDayFromSchedule(cls.schedule);
    days.forEach(day => {
      classesByDay[day].push(cls);
    });
  });

  // Mock data in case API fails
  const mockClasses = [
    { id: 1, title: "Advanced Calculus", tutor: "Dr. Sarah Johnson", schedule: "Mon, Wed 4:00-5:30 PM", startDate: "2023-06-01", capacity: "15/20", subject: "Mathematics", studentCount: 15, maxCapacity: 20 },
    { id: 2, title: "Linear Algebra Fundamentals", tutor: "Dr. Sarah Johnson", schedule: "Tue, Thu 2:00-3:30 PM", startDate: "2023-06-08", capacity: "12/20", subject: "Mathematics", studentCount: 12, maxCapacity: 20 },
    { id: 3, title: "Quantum Physics Fundamentals", tutor: "Prof. James Wilson", schedule: "Tue, Thu 3:30-5:00 PM", startDate: "2023-06-05", capacity: "12/15", subject: "Physics", studentCount: 12, maxCapacity: 15 },
    { id: 4, title: "Classical Mechanics", tutor: "Dr. Robert Chen", schedule: "Mon, Wed 10:00-11:30 AM", startDate: "2023-06-12", capacity: "8/15", subject: "Physics", studentCount: 8, maxCapacity: 15 },
    { id: 5, title: "Organic Chemistry Lab", tutor: "Ms. Emily Chen", schedule: "Fri 2:00-5:00 PM", startDate: "2023-06-02", capacity: "18/25", subject: "Chemistry", studentCount: 18, maxCapacity: 25 },
    { id: 6, title: "Inorganic Chemistry", tutor: "Mrs. Amanda Wilson", schedule: "Mon, Wed 1:00-2:30 PM", startDate: "2023-06-15", capacity: "14/20", subject: "Chemistry", studentCount: 14, maxCapacity: 20 },
    { id: 7, title: "Creative Writing Workshop", tutor: "Mr. David Taylor", schedule: "Wed 6:00-8:00 PM", startDate: "2023-06-07", capacity: "8/12", subject: "English Literature", studentCount: 8, maxCapacity: 12 },
    { id: 8, title: "Python Programming", tutor: "Dr. Michael Brown", schedule: "Tue, Thu 6:00-7:30 PM", startDate: "2023-06-06", capacity: "16/20", subject: "Computer Science", studentCount: 16, maxCapacity: 20 },
    { id: 9, title: "Data Structures", tutor: "Dr. Michael Brown", schedule: "Sat 10:00 AM-1:00 PM", startDate: "2023-06-10", capacity: "12/15", subject: "Computer Science", studentCount: 12, maxCapacity: 15 }
  ];

  const mockSubjects = [
    { id: 1, name: "Mathematics" },
    { id: 2, name: "Physics" },
    { id: 3, name: "Chemistry" },
    { id: 4, name: "English Literature" },
    { id: 5, name: "Computer Science" }
  ];

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Class Timetable
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Browse our schedule of upcoming classes and find the perfect fit for your learning journey.
          </p>
        </div>

        {/* Filters and View Toggle */}
        <div className="mb-8">
          <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center">
            <div className="flex flex-wrap gap-2">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.name}>
                    {subject.name}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Days</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>
            
            <div className="inline-flex rounded-md shadow-sm">
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-l-md ${view === 'list' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setView('list')}
              >
                List View
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-r-md ${view === 'calendar' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setView('calendar')}
              >
                Calendar View
              </button>
            </div>
          </div>
        </div>

        {/* Content based on view */}
        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredClasses.length > 0 ? (
          view === 'list' ? (
            // List View
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollment</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClasses.map((cls) => (
                    <tr key={cls.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cls.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.tutor}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.schedule}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.startDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                            <div 
                              className="bg-indigo-600 h-2.5 rounded-full" 
                              style={{ width: `${(cls.studentCount / cls.maxCapacity) * 100}%` }}
                            ></div>
                          </div>
                          <span>{cls.studentCount}/{cls.maxCapacity}</span>
                        </div>
                      </td>                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          to={`/explore/classes/${cls.id}`}
                          className="px-3 py-1 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 text-xs font-medium rounded mr-2"
                        >
                          Details
                        </Link>
                        <button
                          onClick={() => window.location.href = '/auth/register'}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded"
                          disabled={cls.studentCount >= cls.maxCapacity}
                        >
                          {cls.studentCount >= cls.maxCapacity ? 'Full' : 'Enroll'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // Calendar View
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {Object.entries(classesByDay).map(([day, dayClasses]) => (
                <div key={day} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-indigo-600 text-white py-3 px-4">
                    <h3 className="font-medium">{day}</h3>
                  </div>
                  <div className="p-4">
                    {dayClasses.length > 0 ? (
                      <ul className="divide-y divide-gray-200">
                        {dayClasses.map((cls) => {
                          // Extract time from schedule (assuming format like "Mon, Wed 4:00-5:30 PM")
                          const timeMatch = cls.schedule.match(/\d+:\d+\s*-\s*\d+:\d+\s*[AP]M/);
                          const time = timeMatch ? timeMatch[0] : 'Time not specified';
                          
                          return (
                            <li key={cls.id} className="py-3">
                              <div className="flex justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{cls.title}</p>
                                  <p className="text-xs text-gray-500">{time}</p>
                                  <p className="text-xs text-gray-500 mt-1">{cls.tutor}</p>
                                </div>
                                <div className="flex flex-col items-end">
                                  <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                                    {cls.subject}
                                  </span>
                                  <span className="text-xs text-gray-500 mt-1">
                                    {cls.studentCount}/{cls.maxCapacity} Students
                                  </span>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <p>No classes scheduled</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          )
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No classes found</h3>
            <p className="mt-1 text-gray-500">Try adjusting your filters or check back later for updated schedules.</p>
          </div>
        )}

        {/* Legend */}
        <div className="mt-8 bg-white p-4 rounded-md shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Enrollment Status</h3>
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
              <span className="text-xs text-gray-600">Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-xs text-gray-600">Limited Spots</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
              <span className="text-xs text-gray-600">Full</span>
            </div>
          </div>
        </div>

        {/* Request Custom Schedule */}
        <div className="mt-10 bg-indigo-50 rounded-lg p-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Can't find a suitable time?</h3>
              <p className="text-gray-600 mt-1">Request a class at a time that works for you.</p>
            </div>
            <button
              onClick={() => window.location.href = '/auth/register'}
              className="mt-4 md:mt-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md"
            >
              Request Custom Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
