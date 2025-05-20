import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Progress() {
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [activeTab, setActiveTab] = useState('grades');
  const [loading, setLoading] = useState(true);
  
  // In a real application, you would fetch this data from an API
  useEffect(() => {
    // Simulating API call with setTimeout
    setTimeout(() => {
      const childrenData = [
        { 
          id: 1, 
          name: "Sarah Johnson",
          grade: "8th Grade",
          gradeReports: [
            { subject: 'Mathematics', marks: 92, grade: 'A', comments: 'Excellent work in problem-solving.' },
            { subject: 'Science', marks: 88, grade: 'B+', comments: 'Good understanding of scientific concepts.' },
            { subject: 'English', marks: 95, grade: 'A', comments: 'Outstanding communication skills.' },
            { subject: 'History', marks: 85, grade: 'B', comments: 'Needs to improve on critical analysis.' },
            { subject: 'Art', marks: 98, grade: 'A+', comments: 'Shows exceptional creativity.' }
          ],
          attendanceData: {
            present: 85,
            absent: 3,
            late: 2,
            excused: 5,
            total: 95,
            byMonth: [
              { month: 'Jan', present: 20, absent: 0, late: 0 },
              { month: 'Feb', present: 18, absent: 1, late: 1 },
              { month: 'Mar', present: 22, absent: 0, late: 0 },
              { month: 'Apr', present: 19, absent: 2, late: 1 },
              { month: 'May', present: 6, absent: 0, late: 0 }
            ]
          },
          behaviorReports: [
            { date: 'May 10, 2025', type: 'Positive', description: 'Helped organize class project', teacher: 'Ms. Williams' },
            { date: 'Apr 22, 2025', type: 'Positive', description: 'Excellent participation in class discussion', teacher: 'Mr. Davis' },
            { date: 'Mar 15, 2025', type: 'Neutral', description: 'Reminder to complete homework on time', teacher: 'Ms. Williams' },
          ]
        },
        { 
          id: 2, 
          name: "Michael Johnson",
          grade: "5th Grade",
          gradeReports: [
            { subject: 'Mathematics', marks: 84, grade: 'B', comments: 'Good progress, needs work on algebra.' },
            { subject: 'Science', marks: 90, grade: 'A-', comments: 'Excellent participation in lab activities.' },
            { subject: 'English', marks: 82, grade: 'B', comments: 'Needs to improve grammar and vocabulary.' },
            { subject: 'History', marks: 88, grade: 'B+', comments: 'Good understanding of historical events.' },
            { subject: 'Physical Education', marks: 95, grade: 'A', comments: 'Outstanding athletic abilities.' }
          ],
          attendanceData: {
            present: 80,
            absent: 6,
            late: 4,
            excused: 5,
            total: 95,
            byMonth: [
              { month: 'Jan', present: 19, absent: 1, late: 0 },
              { month: 'Feb', present: 16, absent: 2, late: 2 },
              { month: 'Mar', present: 21, absent: 1, late: 0 },
              { month: 'Apr', present: 18, absent: 2, late: 2 },
              { month: 'May', present: 6, absent: 0, late: 0 }
            ]
          },
          behaviorReports: [
            { date: 'May 5, 2025', type: 'Positive', description: 'Showed leadership during group activity', teacher: 'Mr. Thompson' },
            { date: 'Apr 18, 2025', type: 'Neutral', description: 'Reminder to focus during class time', teacher: 'Mrs. Roberts' },
            { date: 'Mar 10, 2025', type: 'Positive', description: 'Helped a classmate with difficult lesson', teacher: 'Mr. Thompson' },
          ]
        }
      ];

      setChildren(childrenData);
      setSelectedChildId(childrenData[0].id);
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

  // Helper function to get selected child data
  const getSelectedChild = () => {
    return children.find(child => child.id === selectedChildId) || null;
  };

  // Helper function to determine grade color
  const getGradeColor = (grade) => {
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800';
    if (grade.startsWith('B')) return 'bg-cyan-100 text-cyan-800';
    if (grade.startsWith('C')) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  };

  // Helper function to get color for behavior report type
  const getBehaviorTypeColor = (type) => {
    switch (type) {
      case 'Positive':
        return 'bg-green-100 text-green-800';
      case 'Negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderGradesTab = (selectedChild) => {
    return (
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {selectedChild.gradeReports.map((report, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.marks}/100</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${getGradeColor(report.grade)}`}>
                        {report.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{report.comments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderAttendanceTab = (selectedChild) => {
    const { attendanceData } = selectedChild;
    const presentPercentage = Math.round((attendanceData.present / attendanceData.total) * 100);
    
    return (
      <div className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
            <h3 className="text-base font-medium text-gray-800 mb-4">Attendance Summary</h3>
            
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Present</span>
                <span className="text-sm font-medium text-gray-900">{presentPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-teal-600 h-2.5 rounded-full" style={{ width: `${presentPercentage}%` }}></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-teal-50 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-teal-600">{attendanceData.present}</div>
                <div className="text-xs text-teal-700">Present</div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-red-600">{attendanceData.absent}</div>
                <div className="text-xs text-red-700">Absent</div>
              </div>
              <div className="bg-amber-50 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-amber-600">{attendanceData.late}</div>
                <div className="text-xs text-amber-700">Late</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-blue-600">{attendanceData.excused}</div>
                <div className="text-xs text-blue-700">Excused</div>
              </div>
            </div>
          </div>
          
          {/* Monthly Attendance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
            <h3 className="text-base font-medium text-gray-800 mb-4">Monthly Attendance</h3>
            
            <div className="h-64 relative">
              <div className="flex justify-between h-full">
                {attendanceData.byMonth.map((month, index) => (
                  <div key={index} className="flex flex-col items-center justify-end flex-1 h-full">
                    <div className="relative w-full px-1">
                      <div className="absolute bottom-0 left-0 right-0 rounded-t-sm bg-teal-600 transition-all duration-300" style={{ height: `${(month.present / 22) * 100}%` }}></div>
                      {month.absent > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 rounded-t-sm bg-red-400 transition-all duration-300" style={{ height: `${(month.absent / 22) * 100}%`, bottom: `${(month.present / 22) * 100}%` }}></div>
                      )}
                      {month.late > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 rounded-t-sm bg-amber-400 transition-all duration-300" style={{ height: `${(month.late / 22) * 100}%`, bottom: `${((month.present + month.absent) / 22) * 100}%` }}></div>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">{month.month}</div>
                  </div>
                ))}
              </div>
              <div className="absolute left-0 right-0 h-[1px] bg-gray-200" style={{ bottom: '75%' }}></div>
              <div className="absolute left-0 right-0 h-[1px] bg-gray-200" style={{ bottom: '50%' }}></div>
              <div className="absolute left-0 right-0 h-[1px] bg-gray-200" style={{ bottom: '25%' }}></div>
            </div>
            
            <div className="flex justify-center mt-3 space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-teal-600 rounded mr-1"></div>
                <span className="text-xs text-gray-600">Present</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-400 rounded mr-1"></div>
                <span className="text-xs text-gray-600">Absent</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-amber-400 rounded mr-1"></div>
                <span className="text-xs text-gray-600">Late</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBehaviorTab = (selectedChild) => {
    return (
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {selectedChild.behaviorReports.map((report, index) => (
            <div key={index} className={`p-4 ${index < selectedChild.behaviorReports.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <div className="flex justify-between items-start">
                <div className="flex">
                  <div className={`p-2 rounded-full ${getBehaviorTypeColor(report.type)} mr-3`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {report.type === 'Positive' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      ) : report.type === 'Negative' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      )}
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{report.description}</p>
                    <p className="text-xs text-gray-500 mt-1">Reported by: {report.teacher}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">{report.date}</div>
              </div>
            </div>
          ))}
          
          {selectedChild.behaviorReports.length === 0 && (
            <div className="p-6 text-center">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              <p className="text-gray-500">No behavior reports available.</p>
            </div>
          )}
        </div>
      </div>
    );
  };
    return (
    <div className="px-4 py-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Progress Reports</h1>
        <p className="text-gray-600">Track your children's academic performance and attendance</p>
      </header>

      {loading ? (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Child selector */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex flex-wrap gap-3">
                {children.map(child => (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChildId(child.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedChildId === child.id 
                        ? 'bg-teal-600 text-white' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {child.name}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
          
          {/* Tabs */}
          {getSelectedChild() && (
            <>
              <motion.div variants={itemVariants} className="mb-6">
                <div className="bg-white rounded-xl shadow-sm flex border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => setActiveTab('grades')}
                    className={`flex-1 py-3 text-sm font-medium ${activeTab === 'grades' 
                      ? 'text-teal-600 border-b-2 border-teal-600' 
                      : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Grades & Reports
                  </button>
                  <button
                    onClick={() => setActiveTab('attendance')}
                    className={`flex-1 py-3 text-sm font-medium ${activeTab === 'attendance' 
                      ? 'text-teal-600 border-b-2 border-teal-600' 
                      : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Attendance
                  </button>
                  <button
                    onClick={() => setActiveTab('behavior')}
                    className={`flex-1 py-3 text-sm font-medium ${activeTab === 'behavior' 
                      ? 'text-teal-600 border-b-2 border-teal-600' 
                      : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Behavior
                  </button>
                </div>
              </motion.div>
              
              {/* Tab content */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                key={activeTab}
              >
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
                  <div className="flex items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800">
                      {getSelectedChild().name}'s {activeTab === 'grades' ? 'Academic Report' : activeTab === 'attendance' ? 'Attendance Record' : 'Behavior Report'}
                    </h2>
                    <span className="ml-2 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                      {getSelectedChild().grade}
                    </span>
                  </div>
                  
                  {activeTab === 'grades' && renderGradesTab(getSelectedChild())}
                  {activeTab === 'attendance' && renderAttendanceTab(getSelectedChild())}
                  {activeTab === 'behavior' && renderBehaviorTab(getSelectedChild())}

                  <div className="flex justify-end">
                    <button className="px-4 py-2 bg-white border border-gray-300 text-teal-600 rounded-md hover:bg-teal-50 text-sm flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
                      </svg>
                      <span>Download Report</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
