import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { getStudentFees, markFeeAsPaid } from '../../services/feeService';
import AuthContext from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const StudentFees = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, paid, overdue
  const [selectedFee, setSelectedFee] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (currentUser?.id) {
      loadFees();
    }
  }, [currentUser]);

  const loadFees = async () => {
    try {
      const feesData = await getStudentFees(currentUser.id);
      setFees(feesData);
    } catch (error) {
      console.error('Error loading fees:', error);
      toast.error('Failed to load fee information');
    } finally {
      setLoading(false);
    }
  };

  const handlePayFee = async (feeId) => {
    try {
      await markFeeAsPaid(feeId);
      await loadFees(); // Reload fees
      setShowPaymentModal(false);
      toast.success('Fee payment processed successfully!');
    } catch (error) {
      console.error('Error processing fee payment:', error);
      toast.error('Failed to process payment');
    }
  };

  // Filter fees based on status
  const filteredFees = fees.filter(fee => {
    const today = new Date();
    const dueDate = new Date(fee.dueDate);
    
    switch (filter) {
      case 'pending':
        return fee.status === 'pending';
      case 'paid':
        return fee.status === 'paid';
      case 'overdue':
        return fee.status === 'pending' && dueDate < today;
      default:
        return true;
    }
  });

  const getStatusBadge = (fee) => {
    const today = new Date();
    const dueDate = new Date(fee.dueDate);
    
    if (fee.status === 'paid') {
      return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Paid</span>;
    } else if (dueDate < today) {
      return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">Overdue</span>;
    } else {
      return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">Pending</span>;
    }
  };

  const getTotalAmount = (status) => {
    return fees
      .filter(fee => status === 'all' || fee.status === status)
      .reduce((total, fee) => total + fee.amount, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            My Fees
          </h1>
          <p className="text-gray-600">Manage your fee payments and view payment history</p>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full mr-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Amount</p>
                <p className="text-2xl font-bold text-gray-900">${getTotalAmount('pending').toFixed(2)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Paid Amount</p>
                <p className="text-2xl font-bold text-gray-900">${getTotalAmount('paid').toFixed(2)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Fees</p>
                <p className="text-2xl font-bold text-gray-900">${getTotalAmount('all').toFixed(2)}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filter Tabs */}
        <motion.div 
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-lg">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Fees ({fees.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                filter === 'pending'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pending ({fees.filter(f => f.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                filter === 'paid'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Paid ({fees.filter(f => f.status === 'paid').length})
            </button>
            <button
              onClick={() => setFilter('overdue')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                filter === 'overdue'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overdue ({fees.filter(f => f.status === 'pending' && new Date(f.dueDate) < new Date()).length})
            </button>
          </div>
        </motion.div>

        {/* Fee List */}
        {filteredFees.length === 0 ? (
          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <svg className="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Fees Found</h3>
            <p className="text-gray-600">No fees match the selected filter.</p>
          </motion.div>
        ) : (
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {filteredFees.map((fee, index) => (
              <motion.div
                key={fee.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1 mb-4 lg:mb-0">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 mr-3">
                        {fee.description}
                      </h3>
                      {getStatusBadge(fee)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Fee ID:</span> {fee.feeId}
                      </div>
                      <div>
                        <span className="font-medium">Due Date:</span> {new Date(fee.dueDate).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Amount:</span> <span className="text-lg font-bold text-gray-900">${fee.amount}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {fee.status === 'pending' && (
                      <button
                        onClick={() => {
                          setSelectedFee(fee);
                          setShowPaymentModal(true);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                      >
                        Pay Now
                      </button>
                    )}
                    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-200">
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedFee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div 
              className="bg-white rounded-2xl p-8 max-w-md w-full"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Payment</h3>
              <div className="mb-6">
                <p className="text-gray-600 mb-2">You are about to pay:</p>
                <p className="text-2xl font-bold text-gray-900">${selectedFee.amount}</p>
                <p className="text-sm text-gray-600 mt-2">{selectedFee.description}</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handlePayFee(selectedFee.id)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
                >
                  Confirm Payment
                </button>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentFees;