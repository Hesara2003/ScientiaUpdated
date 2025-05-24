import { useState, useEffect } from "react";
import axios from "axios";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell
} from "recharts";
import { format } from "date-fns";

// Import all the API services
import { getAllFees } from "../../services/feeService";
import { getAllAttendanceRecords } from "../../services/attendanceService";
import { getAllTutors } from "../../services/tutorService";
import { getAllClasses } from "../../services/classService";
import { getAllStudents } from "../../services/studentService";
import { getAllExams } from "../../services/examService";
import { getAllSubjects } from "../../services/subjectService";

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [tutorsData, setTutorsData] = useState([]);
  const [classesData, setClassesData] = useState([]);
  const [studentsData, setStudentsData] = useState([]);
  const [examsData, setExamsData] = useState([]);
  const [subjectsData, setSubjectsData] = useState([]);
  
  const [dateRange, setDateRange] = useState('year'); // Options: 'month', 'quarter', 'year', 'all'
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [summaryStats, setSummaryStats] = useState({
    totalRevenue: 0,
    avgAttendance: 0,
    growthRate: 12.5,
    totalStudents: 0,
    totalTutors: 0,
    totalClasses: 0,
    avgTutorRating: 0
  });  // Theme colors
  const THEME = {
    primary: '#4F46E5',    // Indigo
    secondary: '#10B981',  // Emerald
    info: '#3B82F6',       // Blue
    success: '#10B981',    // Green
    warning: '#F59E0B',    // Amber
    light: '#F3F4F6',      // Gray-100
    dark: '#1F2937',       // Gray-800
    accent: '#8B5CF6',     // Purple
    danger: '#EF4444'      // Red
  };
  
  // Colors for pie charts and other visualizations
  const COLORS = ['#4F46E5', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];
  
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching analytics data from APIs...');
        
        // Fetch all data in parallel
        const [
          feesResponse,
          attendanceResponse,
          tutorsResponse,
          classesResponse,
          studentsResponse,
          examsResponse,
          subjectsResponse
        ] = await Promise.allSettled([
          getAllFees(),
          getAllAttendanceRecords(),
          getAllTutors(),
          getAllClasses(),
          getAllStudents(),
          getAllExams(),
          getAllSubjects()
        ]);

        // Process fees data for revenue chart
        const fees = feesResponse.status === 'fulfilled' ? feesResponse.value : [];
        console.log('Fetched fees:', fees);
        const processedRevenueData = processFeesForRevenue(fees);
        setRevenueData(processedRevenueData);

        // Process attendance data
        const attendance = attendanceResponse.status === 'fulfilled' ? attendanceResponse.value : [];
        console.log('Fetched attendance:', attendance);
        const processedAttendanceData = processAttendanceData(attendance);
        setAttendanceData(processedAttendanceData);

        // Set other data
        const tutors = tutorsResponse.status === 'fulfilled' ? tutorsResponse.value : [];
        const classes = classesResponse.status === 'fulfilled' ? classesResponse.value : [];
        const students = studentsResponse.status === 'fulfilled' ? studentsResponse.value : [];
        const exams = examsResponse.status === 'fulfilled' ? examsResponse.value : [];
        const subjects = subjectsResponse.status === 'fulfilled' ? subjectsResponse.value : [];

        setTutorsData(tutors);
        setClassesData(classes);
        setStudentsData(students);
        setExamsData(exams);
        setSubjectsData(subjects);

        // Calculate summary statistics
        const totalRevenue = fees.reduce((sum, fee) => sum + (parseFloat(fee.amount) || 0), 0);
        const avgAttendance = calculateAverageAttendance(attendance);
        const avgTutorRating = calculateAverageTutorRating(tutors);

        setSummaryStats({
          totalRevenue,
          avgAttendance,
          growthRate: 12.5, // Could be calculated from historical data
          totalStudents: students.length,
          totalTutors: tutors.length,
          totalClasses: classes.length,
          avgTutorRating
        });

        console.log('Analytics data loaded successfully');
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError("Failed to load analytics data. Please try refreshing the page.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [dateRange]);

  // Helper function to process fees data for revenue chart
  const processFeesForRevenue = (fees) => {
    if (!fees || !Array.isArray(fees)) return [];
    
    // Group fees by month
    const monthlyRevenue = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize all months with 0
    months.forEach(month => {
      monthlyRevenue[month] = 0;
    });
    
    fees.forEach(fee => {
      if (fee.dueDate && fee.status?.toLowerCase() === 'paid') {
        const date = new Date(fee.dueDate);
        const month = months[date.getMonth()];
        monthlyRevenue[month] += parseFloat(fee.amount) || 0;
      }
    });
    
    return months.map(month => ({
      month,
      value: monthlyRevenue[month]
    }));
  };

  // Helper function to process attendance data
  const processAttendanceData = (attendance) => {
    if (!attendance || !Array.isArray(attendance)) return [];
    
    // Group attendance by subject/class
    const subjectAttendance = {};
    
    attendance.forEach(record => {
      const subject = record.className || record.subject || 'Unknown';
      if (!subjectAttendance[subject]) {
        subjectAttendance[subject] = { total: 0, present: 0 };
      }
      subjectAttendance[subject].total++;
      if (record.status?.toLowerCase() === 'present') {
        subjectAttendance[subject].present++;
      }
    });
    
    return Object.entries(subjectAttendance).map(([subject, data]) => ({
      subject,
      attendance: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0
    }));
  };

  // Helper function to calculate average attendance
  const calculateAverageAttendance = (attendance) => {
    if (!attendance || !Array.isArray(attendance) || attendance.length === 0) return 0;
    
    const presentCount = attendance.filter(record => record.status?.toLowerCase() === 'present').length;
    return Math.round((presentCount / attendance.length) * 100);
  };

  // Helper function to calculate average tutor rating
  const calculateAverageTutorRating = (tutors) => {
    if (!tutors || !Array.isArray(tutors) || tutors.length === 0) return 0;
    
    const ratingsSum = tutors.reduce((sum, tutor) => {
      const rating = parseFloat(tutor.rating) || 4.5; // Default rating
      return sum + rating;
    }, 0);
    
    return (ratingsSum / tutors.length).toFixed(1);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const getColorByValue = (value, max = 100) => {
    if (value >= max * 0.8) return '#10B981'; 
    if (value >= max * 0.6) return '#F59E0B';
    return '#EF4444'; 
  };
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-indigo-50 to-blue-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
        <h3 className="mt-4 text-lg font-medium text-indigo-700">Loading Analytics...</h3>
        <p className="text-sm text-gray-500 mt-2">Preparing your dashboard</p>
      </div>
    );
  }
  // Handle date range change
  const handleDateRangeChange = (range) => {
    setDateRange(range);
    setIsFilterOpen(false);
    // In a real app, you would fetch new data based on the selected range
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 bg-gray-50 min-h-screen">
      {/* Dashboard Header */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
              <p className="text-gray-500">Comprehensive view of your institution's metrics</p>
            </div>
          </div>
        </div>
        
        {/* Date Range Filter */}
        <div className="mt-4 md:mt-0 relative">
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-500">
              {dateRange === 'month' && 'Last 30 days'}
              {dateRange === 'quarter' && 'Last 90 days'}
              {dateRange === 'year' && 'Last 12 months'}
              {dateRange === 'all' && 'All time'}
              <span className="text-xs ml-1">
                ({format(new Date(), 'MMM d, yyyy')})
              </span>
            </div>
            <button 
              className="bg-white border border-gray-300 rounded-md px-3 py-1.5 flex items-center text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-1 1v12a2 2 0 002 2z" />
              </svg>
              Date Range
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          {/* Dropdown Menu */}
          {isFilterOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg p-1 z-10">
              <button 
                className={`block w-full text-left px-4 py-2.5 text-sm rounded-md ${dateRange === 'month' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-100'}`}
                onClick={() => handleDateRangeChange('month')}
              >
                Last 30 days
              </button>
              <button 
                className={`block w-full text-left px-4 py-2.5 text-sm rounded-md ${dateRange === 'quarter' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-100'}`}
                onClick={() => handleDateRangeChange('quarter')}
              >
                Last 90 days
              </button>
              <button 
                className={`block w-full text-left px-4 py-2.5 text-sm rounded-md ${dateRange === 'year' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-100'}`}
                onClick={() => handleDateRangeChange('year')}
              >
                Last 12 months
              </button>
              <button 
                className={`block w-full text-left px-4 py-2.5 text-sm rounded-md ${dateRange === 'all' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-100'}`}
                onClick={() => handleDateRangeChange('all')}
              >
                All time
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Dashboard Tabs - could be expanded for multi-view dashboard */}
      <div className="flex mb-6 overflow-x-auto">
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
          Overview
        </button>
        <button className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md flex items-center mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Finance
        </button>
        <button className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md flex items-center mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Students
        </button>
        <button className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Courses
        </button>
      </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-8">
        {/* Revenue Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Revenue</div>
            <div className="bg-indigo-100 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline mb-2">
            <div className="text-2xl font-bold text-gray-800">{formatCurrency(summaryStats.totalRevenue)}</div>
            <div className="ml-2 bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              12%
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <span className="text-xs text-gray-500 ml-2">75%</span>
          </div>
        </div>
        
        {/* Attendance Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Avg. Attendance</div>
            <div className="bg-green-100 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline mb-2">
            <div className="text-2xl font-bold text-gray-800">{summaryStats.avgAttendance}%</div>
            <div className="ml-2 bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              5%
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${Math.min(summaryStats.avgAttendance, 100)}%` }}></div>
            </div>
            <span className="text-xs text-gray-500 ml-2">{summaryStats.avgAttendance}%</span>
          </div>
        </div>
        
        {/* Performance Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Avg. Performance</div>
            <div className="bg-blue-100 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>          </div>
          <div className="flex items-baseline mb-2">
            <div className="text-2xl font-bold text-gray-800">78.5%</div>
            <div className="ml-2 bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              3%
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `78.5%` }}></div>
            </div>
            <span className="text-xs text-gray-500 ml-2">78.5%</span>
          </div>
        </div>
        
        {/* Active Students Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Students</div>
            <div className="bg-purple-100 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline mb-2">
            <div className="text-2xl font-bold text-gray-800">{summaryStats.totalStudents}</div>
            <div className="ml-2 bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              8%
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full mt-2">
            <div className="flex items-center">
              <div className="flex space-x-0.5 w-full">
                {[...Array(10)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 flex-1 rounded-full ${i < 8 ? 'bg-purple-500' : 'bg-gray-300'}`}
                  ></div>
                ))}
              </div>
              <span className="text-xs text-gray-500 ml-2">80%</span>
            </div>
          </div>
        </div>
        
        {/* Total Classes Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Classes</div>
            <div className="bg-yellow-100 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline mb-2">
            <div className="text-2xl font-bold text-gray-800">{summaryStats.totalClasses}</div>
            <div className="ml-2 bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full">
              +{Math.max(0, summaryStats.totalClasses - 4)} new
            </div>
          </div>
          <div className="mt-2 flex space-x-1">
            {[...Array(Math.min(6, summaryStats.totalClasses))].map((_, i) => (
              <div 
                key={i} 
                className="h-5 w-2 bg-yellow-400 rounded-sm"
                style={{ height: `${20 + Math.random() * 15}px` }}
              ></div>
            ))}
          </div>
        </div>
        
        {/* Tutor Rating Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Avg Tutor Rating</div>
            <div className="bg-red-100 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline mb-2">
            <div className="text-2xl font-bold text-gray-800">{summaryStats.avgTutorRating}</div>
            <div className="text-sm text-gray-500 ml-1">/5.0</div>
            <div className="ml-2 bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              0.2
            </div>
          </div>
          <div className="flex mt-1.5">
            {[...Array(5)].map((_, i) => (
              <svg 
                key={i}
                className={`h-4 w-4 ${i < Math.floor(summaryStats.avgTutorRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <div className="text-xs text-gray-500 ml-2 mt-0.5">({summaryStats.totalTutors} tutors)</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Revenue Trend</h2>
              <p className="text-sm text-gray-500">Monthly revenue performance</p>
            </div>
            <div className="flex space-x-2">
              <div className="rounded-md bg-indigo-50 p-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="rounded-md bg-gray-100 p-1.5 hover:bg-gray-200 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-b from-indigo-50/30 to-white p-4 rounded-xl">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={THEME.primary} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                <XAxis dataKey="month" tick={{ fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} />
                <YAxis tickFormatter={(value) => `$${value}`} tick={{ fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  }}
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                  labelStyle={{ color: '#374151', fontWeight: '500' }}
                />
                <Legend iconType="circle" />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  name="Revenue" 
                  stroke={THEME.primary} 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  activeDot={{ r: 6, stroke: THEME.primary, strokeWidth: 2, fill: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-between text-xs text-gray-500">
            <div>Total Annual Revenue: {formatCurrency(summaryStats.totalRevenue)}</div>
            <div className="text-green-600 font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              {summaryStats.growthRate}% YoY Growth
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Test Performance</h2>
              <p className="text-sm text-gray-500">Student score distribution</p>
            </div>
            <div className="flex space-x-2">
              <div className="rounded-md bg-blue-50 p-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="rounded-md bg-gray-100 p-1.5 hover:bg-gray-200 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </div>
            </div>
          </div>          <div className="bg-gradient-to-b from-blue-50/30 to-white p-4 rounded-xl">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'Test 1', average: 75, highest: 98, lowest: 45 },
                { name: 'Test 2', average: 68, highest: 95, lowest: 40 },
                { name: 'Midterm', average: 72, highest: 99, lowest: 52 },
                { name: 'Test 3', average: 78, highest: 97, lowest: 58 },
                { name: 'Final', average: 82, highest: 100, lowest: 60 }
              ]} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} />
                <YAxis tick={{ fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  }}
                  formatter={(value) => [`${value}%`, null]}
                  labelStyle={{ color: '#374151', fontWeight: '500' }}
                />
                <Legend iconType="circle" verticalAlign="top" height={36} />
                <Bar
                  dataKey="highest"
                  name="Highest Score"
                  fill={THEME.secondary}
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
                <Bar
                  dataKey="average"
                  name="Average Score"
                  fill={THEME.primary}
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
                <Bar
                  dataKey="lowest"
                  name="Lowest Score"
                  fill={THEME.danger}
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="border border-gray-100 rounded-md p-2 text-center">
              <p className="text-xs text-gray-500">Average</p>
              <p className="text-lg font-bold text-indigo-600">75.0%</p>
            </div>
            <div className="border border-gray-100 rounded-md p-2 text-center">
              <p className="text-xs text-gray-500">Highest</p>
              <p className="text-lg font-bold text-green-600">100%</p>
            </div>
            <div className="border border-gray-100 rounded-md p-2 text-center">
              <p className="text-xs text-gray-500">Lowest</p>
              <p className="text-lg font-bold text-red-600">40%</p>
            </div>
          </div>
        </div>
      </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Revenue Trend</h2>
              <p className="text-sm text-gray-500">Monthly revenue performance</p>
            </div>
            <div className="flex space-x-2">
              <div className="rounded-md bg-indigo-50 p-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="rounded-md bg-gray-100 p-1.5 hover:bg-gray-200 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-b from-indigo-50/30 to-white p-4 rounded-xl">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={THEME.primary} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                <XAxis dataKey="month" tick={{ fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} />
                <YAxis tickFormatter={(value) => `$${value}`} tick={{ fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  }}
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                  labelStyle={{ color: '#374151', fontWeight: '500' }}
                />
                <Legend iconType="circle" />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  name="Revenue" 
                  stroke={THEME.primary} 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  activeDot={{ r: 6, stroke: THEME.primary, strokeWidth: 2, fill: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-between text-xs text-gray-500">
            <div>Total Annual Revenue: {formatCurrency(summaryStats.totalRevenue)}</div>
            <div className="text-green-600 font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              {summaryStats.growthRate}% YoY Growth
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Test Performance</h2>
              <p className="text-sm text-gray-500">Student score distribution</p>
            </div>
            <div className="flex space-x-2">
              <div className="rounded-md bg-blue-50 p-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="rounded-md bg-gray-100 p-1.5 hover:bg-gray-200 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </div>
            </div>
          </div>          <div className="bg-gradient-to-b from-blue-50/30 to-white p-4 rounded-xl">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'Test 1', average: 75, highest: 98, lowest: 45 },
                { name: 'Test 2', average: 68, highest: 95, lowest: 40 },
                { name: 'Midterm', average: 72, highest: 99, lowest: 52 },
                { name: 'Test 3', average: 78, highest: 97, lowest: 58 },
                { name: 'Final', average: 82, highest: 100, lowest: 60 }
              ]} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} />
                <YAxis tick={{ fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  }}
                  formatter={(value) => [`${value}%`, null]}
                  labelStyle={{ color: '#374151', fontWeight: '500' }}
                />
                <Legend iconType="circle" verticalAlign="top" height={36} />
                <Bar
                  dataKey="highest"
                  name="Highest Score"
                  fill={THEME.secondary}
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
                <Bar
                  dataKey="average"
                  name="Average Score"
                  fill={THEME.primary}
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
                <Bar
                  dataKey="lowest"
                  name="Lowest Score"
                  fill={THEME.danger}
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="border border-gray-100 rounded-md p-2 text-center">
              <p className="text-xs text-gray-500">Average</p>
              <p className="text-lg font-bold text-indigo-600">75.0%</p>
            </div>
            <div className="border border-gray-100 rounded-md p-2 text-center">
              <p className="text-xs text-gray-500">Highest</p>
              <p className="text-lg font-bold text-green-600">100%</p>
            </div>
            <div className="border border-gray-100 rounded-md p-2 text-center">
              <p className="text-xs text-gray-500">Lowest</p>
              <p className="text-lg font-bold text-red-600">40%</p>
            </div>
          </div>
        </div>
      </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Revenue Trend</h2>
              <p className="text-sm text-gray-500">Monthly revenue performance</p>
            </div>
            <div className="flex space-x-2">
              <div className="rounded-md bg-indigo-50 p-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="rounded-md bg-gray-100 p-1.5 hover:bg-gray-200 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-b from-indigo-50/30 to-white p-4 rounded-xl">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={THEME.primary} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                <XAxis dataKey="month" tick={{ fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} />
                <YAxis tickFormatter={(value) => `$${value}`} tick={{ fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  }}
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                  labelStyle={{ color: '#374151', fontWeight: '500' }}
                />
                <Legend iconType="circle" />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  name="Revenue" 
                  stroke={THEME.primary} 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  activeDot={{ r: 6, stroke: THEME.primary, strokeWidth: 2, fill: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-between text-xs text-gray-500">
            <div>Total Annual Revenue: {formatCurrency(summaryStats.totalRevenue)}</div>
            <div className="text-green-600 font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              {summaryStats.growthRate}% YoY Growth
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Test Performance</h2>
              <p className="text-sm text-gray-500">Student score distribution</p>
            </div>
            <div className="flex space-x-2">
              <div className="rounded-md bg-blue-50 p-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="rounded-md bg-gray-100 p-1.5 hover:bg-gray-200 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </div>
            </div>
          </div>          <div className="bg-gradient-to-b from-blue-50/30 to-white p-4 rounded-xl">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'Test 1', average: 75, highest: 98, lowest: 45 },
                { name: 'Test 2', average: 68, highest: 95, lowest: 40 },
                { name: 'Midterm', average: 72, highest: 99, lowest: 52 },
                { name: 'Test 3', average: 78, highest: 97, lowest: 58 },
                { name: 'Final', average: 82, highest: 100, lowest: 60 }
              ]} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} />
                <YAxis tick={{ fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  }}
                  formatter={(value) => [`${value}%`, null]}
                  labelStyle={{ color: '#374151', fontWeight: '500' }}
                />
                <Legend iconType="circle" verticalAlign="top" height={36} />
                <Bar
                  dataKey="highest"
                  name="Highest Score"
                  fill={THEME.secondary}
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
                <Bar
                  dataKey="average"
                  name="Average Score"
                  fill={THEME.primary}
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
                <Bar
                  dataKey="lowest"
                  name="Lowest Score"
                  fill={THEME.danger}
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="border border-gray-100 rounded-md p-2 text-center">
              <p className="text-xs text-gray-500">Average</p>
              <p className="text-lg font-bold text-indigo-600">75.0%</p>
            </div>
            <div className="border border-gray-100 rounded-md p-2 text-center">
              <p className="text-xs text-gray-500">Highest</p>
              <p className="text-lg font-bold text-green-600">100%</p>
            </div>
            <div className="border border-gray-100 rounded-md p-2 text-center">
              <p className="text-xs text-gray-500">Lowest</p>
              <p className="text-lg font-bold text-red-600">40%</p>
            </div>
          </div>
        </div>
      </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Revenue Trend</h2>
              <p className="text-sm text-gray-500">Monthly revenue performance</p>
            </div>
            <div className="flex space-x-2">
              <div className="rounded-md bg-indigo-50 p-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="rounded-md bg-gray-100 p-1.5 hover:bg-gray-200 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2  0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-b from-indigo-50/30 to-white p-4 rounded-xl">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={THEME.primary} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                <XAxis dataKey="month" tick={{ fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} />
                <YAxis tickFormatter={(value) => `$${value}`} tick={{ fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  }}
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                  labelStyle={{ color: '#374151', fontWeight: '500' }}
                />
                <Legend iconType="circle" />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  name="Revenue" 
                  stroke={THEME.primary} 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  activeDot={{ r: 6, stroke: THEME.primary, strokeWidth: 2, fill: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-between text-xs text-gray-500">
            <div>Total Annual Revenue: {formatCurrency(summaryStats.totalRevenue)}</div>
            <div className="text-green-600 font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              {summaryStats.growthRate}% YoY Growth
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Test Performance</h2>
              <p className="text-sm text-gray-500">Student score distribution</p>
            </div>
            <div className="flex space-x-2">
              <div className="rounded-md bg-blue-50 p-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="rounded-md bg-gray-100 p-1.5 hover:bg-gray-200 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </div>
            </div>
          </div>          <div className="bg-gradient-to-b from-blue-50/30 to-white p-4 rounded-xl">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'Test 1', average: 75, highest: 98, lowest: 45 },
                { name: 'Test 2', average: 68, highest: 95, lowest: 40 },
                { name: 'Midterm', average: 72, highest: 99, lowest: 52 },
                { name: 'Test 3', average: 78, highest: 97, lowest: 58 },
                { name: 'Final', average: 82, highest: 100, lowest: 60 }
              ]} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} />
                <YAxis tick={{ fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  }}
                  formatter={(value) => [`${value}%`, null]}
                  labelStyle={{ color: '#374151', fontWeight: '500' }}
                />
                <Legend iconType="circle" verticalAlign="top" height={36} />
                <Bar
                  dataKey="highest"
                  name="Highest Score"
                  fill={THEME.secondary}
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
                <Bar
                  dataKey="average"
                  name="Average Score"
                  fill={THEME.primary}
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
                <Bar
                  dataKey="lowest"
                  name="Lowest Score"
                  fill={THEME.danger}
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="border border-gray-100 rounded-md p-2 text-center">
              <p className="text-xs text-gray-500">Average</p>
              <p className="text-lg font-bold text-indigo-600">75.0%</p>
            </div>
            <div className="border border-gray-100 rounded-md p-2 text-center">
              <p className="text-xs text-gray-500">Highest</p>
              <p className="text-lg font-bold text-green-600">100%</p>
            </div>
            <div className="border border-gray-100 rounded-md p-2 text-center">
              <p className="text-xs text-gray-500">Lowest</p>
              <p className="text-lg font-bold text-red-600">40%</p>
            </div>
          </div>
        </div>
      </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Revenue Trend</h2>
              <p className="text-sm text-gray-500">Monthly revenue performance</p>
            </div>
            <div className="flex space-x-2">
              <div className="rounded-md bg-indigo-50 p-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="rounded-md bg-gray-100 p-1.5 hover:bg-gray-200 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-b from-indigo-50/30 to-white p-4 rounded-xl">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={THEME.primary} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                <XAxis dataKey="month" tick={{ fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} />
                <YAxis tickFormatter={(value) => `$${value}`} tick={{ fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  }}
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                  labelStyle={{ color: '#374151', fontWeight: '500' }}
                />
                <Legend iconType="circle" />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  name="Revenue" 
                  stroke={THEME.primary} 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  activeDot={{ r: 6, stroke: THEME.primary, strokeWidth: 2, fill: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-between text-xs text-gray-500">
            <div>Total Annual Revenue: {formatCurrency(summaryStats.totalRevenue)}</div>
            <div className="text-green-600 font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              {summaryStats.growthRate}% YoY Growth
            </div>
          </div>
        </div>
        
        {/* Classes Available Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Available Classes</h2>
              <p className="text-sm text-gray-500">Currently active classes in the system</p>
            </div>
            <div className="bg-indigo-100 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {classesData.length > 0 ? (
              classesData.slice(0, 6).map((cls, idx) => {
                // Find the tutor for this class
                const tutor = tutorsData.find(t => t.tutorId === cls.tutor?.tutorId) || cls.tutor || {};
                
                // Format tutor name
                const tutorName = tutor.firstName && tutor.lastName 
                  ? `${tutor.firstName} ${tutor.lastName}`
                  : tutor.name || tutor.tutorName || 'Unassigned';
                
                return (
                  <div key={cls.classId || idx} className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all duration-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{cls.className || cls.name}</h4>
                        <p className="text-sm text-indigo-600 font-medium">{cls.description || 'No description'}</p>
                      </div>
                      <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                        Active
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        ${cls.price || '0'}
                      </div>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {tutorName}
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                        View Details
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 text-center py-8 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p>No classes found</p>
                <button className="mt-2 text-indigo-600 text-sm hover:text-indigo-800">
                  Add a new class
                </button>
              </div>
            )}
          </div>
          
          {classesData.length > 0 && (
            <div className="mt-4 flex justify-between">
              <div className="text-sm text-gray-500">
                Showing {Math.min(6, classesData.length)} of {classesData.length} classes
              </div>
              <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                View All Classes
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Error Message - Moved outside the grid layout */}
      {error && (
        <div className="mt-4 p-4 rounded-md bg-red-50 border border-red-200 text-red-800">
          <div className="flex items-center">            
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="font-medium">Error:</span> {error}
          </div>
        </div>
      )}
    </div>
  );
}