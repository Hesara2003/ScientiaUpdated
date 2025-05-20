// filepath: c:\Users\Dell\Desktop\group-project-group-2-1\admin\frontend\src\pages\parent\Payments.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // In a real application, you would fetch this data from an API
  useEffect(() => {
    // Simulating API call with setTimeout
    setTimeout(() => {
      const paymentsData = [
        { 
          id: 1, 
          description: "Term 1 Tuition Fee",
          amount: "$1,200",
          date: "Jan 15, 2025",
          status: "Paid",
          receiptNo: "REC-2025-0043",
          student: "Sarah Johnson"
        },
        { 
          id: 2, 
          description: "Computer Lab Fee",
          amount: "$150",
          date: "Feb 05, 2025",
          status: "Paid",
          receiptNo: "REC-2025-0098",
          student: "Michael Johnson"
        },
        { 
          id: 3, 
          description: "Library Fee",
          amount: "$75",
          date: "Mar 10, 2025",
          status: "Paid",
          receiptNo: "REC-2025-0156",
          student: "Sarah Johnson"
        }
      ];

      const pendingPaymentsData = [
        { 
          id: 1, 
          description: "Term 2 Tuition Fee",
          amount: "$1,200",
          dueDate: "May 30, 2025",
          student: "Sarah Johnson",
          status: "Due Soon"
        },
        { 
          id: 2, 
          description: "Science Lab Fee",
          amount: "$150",
          dueDate: "Jun 05, 2025",
          student: "Michael Johnson",
          status: "Upcoming"
        },
        { 
          id: 3, 
          description: "Sports Activity Fee",
          amount: "$90",
          dueDate: "Jun 15, 2025",
          student: "Sarah Johnson",
          status: "Upcoming"
        }
      ];

      setPayments(paymentsData);
      setPendingPayments(pendingPaymentsData);
      setLoading(false);
    }, 800);
  }, []);

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

  return (
    <div className="px-4 py-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Payments</h1>
        <p className="text-gray-600">View and manage payments for your children</p>
      </header>

      {loading ? (
        <div className="space-y-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-52 bg-gray-200 rounded-xl"></div>
              <div className="h-52 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Pending Payments */}
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Pending Payments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingPayments.map((payment) => (
                <div 
                  key={payment.id} 
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-gray-800">{payment.description}</h3>
                        <p className="text-sm text-gray-600 mt-1">For: {payment.student}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        payment.status === 'Due Soon' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-teal-100 text-teal-800'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                    
                    <div className="mt-4 flex justify-between">
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Amount</p>
                        <p className="text-xl font-semibold text-gray-800">{payment.amount}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase">Due Date</p>
                        <p className="text-gray-800">{payment.dueDate}</p>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <button 
                        className="w-full py-2.5 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors"
                      >
                        Pay Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Payment History */}
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Payment History</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Receipt
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{payment.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {payment.student}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                          {payment.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {payment.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          <button className="text-teal-600 hover:text-teal-800 hover:underline transition-colors">
                            {payment.receiptNo}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
          
          {/* Payment Summary */}
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Summary</h2>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium mb-1">Paid This Year</p>
                  <p className="text-2xl font-bold text-green-700">$1,425</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg">
                  <p className="text-sm text-amber-600 font-medium mb-1">Pending Payments</p>
                  <p className="text-2xl font-bold text-amber-700">$1,440</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium mb-1">Total Annual Fees</p>
                  <p className="text-2xl font-bold text-blue-700">$2,865</p>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600 mb-3">Payment Progress</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                  <div className="bg-teal-600 h-2.5 rounded-full" style={{ width: '49.7%' }}></div>
                </div>
                <div className="flex justify-between">
                  <p className="text-xs text-gray-500">49.7% Paid</p>
                  <p className="text-xs text-gray-500">50.3% Remaining</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
