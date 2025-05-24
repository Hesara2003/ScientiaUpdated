import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from "react-router-dom";
import * as attendanceService from "../../services/attendanceService";
import * as studentService from "../../services/studentService";
import { getUser, ensureConsistentRole, getAuthHeaders } from '../../utils/authUtils';

// Icons
const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const AcademicCapIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const XCircleIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
  </svg>
);

const ChartBarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const ClipboardListIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

export default function Attendance() {
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [classes, setClasses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [newAttendance, setNewAttendance] = useState({
    studentId: "",
    classId: "",
    date: new Date().toISOString().split('T')[0],
    status: "Present",
    notes: ""
  });
  const [students, setStudents] = useState([]);
  const [bulkAttendance, setBulkAttendance] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    total: 0,
    presentPercentage: 0
  });

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

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        // Get current admin user
        const user = getUser();
        if (!user || !user.id) {
          throw new Error('User information not available');
        }

        // Hardcoded classes for admin view
        const classesData = [
          { classId: 1, className: "Advanced Mathematics", subject: "Mathematics" },
          { classId: 2, className: "Physics for Engineers", subject: "Physics" },
          { classId: 3, className: "Organic Chemistry", subject: "Chemistry" },
          { classId: 4, className: "Molecular Biology", subject: "Biology" },
          { classId: 5, className: "Web Development", subject: "Computer Science" }
        ];
        setClasses(classesData);

        // Fetch attendance records
        await fetchAttendanceRecords(classesData);
        
      } catch (err) {
        console.error('Error fetching attendance data:', err);
        setError('Failed to load attendance data. Please try again later.');
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  // Fetch attendance records
  const fetchAttendanceRecords = async (classesData = classes) => {
    try {
      const records = await attendanceService.getAllAttendanceRecords();
      console.log('Fetched attendance records:', records);
      
      const recordsArray = Array.isArray(records) ? records : [];
      const currentClasses = classesData.length > 0 ? classesData : classes;
      
      const formattedData = recordsArray.map(record => {
        const recordClassId = record.classEntity?.classId || record.classId;
        const className = currentClasses.find(c => c.classId === recordClassId)?.className || `Class ${recordClassId}`;
        const studentName = record.studentName || 'Unknown Student';
        
        return {
          attendanceId: record.attendanceId || record.id,
          date: record.date ? new Date(record.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          className: className,
          classId: recordClassId,
          studentName: studentName,
          studentId: record.student?.studentId || record.studentId,
          student: record.student,
          status: record.status || 'Present',
          notes: record.notes || ''
        };
      });
      
      console.log('Formatted attendance data:', formattedData);
      setAttendanceData(formattedData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching attendance records:', err);
      setError('Failed to load attendance data. Please try again later.');
      setLoading(false);
    }
  };

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const studentsData = await studentService.getAllStudents();
        console.log('Fetched students:', studentsData);
        setStudents(studentsData);
      } catch (err) {
        console.error('Error fetching students:', err);
        setStudents([]);
      }
    };

    fetchStudents();
  }, []);

  // Calculate attendance statistics
  useEffect(() => {
    const filteredRecords = attendanceData.filter(record => {
      const recordDate = record.date;
      const matchesDate = recordDate === selectedDate;
      const matchesClass = selectedClass === 'all' || record.classId === parseInt(selectedClass);
      return matchesDate && matchesClass;
    });
    
    if (filteredRecords.length > 0) {
      const present = filteredRecords.filter(r => r.status?.toLowerCase() === 'present').length;
      const absent = filteredRecords.filter(r => r.status?.toLowerCase() === 'absent').length;
      const late = filteredRecords.filter(r => r.status?.toLowerCase() === 'late').length;
      const excused = filteredRecords.filter(r => r.status?.toLowerCase() === 'excused').length;
      const total = filteredRecords.length;
      const presentPercentage = total > 0 ? Math.round((present + late) / total * 100) : 0;
      
      setAttendanceStats({
        present,
        absent,
        late,
        excused,
        total,
        presentPercentage
      });
    } else {
      setAttendanceStats({
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        total: 0,
        presentPercentage: 0
      });
    }
  }, [attendanceData, selectedDate, selectedClass]);

  // Initialize bulk attendance
  useEffect(() => {
    if (selectedClass !== 'all') {
      const classId = parseInt(selectedClass);
      const studentsInClass = students.filter(student => 
        student.classIds?.includes(classId) || true // For now, show all students
      );
      
      setBulkAttendance(studentsInClass.map(student => ({
        studentId: student.studentId || student.id,
        studentName: `${student.firstName} ${student.lastName}`.trim(),
        studentNumber: student.studentNumber || student.studentId || `ST${(student.studentId || student.id).toString().padStart(3, '0')}`,
        classId,
        className: classes.find(c => c.classId === classId)?.className || '',
        date: selectedDate,
        status: 'Present',
        notes: ''
      })));
    }
  }, [students, selectedClass, selectedDate, classes]);

  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (!newAttendance.studentId) {
        throw new Error("Please select a student");
      }
      if (!newAttendance.classId) {
        throw new Error("Please select a class");
      }

      const attendanceData = {
        studentId: parseInt(newAttendance.studentId),
        classId: parseInt(newAttendance.classId),
        status: newAttendance.status,
        date: newAttendance.date,
        notes: newAttendance.notes
      };
      
      console.log('Submitting attendance data:', attendanceData);
      
      const createdRecord = await attendanceService.createAttendance(attendanceData);
      console.log('Created attendance record:', createdRecord);
      
      setShowAddModal(false);
      setNewAttendance({
        studentId: "",
        classId: "",
        date: new Date().toISOString().split('T')[0],
        status: "Present",
        notes: ""
      });

      setLoading(true);
      await fetchAttendanceRecords();
      
    } catch (err) {
      console.error('Error submitting attendance:', err);
      setError('Failed to submit attendance: ' + (err.message || 'Please try again.'));
    }
  };

  // Handle bulk attendance submission
  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const attendancePromises = bulkAttendance.map(record => 
        attendanceService.createAttendance({
          studentId: record.studentId,
          classId: record.classId,
          date: record.date,
          status: record.status,
          notes: record.notes
        })
      );
      
      await Promise.all(attendancePromises);
      setShowBulkModal(false);
      await fetchAttendanceRecords();
      
    } catch (err) {
      console.error("Error submitting bulk attendance:", err);
      setError("Failed to submit attendance. Please try again.");
      setLoading(false);
    }
  };

  // Handle bulk status changes
  const handleBulkStatusChange = (index, status) => {
    const updated = [...bulkAttendance];
    updated[index].status = status;
    setBulkAttendance(updated);
  };

  const handleBulkNotesChange = (index, notes) => {
    const updated = [...bulkAttendance];
    updated[index].notes = notes;
    setBulkAttendance(updated);
  };

  // Filter attendance based on search and filters
  const filteredAttendance = attendanceData.filter(record => {
    const recordDate = record.date;
    const matchesDate = recordDate === selectedDate;
    const matchesClass = selectedClass === 'all' || record.classId === parseInt(selectedClass);
    
    const matchesSearch = !searchQuery || 
      record.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesDate && matchesClass && matchesSearch;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-amber-100 text-amber-800';
      case 'excused':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteAttendance = async (attendanceId) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) {
      return;
    }

    try {
      await attendanceService.deleteAttendance(attendanceId);
      setLoading(true);
      await fetchAttendanceRecords();
    } catch (err) {
      console.error('Error deleting attendance:', err);
      setError('Failed to delete attendance record');
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const records = filteredAttendance;
    
    if (records.length === 0) {
      alert('No data to export');
      return;
    }
    
    const headers = ['Date', 'Student Name', 'Student ID', 'Class', 'Status', 'Notes'];
    
    const rows = records.map(record => [
      record.date,
      record.studentName,
      record.studentId,
      record.className,
      record.status.charAt(0).toUpperCase() + record.status.slice(1),
      record.notes || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_${selectedDate}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-6">
      {/* Header Section */}
      <header className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <AcademicCapIcon />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Attendance Management
                </h1>
                <p className="text-gray-600 mt-1">Track and manage student attendance records</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <PlusIcon />
                Add Record
              </button>
              
              <button
                onClick={() => setShowBulkModal(true)}
                disabled={selectedClass === 'all'}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <ClipboardListIcon />
                Bulk Entry
              </button>
              
              <button
                onClick={exportToCSV}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <DownloadIcon />
                Export
              </button>
              
              <Link 
                to="/attendance/reports"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <ChartBarIcon />
                Reports
              </Link>
            </div>
          </div>
        </div>
      </header>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 mb-6 rounded-r-xl shadow-sm"
          role="alert"
        >
          <div className="flex items-center">
            <XCircleIcon />
            <p className="ml-2">{error}</p>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/4 mb-6"></div>
            <div className="space-y-4">
              <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/3"></div>
              <div className="h-64 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Statistics Cards */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-md transform transition-all duration-200 hover:scale-105">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Total Students</span>
                  <div className="rounded-full bg-gray-100 p-2">
                    <UserIcon />
                  </div>
                </div>
                <div className="text-2xl font-bold">{attendanceStats.total}</div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-md transform transition-all duration-200 hover:scale-105">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Present</span>
                  <div className="rounded-full bg-green-100 p-2">
                    <CheckCircleIcon />
                  </div>
                </div>
                <div className="text-2xl font-bold">{attendanceStats.present}</div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-md transform transition-all duration-200 hover:scale-105">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Absent</span>
                  <div className="rounded-full bg-red-100 p-2">
                    <XCircleIcon />
                  </div>
                </div>
                <div className="text-2xl font-bold">{attendanceStats.absent}</div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-md transform transition-all duration-200 hover:scale-105">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Late</span>
                  <div className="rounded-full bg-yellow-100 p-2">
                    <CalendarIcon />
                  </div>
                </div>
                <div className="text-2xl font-bold">{attendanceStats.late}</div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-md transform transition-all duration-200 hover:scale-105">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Attendance Rate</span>
                  <div className="rounded-full bg-blue-100 p-2">
                    <ChartBarIcon />
                  </div>
                </div>
                <div className="text-2xl font-bold">{attendanceStats.presentPercentage}%</div>
              </div>
            </div>
          </motion.div>

          {/* Filters Section */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Filter Options</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <AcademicCapIcon />
                    Select Class
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                  >
                    <option value="all">All Classes</option>
                    {classes.map((cls) => (
                      <option key={cls.classId} value={cls.classId.toString()}>
                        {cls.className}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <CalendarIcon />
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Students</label>
                  <input
                    type="text"
                    placeholder="Search by name or notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Attendance Data Section */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Attendance Records</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    {filteredAttendance.length} records found
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <UserIcon />
                          Student
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <AcademicCapIcon />
                          Class
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <CalendarIcon />
                          Date
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Notes
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredAttendance.length > 0 ? (
                      filteredAttendance.map((record, index) => (
                        <motion.tr 
                          key={record.attendanceId}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                                {record.studentName.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </div>
                              <div className="text-sm font-medium text-gray-900">{record.studentName}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-medium">{record.className}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(record.date)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                              {record.status?.toLowerCase() === 'present' ? <CheckCircleIcon /> : <XCircleIcon />}
                              {record.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 max-w-xs">
                            <div className="text-sm text-gray-900 truncate" title={record.notes}>
                              {record.notes || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => handleDeleteAttendance(record.attendanceId)}
                              className="inline-flex items-center gap-1 text-red-600 hover:text-red-900 hover:bg-red-50 px-3 py-1 rounded-lg transition-all duration-200"
                            >
                              <TrashIcon />
                              Delete
                            </button>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <p className="text-lg font-medium">No attendance records found</p>
                            <p className="text-sm mt-1">Try adjusting your filters or add some attendance records.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Add Attendance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-auto overflow-hidden"
            >
              <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <PlusIcon />
                  Record Attendance
                </h3>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleAttendanceSubmit} className="space-y-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <UserIcon />
                      Student
                    </label>
                    <select
                      value={newAttendance.studentId}
                      onChange={(e) => setNewAttendance({...newAttendance, studentId: e.target.value})}
                      className="w-full border border-gray-300 rounded-xl py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                      required
                    >
                      <option value="">Select a student</option>
                      {students.map((student) => (
                        <option key={student.studentId || student.id} value={student.studentId || student.id}>
                          {student.firstName} {student.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <AcademicCapIcon />
                      Class
                    </label>
                    <select
                      value={newAttendance.classId}
                      onChange={(e) => setNewAttendance({...newAttendance, classId: e.target.value})}
                      className="w-full border border-gray-300 rounded-xl py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                      required
                    >
                      <option value="">Select a class</option>
                      {classes.map((cls) => (
                        <option key={cls.classId} value={cls.classId.toString()}>
                          {cls.className}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <CalendarIcon />
                      Date
                    </label>
                    <input
                      type="date"
                      value={newAttendance.date}
                      onChange={(e) => setNewAttendance({...newAttendance, date: e.target.value})}
                      className="w-full border border-gray-300 rounded-xl py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setNewAttendance({...newAttendance, status: "Present"})}
                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all duration-200 ${
                          newAttendance.status === "Present" 
                            ? "border-green-500 bg-green-50 text-green-700" 
                            : "border-gray-300 bg-white text-gray-700 hover:border-green-300"
                        }`}
                      >
                        <CheckCircleIcon />
                        Present
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewAttendance({...newAttendance, status: "Absent"})}
                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all duration-200 ${
                          newAttendance.status === "Absent" 
                            ? "border-red-500 bg-red-50 text-red-700" 
                            : "border-gray-300 bg-white text-gray-700 hover:border-red-300"
                        }`}
                      >
                        <XCircleIcon />
                        Absent
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={newAttendance.notes}
                      onChange={(e) => setNewAttendance({...newAttendance, notes: e.target.value})}
                      className="w-full border border-gray-300 rounded-xl py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                      rows="3"
                      placeholder="Add any additional notes..."
                    ></textarea>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
                    >
                      Save Attendance
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Bulk Attendance Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-auto max-h-screen overflow-y-auto"
            >
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 sticky top-0 z-10">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <ClipboardListIcon />
                    Bulk Attendance Entry - {selectedDate}
                  </h3>
                  <button
                    onClick={() => setShowBulkModal(false)}
                    className="text-white hover:text-gray-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleBulkSubmit}>
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-blue-700">
                          Recording attendance for {classes.find(c => c.classId === parseInt(selectedClass))?.className} on {selectedDate}.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mb-4 space-x-2">
                    <button
                      type="button"
                      className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                      onClick={() => {
                        setBulkAttendance(bulkAttendance.map(record => ({
                          ...record,
                          status: 'Present'
                        })));
                      }}
                    >
                      Set All Present
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                      onClick={() => {
                        setBulkAttendance(bulkAttendance.map(record => ({
                          ...record,
                          status: 'Absent'
                        })));
                      }}
                    >
                      Set All Absent
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Notes
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {bulkAttendance.map((record, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                                  {record.studentName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{record.studentName}</div>
                                  <div className="text-sm text-gray-500">{record.studentNumber}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex space-x-2">
                                <button
                                  type="button"
                                  className={`px-3 py-1 rounded-full text-xs ${record.status === 'Present' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-800'}`}
                                  onClick={() => handleBulkStatusChange(index, 'Present')}
                                >
                                  Present
                                </button>
                                <button
                                  type="button"
                                  className={`px-3 py-1 rounded-full text-xs ${record.status === 'Absent' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-800'}`}
                                  onClick={() => handleBulkStatusChange(index, 'Absent')}
                                >
                                  Absent
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="text"
                                value={record.notes}
                                onChange={(e) => handleBulkNotesChange(index, e.target.value)}
                                placeholder="Add notes here..."
                                className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {bulkAttendance.length === 0 && (
                    <div className="py-8 text-center">
                      <p className="text-gray-600">
                        No students found in this class. Please select another class or add students to this class first.
                      </p>
                    </div>
                  )}
                  
                  {bulkAttendance.length > 0 && (
                    <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200 sticky bottom-0 mt-6">
                      <button
                        type="button"
                        onClick={() => setShowBulkModal(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
                      >
                        Save Attendance
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      <div className="text-center text-sm text-gray-500 mt-8">
        <p>Showing {filteredAttendance.length} attendance records</p>
      </div>
    </div>
  );
}