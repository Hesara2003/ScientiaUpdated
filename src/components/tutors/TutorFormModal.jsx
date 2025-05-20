import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TutorFormModal = ({ 
  show, 
  onClose, 
  onSubmit, 
  initialData = {
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    specialization: "",
    hourlyRate: "",
    availability: "full-time",
    bio: ""
  }, 
  title = "Add New Tutor",
  isEdit = false
}) => {
  const [tutor, setTutor] = useState({ ...initialData });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  // Reset form when modal is opened
  useEffect(() => {
    if (show) {
      setTutor({ ...initialData });
      setErrors({});
      setIsSubmitting(false);
      setActiveTab('personal');
    }
  }, [show, initialData]);

  // Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTutor(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Email validation
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Personal info validation
    if (!tutor.firstName?.trim()) newErrors.firstName = "First name is required";
    if (!tutor.lastName?.trim()) newErrors.lastName = "Last name is required";
    
    if (!tutor.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(tutor.email)) {
      newErrors.email = "Email format is invalid";
    }
    
    // Professional info validation
    if (!tutor.specialization?.trim()) newErrors.specialization = "Specialization is required";
    
    if (!tutor.hourlyRate) {
      newErrors.hourlyRate = "Hourly rate is required";
    } else if (isNaN(tutor.hourlyRate) || parseFloat(tutor.hourlyRate) <= 0) {
      newErrors.hourlyRate = "Hourly rate must be a positive number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const formattedTutor = {
        ...tutor,
        hourlyRate: parseFloat(tutor.hourlyRate),
        tutorId: tutor.tutorId || tutor.id || null
      };
      
      await onSubmit(formattedTutor);
      onClose();
    } catch (error) {
      console.error("Error submitting tutor:", error);
      setErrors(prev => ({ ...prev, submit: error.message || "Failed to save tutor. Please try again." }));
      setIsSubmitting(false);
    }
  };

  // Helper function to get initials for avatar
  const getInitials = () => {
    return (tutor.firstName?.[0] || '').toUpperCase() + (tutor.lastName?.[0] || '').toUpperCase();
  };

  // Don't render anything if modal is not shown
  if (!show) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">{title}</h3>
              <button 
                onClick={onClose}
                className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-white/20"
                disabled={isSubmitting}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
          
          {/* Content */}
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              {/* Avatar */}
              <div className="flex justify-center mb-6">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
                  {getInitials() || '?'}
                </div>
              </div>
              
              {/* Error message */}
              {errors.submit && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-3 rounded">
                  <p className="text-sm text-red-700">{errors.submit}</p>
                </div>
              )}
              
              {/* Tabs */}
              <div className="flex border-b mb-6">
                <button 
                  type="button"
                  className={`pb-3 px-4 font-medium text-sm ${activeTab === 'personal' 
                    ? 'text-indigo-600 border-b-2 border-indigo-600' 
                    : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('personal')}
                >
                  Personal Information
                </button>
                <button 
                  type="button"
                  className={`pb-3 px-4 font-medium text-sm ${activeTab === 'professional' 
                    ? 'text-indigo-600 border-b-2 border-indigo-600' 
                    : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('professional')}
                >
                  Professional Details
                </button>
              </div>
              
              {/* Tab content */}
              <div className="space-y-5">
                {activeTab === 'personal' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* First Name */}
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          className={`block w-full border ${errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                          value={tutor.firstName || ''}
                          onChange={handleChange}
                          placeholder="First name"
                        />
                        {errors.firstName && (
                          <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                        )}
                      </div>
                      
                      {/* Last Name */}
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          className={`block w-full border ${errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                          value={tutor.lastName || ''}
                          onChange={handleChange}
                          placeholder="Last name"
                        />
                        {errors.lastName && (
                          <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className={`block w-full border ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                        value={tutor.email || ''}
                        onChange={handleChange}
                        placeholder="email@example.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>
                    
                    {/* Phone Number */}
                    <div>
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={tutor.phoneNumber || ''}
                        onChange={handleChange}
                        placeholder="(123) 456-7890"
                      />
                    </div>
                  </motion.div>
                )}
                
                {activeTab === 'professional' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    {/* Specialization */}
                    <div>
                      <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                        Specialization <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="specialization"
                        name="specialization"
                        className={`block w-full border ${errors.specialization ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                        value={tutor.specialization || ''}
                        onChange={handleChange}
                        placeholder="e.g. Mathematics, Physics"
                      />
                      {errors.specialization && (
                        <p className="mt-1 text-sm text-red-600">{errors.specialization}</p>
                      )}
                    </div>
                    
                    {/* Hourly Rate */}
                    <div>
                      <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 mb-1">
                        Hourly Rate ($) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="hourlyRate"
                        name="hourlyRate"
                        min="0"
                        step="0.01"
                        className={`block w-full border ${errors.hourlyRate ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                        value={tutor.hourlyRate || ''}
                        onChange={handleChange}
                        placeholder="0.00"
                      />
                      {errors.hourlyRate && (
                        <p className="mt-1 text-sm text-red-600">{errors.hourlyRate}</p>
                      )}
                    </div>
                    
                    {/* Availability */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="availability"
                            className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                            value="full-time"
                            checked={tutor.availability === "full-time"}
                            onChange={handleChange}
                          />
                          <span className="ml-2 text-sm text-gray-700">Full-time</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="availability"
                            className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                            value="part-time"
                            checked={tutor.availability === "part-time"}
                            onChange={handleChange}
                          />
                          <span className="ml-2 text-sm text-gray-700">Part-time</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="availability"
                            className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                            value="weekends"
                            checked={tutor.availability === "weekends"}
                            onChange={handleChange}
                          />
                          <span className="ml-2 text-sm text-gray-700">Weekends Only</span>
                        </label>
                      </div>
                    </div>
                    
                    {/* Bio */}
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                        Bio / Description
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows="3"
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={tutor.bio || ''}
                        onChange={handleChange}
                        placeholder="Brief description of experience, teaching style, etc."
                      ></textarea>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
            
            {/* Footer with actions */}
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
              <div>
                {activeTab === 'professional' && (
                  <button
                    type="button"
                    className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => setActiveTab('personal')}
                  >
                    Back to Personal Info
                  </button>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                
                {activeTab === 'personal' ? (
                  <button
                    type="button"
                    className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium"
                    onClick={() => setActiveTab('professional')}
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium inline-flex items-center"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isEdit ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>{isEdit ? 'Update Tutor' : 'Create Tutor'}</>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TutorFormModal;