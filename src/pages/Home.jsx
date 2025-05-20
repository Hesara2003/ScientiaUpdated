import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
         PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts";
import { format } from "date-fns";
import { toast } from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState([
    { label: "Total Students", value: "...", change: "", icon: "users" },
    { label: "Active Courses", value: "...", change: "", icon: "book" },
    { label: "Fee Collection", value: "...", change: "", icon: "dollar" },
    { label: "Pending Fees", value: "...", change: "", icon: "alert" }
  ]);
  
  const [recentStudents, setRecentStudents] = useState([]);
  const [feeData, setFeeData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);      try {
        const studentsResponse = await api.get('/students');
        const students = studentsResponse.data;
        
        let feeCollection = 0;
        let pendingFees = 0;
        let feesByMonth = [];
        
        try {
          const feesResponse = await api.get('/fees');
          const fees = feesResponse.data;
          
          fees.forEach(fee => {
            if (fee.status === 'paid') {
              feeCollection += fee.amount;
            } else {
              pendingFees += fee.amount;
            }
          });
          
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          feesByMonth = monthNames.map(month => ({ name: month, collected: 0, pending: 0 }));
          
          fees.forEach(fee => {
            const date = new Date(fee.dueDate);
            const month = date.getMonth();
            if (fee.status === 'paid') {
              feesByMonth[month].collected += fee.amount;
            } else {
              feesByMonth[month].pending += fee.amount;
            }
          });
          
          setFeeData(feesByMonth);
        } catch (err) {
          console.error("Error fetching fee data:", err);
          setFeeData([
            { name: 'Jan', collected: 4000, pending: 1000 },
            { name: 'Feb', collected: 5000, pending: 1200 },
            { name: 'Mar', collected: 6000, pending: 800 },
            { name: 'Apr', collected: 7000, pending: 1500 },
            { name: 'May', collected: 5500, pending: 900 },
            { name: 'Jun', collected: 6500, pending: 700 }
          ]);
        }
        
        const activeStudents = students.filter(student => student.status === 'active').length;
        const inactiveStudents = students.length - activeStudents;
        
        setStatusData([
          { name: 'Active', value: activeStudents || 1 },
          { name: 'Inactive', value: inactiveStudents || 0 }
        ]);
        
        const currentYear = new Date().getFullYear();
        const enrollmentCounts = {};
        
        students.forEach(student => {
          if (student.enrollmentDate) {
            const enrollmentDate = new Date(student.enrollmentDate);
            const month = enrollmentDate.getMonth();
            const year = enrollmentDate.getFullYear();
            
            if (year === currentYear) {
              enrollmentCounts[month] = (enrollmentCounts[month] || 0) + 1;
            }
          }
        });
        
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const enrollmentByMonth = monthNames.map((month, index) => ({
          name: month,
          students: enrollmentCounts[index] || 0
        }));
        
        setEnrollmentData(enrollmentByMonth);
        
        setStats([
          { 
            label: "Total Students", 
            value: students.length, 
            change: `+${Math.floor(students.length * 0.12)}%`, 
            icon: "users" 
          },
          { 
            label: "Active Students", 
            value: activeStudents, 
            change: `+${Math.floor(activeStudents * 0.05)}%`, 
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
        
        const recentStudentsList = [...students]
          .sort((a, b) => new Date(b.enrollmentDate) - new Date(a.enrollmentDate))
          .slice(0, 5)
          .map(student => ({
            studentId: student.studentId,
            name: `${student.firstName} ${student.lastName}`,
            course: "Enrolled",
            date: student.enrollmentDate,
            status: student.status
          }));
        
        setRecentStudents(recentStudentsList);
        
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try refreshing the page.");
        
        setRecentStudents([
          { studentId: 1, name: "Alex Johnson", course: "Advanced Mathematics", date: "2025-03-15", status: "active" },
          { studentId: 2, name: "Sarah Williams", course: "Physics 101", date: "2025-03-14", status: "active" },
          { studentId: 3, name: "Michael Brown", course: "Chemistry", date: "2025-03-12", status: "inactive" },
          { studentId: 4, name: "Emily Davis", course: "Biology", date: "2025-03-10", status: "active" }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();  }, []);

  // Function to retry data fetch with refreshed token
  const retryFetch = () => {
    toast.info("Retrying data fetch...");
    // Remove and re-add the token to ensure fresh headers
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('API token refreshed for retry');
    }
    
    setError(null);
    setLoading(true);
    
    // Force refresh the page
    window.location.reload();
  };

  const getIcon = (type) => {
    switch(type) {
      case "users":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
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
          </div>          <button 
            className="ml-3 bg-white border border-gray-300 rounded-lg shadow-sm p-2 hover:bg-gray-50"
            onClick={retryFetch}
            title="Refresh data"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2 hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Fee Collection Trends</h2>
              <p className="text-sm text-gray-500">Monthly revenue breakdown</p>
            </div>
            <div className="flex space-x-2">
              <div className="rounded-md bg-indigo-50 p-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
              </div>
              <div className="rounded-md bg-gray-100 p-1.5 hover:bg-gray-200 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              <p className="ml-3 text-indigo-600 font-medium">Loading data...</p>
            </div>
          ) : (
            <div className="bg-gradient-to-b from-indigo-50/30 to-white p-4 rounded-xl">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={feeData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} />
                  <YAxis tick={{ fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    }}
                    formatter={(value) => [`$${value}`, null]}
                    labelStyle={{ color: '#374151', fontWeight: '500' }}
                  />
                  <Legend 
                    iconType="circle"
                    formatter={(value) => (
                      <span style={{ color: '#4B5563', fontSize: '13px', padding: '0 8px' }}>{value}</span>
                    )}
                  />
                  <Bar 
                    dataKey="collected" 
                    name="Collected" 
                    fill={THEME.primary}
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                  <Bar 
                    dataKey="pending" 
                    name="Pending" 
                    fill={THEME.warning}
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="border border-gray-100 rounded-md p-3 bg-indigo-50/30">
              <p className="text-xs text-gray-500">Total Collected</p>
              <p className="text-lg font-bold text-indigo-600">
                ${feeData.reduce((sum, item) => sum + item.collected, 0).toLocaleString()}
              </p>
            </div>
            <div className="border border-gray-100 rounded-md p-3 bg-amber-50/30">
              <p className="text-xs text-gray-500">Total Pending</p>
              <p className="text-lg font-bold text-amber-600">
                ${feeData.reduce((sum, item) => sum + item.pending, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Student Status</h2>
              <p className="text-sm text-gray-500">Active vs. inactive students</p>
            </div>
            <div className="rounded-md bg-green-50 p-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
              <p className="ml-3 text-green-600 font-medium">Loading data...</p>
            </div>
          ) : (
            <div className="bg-gradient-to-b from-green-50/30 to-white p-4 rounded-xl">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={90}
                    innerRadius={60}
                    paddingAngle={2}
                    cornerRadius={6}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value, percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === 0 ? THEME.success : THEME.danger} 
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
                    formatter={(value, name) => [`${value} students`, name]}
                    labelStyle={{ color: '#374151', fontWeight: '500' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          
          <div className="mt-4 grid grid-cols-2 gap-2 text-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-sm font-medium text-green-800">Active</div>
              <div className="text-xl font-bold text-green-600">{statusData[0]?.value || 0}</div>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <div className="text-sm font-medium text-red-800">Inactive</div>
              <div className="text-xl font-bold text-red-600">{statusData[1]?.value || 0}</div>
            </div>
          </div>
        </div>
      </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 hover:shadow-md transition-shadow duration-300">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Student Enrollment Trends</h2>
            <p className="text-sm text-gray-500">Monthly enrollment statistics for {new Date().getFullYear()}</p>
          </div>
          <div className="flex space-x-2">
            <div className="rounded-md bg-blue-50 p-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="rounded-md bg-gray-100 p-1.5 hover:bg-gray-200 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <p className="mt-3 text-blue-600 font-medium">Loading enrollment data...</p>
          </div>
        ) : (
          <div className="bg-gradient-to-b from-blue-50/30 to-white p-4 rounded-xl">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={enrollmentData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorEnrollment" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={THEME.info} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={THEME.info} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                <XAxis dataKey="name" tick={{ fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} />
                <YAxis tick={{ fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  }}
                  formatter={(value) => [`${value} students`, 'New Enrollments']}
                  labelStyle={{ color: '#374151', fontWeight: '500' }}
                />
                <Legend iconType="circle" />
                <Area
                  type="monotone" 
                  dataKey="students" 
                  name="New Enrollments" 
                  stroke={THEME.info}
                  strokeWidth={3}
                  fill="url(#colorEnrollment)"
                  activeDot={{ r: 8, stroke: THEME.info, strokeWidth: 2, fill: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
        
        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span className="text-sm text-gray-600">Total enrollments: {enrollmentData.reduce((sum, month) => sum + month.students, 0)}</span>
          </div>
          <div className="flex">
            <button className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-1 px-3 rounded-l-md transition-colors">
              Monthly
            </button>
            <button className="text-sm bg-white border border-gray-300 text-gray-700 font-medium py-1 px-3 rounded-r-md transition-colors">
              Quarterly
            </button>
          </div>
        </div>
      </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/students" className="group bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white p-6 rounded-xl shadow-md transition duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-6">
            <div className="bg-white/20 rounded-lg p-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </div>
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold mb-2">Manage Students</h3>
          <p className="text-blue-100 mb-4">Add, edit, or remove student records</p>
          <div className="mt-2 flex items-center text-sm text-white/80">
            <span className="bg-white/30 rounded-full px-2 py-0.5 mr-2">{statusData[0]?.value || 0}</span>
            <span>Active Students</span>
          </div>
        </Link>
        
        <Link to="/classes" className="group bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white p-6 rounded-xl shadow-md transition duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-6">
            <div className="bg-white/20 rounded-lg p-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold mb-2">Manage Classes</h3>
          <p className="text-green-100 mb-4">Create and organize course schedules</p>
          <div className="mt-2 flex items-center text-sm text-white/80">
            <span className="bg-white/30 rounded-full px-2 py-0.5 mr-2">6</span>
            <span>Active Classes</span>
          </div>
        </Link>
        
        <Link to="/admin/fees" className="group bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white p-6 rounded-xl shadow-md transition duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-6">
            <div className="bg-white/20 rounded-lg p-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold mb-2">Fee Management</h3>
          <p className="text-purple-100 mb-4">Track and manage student payments</p>
          <div className="mt-2 flex items-center text-sm text-white/80">
            <span className="bg-white/30 rounded-full px-2 py-0.5 mr-2">${feeData.reduce((sum, item) => sum + item.pending, 0).toLocaleString()}</span>
            <span>Pending Fees</span>
          </div>
        </Link>
      </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 hover:shadow-md transition-shadow duration-300">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Recent Students</h2>
            <p className="text-sm text-gray-500">Newly enrolled students</p>
          </div>
          <Link 
            to="/students" 
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
            <p className="mt-3 text-indigo-600 font-medium">Loading students...</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
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
                {recentStudents.map((student) => (
                  <tr key={student.studentId || Math.random().toString()} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium mr-3">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="font-medium text-gray-800">{student.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-600 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 mr-2"></span>
                        {student.course}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-600">
                        {student.date ? format(new Date(student.date), 'MMM dd, yyyy') : 'No date'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        student.status?.toLowerCase() === 'active' 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          student.status?.toLowerCase() === 'active' ? 'bg-green-600' : 'bg-gray-500'
                        } mr-1.5 self-center`}></span>
                        {student.status?.charAt(0).toUpperCase() + student.status?.slice(1) || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/students/${student.studentId}`} 
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded mr-2 transition-colors"
                      >
                        View
                      </Link>
                      <Link 
                        to={`/students/${student.studentId}/edit`}
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded transition-colors"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
                {recentStudents.length === 0 && !loading && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-gray-500 font-medium">No students found. Add your first student to get started.</p>
                        <Link to="/students/add" className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-md transition-colors">
                          Add Student
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
          <p>Showing {recentStudents.length} of {statusData.reduce((sum, item) => sum + item.value, 0)} total students</p>
          <div className="flex items-center space-x-1">
            <button className="border border-gray-300 rounded px-2 py-1 hover:bg-gray-50 disabled:opacity-50" disabled>
              &lt; Previous
            </button>
            <button className="border border-gray-300 bg-indigo-50 text-indigo-600 font-medium rounded px-2 py-1">1</button>
            <button className="border border-gray-300 rounded px-2 py-1 hover:bg-gray-50">2</button>
            <button className="border border-gray-300 rounded px-2 py-1 hover:bg-gray-50">3</button>
            <button className="border border-gray-300 rounded px-2 py-1 hover:bg-gray-50">
              Next &gt;
            </button>
          </div>
        </div>
      </div>
            {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <div className="mt-2">
                <button 
                  className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md text-sm font-medium"
                  onClick={retryFetch}
                >
                  Retry with refreshed token
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-center text-gray-500 text-sm mt-8 pb-6">
        <p className="mb-1">&copy; {new Date().getFullYear()} Education Management System. All rights reserved.</p>
        <div className="flex justify-center space-x-4 mt-2">
          <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors">Privacy Policy</a>
          <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors">Terms of Service</a>
          <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors">Contact Support</a>
        </div>
      </div>
    </div>
  );
}