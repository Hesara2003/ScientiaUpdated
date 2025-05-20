import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getStudents, addStudent, updateStudent, deleteStudent } from "../../services/studentService";
import { getAllFees } from "../../services/feeService";
import { toast } from "react-hot-toast";
import StudentFormModal from "../../components/students/StudentFormModal";
import { format } from "date-fns";
import { getAllParents } from "../../services/parentService";
import { getParentStudents, addParentStudent } from "../../services/parentStudentService";

export default function StudentManagement() {
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
  };  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]); 
  const [parents, setParents] = useState([]);
  const [parentStudents, setParentStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    course: "",
    status: "active"
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudentsAndFees();
  }, []);
  const fetchStudentsAndFees = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [studentsData, feesData, parentsData, parentStudentsData] = await Promise.all([
        getStudents(),
        getAllFees(),
        getAllParents(),
        getParentStudents()
      ]);
      
      console.log("Loaded students:", studentsData.length);
      console.log("Loaded fees:", feesData.length);
      console.log("Loaded parents:", parentsData.length);
      console.log("Loaded parent-student relationships:", parentStudentsData.length);
        setFees(feesData);
      setParents(parentsData);
      setParentStudents(parentStudentsData);
      
      const studentParentMap = {};
      parentStudentsData.forEach(relation => {
        const studentId = relation.studentId?.toString();
        if (studentId) {
          studentParentMap[studentId] = relation.parentId?.toString();
          console.log(`Mapped student ${studentId} to parent ${relation.parentId}`);
        } else {
          console.warn(`Invalid student ID in relation:`, relation);
        }
      });
      
      console.log(`Built student-parent map with ${Object.keys(studentParentMap).length} entries:`, studentParentMap);
      
      const studentsWithPayments = studentsData.map(student => {
        const studentId = (student.studentId || student.id)?.toString();
        console.log(`Processing student: ${student.firstName} ${student.lastName}, ID: ${studentId}`);
        
        // Find parent for this student
        const parentId = studentParentMap[studentId];
        console.log(`Parent ID for student ${studentId}: ${parentId || 'None'}`);
        
        const parent = parentId 
          ? parentsData.find(p => p.id?.toString() === parentId) 
          : null;
          
        if (parent) {
          console.log(`Found parent for student ${studentId}: ${parent.firstName} ${parent.lastName}`);
        } else if (parentId) {
          console.warn(`Parent ID ${parentId} found for student ${studentId}, but parent data not found in parents list`);
          console.log(`Available parents:`, parentsData.map(p => ({id: p.id, name: `${p.firstName} ${p.lastName}`})));
        }
        
        const studentFees = feesData.filter(fee => {
          if (fee.student && (fee.student.studentId === studentId || 
              fee.student.id === studentId ||
              String(fee.student.studentId) === String(studentId) ||
              String(fee.student.id) === String(studentId))) {
            return true;
          }
          
          if (fee.studentId === studentId || 
              String(fee.studentId) === String(studentId)) {
            return true;
          }
          
          if (fee.student_id === studentId || 
              String(fee.student_id) === String(studentId)) {
            return true;
          }
          
          return false;
        });
        
        console.log(`Found ${studentFees.length} fees for student ${studentId}`);
        
        const paidFees = studentFees.filter(fee => {
          const status = fee.status || '';
          return status.toLowerCase() === 'paid';
        });
        
        console.log(`Found ${paidFees.length} paid fees for student ${studentId}`);
        
        paidFees.sort((a, b) => {
          const dateA = a.paymentDate || a.payment_date || a.paidDate || a.date;
          const dateB = b.paymentDate || b.payment_date || b.paidDate || b.date;
          
          if (!dateA) return 1;  
          if (!dateB) return -1; 
          
          return new Date(dateB) - new Date(dateA);
        });
        
        if (paidFees.length > 0) {
          console.log(`Latest payment for ${studentId}:`, paidFees[0]);
        }
        
        const getAmount = (fee) => {
          return fee.amount || fee.feeAmount || fee.payment_amount || 0;
        };
        
        return {
          ...student,
          parent: parent,
          parentId: parentId,
          lastPayment: paidFees.length > 0 ? 
            (paidFees[0].paymentDate || paidFees[0].payment_date || paidFees[0].paidDate || paidFees[0].date) : 
            null,
          lastPaymentAmount: paidFees.length > 0 ? getAmount(paidFees[0]) : null,
          totalPaid: paidFees.reduce((sum, fee) => sum + Number(getAmount(fee) || 0), 0),
          paymentCount: paidFees.length
        };
      });
      
      const studentsWithPaymentsCount = studentsWithPayments.filter(s => s.lastPayment).length;
      console.log(`${studentsWithPaymentsCount} out of ${studentsWithPayments.length} students have payment records`);
      
      setStudents(studentsWithPayments);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load students data. Please try again.");
      toast.error("Could not fetch data from server.");
    } finally {
      setIsLoading(false);
    }
  };
  const fetchStudents = fetchStudentsAndFees;
  const handleAddStudent = async (studentData) => {
    try {
      if (!studentData.firstName || !studentData.lastName || !studentData.email) {
        throw new Error("Missing required student information");
      }
      
      console.log("Sending student data to API:", studentData);
      
      const newStudentData = await addStudent(studentData);
      
      toast.success("Student added successfully!");
      
      // If parent is linked, create the parent-student relationship
      if (studentData.parentId) {
        try {
          // Validate parent and student IDs
          if (!studentData.parentId || !newStudentData.id) {
            console.error("Missing parentId or studentId for relationship", {
              parentId: studentData.parentId,
              studentId: newStudentData.id || newStudentData.studentId
            });
            toast.error("Cannot link student to parent: missing ID information");
          } else {
            const relationData = {
              parentId: studentData.parentId,
              studentId: newStudentData.id || newStudentData.studentId
            };
            
            // Call the parentStudentService to create the relationship in the API
            const relationResult = await addParentStudent(relationData);
            console.log("Created parent-student relationship:", relationResult);
            
            // Add the new relationship to local state as well
            setParentStudents(prev => [...prev, relationResult]);
            
            toast.success("Student linked to parent successfully!");
          }
        } catch (relationError) {
          console.error("Error creating parent-student relationship:", relationError);
          toast.error(`Student added but couldn't link to parent: ${relationError.message || 'Unknown error'}`);
        }
      }
      
      setShowAddModal(false);
      
      fetchStudents();
      
      return newStudentData;
    } catch (error) {
      console.error("Error adding student:", error);
      
      toast.error(error.response?.data?.message || error.message || "Failed to add student");
      
      throw error;
    }
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      setIsLoading(true);
      try {
        await deleteStudent(id);
        toast.success("Student deleted successfully!");
        fetchStudents();
      } catch (err) {
        toast.error("Failed to delete student.");
        setIsLoading(false);
      }
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    setIsLoading(true);
    try {
      await updateStudent(id, { status: newStatus });
      toast.success("Student status updated!");
      fetchStudents();
    } catch (err) {
      toast.error("Failed to update student status.");
      setIsLoading(false);
    }
  };

  const getStudentId = (student) => {
    return student.studentId || student.id;
  };

  const filteredStudents = students.filter(student => {
    const fullName = `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                          student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || student.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

const renderLastPayment = (student) => {
  if (student.lastPayment) {
    try {
      const paymentDate = new Date(student.lastPayment);
      const formattedDate = isNaN(paymentDate) ? 'Invalid date' : paymentDate.toLocaleDateString();
      
      return (
        <div className="flex flex-col">
          <div className="flex items-center text-sm text-gray-900">
            <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {formattedDate}
          </div>
          {student.lastPaymentAmount && (
            <div className="text-xs text-gray-500 mt-1">
              Amount: ${Number(student.lastPaymentAmount).toFixed(2)}
            </div>
          )}
          {student.paymentCount > 1 && (
            <div className="text-xs text-blue-500 mt-1">
              {student.paymentCount} payments total
            </div>
          )}
        </div>
      );
    } catch (error) {
      console.error("Error rendering payment date:", error);
      return (
        <span className="text-sm text-orange-500 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Payment data error
        </span>
      );
    }
  } else {
    return (
      <span className="text-sm text-red-500 flex items-center">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        No payment
      </span>
    );
  }
};
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-6 mb-8 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl"></div>
          
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 relative z-10">            <div>
              <div className="text-sm font-medium text-indigo-200 mb-1">
                {format(new Date(), "EEEE, MMMM d, yyyy")}
              </div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <svg className="w-10 h-10 mr-3 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
                Student Management
              </h1>
              <p className="text-indigo-100 mt-1 max-w-xl">Track, update and manage all student information in the Sciencia Education System</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/admin/student-management"
                className="bg-indigo-800 text-white hover:bg-indigo-700 py-3 px-6 rounded-xl shadow-md transition duration-300 flex items-center gap-2 w-full md:w-auto justify-center transform hover:-translate-y-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path>
                </svg>
                View Recent Registrations
              </Link>
              <button 
                className="bg-white text-indigo-700 hover:bg-indigo-50 py-3 px-6 rounded-xl shadow-md transition duration-300 flex items-center gap-2 w-full md:w-auto justify-center transform hover:-translate-y-1"
                onClick={() => setShowAddModal(true)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add New Student
              </button>
            </div>
          </div>
        </div>
          {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-indigo-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-sm font-medium text-gray-500 uppercase mb-2">Total Students</div>
            <div className="flex items-center">
              <div className="text-3xl font-bold text-gray-800 mr-3">{students.length}</div>
              <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                All Enrolled
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {students.filter(s => s.status === 'active').length} active students
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-emerald-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-sm font-medium text-gray-500 uppercase mb-2">Active Status</div>
            <div className="flex items-center">
              <div className="text-3xl font-bold text-gray-800 mr-3">
                {Math.round((students.filter(s => s.status === 'active').length / Math.max(students.length, 1)) * 100)}%
              </div>
              <div className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                Participation
              </div>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 rounded-full" 
                style={{ width: `${(students.filter(s => s.status === 'active').length / Math.max(students.length, 1)) * 100}%` }}>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-amber-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-sm font-medium text-gray-500 uppercase mb-2">Payment Status</div>
            <div className="flex items-center">
              <div className="text-3xl font-bold text-gray-800 mr-3">
                {students.filter(s => s.lastPayment).length}
              </div>
              <div className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                With Payments
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {students.length - students.filter(s => s.lastPayment).length} students without payment records
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-sm font-medium text-gray-500 uppercase mb-2">Average Paid</div>
            <div className="flex items-center">
              <div className="text-3xl font-bold text-gray-800 mr-3">
                ${students.reduce((sum, student) => sum + (student.totalPaid || 0), 0) / 
                  Math.max(students.filter(s => s.totalPaid).length, 1)}
              </div>
              <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                Per Student
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Total: ${students.reduce((sum, student) => sum + (student.totalPaid || 0), 0).toFixed(2)}
            </div>
          </div>
        </div>
      
        {/* Search and Filter */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-6 hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input 
                type="text" 
                className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 leading-5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center">
              <label htmlFor="filter" className="mr-3 text-sm font-medium text-gray-700">Status:</label>
              <select 
                id="filter" 
                className="block pl-4 pr-10 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Students</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
            
            <button 
              onClick={fetchStudents} 
              className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 py-3 px-6 rounded-xl transition duration-300 flex items-center gap-2 w-full md:w-auto justify-center transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Refresh
            </button>
          </div>
        </div>
          {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-xl mb-6 shadow-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Students List */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-16">
              <div className="w-20 h-20 relative">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-100 rounded-full animate-ping opacity-75"></div>
                <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <span className="mt-6 text-gray-600 text-lg font-medium">Loading students data...</span>
              <p className="text-gray-400 text-sm mt-2">Please wait while we fetch the latest information</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center p-16">
              <div className="w-24 h-24 mx-auto bg-indigo-50 rounded-full flex items-center justify-center">
                <svg className="w-14 h-14 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <p className="mt-6 text-xl font-medium text-gray-700">No students found matching your search criteria.</p>
              <p className="mt-2 text-gray-500 max-w-md mx-auto">Try adjusting your search or filter to find what you're looking for.</p>
              <button 
                className="mt-6 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 py-2.5 px-6 rounded-lg transition duration-300 font-medium"
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50">
                  <tr>                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                      Student
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                      Course
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                      Parent
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                      Status
                    </th>                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                      Last Payment
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-indigo-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredStudents.map((student) => (
                    <tr key={student.studentId || student.id} className="hover:bg-indigo-50/50 transition-all duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-14 w-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-medium text-lg shadow-lg">
                            {(student.firstName?.[0] || '') + (student.lastName?.[0] || '') || '?'}
                          </div>
                          <div className="ml-4">
                            <div className="text-base font-semibold text-gray-900">
                              {`${student.firstName || ''} ${student.lastName || ''}`}
                            </div>
                            <div className="flex items-center mt-1">
                              <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                                ID: {student.studentId || student.id}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm text-gray-900 flex items-center">
                            <svg className="w-4 h-4 mr-1.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                            </svg>
                            <span className="font-medium">{student.email}</span>
                          </div>
                          <div className="text-sm text-gray-500 flex items-center mt-1.5">
                            <svg className="w-4 h-4 mr-1.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                            </svg>
                            {student.phoneNumber || student.phone || 'No phone'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 px-3 py-1 bg-indigo-50 rounded-lg inline-flex items-center">
                          <svg className="w-4 h-4 mr-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 14l9-5-9-5-9 5z"></path>
                            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path>
                          </svg>                          {student.course || 'Not assigned'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {student.parent ? (
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-medium text-xs shadow-md">
                              {(student.parent.firstName?.[0] || '') + (student.parent.lastName?.[0] || '') || '?'}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {student.parent.firstName} {student.parent.lastName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {student.parent.email}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 flex items-center">
                            <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            No parent linked
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className={`px-4 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer transition-colors duration-150
                          ${student.status === 'active' 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                          onClick={() => handleUpdateStatus(getStudentId(student), student.status === 'active' ? 'inactive' : 'active')}
                          title="Click to toggle status"
                        >
                          {student.status === 'active' ? (
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                          )}
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderLastPayment(student)}
                      </td>                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-2">
                          <Link to={`/admin/students/${student.studentId || student.id}/assign`} className="bg-green-50 p-2 rounded-lg text-green-600 hover:bg-green-100 transition-colors duration-150" title="Assign to Classes">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                            </svg>
                          </Link>
                          <Link to={`/admin/students/${student.studentId || student.id}/edit`} className="bg-indigo-50 p-2 rounded-lg text-indigo-600 hover:bg-indigo-100 transition-colors duration-150">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                          </Link>
                          <button 
                            className="bg-red-50 p-2 rounded-lg text-red-600 hover:bg-red-100 transition-colors duration-150"
                            onClick={() => handleDeleteStudent(getStudentId(student))}
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
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Student Management System</p>
        </div>
      </div>

      {/* Add Student Modal */}
      <StudentFormModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddStudent}
        initialData={newStudent}
        title="Add New Student"
      />
    </div>
  );
}