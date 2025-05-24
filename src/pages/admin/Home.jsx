import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
         PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts";
import { format } from "date-fns";
// Import actual services
import studentService from "../../services/studentService";
import parentService from "../../services/parentService";
import * as feeService from "../../services/feeService";
import * as tutorService from "../../services/tutorService";
import classService from "../../services/classService";
import { safeAccess } from "../../utils/safeUtils";

export default function AdminDashboard() {
  const [stats, setStats] = useState([
    { label: "Total Students", value: "...", change: "", icon: "users" },
    { label: "Active Courses", value: "...", change: "", icon: "book" },
    { label: "Fee Collection", value: "...", change: "", icon: "dollar" },
    { label: "Pending Fees", value: "...", change: "", icon: "alert" }
  ]);
  
  const [recentStudents, setRecentStudents] = useState([]);
  const [newRegistrations, setNewRegistrations] = useState([]);
  const [feeData, setFeeData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError("Please log in to access the dashboard.");
        setLoading(false);
        navigate('/login');
        return;
      }
      
      // Ensure admin role is set
      localStorage.setItem('userRole', 'admin');
      console.log('Using token:', token.substring(0, 15) + '...');

      try {
        // Fetch all data concurrently
        const [studentsData, parentsData, feesData, tutorsData, classesData] = await Promise.allSettled([
          studentService.getAllStudents(),
          parentService.getAllParents(),
          feeService.getAllFees(),
          tutorService.getAllTutors(),
          classService.getAllClasses()
        ]);

        // Process students data
        const students = studentsData.status === 'fulfilled' ? studentsData.value : [];
        console.log('Students fetched:', students.length);

        // Process parents data
        const parents = parentsData.status === 'fulfilled' ? parentsData.value : [];
        console.log('Parents fetched:', parents.length);

        // Process fees data
        const fees = feesData.status === 'fulfilled' ? feesData.value : [];
        console.log('Fees fetched:', fees.length);

        // Process tutors data
        const tutors = tutorsData.status === 'fulfilled' ? tutorsData.value : [];
        console.log('Tutors fetched:', tutors.length);

        // Process classes data
        const classes = classesData.status === 'fulfilled' ? classesData.value : [];
        console.log('Classes fetched:', classes.length);

        // Calculate fee statistics
        let feeCollection = 0;
        let pendingFees = 0;
        
        fees.forEach(fee => {
          const amount = Number(fee.amount || 0);
          if (fee.status?.toLowerCase() === 'paid') {
            feeCollection += amount;
          } else {
            pendingFees += amount;
          }
        });

        // Generate fee data by month
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const feesByMonth = monthNames.map(month => ({ name: month, collected: 0, pending: 0 }));
        
        fees.forEach(fee => {
          if (fee.dueDate) {
            try {
              const date = new Date(fee.dueDate);
              if (!isNaN(date.getTime())) {
                const month = date.getMonth();
                const amount = Number(fee.amount || 0);
                if (month >= 0 && month < 12) {
                  if (fee.status?.toLowerCase() === 'paid') {
                    feesByMonth[month].collected += amount;
                  } else {
                    feesByMonth[month].pending += amount;
                  }
                }
              }
            } catch (dateError) {
              console.warn('Error processing fee date:', dateError);
            }
          }
        });

        setFeeData(feesByMonth);

        // Calculate active vs inactive students
        const activeStudents = students.filter(student => 
          student?.status?.toLowerCase() === 'active' || !student?.status
        ).length;
        const inactiveStudents = students.length - activeStudents;

        setStatusData([
          { name: 'Active', value: activeStudents || 1 },
          { name: 'Inactive', value: inactiveStudents || 0 }
        ]);

        // Generate enrollment data by month (current year)
        const currentYear = new Date().getFullYear();
        const enrollmentCounts = {};

        students.forEach(student => {
          if (student?.enrollmentDate) {
            try {
              const enrollmentDate = new Date(student.enrollmentDate);
              if (!isNaN(enrollmentDate.getTime()) && enrollmentDate.getFullYear() === currentYear) {
                const month = enrollmentDate.getMonth();
                enrollmentCounts[month] = (enrollmentCounts[month] || 0) + 1;
              }
            } catch (dateError) {
              console.warn('Error parsing enrollment date:', dateError);
            }
          }
        });

        const enrollmentByMonth = monthNames.map((month, index) => ({
          name: month,
          students: enrollmentCounts[index] || 0
        }));

        setEnrollmentData(enrollmentByMonth);

        // Get recent registrations (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentStudentRegistrations = students
          .filter(student => {
            if (!student?.enrollmentDate) return false;
            const enrollmentDate = new Date(student.enrollmentDate);
            return !isNaN(enrollmentDate.getTime()) && enrollmentDate >= thirtyDaysAgo;
          })
          .map(student => ({
            id: student.studentId || student.id,
            name: `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Unknown Student',
            role: 'student',
            date: student.enrollmentDate,
            status: student.status || 'active'
          }));

        const recentParentRegistrations = parents
          .filter(parent => {
            if (!parent?.createdAt) return false;
            const createdDate = new Date(parent.createdAt);
            return !isNaN(createdDate.getTime()) && createdDate >= thirtyDaysAgo;
          })
          .map(parent => ({
            id: parent.parentId || parent.id,
            name: `${parent.firstName || ''} ${parent.lastName || ''}`.trim() || 'Unknown Parent',
            role: 'parent',
            date: parent.createdAt,
            status: parent.status || 'active'
          }));

        const allNewRegistrations = [...recentStudentRegistrations, ...recentParentRegistrations]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 10);

        setNewRegistrations(allNewRegistrations);

        // Update stats
        setStats([
          { 
            label: "Total Students", 
            value: students.length, 
            change: `+${Math.floor(students.length * 0.12)}%`, 
            icon: "users" 
          },
          { 
            label: "Active Courses", 
            value: classes.length, 
            change: `+${classes.length > 0 ? Math.floor(classes.length * 0.08) : 0}%`, 
            icon: "book" 
          },
          { 
            label: "Fee Collection", 
            value: `$${feeCollection.toFixed(2)}`, 
            change: "+15%", 
            icon: "dollar" 
          },
          { 
            label: "Pending Fees", 
            value: `$${pendingFees.toFixed(2)}`, 
            change: "-5%", 
            icon: "alert" 
          }
        ]);

        // Set recent students
        const recentStudentsList = [...students]
          .sort((a, b) => {
            const dateA = a.enrollmentDate ? new Date(a.enrollmentDate) : new Date(0);
            const dateB = b.enrollmentDate ? new Date(b.enrollmentDate) : new Date(0);
            return dateB - dateA;
          })
          .slice(0, 5)
          .map(student => ({
            studentId: student.studentId || student.id,
            name: `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Unknown Student',
            course: "General Course", // You can enhance this based on your data
            date: student.enrollmentDate || new Date().toISOString(),
            status: student.status || 'active'
          }));

        setRecentStudents(recentStudentsList);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError("Failed to load dashboard data. Please try refreshing the page.");
        }

        // Set fallback data
        setStats([
          { label: "Total Students", value: 0, change: "+0%", icon: "users" },
          { label: "Active Courses", value: 0, change: "+0%", icon: "book" },
          { label: "Fee Collection", value: "$0.00", change: "+0%", icon: "dollar" },
          { label: "Pending Fees", value: "$0.00", change: "+0%", icon: "alert" }
        ]);

        setStatusData([
          { name: 'Active', value: 1 },
          { name: 'Inactive', value: 0 }
        ]);

        setEnrollmentData(
          ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            .map(month => ({ name: month, students: 0 }))
        );
        
        setFeeData(
          ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            .map(month => ({ name: month, collected: 0, pending: 0 }))
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);
  
  const getIcon = (type) => {
    switch(type) {
      case "users":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
          </svg>
        );
      case "user-plus":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
          </svg>
        );
      case "book":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
          </svg>
        );
      case "dollar":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
      case "alert":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
      default:
        return null;
    }
  };

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

  const COLORS = [THEME.primary, THEME.secondary, THEME.warning, THEME.danger, THEME.accent];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="flex items-center">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-500">Welcome back, Admin. Here's what's happening today.</p>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center">
          <div className="bg-indigo-100 text-indigo-800 text-sm px-3 py-1.5 rounded-lg font-medium flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {format(new Date(), 'MMMM d, yyyy')}
          </div>
          <button className="ml-3 bg-white border border-gray-300 rounded-lg shadow-sm p-2 hover:bg-gray-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((stat, index) => {
          const bgColors = [
            'bg-indigo-100 text-indigo-600',
            'bg-emerald-100 text-emerald-600', 
            'bg-blue-100 text-blue-600',
            'bg-amber-100 text-amber-600'
          ];
          
          const gradients = [
            'from-indigo-500 to-purple-600',
            'from-emerald-500 to-teal-600',
            'from-blue-500 to-indigo-600',
            'from-amber-500 to-orange-600'
          ];
          
          const progressWidths = ['85%', '75%', '65%', '45%'];
          
          return (
            <div 
              key={index} 
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</div>
                <div className={`${bgColors[index % bgColors.length]} p-2 rounded-lg`}>
                  {getIcon(stat.icon)}
                </div>
              </div>
              <div className="flex items-baseline mb-2">
                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                <div 
                  className={`ml-2 text-xs px-1.5 py-0.5 rounded-full flex items-center ${
                    stat.change.startsWith('+') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-3 w-3 mr-0.5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d={
                        stat.change.startsWith('+') 
                          ? "M5 10l7-7m0 0l7 7m-7-7v18" 
                          : "M19 14l-7 7m0 0l-7-7m7 7V3"
                      }
                    />
                  </svg>
                  {stat.change.replace('+', '').replace('-', '')}
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{progressWidths[index]}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full bg-gradient-to-r ${gradients[index % gradients.length]}`} 
                    style={{ width: progressWidths[index] }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Fee Collection Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Fee Collection Overview</h3>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={feeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, '']} />
                <Legend />
                <Bar dataKey="collected" fill={THEME.success} name="Collected" />
                <Bar dataKey="pending" fill={THEME.warning} name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Student Status Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Student Status Distribution</h3>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Enrollment Trends */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Enrollment Trends ({new Date().getFullYear()})</h3>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="students" stroke={THEME.primary} fill={THEME.primary} fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* New Registrations Section */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6 mb-8 hover:shadow-md transition-shadow duration-300">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Recent Registrations</h2>
            <p className="text-sm text-gray-500">New student and parent sign-ups in the last 30 days</p>
          </div>
          <Link
            to="/admin/student-management"
            className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            View All
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center h-32">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="mt-3 text-indigo-600 font-medium">Loading registrations...</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration Date
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {newRegistrations.map((user) => (
                  <tr key={user.id || Math.random().toString()} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white font-medium mr-3 ${
                          user.role === 'student' 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600' 
                            : 'bg-gradient-to-r from-purple-500 to-pink-600'
                        }`}>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="font-medium text-gray-800">{user.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'student' 
                          ? 'bg-blue-100 text-blue-800' 
                          : user.role === 'parent'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          user.role === 'student' 
                            ? 'bg-blue-400' 
                            : user.role === 'parent'
                              ? 'bg-purple-400'
                              : 'bg-gray-400'
                        }`}></span>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-600">
                        {user.date ? format(new Date(user.date), 'MMM dd, yyyy') : 'No date'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status?.toLowerCase() === 'active' 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          user.status?.toLowerCase() === 'active' ? 'bg-green-600' : 'bg-gray-500'
                        } mr-1.5 self-center`}></span>
                        {user.status?.charAt(0).toUpperCase() + user.status?.slice(1) || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={user.role === 'student' ? `/admin/students/${user.id}/edit` : `/admin/parents`} 
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded transition-colors"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
                {newRegistrations.length === 0 && !loading && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-gray-500 font-medium">No new registrations in the last 30 days.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="text-center text-gray-500 text-sm mt-8 pb-6">
        <p className="mb-1">© {new Date().getFullYear()} Education Management System. All rights reserved.</p>
        <div className="flex justify-center space-x-4 mt-2">
          <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors">Privacy Policy</a>
          <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors">Terms of Service</a>
          <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors">Contact Support</a>
        </div>
      </div>
    </div>
  );
}
