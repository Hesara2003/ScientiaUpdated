import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  addProgressReport,
  getAllProgressReports,
  getProgressReportById,
  deleteProgressReport
} from '../../services/progressReportService';

const ProgressReport = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    classId: '',
    attendancePercentage: '',
    averageScore: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProgressReports();
  }, []);

  const fetchProgressReports = async () => {
    try {
      setLoading(true);
      const data = await getAllProgressReports();
      setReports(data);
    } catch (err) {
      if (err.message.includes('Access denied')) {
        setError('Authentication required. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError('Failed to fetch progress reports');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const reportData = {
        student: { id: formData.studentId },
        classEntity: { id: formData.classId },
        attendancePercentage: parseFloat(formData.attendancePercentage),
        averageScore: parseFloat(formData.averageScore)
      };
      await addProgressReport(reportData);
      setShowForm(false);
      setFormData({
        studentId: '',
        classId: '',
        attendancePercentage: '',
        averageScore: ''
      });
      await fetchProgressReports();
    } catch (err) {
      if (err.message.includes('Access denied')) {
        setError('Authentication required. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError('Failed to add progress report');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = async (reportId) => {
    try {
      setLoading(true);
      const report = await getProgressReportById(reportId);
      setSelectedReport(report);
    } catch (err) {
      if (err.message.includes('Access denied')) {
        setError('Authentication required. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError('Failed to fetch report details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this progress report?')) {
      try {
        setLoading(true);
        await deleteProgressReport(reportId);
        await fetchProgressReports();
      } catch (err) {
        if (err.message.includes('Access denied')) {
          setError('Authentication required. Please login again.');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setError('Failed to delete progress report');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Progress Reports</h1>
              <p className="mt-2 text-sm text-gray-600">
                Create and manage student progress reports for your classes
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              {showForm ? 'Cancel' : 'Add New Report'}
            </motion.button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-md p-4"
          >
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Create Progress Report</h2>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
                        Student ID
                      </label>
                      <input
                        type="number"
                        name="studentId"
                        id="studentId"
                        value={formData.studentId}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="classId" className="block text-sm font-medium text-gray-700">
                        Class ID
                      </label>
                      <input
                        type="number"
                        name="classId"
                        id="classId"
                        value={formData.classId}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="attendancePercentage" className="block text-sm font-medium text-gray-700">
                        Attendance Percentage
                      </label>
                      <input
                        type="number"
                        name="attendancePercentage"
                        id="attendancePercentage"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.attendancePercentage}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="averageScore" className="block text-sm font-medium text-gray-700">
                        Average Score
                      </label>
                      <input
                        type="number"
                        name="averageScore"
                        id="averageScore"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.averageScore}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {loading ? 'Adding...' : 'Add Report'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reports Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Progress Reports</h2>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance %
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Average Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Generated At
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report) => (
                    <motion.tr
                      key={report.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {report.student?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.classEntity?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          report.attendancePercentage >= 80 
                            ? 'bg-green-100 text-green-800' 
                            : report.attendancePercentage >= 60 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {report.attendancePercentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          report.averageScore >= 80 
                            ? 'bg-green-100 text-green-800' 
                            : report.averageScore >= 60 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {report.averageScore}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(report.generatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewReport(report.id)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteReport(report.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Report Details Modal */}
        <AnimatePresence>
          {selectedReport && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 overflow-y-auto"
            >
              <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                  <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>
                
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                >
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Progress Report Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-gray-700">Student:</span>
                        <span className="ml-2 text-gray-900">{selectedReport.student?.name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Student ID:</span>
                        <span className="ml-2 text-gray-900">{selectedReport.student?.id}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Class:</span>
                        <span className="ml-2 text-gray-900">{selectedReport.classEntity?.name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Class ID:</span>
                        <span className="ml-2 text-gray-900">{selectedReport.classEntity?.id}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Attendance Percentage:</span>
                        <span className="ml-2 text-gray-900">{selectedReport.attendancePercentage}%</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Average Score:</span>
                        <span className="ml-2 text-gray-900">{selectedReport.averageScore}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Generated At:</span>
                        <span className="ml-2 text-gray-900">{new Date(selectedReport.generatedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      onClick={() => setSelectedReport(null)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProgressReport;
