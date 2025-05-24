import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { getAllClasses, getClassesByTutorId } from '../../services/classService';
import { getAllTutes, getTutesByTutorId } from '../../services/tuteService';
import { getAllStudents } from '../../services/studentService';
import { getAllReminders } from '../../services/feeReminderService';
import { getAllRecordingBundles } from '../../services/recordingService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

export default function Home() {
  const [dashboardData, setDashboardData] = useState({
    classes: [],
    tutorials: [],
    students: [],
    reminders: [],
    recordings: []
  });
  const [analytics, setAnalytics] = useState({
    totalClasses: 0,
    totalTutorials: 0,
    totalStudents: 0,
    activeReminders: 0,
    totalRecordings: 0,
    revenueMetrics: {
      totalRevenue: 0,
      averageTutorialPrice: 0,
      highestPricedTutorial: 0
    },
    performanceMetrics: {
      tutorialsThisMonth: 0,
      classesThisWeek: 0,
      pendingReminders: 0
    }
  });
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState({
    revenueChart: null,
    subjectChart: null,
    performanceChart: null,
    monthlyTrends: null
  });

  // Get current user's tutor ID from localStorage or auth context
  const getCurrentTutorId = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.tutorId || user.id;
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const tutorId = getCurrentTutorId();
      
      // Fetch all data concurrently
      const [classesData, tutorialsData, studentsData, remindersData, recordingsData] = await Promise.allSettled([
        tutorId ? getClassesByTutorId(tutorId) : getAllClasses(),
        tutorId ? getTutesByTutorId(tutorId) : getAllTutes(),
        getAllStudents(),
        getAllReminders(),
        getAllRecordingBundles()
      ]);

      const dashboard = {
        classes: classesData.status === 'fulfilled' ? classesData.value : [],
        tutorials: tutorialsData.status === 'fulfilled' ? tutorialsData.value : [],
        students: studentsData.status === 'fulfilled' ? studentsData.value : [],
        reminders: remindersData.status === 'fulfilled' ? remindersData.value : [],
        recordings: recordingsData.status === 'fulfilled' ? recordingsData.value : []
      };

      setDashboardData(dashboard);
      calculateAnalytics(dashboard);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (data) => {
    const { classes, tutorials, students, reminders, recordings } = data;
    
    // Subject Distribution Doughnut Chart
    const subjectDistribution = getSubjectDistribution();
    const subjectChart = {
      labels: subjectDistribution.map(item => item.subject),
      datasets: [{
        data: subjectDistribution.map(item => item.count),
        backgroundColor: [
          '#0891b2', '#059669', '#7c3aed', '#dc2626', '#ea580c',
          '#16a34a', '#2563eb', '#9333ea', '#ca8a04', '#be123c'
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 4
      }]
    };

    // Revenue Bar Chart (mock monthly data)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const revenueData = months.map(() => Math.random() * 1000 + 500);
    const revenueChart = {
      labels: months,
      datasets: [{
        label: 'Monthly Revenue ($)',
        data: revenueData,
        backgroundColor: 'rgba(8, 145, 178, 0.1)',
        borderColor: '#0891b2',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    };

    // Performance Metrics Bar Chart
    const performanceChart = {
      labels: ['Classes', 'Tutorials', 'Students', 'Reminders'],
      datasets: [{
        label: 'Count',
        data: [
          analytics.totalClasses,
          analytics.totalTutorials,
          analytics.totalStudents,
          analytics.activeReminders
        ],
        backgroundColor: [
          'rgba(8, 145, 178, 0.8)',
          'rgba(5, 150, 105, 0.8)',
          'rgba(124, 58, 237, 0.8)',
          'rgba(245, 158, 11, 0.8)'
        ],
        borderColor: [
          '#0891b2',
          '#059669',
          '#7c3aed',
          '#f59e0b'
        ],
        borderWidth: 1,
        borderRadius: 8
      }]
    };

    // Monthly Trends Line Chart
    const trendLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const monthlyTrends = {
      labels: trendLabels,
      datasets: [
        {
          label: 'New Tutorials',
          data: [3, 7, 4, 8],
          borderColor: '#0891b2',
          backgroundColor: 'rgba(8, 145, 178, 0.1)',
          tension: 0.4
        },
        {
          label: 'Active Students',
          data: [15, 22, 18, 25],
          borderColor: '#059669',
          backgroundColor: 'rgba(5, 150, 105, 0.1)',
          tension: 0.4
        }
      ]
    };

    setChartData({
      revenueChart,
      subjectChart,
      performanceChart,
      monthlyTrends
    });
  };

  const calculateAnalytics = (data) => {
    const { classes, tutorials, students, reminders, recordings } = data;
    
    // Revenue calculations
    const tutorialPrices = tutorials
      .map(t => parseFloat(t.price) || 0)
      .filter(price => price > 0);
    
    const totalRevenue = tutorialPrices.reduce((sum, price) => sum + price, 0);
    const averageTutorialPrice = tutorialPrices.length > 0 
      ? totalRevenue / tutorialPrices.length 
      : 0;
    const highestPricedTutorial = tutorialPrices.length > 0 
      ? Math.max(...tutorialPrices) 
      : 0;

    // Time-based metrics
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const tutorialsThisMonth = tutorials.filter(t => {
      const createdDate = new Date(t.createdAt || t.dateCreated || now);
      return createdDate >= thisMonthStart;
    }).length;

    const pendingReminders = reminders.filter(r => {
      const reminderDate = new Date(r.reminderDate);
      return reminderDate <= now && !r.completed;
    }).length;

    setAnalytics({
      totalClasses: classes.length,
      totalTutorials: tutorials.length,
      totalStudents: students.length,
      activeReminders: reminders.length,
      totalRecordings: recordings.length,
      revenueMetrics: {
        totalRevenue,
        averageTutorialPrice,
        highestPricedTutorial
      },
      performanceMetrics: {
        tutorialsThisMonth,
        classesThisWeek: classes.length, // Assuming all classes are recent for demo
        pendingReminders
      }
    });

    // Generate chart data after analytics calculation
    generateChartData(data);
  };

  const getTopPerformingTutorials = () => {
    return dashboardData.tutorials
      .sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0))
      .slice(0, 5);
  };

  const getRecentReminders = () => {
    return dashboardData.reminders
      .sort((a, b) => new Date(b.reminderDate) - new Date(a.reminderDate))
      .slice(0, 5);
  };

  const getSubjectDistribution = () => {
    const subjects = {};
    dashboardData.tutorials.forEach(tutorial => {
      const subject = tutorial.subject || 'Other';
      subjects[subject] = (subjects[subject] || 0) + 1;
    });
    return Object.entries(subjects).map(([subject, count]) => ({ subject, count }));
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true
        }
      }
    }
  };

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  // ...existing animation variants...
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 80 }
    }
  };

  if (error) {
    return (
      <div className="px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Dashboard</h3>
          <p className="text-red-600 mt-1">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 bg-gray-50 min-h-screen">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive overview of your teaching performance</p>
        </div>
        
        {/* Date Range Filter */}
        <div className="flex gap-3 items-center">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500"
          />
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700"
          >
            Refresh
          </button>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* Enhanced Primary Metrics with Progress Rings */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-cyan-50 to-sky-100 rounded-xl shadow-lg p-6 border border-sky-200 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Total Classes</h3>
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">{analytics.totalClasses}</p>
              <p className="text-sm text-gray-600 mt-1">Active classes</p>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-cyan-600 h-2 rounded-full transition-all duration-1000" style={{ width: '75%' }}></div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl shadow-lg p-6 border border-emerald-200 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Tutorials</h3>
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"></svg>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">{analytics.totalTutorials}</p>
              <p className="text-sm text-gray-600 mt-1">{analytics.performanceMetrics.tutorialsThisMonth} this month</p>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-emerald-600 h-2 rounded-full transition-all duration-1000" style={{ width: '60%' }}></div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-xl shadow-lg p-6 border border-purple-200 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Total Revenue</h3>
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                    </svg>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">${analytics.revenueMetrics.totalRevenue.toFixed(2)}</p>
              <p className="text-sm text-gray-600 mt-1">Avg: ${analytics.revenueMetrics.averageTutorialPrice.toFixed(2)}</p>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full transition-all duration-1000" style={{ width: '85%' }}></div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-yellow-100 rounded-xl shadow-lg p-6 border border-amber-200 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Pending Reminders</h3>
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                  </div>
                  {analytics.performanceMetrics.pendingReminders > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-bounce"></div>
                  )}
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">{analytics.performanceMetrics.pendingReminders}</p>
              <p className="text-sm text-gray-600 mt-1">Need attention</p>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-amber-600 h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.min((analytics.performanceMetrics.pendingReminders / 10) * 100, 100)}%` }}></div>
              </div>
            </div>
          </motion.div>

          {/* Charts Section */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Subject Distribution Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Subject Distribution</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Active</span>
                </div>
              </div>
              <div className="h-64">
                {chartData.subjectChart && (
                  <Doughnut data={chartData.subjectChart} options={chartOptions} />
                )}
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  {getSubjectDistribution().length} different subjects
                </p>
              </div>
            </div>

            {/* Performance Overview */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Performance Overview</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Live</span>
                </div>
              </div>
              <div className="h-64">
                {chartData.performanceChart && (
                  <Bar data={chartData.performanceChart} options={barChartOptions} />
                )}
              </div>
            </div>
          </motion.div>

          {/* Revenue and Trends Charts */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Trends */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Revenue Trends</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-green-600 font-medium">↗ +12.5%</span>
                </div>
              </div>
              <div className="h-64">
                {chartData.revenueChart && (
                  <Line data={chartData.revenueChart} options={lineChartOptions} />
                )}
              </div>
            </div>

            {/* Monthly Activity */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Monthly Activity</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-blue-600 font-medium">This Month</span>
                </div>
              </div>
              <div className="h-64">
                {chartData.monthlyTrends && (
                  <Line data={chartData.monthlyTrends} options={lineChartOptions} />
                )}
              </div>
            </div>
          </motion.div>

          {/* Enhanced Quick Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Students</p>
                  <p className="text-2xl font-bold">{analytics.totalStudents}</p>
                </div>
                <div className="text-blue-100">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Recording Bundles</p>
                  <p className="text-2xl font-bold">{analytics.totalRecordings}</p>
                </div>
                <div className="text-green-100">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Highest Price</p>
                  <p className="text-2xl font-bold">${analytics.revenueMetrics.highestPricedTutorial.toFixed(0)}</p>
                </div>
                <div className="text-purple-100">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Active Reminders</p>
                  <p className="text-2xl font-bold">{analytics.activeReminders}</p>
                </div>
                <div className="text-orange-100">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Top Performing Tutorials */}
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Top Performing Tutorials</h2>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getTopPerformingTutorials().map((tutorial) => (
                      <tr key={tutorial.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{tutorial.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-cyan-100 text-cyan-800 rounded-full">
                            {tutorial.subject}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">${parseFloat(tutorial.price || 0).toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            tutorial.isPublished 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {tutorial.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-cyan-600 hover:text-cyan-900 mr-3">Edit</button>
                          <button className="text-gray-600 hover:text-gray-900">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Recent Reminders with better styling */}
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Fee Reminders</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getRecentReminders().map((reminder, index) => (
                <motion.div 
                  key={reminder.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-cyan-500 hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-800 flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      {reminder.student?.firstName} {reminder.student?.lastName}
                    </h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {new Date(reminder.reminderDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">
                    {reminder.message || 'Fee payment reminder'}
                  </p>
                  <div className="flex justify-end gap-2">
                    <button className="px-3 py-1 text-xs bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-md hover:from-gray-200 hover:to-gray-300 transition-all">
                      Mark Complete
                    </button>
                    <button className="px-3 py-1 text-xs bg-gradient-to-r from-cyan-100 to-cyan-200 text-cyan-700 rounded-md hover:from-cyan-200 hover:to-cyan-300 transition-all">
                      Edit
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
