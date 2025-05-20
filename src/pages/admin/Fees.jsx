import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { getAllFees, markFeeAsPaid, deleteFee, addFeePayment } from '../../services/feeService';
import { getStudents } from '../../services/studentService';
import FeeFormModal from '../../components/fees/FeeFormModal';
import { format } from 'date-fns';

const Fees = () => {
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
  
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'dueDate', direction: 'asc' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [studentNameCache, setStudentNameCache] = useState({});

  const findStudentName = (studentId, studentsList) => {
    if (!studentId || !studentsList || !studentsList.length) {
      return null;
    }
    
    const student = studentsList.find(s => 
      s.id === studentId || 
      s.studentId === studentId ||
      String(s.id) === String(studentId) || 
      String(s.studentId) === String(studentId)
    );
    
    if (student) {
      return `${student.firstName} ${student.lastName}`;
    }
    
    return null;
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      
      try {
        const studentData = await getStudents();
        console.log('Students loaded:', studentData.length);
        setStudents(studentData || []);
        
        const nameCache = {};
        studentData.forEach(student => {
          nameCache[student.studentId] = `${student.firstName} ${student.lastName}`;
        });
        setStudentNameCache(nameCache);
        localStorage.setItem('studentNameCache', JSON.stringify(nameCache));
        
        const feeData = await getAllFees();
        console.log('Fees loaded:', feeData?.length || 0);
        
        const formattedFees = Array.isArray(feeData) ? feeData.map(fee => {
          let studentName = fee.studentName;
          if (!studentName && fee.studentId) {
            studentName = findStudentName(fee.studentId, studentData);
          }
          
          return {
            id: fee.feeId || fee.id,
            studentName: studentName || 'Unknown Student',
            studentId: fee.studentId?.toString() || '',
            amount: fee.amount || 0,
            dueDate: fee.dueDate,
            status: fee.status?.toLowerCase() || 'pending',
            category: fee.category || 'Tuition',
            paymentDate: fee.paymentDate || null
          };
        }) : [];
        
        setFees(formattedFees);
        setError(null);
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Failed to load fees data. Please try again.');
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
    
    const cachedNames = localStorage.getItem('studentNameCache');
    if (cachedNames) {
      setStudentNameCache(JSON.parse(cachedNames));
    }
    
    loadInitialData();
  }, []);

  const getSummaryStats = () => {
    const stats = {
      totalFees: 0,
      pendingAmount: 0,
      paidAmount: 0,
      overdueCount: 0
    };
    
    if (!fees.length) return stats;
    
    fees.forEach(fee => {
      stats.totalFees += 1;
      
      const amount = Number(fee.amount) || 0;
      
      if (fee.status === 'paid') {
        stats.paidAmount += amount;
      } else {
        stats.pendingAmount += amount;
        
        const dueDate = new Date(fee.dueDate);
        const today = new Date();
        if (dueDate < today) {
          stats.overdueCount += 1;
        }
      }
    });
    
    return stats;
  };

  const getFilteredFees = () => {
    return fees
      .filter(fee => {
        const matchesSearch = 
          (fee.studentName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
          (fee.studentId?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (fee.category?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === 'all' || fee.status === filterStatus;
        
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortConfig.key === 'dueDate') {
          const dateA = new Date(a.dueDate || 0);
          const dateB = new Date(b.dueDate || 0);
          return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }
        
        if (sortConfig.key === 'amount') {
          return sortConfig.direction === 'asc' 
            ? Number(a.amount || 0) - Number(b.amount || 0) 
            : Number(b.amount || 0) - Number(a.amount || 0);
        }
        
        const valueA = String(a[sortConfig.key] || '').toLowerCase();
        const valueB = String(b[sortConfig.key] || '').toLowerCase();
        
        return sortConfig.direction === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      });
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleMarkAsPaid = async (feeId) => {
    try {
      await markFeeAsPaid(feeId);
      
      setFees(fees.map(fee => 
        fee.id === feeId 
          ? { ...fee, status: 'paid', paymentDate: new Date().toISOString().split('T')[0] } 
          : fee
      ));
      
      toast.success('Fee marked as paid successfully');
    } catch (error) {
      console.error('Error marking fee as paid:', error);
      toast.error('Failed to update payment status');
    }
  };

  const handleDeleteFee = async (feeId) => {
    if (!confirm('Are you sure you want to delete this fee record?')) {
      return;
    }
    
    try {
      await deleteFee(feeId);
      
      setFees(fees.filter(fee => fee.id !== feeId));
      
      toast.success('Fee record deleted successfully');
    } catch (error) {
      console.error('Error deleting fee:', error);
      toast.error('Failed to delete fee record');
    }
  };

  const handleAddFee = async (feeData) => {
    try {
      console.log('Adding fee with data:', feeData);
      
      if (!feeData.studentId) {
        toast.error('Student ID is required');
        return;
      }
      
      let studentName = feeData.studentName;
      if (!studentName || studentName.trim() === '') {
        const foundName = findStudentName(feeData.studentId, students);
        if (foundName) {
          studentName = foundName;
          feeData.studentName = studentName;
        } else {
          feeData.studentName = `Student ${feeData.studentId}`;
        }
      }
      
      const result = await addFeePayment(feeData);
      console.log('Server response from fee creation:', result);
      
      const newFee = {
        id: result.feeId || result.id,
        studentName: feeData.studentName,
        studentId: feeData.studentId,
        amount: feeData.amount,
        dueDate: feeData.dueDate,
        status: (feeData.status || 'Pending').toLowerCase(),
        category: feeData.category,
        paymentDate: feeData.status === 'Paid' ? new Date().toISOString().split('T')[0] : null
      };
      
      console.log('Adding new fee to UI:', newFee);
      setFees([...fees, newFee]);
      
      toast.success('Fee added successfully');
      return result;
    } catch (error) {
      console.error('Error adding fee:', error);
      toast.error(error.response?.data?.message || 'Failed to add fee');
      throw error;
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'paid') {
      return (
        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          Paid
        </span>
      );
    } else if (status === 'overdue') {
      return (
        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
          Overdue
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
          Pending
        </span>
      );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const stats = getSummaryStats();
  const filteredFees = getFilteredFees();
  if (isLoading) {
    return (
      <div className="py-16 px-4 flex justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center"
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-100"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 absolute top-0"></div>
          </div>
          <p className="mt-4 text-indigo-800 font-medium">Loading fees data...</p>
          <p className="text-gray-500 text-sm mt-2">This may take a moment</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 px-4">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden"
        >
          <div className="p-1 bg-gradient-to-r from-red-500 to-pink-500"></div>
          <div className="p-8">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-full p-3">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-5">
                <h3 className="text-lg font-medium text-gray-900">Error Loading Data</h3>
                <p className="mt-1 text-base text-gray-600">{error}</p>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-end">
              <button 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={() => window.location.reload()}
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry Loading Data
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg mb-8 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-indigo-500 to-indigo-600 opacity-30 rounded-l-xl"></div>
          <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-b from-purple-400 to-transparent opacity-20"></div>
          <div className="absolute bottom-0 left-1/3 w-24 h-24 bg-white rounded-full opacity-10"></div>
          <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-white rounded-full opacity-5"></div>
        </div>
        
        <div className="relative md:flex md:items-center md:justify-between p-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-white sm:text-3xl sm:truncate">
              Fees Management
            </h2>
            <p className="mt-2 text-sm text-indigo-100">
              Manage student fees, payments, and track financial records with ease
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New Fee
            </motion.button>
          </div>
        </div>
      </div>      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white overflow-hidden shadow-md rounded-xl border border-indigo-50 hover:shadow-lg transition-all duration-200"
        >
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-3 shadow-md">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Fees
                </dt>
                <dd className="mt-1 flex items-baseline">
                  <div className="text-2xl font-bold text-indigo-700">
                    {stats.totalFees}
                  </div>
                  <div className="ml-2 flex items-baseline text-sm font-semibold text-indigo-500">
                    <span className="sr-only">Fee Records</span>
                    Entries
                  </div>
                </dd>
              </div>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white overflow-hidden shadow-md rounded-xl border border-amber-50 hover:shadow-lg transition-all duration-200"
        >
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg p-3 shadow-md">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Pending Amount
                </dt>
                <dd className="mt-1 flex items-baseline">
                  <div className="text-2xl font-bold text-amber-600">
                    {formatCurrency(stats.pendingAmount)}
                  </div>
                </dd>
              </div>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-500"></div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white overflow-hidden shadow-md rounded-xl border border-green-50 hover:shadow-lg transition-all duration-200"
        >
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-lg p-3 shadow-md">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Collected
                </dt>
                <dd className="mt-1 flex items-baseline">
                  <div className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(stats.paidAmount)}
                  </div>
                </dd>
              </div>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-500"></div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-white overflow-hidden shadow-md rounded-xl border border-red-50 hover:shadow-lg transition-all duration-200"
        >
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gradient-to-br from-red-400 to-red-500 rounded-lg p-3 shadow-md">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Overdue Payments
                </dt>
                <dd className="mt-1 flex items-baseline">
                  <div className="text-2xl font-bold text-red-600">
                    {stats.overdueCount}
                  </div>
                  <div className="ml-2 flex items-baseline text-sm font-semibold text-red-500">
                    <span className="sr-only">Fees</span>
                    Fees
                  </div>
                </dd>
              </div>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-red-400 to-red-500"></div>
        </motion.div>
      </div>      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="bg-white shadow-md rounded-xl mb-8 overflow-hidden border border-indigo-50"
      >
        <div className="border-b border-indigo-100 bg-gradient-to-r from-indigo-50 to-white px-4 py-4">
          <h3 className="text-lg font-medium text-indigo-700 flex items-center">
            <svg className="h-5 w-5 mr-2 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Search and Filter Fees
          </h3>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <div className="relative">
              <label htmlFor="search" className="block text-sm font-medium text-indigo-700 mb-1">Search</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg shadow-sm"
                  placeholder="Student name or ID"
                />
                {searchTerm && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-indigo-700 mb-1">Status</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <select
                  id="status"
                  name="status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-end">
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </motion.div>      <div className="bg-white shadow-md overflow-hidden rounded-xl border border-indigo-50">
        {filteredFees.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <div className="mx-auto h-24 w-24 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
              <svg className="h-12 w-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
            
            <h3 className="text-lg font-semibold text-indigo-800">No fees found</h3>
            <p className="mt-2 text-base text-gray-500 max-w-md mx-auto">
              {searchTerm || filterStatus !== 'all' ? 
                'Try adjusting your search or filter criteria to find what you\'re looking for.' : 
                'Get started by creating your first fee record to track student payments.'}
            </p>
            <div className="mt-8">              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create New Fee Record
              </button>
            </div>
            
            {(searchTerm || filterStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
                className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
              >
                <svg className="mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Reset all filters
              </button>
            )}
          </motion.div>
        ) : (          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-indigo-100">
              <thead className="bg-gradient-to-r from-indigo-50 to-white">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider cursor-pointer hover:text-indigo-800 transition-colors duration-150"
                    onClick={() => handleSort('studentName')}
                  >
                    <div className="flex items-center">
                      <span>Student</span>
                      {sortConfig.key === 'studentName' && (
                        <svg className="w-4 h-4 ml-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          {sortConfig.direction === 'asc' ? (
                            <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M5.293 9.293a1 1 0 011.414 0L10 12.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          )}
                        </svg>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider cursor-pointer hover:text-indigo-800 transition-colors duration-150"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center">
                      <span>Amount</span>
                      {sortConfig.key === 'amount' && (
                        <svg className="w-4 h-4 ml-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          {sortConfig.direction === 'asc' ? (
                            <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M5.293 9.293a1 1 0 011.414 0L10 12.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          )}
                        </svg>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider cursor-pointer hover:text-indigo-800 transition-colors duration-150"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center">
                      <span>Category</span>
                      {sortConfig.key === 'category' && (
                        <svg className="w-4 h-4 ml-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          {sortConfig.direction === 'asc' ? (
                            <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M5.293 9.293a1 1 0 011.414 0L10 12.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          )}
                        </svg>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider cursor-pointer hover:text-indigo-800 transition-colors duration-150"
                    onClick={() => handleSort('dueDate')}
                  >
                    <div className="flex items-center">
                      <span>Due Date</span>
                      {sortConfig.key === 'dueDate' && (
                        <svg className="w-4 h-4 ml-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          {sortConfig.direction === 'asc' ? (
                            <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M5.293 9.293a1 1 0 011.414 0L10 12.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          )}
                        </svg>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider cursor-pointer hover:text-indigo-800 transition-colors duration-150"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      <span>Status</span>
                      {sortConfig.key === 'status' && (
                        <svg className="w-4 h-4 ml-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          {sortConfig.direction === 'asc' ? (
                            <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M5.293 9.293a1 1 0 011.414 0L10 12.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          )}
                        </svg>
                      )}
                    </div>
                  </th>                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-indigo-50">
                {filteredFees.map((fee) => (
                  <motion.tr 
                    key={fee.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="hover:bg-indigo-50/50 transition-all duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-medium text-lg shadow-md">
                          {fee.studentName?.charAt(0) || '?'}
                        </div>
                        <div className="ml-4">
                          <div className="text-base font-semibold text-gray-900">
                            {fee.studentName || studentNameCache[fee.studentId] || 'Unknown Student'}
                          </div>
                          <div className="flex items-center mt-1">
                            <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                              ID: {fee.studentId}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-base font-semibold text-gray-900">{formatCurrency(fee.amount)}</div>
                      <div className="text-xs text-gray-500 mt-1">Fee Amount</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-sm leading-5 font-medium rounded-md bg-indigo-50 text-indigo-700">
                        {fee.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900">{formatDate(fee.dueDate)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {fee.status === 'paid' ? (
                        <span className="px-3 py-1.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Paid
                        </span>
                      ) : fee.status === 'overdue' ? (
                        <span className="px-3 py-1.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Overdue
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {fee.status !== 'paid' && (
                          <button
                            onClick={() => handleMarkAsPaid(fee.id)}
                            className="bg-green-50 p-2 rounded-lg text-green-600 hover:bg-green-100 transition-colors duration-150"
                            title="Mark as Paid"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteFee(fee.id)}
                          className="bg-red-50 p-2 rounded-lg text-red-600 hover:bg-red-100 transition-colors duration-150"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <FeeFormModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddFee}
        students={students}
      />
    </div>
  );
};

export default Fees;