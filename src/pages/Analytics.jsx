import { useState, useEffect } from "react";
import axios from "axios";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { format } from "date-fns";

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [revenueData, setRevenueData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [coursePopularityData, setCoursePopularityData] = useState([]);
  const [tutorRatingData, setTutorRatingData] = useState([]);
  const [studentDemographicsData, setStudentDemographicsData] = useState([]);
  
  const [dateRange, setDateRange] = useState('year'); // Options: 'month', 'quarter', 'year', 'all'


  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [summaryStats, setSummaryStats] = useState({
    totalRevenue: 0,
    avgAttendance: 0,
    avgPerformance: 0,
    activeStudents: 0,
    totalCourses: 0,
    avgTutorRating: 0,
    growthRate: 12.5
  });

  // Theme colors
  const THEME = {
    primary: '#4F46E5',    // Indigo
    secondary: '#10B981',  // Emerald
    accent: '#8B5CF6',     // Violet
    warning: '#F59E0B',    // Amber
    danger: '#EF4444',     // Red
    success: '#10B981',    // Green
    info: '#3B82F6',       // Blue
    light: '#F3F4F6',      // Gray-100
    dark: '#1F2937'        // Gray-800
  };
  
  const COLORS = [THEME.primary, THEME.secondary, THEME.warning, THEME.danger, THEME.accent, '#EC4899'];
  const RADAR_COLORS = {
    student: '#4F46E5',
    performance: '#10B981',
    attendance: '#F59E0B'
  };

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        let hasRealData = true;

        try {
          const revenueResponse = await axios.get('http://localhost:8080/analytics/revenue');
          setRevenueData(revenueResponse.data);
        } catch (err) {
          console.log("Using mock revenue data");
          hasRealData = false;
          // Mock Revenue Data
          setRevenueData([
            { month: 'Jan', value: 4500 },
            { month: 'Feb', value: 5200 },
            { month: 'Mar', value: 6800 },
            { month: 'Apr', value: 7400 },
            { month: 'May', value: 6300 },
            { month: 'Jun', value: 5900 },
            { month: 'Jul', value: 6100 },
            { month: 'Aug', value: 7200 },
            { month: 'Sep', value: 8400 },
            { month: 'Oct', value: 9100 },
            { month: 'Nov', value: 8700 },
            { month: 'Dec', value: 9500 }
          ]);
        }

        try {
          const attendanceResponse = await axios.get('http://localhost:8080/analytics/attendance');
          setAttendanceData(attendanceResponse.data);
        } catch (err) {
          console.log("Using mock attendance data");
          setAttendanceData([
            { subject: 'Mathematics', attendance: 85 },
            { subject: 'Physics', attendance: 78 },
            { subject: 'Chemistry', attendance: 82 },
            { subject: 'Biology', attendance: 90 },
            { subject: 'Computer Science', attendance: 95 },
            { subject: 'English', attendance: 70 }
          ]);
        }

        try {
          const performanceResponse = await axios.get('http://localhost:8080/analytics/performance');
          setPerformanceData(performanceResponse.data);
        } catch (err) {
          console.log("Using mock performance data");
          setPerformanceData([
            { name: 'Test 1', average: 75, highest: 98, lowest: 45 },
            { name: 'Test 2', average: 68, highest: 95, lowest: 40 },
            { name: 'Midterm', average: 72, highest: 99, lowest: 52 },
            { name: 'Test 3', average: 78, highest: 97, lowest: 58 },
            { name: 'Final', average: 82, highest: 100, lowest: 60 }
          ]);
        }

        try {
          const courseResponse = await axios.get('http://localhost:8080/analytics/course-popularity');
          setCoursePopularityData(courseResponse.data);
        } catch (err) {
          console.log("Using mock course popularity data");
          setCoursePopularityData([
            { name: 'Advanced Mathematics', students: 45, value: 45 },
            { name: 'Physics 101', students: 38, value: 38 },
            { name: 'Chemistry Lab', students: 30, value: 30 },
            { name: 'Biology', students: 28, value: 28 },
            { name: 'Computer Programming', students: 52, value: 52 },
            { name: 'English Literature', students: 20, value: 20 }
          ]);
        }

        try {
          const tutorResponse = await axios.get('http://localhost:8080/analytics/tutor-ratings');
          setTutorRatingData(tutorResponse.data);
        } catch (err) {
          console.log("Using mock tutor rating data");
          setTutorRatingData([
            { name: 'Dr. Smith', rating: 4.8, reviews: 25, subjects: ['Mathematics', 'Physics'] },
            { name: 'Prof. Johnson', rating: 4.6, reviews: 32, subjects: ['Chemistry'] },
            { name: 'Ms. Williams', rating: 4.9, reviews: 18, subjects: ['Biology'] },
            { name: 'Mr. Brown', rating: 4.5, reviews: 27, subjects: ['Computer Science'] },
            { name: 'Dr. Davis', rating: 4.7, reviews: 22, subjects: ['English'] }
          ]);
        }

        try {
          const demographicsResponse = await axios.get('http://localhost:8080/analytics/demographics');
          setStudentDemographicsData(demographicsResponse.data);
        } catch (err) {
          console.log("Using mock demographics data");
          setStudentDemographicsData([
            { name: '13-15', value: 25 },
            { name: '16-18', value: 45 },
            { name: '19-21', value: 20 },
            { name: '22+', value: 10 }
          ]);
        }

        let totalRevenue = revenueData.reduce((sum, item) => sum + item.value, 0);
        let avgAttendance = attendanceData.reduce((sum, item) => sum + item.attendance, 0) / attendanceData.length;
        let avgPerformance = performanceData.reduce((sum, item) => sum + item.average, 0) / performanceData.length;
        let activeStudents = coursePopularityData.reduce((sum, item) => sum + item.students, 0);
        let totalCourses = coursePopularityData.length;
        let avgTutorRating = tutorRatingData.reduce((sum, item) => sum + item.rating, 0) / tutorRatingData.length;

        setSummaryStats({
          totalRevenue,
          avgAttendance,
          avgPerformance,
          activeStudents,
          totalCourses,
          avgTutorRating
        });

      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError("Failed to load analytics data. Please try refreshing the page.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
            <div className="text-2xl font-bold text-gray-800">{summaryStats.avgAttendance.toFixed(1)}%</div>
            <div className="ml-2 bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              5%
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${summaryStats.avgAttendance}%` }}></div>
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
            </div>
          </div>
          <div className="flex items-baseline mb-2">
            <div className="text-2xl font-bold text-gray-800">{summaryStats.avgPerformance.toFixed(1)}%</div>
            <div className="ml-2 bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              3%
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${summaryStats.avgPerformance}%` }}></div>
            </div>
            <span className="text-xs text-gray-500 ml-2">{summaryStats.avgPerformance}%</span>
          </div>
        </div>
        
        {/* Active Students Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Students</div>
            <div className="bg-purple-100 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline mb-2">
            <div className="text-2xl font-bold text-gray-800">{summaryStats.activeStudents}</div>
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
        
        {/* Courses Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Courses</div>
            <div className="bg-yellow-100 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline mb-2">
            <div className="text-2xl font-bold text-gray-800">{summaryStats.totalCourses}</div>
            <div className="ml-2 bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full">+2 new</div>
          </div>
          <div className="mt-2 flex space-x-1">
            {[...Array(summaryStats.totalCourses > 10 ? 10 : summaryStats.totalCourses)].map((_, i) => (
              <div 
                key={i} 
                className="h-5 w-2 bg-yellow-400 rounded-sm"
                style={{ height: `${20 + Math.random() * 15}px` }}
              ></div>
            ))}
          </div>
        </div>
        
        {/* Rating Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Tutor Rating</div>
            <div className="bg-red-100 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline mb-2">
            <div className="text-2xl font-bold text-gray-800">{summaryStats.avgTutorRating.toFixed(1)}</div>
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
            <div className="text-xs text-gray-500 ml-2 mt-0.5">({tutorRatingData.reduce((sum, tutor) => sum + tutor.reviews, 0)} reviews)</div>
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
          </div>
          <div className="bg-gradient-to-b from-blue-50/30 to-white p-4 rounded-xl">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="border border-gray-100 rounded-md p-2 text-center">
              <p className="text-xs text-gray-500">Average</p>
              <p className="text-lg font-bold text-indigo-600">{(performanceData.reduce((sum, item) => sum + item.average, 0) / performanceData.length).toFixed(1)}%</p>
            </div>
            <div className="border border-gray-100 rounded-md p-2 text-center">
              <p className="text-xs text-gray-500">Highest</p>
              <p className="text-lg font-bold text-green-600">{Math.max(...performanceData.map(item => item.highest))}%</p>
            </div>
            <div className="border border-gray-100 rounded-md p-2 text-center">
              <p className="text-xs text-gray-500">Lowest</p>
              <p className="text-lg font-bold text-red-600">{Math.min(...performanceData.map(item => item.lowest))}%</p>
            </div>
          </div>
        </div>
      </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Course Popularity</h2>
              <p className="text-sm text-gray-500">Students enrolled per course</p>
            </div>
            <div className="flex space-x-2">
              <div className="rounded-md bg-purple-50 p-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="rounded-md bg-gray-100 p-1.5 hover:bg-gray-200 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-b from-purple-50/30 to-white p-4 rounded-xl">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                layout="vertical"
                data={coursePopularityData} 
                margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" horizontal={false} />
                <XAxis 
                  type="number"
                  tick={{ fill: '#6B7280' }} 
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={150}
                  tick={{ fill: '#4B5563', fontSize: '12px' }} 
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  }}
                  formatter={(value) => [`${value} students`, 'Enrolled']}
                  labelStyle={{ color: '#374151', fontWeight: '500' }}
                />
                <Bar 
                  dataKey="students" 
                  name="Number of Students" 
                  fill={THEME.accent}
                  barSize={20}
                  radius={[0, 4, 4, 0]}
                >
                  {coursePopularityData.map((entry, index) => {
                    const color = entry.students > 40 
                      ? THEME.primary 
                      : entry.students > 30 
                        ? THEME.accent 
                        : THEME.warning;
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-between">
            <div className="bg-purple-50 text-purple-800 text-xs font-medium rounded-full px-3 py-1 flex items-center">
              <span className="w-2 h-2 bg-purple-600 rounded-full mr-1.5"></span>
              Computer Programming: Most Popular
            </div>
            <div className="text-xs text-gray-500 flex items-center">
              Total Enrolled: {coursePopularityData.reduce((sum, course) => sum + course.students, 0)} students
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Student Demographics</h2>
              <p className="text-sm text-gray-500">Age distribution of enrolled students</p>
            </div>
            <div className="flex space-x-2">
              <div className="rounded-md bg-green-50 p-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="rounded-md bg-gray-100 p-1.5 hover:bg-gray-200 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-b from-green-50/30 to-white p-4 rounded-xl">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={studentDemographicsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={110}
                  innerRadius={60}
                  paddingAngle={2}
                  cornerRadius={6}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value, percent, cx, cy, midAngle, innerRadius, outerRadius, index }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = outerRadius * 0.8;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                    return (
                      <g>
                        <text
                          x={x}
                          y={y}
                          fill="#fff"
                          textAnchor={x > cx ? 'start' : 'end'}
                          dominantBaseline="central"
                          fontSize={12}
                          fontWeight="bold"
                        >
                          {name}: {(percent * 100).toFixed(0)}%
                        </text>
                      </g>
                    );
                  }}
                >
                  {studentDemographicsData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  }}
                  formatter={(value) => [`${value} students`, null]}
                  labelStyle={{ color: '#374151', fontWeight: '500' }}
                />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  formatter={(value, entry) => (
                    <span style={{ color: '#4B5563', fontSize: '13px', padding: '0 8px' }}>{value}</span>
                  )}
                  iconType="circle"
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-center">
            <div className="text-sm text-gray-500">
              Total students: {studentDemographicsData.reduce((sum, group) => sum + group.value, 0)}
            </div>
            <div className="mt-1 text-xs text-green-600">
              Majority age group: 16-18 years ({studentDemographicsData[1].value} students)
            </div>
          </div>
        </div>
      </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Subject Attendance Rates</h2>
              <p className="text-sm text-gray-500">Percentage attendance by subject</p>
            </div>
            <div className="flex space-x-2">
              <div className="rounded-md bg-blue-50 p-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="rounded-md bg-gray-100 p-1.5 hover:bg-gray-200 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-b from-blue-50/30 to-white p-4 rounded-xl flex items-center justify-center">
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart outerRadius={130} width={500} height={300} data={attendanceData}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#4B5563', fontSize: '12px' }}
                  stroke="#E5E7EB"
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={{ fill: '#6B7280' }}
                  stroke="#E5E7EB"
                  tickCount={5}
                />
                <Radar 
                  name="Attendance %" 
                  dataKey="attendance" 
                  stroke={THEME.info}
                  strokeWidth={2} 
                  fill={THEME.info}
                  fillOpacity={0.6}
                  animationDuration={1000}
                />
                <Legend 
                  iconType="circle"
                  formatter={(value) => (
                    <span style={{ color: '#4B5563', fontSize: '13px', padding: '0 8px' }}>{value}</span>
                  )}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  }}
                  formatter={(value) => [`${value}%`, 'Attendance Rate']}
                  labelStyle={{ color: '#374151', fontWeight: '500' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="border border-gray-100 rounded-md p-2 bg-green-50">
              <p className="text-xs text-gray-500">Highest</p>
              <p className="text-md font-bold text-green-600">{Math.max(...attendanceData.map(subject => subject.attendance))}%</p>
              <p className="text-xs text-gray-600">{attendanceData.reduce((highest, subject) => 
                subject.attendance > highest.attendance ? subject : highest
              ).subject}</p>
            </div>
            <div className="border border-gray-100 rounded-md p-2 bg-blue-50">
              <p className="text-xs text-gray-500">Average</p>
              <p className="text-md font-bold text-blue-600">{(attendanceData.reduce((sum, subject) => sum + subject.attendance, 0) / attendanceData.length).toFixed(1)}%</p>
              <p className="text-xs text-gray-600">All Subjects</p>
            </div>
            <div className="border border-gray-100 rounded-md p-2 bg-yellow-50">
              <p className="text-xs text-gray-500">Lowest</p>
              <p className="text-md font-bold text-yellow-600">{Math.min(...attendanceData.map(subject => subject.attendance))}%</p>
              <p className="text-xs text-gray-600">{attendanceData.reduce((lowest, subject) => 
                subject.attendance < lowest.attendance ? subject : lowest
              ).subject}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Top Tutor Ratings</h2>
              <p className="text-sm text-gray-500">Performance scores and student feedback</p>
            </div>
            <div className="flex space-x-2">
              <button className="bg-indigo-100 text-indigo-700 text-xs font-medium px-3 py-1 rounded-md">
                Sort by Rating
              </button>
              <div className="rounded-md bg-gray-100 p-1.5 hover:bg-gray-200 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {tutorRatingData.map((tutor, idx) => (
              <div 
                key={idx} 
                className="p-4 border border-gray-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all duration-200 transform hover:-translate-y-1"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold mr-3">
                      {tutor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{tutor.name}</h3>
                      <div className="text-xs text-gray-500 flex flex-wrap">
                        {tutor.subjects.map((subject, i) => (
                          <span 
                            key={i}
                            className="bg-gray-100 text-gray-700 rounded-full px-2 py-0.5 mr-1 mt-1"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-1 rounded-full">
                      <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-bold text-indigo-800">{tutor.rating.toFixed(1)}</span>
                      <span className="ml-1 text-xs text-gray-600">({tutor.reviews})</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.floor(tutor.rating * 20)}% student satisfaction
                    </div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Rating</span>
                    <span>{tutor.rating}/5.0</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${(tutor.rating / 5) * 100}%`,
                        background: `linear-gradient(to right, ${THEME.primary}, ${THEME.accent})` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <button className="bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 font-medium rounded-lg text-sm px-5 py-2 transition-colors duration-200">
              View All Tutors
            </button>
          </div>
        </div>
      </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 hover:shadow-md transition-shadow duration-300">
        <div className="flex flex-wrap justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Insights & Recommendations</h2>
            <p className="text-sm text-gray-500">AI-powered analysis based on your educational data</p>
          </div>
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1.5 rounded-full text-sm flex items-center mt-2 md:mt-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI Powered
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 hover:shadow-md transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-600/10 rounded-lg flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-bold text-blue-800 text-lg">Performance Trend</h3>
            </div>
            <p className="text-gray-700">Overall student performance has increased by <span className="font-medium">3%</span> compared to last term. Keep monitoring the progress in challenging subjects.</p>
            <div className="mt-4">
              <button className="text-blue-600 text-sm font-medium flex items-center hover:text-blue-800">
                View Details
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 hover:shadow-md transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-600/10 rounded-lg flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-green-800 text-lg">Revenue Growth</h3>
            </div>
            <p className="text-gray-700">Monthly revenue is showing consistent growth. Consider expanding <span className="font-medium">Computer Programming</span> courses for further improvements.</p>
            <div className="mt-4">
              <button className="text-green-600 text-sm font-medium flex items-center hover:text-green-800">
                View Details
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="p-6 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-100 hover:shadow-md transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-yellow-600/10 rounded-lg flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="font-bold text-yellow-800 text-lg">Attendance Focus</h3>
            </div>
            <p className="text-gray-700"><span className="font-medium">English</span> has lower attendance rates compared to other subjects. Consider conducting a student survey to understand the issues.</p>
            <div className="mt-4">
              <button className="text-yellow-600 text-sm font-medium flex items-center hover:text-yellow-800">
                View Details
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex">
            <div className="flex-shrink-0 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-md font-semibold text-indigo-900 mb-1">Recommended Action</h3>
              <p className="text-sm text-indigo-700">Based on current data, we recommend focusing on improving <span className="font-medium">English</span> attendance rates and expanding the <span className="font-medium">Computer Programming</span> course offerings to capitalize on student interest.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer with Data Timestamp */}
      <div className="flex items-center justify-between py-4 px-6 bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="text-sm text-gray-500">
          <span className="font-medium">Data last updated:</span> {format(new Date(), 'MMMM d, yyyy')} at {format(new Date(), 'h:mm a')}
        </div>
        <div className="flex space-x-2">
          <button className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 text-xs font-medium rounded-md px-3 py-1.5 transition-colors">
            Download Report
          </button>
          <button className="bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-medium rounded-md px-3 py-1.5 transition-colors flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </button>
        </div>
      </div>
      
      <div className="text-center text-xs text-gray-400 mt-8 mb-4">
        <p>© {new Date().getFullYear()} Scientia Education Analytics. All rights reserved.</p>
      </div>
    </div>
  );
}