import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import * as attendanceService from "../services/attendanceService";

export default function Attendance() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    total: 0,
    presentPercentage: 0
  });

  const [newAttendance, setNewAttendance] = useState({
    studentId: "",
    classId: "",
    date: new Date().toISOString().split('T')[0],
    status: "present", 
    notes: ""
  });

  const [bulkAttendance, setBulkAttendance] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const records = await attendanceService.getAllAttendanceRecords();
        setAttendanceRecords(records);
        
        try {
          setClasses([
            { id: 1, name: "Advanced Mathematics", subject: "Mathematics" },
            { id: 2, name: "Physics for Engineers", subject: "Physics" },
            { id: 3, name: "Organic Chemistry", subject: "Chemistry" },
            { id: 4, name: "Molecular Biology", subject: "Biology" },
            { id: 5, name: "Web Development", subject: "Computer Science" }
          ]);
          
          setStudents([
            { id: 1, name: "Alex Johnson", classIds: [1, 2], studentNumber: "ST001" },
            { id: 2, name: "Sarah Williams", classIds: [1, 3], studentNumber: "ST002" },
            { id: 3, name: "Michael Brown", classIds: [2, 5], studentNumber: "ST003" },
            { id: 4, name: "Emily Davis", classIds: [3, 4], studentNumber: "ST004" },
            { id: 5, name: "James Wilson", classIds: [1, 5], studentNumber: "ST005" },
            { id: 6, name: "Emma Taylor", classIds: [2, 4], studentNumber: "ST006" },
            { id: 7, name: "Daniel Martinez", classIds: [1, 3], studentNumber: "ST007" },
            { id: 8, name: "Olivia Anderson", classIds: [4, 5], studentNumber: "ST008" }
          ]);
        } catch (err) {
          console.error("Error fetching supporting data:", err);
        }
        
        // If no records yet from API, use mock data
        if (!records || records.length === 0) {
          // Generate some mock attendance data
          const mockAttendance = [];
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          // Mock data for current date
          mockAttendance.push(
            { 
              attendanceId: 1, 
              studentId: 1, 
              studentName: "Alex Johnson", 
              studentNumber: "ST001",
              classId: 1, 
              className: "Advanced Mathematics",
              date: today.toISOString().split('T')[0], 
              status: "present", 
              notes: "Arrived on time" 
            },
            { 
              attendanceId: 2, 
              studentId: 2, 
              studentName: "Sarah Williams", 
              studentNumber: "ST002",
              classId: 1, 
              className: "Advanced Mathematics",
              date: today.toISOString().split('T')[0], 
              status: "present", 
              notes: "" 
            },
            { 
              attendanceId: 3, 
              studentId: 3, 
              studentName: "Michael Brown", 
              studentNumber: "ST003",
              classId: 2, 
              className: "Physics for Engineers",
              date: today.toISOString().split('T')[0], 
              status: "absent", 
              notes: "No notification received" 
            },
            { 
              attendanceId: 4, 
              studentId: 4, 
              studentName: "Emily Davis", 
              studentNumber: "ST004",
              classId: 3, 
              className: "Organic Chemistry",
              date: today.toISOString().split('T')[0], 
              status: "late", 
              notes: "Arrived 15 minutes late" 
            },
            { 
              attendanceId: 5, 
              studentId: 5, 
              studentName: "James Wilson", 
              studentNumber: "ST005",
              classId: 1, 
              className: "Advanced Mathematics",
              date: today.toISOString().split('T')[0], 
              status: "excused", 
              notes: "Doctor's appointment" 
            }
          );
          
          // Mock data for yesterday
          mockAttendance.push(
            { 
              attendanceId: 6, 
              studentId: 1, 
              studentName: "Alex Johnson", 
              studentNumber: "ST001",
              classId: 2, 
              className: "Physics for Engineers",
              date: yesterday.toISOString().split('T')[0], 
              status: "present", 
              notes: "" 
            },
            { 
              attendanceId: 7, 
              studentId: 2, 
              studentName: "Sarah Williams", 
              studentNumber: "ST002",
              classId: 3, 
              className: "Organic Chemistry",
              date: yesterday.toISOString().split('T')[0], 
              status: "absent", 
              notes: "Sick leave" 
            }
          );
          
          setAttendanceRecords(mockAttendance);
        }
        
      } catch (err) {
        console.error("Error fetching attendance data:", err);
        setError("Failed to load attendance data. Please try refreshing the page.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Calculate attendance statistics whenever attendance records change
  useEffect(() => {
    // Filter records for the selected date and class
    const filteredRecords = attendanceRecords.filter(record => {
      const matchesDate = record.date === selectedDate;
      const matchesClass = selectedClass === 'all' || record.classId === parseInt(selectedClass);
      return matchesDate && matchesClass;
    });
    
    if (filteredRecords.length > 0) {
      const present = filteredRecords.filter(r => r.status === 'present').length;
      const absent = filteredRecords.filter(r => r.status === 'absent').length;
      const late = filteredRecords.filter(r => r.status === 'late').length;
      const excused = filteredRecords.filter(r => r.status === 'excused').length;
      const total = filteredRecords.length;
      const presentPercentage = Math.round((present + late) / total * 100);
      
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
  }, [attendanceRecords, selectedDate, selectedClass]);

  // Initialize bulk attendance when students or selectedClass changes
  useEffect(() => {
    if (selectedClass !== 'all') {
      const classId = parseInt(selectedClass);
      const studentsInClass = students.filter(student => 
        student.classIds.includes(classId)
      );
      
      setBulkAttendance(studentsInClass.map(student => ({
        studentId: student.id,
        studentName: student.name,
        studentNumber: student.studentNumber,
        classId,
        className: classes.find(c => c.id === classId)?.name || '',
        date: selectedDate,
        status: 'present',
        notes: ''
      })));
    }
  }, [students, selectedClass, selectedDate, classes]);

  // Filter attendance records based on date, class and search query
  const filteredAttendance = attendanceRecords.filter(record => {
    const matchesDate = record.date === selectedDate;
    const matchesClass = selectedClass === 'all' || record.classId === parseInt(selectedClass);
    const matchesSearch = !searchQuery || 
      record.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.studentNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesDate && matchesClass && matchesSearch;
  });

  // Handle input changes for new attendance record
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAttendance({ ...newAttendance, [name]: value });
  };

  // Handle bulk attendance status change
  const handleBulkStatusChange = (index, status) => {
    const updated = [...bulkAttendance];
    updated[index].status = status;
    setBulkAttendance(updated);
  };

  // Handle bulk attendance notes change
  const handleBulkNotesChange = (index, notes) => {
    const updated = [...bulkAttendance];
    updated[index].notes = notes;
    setBulkAttendance(updated);
  };

  // Handle date range change for reports
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange({ ...dateRange, [name]: value });
  };

  // Add a single attendance record
  const handleAddAttendance = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Get student and class details
      const student = students.find(s => s.id === parseInt(newAttendance.studentId));
      const classObj = classes.find(c => c.id === parseInt(newAttendance.classId));
      
      // Create new attendance record with additional display fields
      const attendanceRecord = {
        ...newAttendance,
        studentId: parseInt(newAttendance.studentId),
        classId: parseInt(newAttendance.classId),
        studentName: student?.name || 'Unknown Student',
        studentNumber: student?.studentNumber || 'N/A',
        className: classObj?.name || 'Unknown Class'
      };
      
      // In a real app, you would call the API
      // const response = await attendanceService.createAttendance(attendanceRecord);
      // const savedRecord = response;
      
      // For now, simulate API response
      const savedRecord = {
        ...attendanceRecord,
        attendanceId: Date.now()
      };
      
      // Update state with new record
      setAttendanceRecords([savedRecord, ...attendanceRecords]);
      
      // Reset form and close modal
      setNewAttendance({
        studentId: "",
        classId: "",
        date: new Date().toISOString().split('T')[0],
        status: "present",
        notes: ""
      });
      setShowAddModal(false);
      
    } catch (err) {
      console.error("Error adding attendance record:", err);
      alert("Failed to add attendance record. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Submit bulk attendance
  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // In a real app, you would call the API
      // const response = await attendanceService.bulkCreateAttendance(bulkAttendance);
      // const savedRecords = response;
      
      // For now, simulate API response
      const savedRecords = bulkAttendance.map((record, index) => ({
        ...record,
        attendanceId: Date.now() + index
      }));
      
      // Update state with new records
      // Check for existing records and replace them, or add new ones
      const existingIds = attendanceRecords
        .filter(r => r.date === selectedDate)
        .map(r => r.studentId);
      
      const updatedRecords = [
        ...attendanceRecords.filter(r => !(r.date === selectedDate && savedRecords.some(sr => sr.studentId === r.studentId))),
        ...savedRecords
      ];
      
      setAttendanceRecords(updatedRecords);
      setShowBulkModal(false);
      
    } catch (err) {
      console.error("Error submitting bulk attendance:", err);
      alert("Failed to submit attendance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle attendance status update
  const handleStatusChange = async (id, newStatus) => {
    try {
      // Optimistic UI update
      const updatedRecords = attendanceRecords.map(record => 
        record.attendanceId === id ? { ...record, status: newStatus } : record
      );
      setAttendanceRecords(updatedRecords);
      
      // In a real app, call the API
      // Find the record to update
      const recordToUpdate = attendanceRecords.find(r => r.attendanceId === id);
      if (recordToUpdate) {
        // await attendanceService.updateAttendance(id, { ...recordToUpdate, status: newStatus });
        console.log(`Updated attendance ${id} to status: ${newStatus}`);
      }
    } catch (err) {
      console.error("Error updating attendance status:", err);
      // Revert the change if API call fails
      alert("Failed to update attendance status. Please try again.");
      setAttendanceRecords([...attendanceRecords]);
    }
  };

  // Delete attendance record
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this attendance record?")) {
      try {
        // Optimistic UI update
        setAttendanceRecords(attendanceRecords.filter(record => record.attendanceId !== id));
        
        // In a real app, call the API
        // await attendanceService.deleteAttendance(id);
        console.log(`Deleted attendance record ${id}`);
      } catch (err) {
        console.error("Error deleting attendance record:", err);
        // Revert the deletion if API call fails
        alert("Failed to delete attendance record. Please try again.");
        setAttendanceRecords([...attendanceRecords]);
      }
    }
  };

  // Get color for status badge
  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'excused':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Export attendance data to CSV
  const exportToCSV = () => {
    // Filter records based on current filters
    const records = filteredAttendance;
    
    if (records.length === 0) {
      alert('No data to export');
      return;
    }
    
    // Create CSV header
    const headers = ['Date', 'Student Name', 'Student ID', 'Class', 'Status', 'Notes'];
    
    // Convert records to CSV rows
    const rows = records.map(record => [
      record.date,
      record.studentName,
      record.studentNumber,
      record.className,
      record.status.charAt(0).toUpperCase() + record.status.slice(1),
      record.notes
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
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

  if (loading && attendanceRecords.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Attendance Management</h1>
        <p className="text-gray-600">Track and manage student attendance records</p>
      </div>

      {/* Actions and Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Date and Class Selection */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 items-end justify-end">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add Record
          </button>
          
          <button
            onClick={() => setShowBulkModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
            disabled={selectedClass === 'all'}
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
            </svg>
            Bulk Entry
          </button>
          
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Export
          </button>
          
          <Link 
            to="/attendance/reports"
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            Reports
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search students by name, ID, or notes..."
            className="w-full border border-gray-300 rounded-md pl-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md transform transition-all duration-200 hover:scale-105">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Total Students</span>
            <div className="rounded-full bg-gray-100 p-2">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold">{attendanceStats.total}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md transform transition-all duration-200 hover:scale-105">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Present</span>
            <div className="rounded-full bg-green-100 p-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold">{attendanceStats.present}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md transform transition-all duration-200 hover:scale-105">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Absent</span>
            <div className="rounded-full bg-red-100 p-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold">{attendanceStats.absent}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md transform transition-all duration-200 hover:scale-105">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Late</span>
            <div className="rounded-full bg-yellow-100 p-2">
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold">{attendanceStats.late}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md transform transition-all duration-200 hover:scale-105">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Attendance Rate</span>
            <div className="rounded-full bg-blue-100 p-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold">{attendanceStats.presentPercentage}%</div>
        </div>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Records Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAttendance.map((record) => (
                <tr key={record.attendanceId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{record.studentName}</div>
                        <div className="text-sm text-gray-500">{record.studentNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{record.className}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(record.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        className={`px-2 py-1 rounded-full text-xs ${record.status === 'present' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                        onClick={() => handleStatusChange(record.attendanceId, 'present')}
                      >
                        Present
                      </button>
                      <button
                        className={`px-2 py-1 rounded-full text-xs ${record.status === 'absent' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                        onClick={() => handleStatusChange(record.attendanceId, 'absent')}
                      >
                        Absent
                      </button>
                      <button
                        className={`px-2 py-1 rounded-full text-xs ${record.status === 'late' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                        onClick={() => handleStatusChange(record.attendanceId, 'late')}
                      >
                        Late
                      </button>
                      <button
                        className={`px-2 py-1 rounded-full text-xs ${record.status === 'excused' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                        onClick={() => handleStatusChange(record.attendanceId, 'excused')}
                      >
                        Excused
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {record.notes || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          // Edit logic here
                          alert('Edit functionality would go here');
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(record.attendanceId)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredAttendance.length === 0 && (
          <div className="py-12 text-center">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <p className="mt-4 text-gray-600">
              {selectedClass === 'all' 
                ? 'No attendance records found for the selected date.' 
                : 'No attendance records found for this class on the selected date.'}
            </p>
            <button
              onClick={() => setShowBulkModal(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {selectedClass === 'all' 
                ? 'Select a class to add attendance' 
                : 'Add attendance for this class'}
            </button>
          </div>
        )}
      </div>

      {/* Add Attendance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-bold text-gray-800">Add Attendance Record</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddAttendance}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                  <select
                    name="studentId"
                    value={newAttendance.studentId}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name} ({student.studentNumber})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <select
                    name="classId"
                    value={newAttendance.classId}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={newAttendance.date}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="flex flex-wrap gap-3">
                    {['present', 'absent', 'late', 'excused'].map(status => (
                      <button
                        key={status}
                        type="button"
                        className={`px-4 py-2 rounded-md ${
                          newAttendance.status === status
                            ? `bg-${
                                status === 'present' ? 'green' :
                                status === 'absent' ? 'red' :
                                status === 'late' ? 'yellow' : 'blue'
                              }-500 text-white`
                            : 'bg-gray-100 text-gray-800'
                        }`}
                        onClick={() => setNewAttendance({ ...newAttendance, status })}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    value={newAttendance.notes}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                >
                  Add Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Attendance Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-gray-800">
                Bulk Attendance Entry - {selectedDate}
              </h3>
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
            <form onSubmit={handleBulkSubmit}>
              <div className="p-6">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-blue-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        Recording attendance for {classes.find(c => c.id === parseInt(selectedClass))?.name} on {selectedDate}.
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
                        status: 'present'
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
                        status: 'absent'
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
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bulkAttendance.map((record, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
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
                                className={`px-3 py-1 rounded-full text-xs ${record.status === 'present' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-800'}`}
                                onClick={() => handleBulkStatusChange(index, 'present')}
                              >
                                Present
                              </button>
                              <button
                                type="button"
                                className={`px-3 py-1 rounded-full text-xs ${record.status === 'absent' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-800'}`}
                                onClick={() => handleBulkStatusChange(index, 'absent')}
                              >
                                Absent
                              </button>
                              <button
                                type="button"
                                className={`px-3 py-1 rounded-full text-xs ${record.status === 'late' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-800'}`}
                                onClick={() => handleBulkStatusChange(index, 'late')}
                              >
                                Late
                              </button>
                              <button
                                type="button"
                                className={`px-3 py-1 rounded-full text-xs ${record.status === 'excused' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}
                                onClick={() => handleBulkStatusChange(index, 'excused')}
                              >
                                Excused
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
              </div>
              
              {bulkAttendance.length > 0 && (
                <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200 sticky bottom-0">
                  <button
                    type="button"
                    onClick={() => setShowBulkModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                  >
                    Save Attendance
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      <div className="text-center text-sm text-gray-500 mt-8">
        <p>Showing {filteredAttendance.length} attendance records</p>
      </div>
    </div>
  );
}