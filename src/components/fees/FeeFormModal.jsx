import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion'; // You may need to install this

const FeeFormModal = ({ show, onClose, onSubmit, students = [] }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    amount: '',
    dueDate: new Date().toISOString().split('T')[0],
    category: 'Tuition',
    status: 'Pending'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeStep, setActiveStep] = useState(1); // Add a step system for large forms

  // Reset form when modal is opened
  useEffect(() => {
    if (show) {
      setFormData({
        studentId: '',
        studentName: '',
        amount: '',
        dueDate: new Date().toISOString().split('T')[0],
        category: 'Tuition',
        status: 'Pending'
      });
      setErrors({});
      setActiveStep(1);
    }
  }, [show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleStudentChange = (e) => {
    const studentId = e.target.value;
    
    if (!studentId) {
      setFormData({
        ...formData,
        studentId: '',
        studentName: ''
      });
      return;
    }
    
    const selectedStudent = students.find(s => 
      s.id === studentId || 
      s.studentId === studentId ||
      String(s.id) === studentId || 
      String(s.studentId) === studentId
    );
    
    setFormData({
      ...formData,
      studentId,
      studentName: selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : ''
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.studentId) {
      newErrors.studentId = 'Student ID is required';
    }
    
    if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'A valid amount greater than zero is required';
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onClose();
      toast.success('Fee added successfully');
    } catch (error) {
      console.error('Error adding fee:', error);
      toast.error('Failed to add fee');
    } finally {
      setIsSubmitting(false);
    }
  };

  // UI helpers
  const renderErrorMessage = (fieldName) => {
    return errors[fieldName] ? (
      <motion.p 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-1 text-sm text-red-600 flex items-center"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {errors[fieldName]}
      </motion.p>
    ) : null;
  };

  const getInputClassName = (fieldName) => {
    return `mt-1 block w-full rounded-lg border ${
      errors[fieldName] 
        ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
    } shadow-sm py-2.5 px-3 transition-colors duration-200 ease-in-out sm:text-sm`;
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-600 bg-opacity-75 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.25 }}
            className="relative mx-auto p-6 border w-full max-w-md bg-white rounded-xl shadow-2xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-200">
              <h3 className="text-2xl font-semibold text-gray-800 flex items-center">
                <span className="bg-blue-100 text-blue-600 p-1.5 rounded-lg mr-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </span>
                Add New Fee
              </h3>
              <button 
                onClick={onClose}
                className="bg-gray-100 rounded-lg p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Progress steps for visual indication */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${activeStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    1
                  </div>
                  <div className={`ml-2 text-sm font-medium ${activeStep >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>Student</div>
                </div>
                <div className={`flex-1 h-1 mx-4 ${activeStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${activeStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    2
                  </div>
                  <div className={`ml-2 text-sm font-medium ${activeStep >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>Fee Details</div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {activeStep === 1 && (
                <div className="space-y-5">
                  <div>
                    <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                    {students.length > 0 ? (
                      <div className="relative">
                        <select
                          id="studentId"
                          name="studentId"
                          value={formData.studentId}
                          onChange={handleStudentChange}
                          className={getInputClassName('studentId')}
                        >
                          <option value="">Select a student</option>
                          {students.map(student => (
                            <option key={student.id || student.studentId} value={student.id || student.studentId}>
                              {student.firstName} {student.lastName} ({student.id || student.studentId})
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <input
                        type="text"
                        id="studentId"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleChange}
                        className={getInputClassName('studentId')}
                        placeholder="Enter student ID"
                      />
                    )}
                    {renderErrorMessage('studentId')}
                    
                    {formData.studentId && formData.studentName && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg text-blue-800 flex items-start">
                        <svg className="w-5 h-5 mr-2 mt-0.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="font-medium">{formData.studentName}</p>
                          <p className="text-sm text-blue-700">Student ID: {formData.studentId}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Only show if not using student dropdown */}
                  {students.length === 0 && (
                    <div>
                      <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                      <input
                        type="text"
                        id="studentName"
                        name="studentName"
                        value={formData.studentName}
                        onChange={handleChange}
                        className={getInputClassName('studentName')}
                        placeholder="Enter student name"
                      />
                    </div>
                  )}
                  
                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setActiveStep(2)}
                      disabled={!formData.studentId}
                      className={`inline-flex items-center px-4 py-2 shadow-sm text-sm font-medium rounded-lg ${
                        formData.studentId 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
                    >
                      Continue
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="space-y-5">
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        id="amount"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        className={`${getInputClassName('amount')} pl-7`}
                        placeholder="0.00"
                      />
                    </div>
                    {renderErrorMessage('amount')}
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <div className="relative">
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className={getInputClassName('category')}
                      >
                        <option value="Tuition">Tuition</option>
                        <option value="Library">Library</option>
                        <option value="Transport">Transport</option>
                        <option value="Examination">Examination</option>
                        <option value="Hostel">Hostel</option>
                        <option value="Other">Other</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {renderErrorMessage('category')}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                      <input
                        type="date"
                        id="dueDate"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleChange}
                        className={getInputClassName('dueDate')}
                      />
                      {renderErrorMessage('dueDate')}
                    </div>

                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <div className="relative">
                        <select
                          id="status"
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className={getInputClassName('status')}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fee Summary */}
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Fee Summary</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Student:</span>
                        <span className="font-medium">{formData.studentName || 'Not selected'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Amount:</span>
                        <span className="font-medium">{formData.amount ? `$${parseFloat(formData.amount).toFixed(2)}` : '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Category:</span>
                        <span className="font-medium">{formData.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Due Date:</span>
                        <span className="font-medium">{formData.dueDate ? new Date(formData.dueDate).toLocaleDateString() : '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <span className={`font-medium ${
                          formData.status === 'Paid' 
                            ? 'text-green-600' 
                            : formData.status === 'Overdue' 
                              ? 'text-red-600' 
                              : 'text-yellow-600'
                        }`}>
                          {formData.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveStep(1)}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                    >
                      <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                      Back
                    </button>
                    <div>
                      <button
                        type="button"
                        onClick={onClose}
                        className="bg-white py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white ${
                          isSubmitting 
                            ? 'bg-blue-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </>
                        ) : 'Save Fee'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FeeFormModal;