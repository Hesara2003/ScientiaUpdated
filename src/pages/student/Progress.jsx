import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title
);

export default function Progress() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Sample data - in a real app this would come from an API
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // Simulating API call with setTimeout
    setTimeout(() => {
      setCourses([
        { 
          id: 1, 
          name: "Advanced Mathematics", 
          grade: "B+",
          percentage: 88,
          assessments: [
            { name: "Quiz 1", score: 92, maxScore: 100 },
            { name: "Midterm", score: 85, maxScore: 100 },
            { name: "Assignment 1", score: 88, maxScore: 100 },
            { name: "Quiz 2", score: 90, maxScore: 100 }
          ],
          grades: [
            { month: "January", grade: 82 },
            { month: "February", grade: 85 },
            { month: "March", grade: 87 },
            { month: "April", grade: 90 },
            { month: "May", grade: 88 }
          ]
        },
        { 
          id: 2, 
          name: "Physics 101", 
          grade: "B",
          percentage: 84,
          assessments: [
            { name: "Lab Report 1", score: 80, maxScore: 100 },
            { name: "Quiz 1", score: 78, maxScore: 100 },
            { name: "Midterm", score: 85, maxScore: 100 },
            { name: "Lab Report 2", score: 88, maxScore: 100 }
          ],
          grades: [
            { month: "January", grade: 79 },
            { month: "February", grade: 81 },
            { month: "March", grade: 83 },
            { month: "April", grade: 85 },
            { month: "May", grade: 84 }
          ]
        },
        { 
          id: 3, 
          name: "English Literature", 
          grade: "A",
          percentage: 92,
          assessments: [
            { name: "Essay 1", score: 90, maxScore: 100 },
            { name: "Class Participation", score: 95, maxScore: 100 },
            { name: "Midterm Paper", score: 92, maxScore: 100 },
            { name: "Presentation", score: 94, maxScore: 100 }
          ],
          grades: [
            { month: "January", grade: 90 },
            { month: "February", grade: 91 },
            { month: "March", grade: 93 },
            { month: "April", grade: 94 },
            { month: "May", grade: 92 }
          ]
        }
      ]);
      setLoading(false);
    }, 800);
  }, []);

  // Prepare data for Overall Performance chart
  const overallPerformanceData = {
    labels: courses.map(course => course.name),
    datasets: [
      {
        label: 'Current Grade (%)',
        data: courses.map(course => course.percentage),
        backgroundColor: [
          'rgba(79, 70, 229, 0.6)',  // indigo-600 with opacity
          'rgba(124, 58, 237, 0.6)', // purple-600 with opacity
          'rgba(55, 48, 163, 0.6)',  // indigo-800 with opacity
        ],
        borderColor: [
          'rgba(79, 70, 229, 1)',    // indigo-600
          'rgba(124, 58, 237, 1)',   // purple-600
          'rgba(55, 48, 163, 1)',    // indigo-800
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for Progress Over Time chart
  const progressOverTimeData = {
    labels: ['January', 'February', 'March', 'April', 'May'],
    datasets: courses.map((course, index) => ({
      label: course.name,
      data: course.grades.map(grade => grade.grade),
      fill: false,
      backgroundColor: index === 0 ? 'rgb(79, 70, 229)' : 
                      index === 1 ? 'rgb(124, 58, 237)' : 'rgb(55, 48, 163)',
      borderColor: index === 0 ? 'rgba(79, 70, 229, 0.8)' : 
                  index === 1 ? 'rgba(124, 58, 237, 0.8)' : 'rgba(55, 48, 163, 0.8)',
      tension: 0.1
    }))
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

  const handleTabChange = (index) => {
    setTabValue(index);
  };

  return (
    <div className="px-4 py-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">My Academic Progress</h1>
        <p className="text-gray-600">View your grades and performance across all courses</p>
      </header>

      {loading ? (
        <div>
          {/* Summary Cards Loading State */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            ))}
          </div>
          
          {/* Chart Loading State */}
          <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse mb-8">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Course Performance Summary */}
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Course Performance Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">{course.name}</h3>
                  
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Current Grade</span>
                    <span className={`font-semibold ${
                      course.grade.startsWith('A') ? 'text-green-600' : 
                      course.grade.startsWith('B') ? 'text-indigo-600' : 
                      course.grade.startsWith('C') ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {course.grade} ({course.percentage}%)
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className={`h-2 rounded-full ${
                        course.percentage >= 90 ? 'bg-green-600' : 
                        course.percentage >= 80 ? 'bg-indigo-600' : 
                        course.percentage >= 70 ? 'bg-amber-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${course.percentage}%` }}
                    ></div>
                  </div>
                  
                  <div className="border-t border-gray-100 my-3 pt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Assessments</h4>
                    
                    {course.assessments.slice(-2).map((assessment, index) => (
                      <div key={index} className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">{assessment.name}</span>
                        <span className="text-sm">
                          {assessment.score}/{assessment.maxScore} 
                          ({Math.round((assessment.score / assessment.maxScore) * 100)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* Progress Analysis */}
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Progress Analysis</h2>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button 
                  onClick={() => handleTabChange(0)} 
                  className={`px-4 py-3 text-sm font-medium ${tabValue === 0 
                    ? 'text-indigo-600 border-b-2 border-indigo-600' 
                    : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Overall Performance
                </button>
                <button 
                  onClick={() => handleTabChange(1)} 
                  className={`px-4 py-3 text-sm font-medium ${tabValue === 1 
                    ? 'text-indigo-600 border-b-2 border-indigo-600' 
                    : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Progress Over Time
                </button>
                <button 
                  onClick={() => handleTabChange(2)} 
                  className={`px-4 py-3 text-sm font-medium ${tabValue === 2 
                    ? 'text-indigo-600 border-b-2 border-indigo-600' 
                    : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Assessment Breakdown
                </button>
              </div>
              
              {/* Tab Content */}
              <div className="p-6">
                {tabValue === 0 && (
                  <div className="h-80">
                    <Bar 
                      data={overallPerformanceData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                          title: {
                            display: true,
                            text: 'Overall Course Performance'
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100
                          }
                        }
                      }} 
                    />
                  </div>
                )}
                
                {tabValue === 1 && (
                  <div className="h-80">
                    <Line 
                      data={progressOverTimeData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                          title: {
                            display: true,
                            text: 'Grade Progress Over Time'
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: false,
                            min: 60,
                            max: 100
                          }
                        }
                      }} 
                    />
                  </div>
                )}
                
                {tabValue === 2 && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assessment</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Out Of</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {courses.map((course) => (
                          course.assessments.map((assessment, index) => (
                            <tr key={`${course.id}-${index}`} className="hover:bg-gray-50">
                              {index === 0 && (
                                <td rowSpan={course.assessments.length} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {course.name}
                                </td>
                              )}
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assessment.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{assessment.score}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{assessment.maxScore}</td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                                (assessment.score / assessment.maxScore) * 100 >= 90 ? 'text-green-600' : 
                                (assessment.score / assessment.maxScore) * 100 >= 80 ? 'text-indigo-600' : 
                                (assessment.score / assessment.maxScore) * 100 >= 70 ? 'text-amber-600' : 'text-red-600'
                              }`}>
                                {Math.round((assessment.score / assessment.maxScore) * 100)}%
                              </td>
                            </tr>
                          ))
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
