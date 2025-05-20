import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion"; 
import { getAllParents } from "../../services/parentService";

const StudentFormModal = ({ 
  show, 
  onClose, 
  onSubmit, 
  initialData = {
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    course: "",
    status: "active",
    dateOfBirth: "",
    notes: "",
    parentId: ""
  }, 
  title = "Add New Student",
  isEdit = false
}) => {
  const [student, setStudent] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [formStep, setFormStep] = useState(1);
  const totalSteps = 3;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [parents, setParents] = useState([]);
  const [loadingParents, setLoadingParents] = useState(false);
  
  const [avatarColors, setAvatarColors] = useState({
    from: 'from-blue-600',
    to: 'to-indigo-700'
  });
  useEffect(() => {
    if (show) {
      setStudent(initialData);
      setErrors({});
      setFormStep(1);
      setIsSubmitting(false);
      setSubmitError(null);
      
      const colorOptions = [
        { from: 'from-blue-600', to: 'to-indigo-700' },
        { from: 'from-purple-600', to: 'to-pink-700' },
        { from: 'from-green-600', to: 'to-teal-700' },
        { from: 'from-red-600', to: 'to-orange-700' },
        { from: 'from-yellow-500', to: 'to-amber-700' }
      ];
      
      const nameChar = (initialData.firstName?.[0] || 'A').toLowerCase();
      const colorIndex = (nameChar.charCodeAt(0) - 97) % colorOptions.length;
      setAvatarColors(colorOptions[Math.max(0, colorIndex)]);
      
      // Fetch all parents when the modal is shown
      fetchParents();
    }
  }, [initialData, show]);
  
  const fetchParents = async () => {
    try {
      setLoadingParents(true);
      const parentsList = await getAllParents();
      setParents(parentsList);
    } catch (error) {
      console.error("Error fetching parents:", error);
    } finally {
      setLoadingParents(false);
    }
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!student.firstName?.trim()) newErrors.firstName = "First name is required";
      if (!student.lastName?.trim()) newErrors.lastName = "Last name is required";
    }
    
    if (step === 2) {
      if (!student.email?.trim()) {
        newErrors.email = "Email is required";
      } else if (!isValidEmail(student.email)) {
        newErrors.email = "Email format is invalid";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAllSteps = () => {
    const personalInfoValid = validateStep(1);
    const contactInfoValid = validateStep(2);
    
    if (!personalInfoValid) {
      setFormStep(1);
      return false;
    } else if (!contactInfoValid) {
      setFormStep(2);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    
    if (!validateAllSteps()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const formattedStudent = {
        ...student,
        status: student.status || 'active',
        studentId: student.studentId || student.id || null
      };
      
      console.log("Submitting student data:", formattedStudent);
      
      await onSubmit(formattedStudent);
      
      onClose();
    } catch (error) {
      console.error("Error submitting student:", error);
      setSubmitError(error.message || "Failed to save student. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const moveToNextStep = () => {
    if (validateStep(formStep)) {
      setFormStep(Math.min(formStep + 1, totalSteps));
    }
  };

  const moveToPrevStep = () => {
    setFormStep(Math.max(formStep - 1, 1));
  };

  // Get initials for the avatar
  const getInitials = () => {
    return (student.firstName?.[0] || '') + (student.lastName?.[0] || '');
  };

  if (!show) return null;

  // Animation variants for smooth transitions
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: "easeIn" } }
  };

  const contentVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 10, transition: { duration: 0.2 } }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
        >
          <motion.div 
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-0 max-h-[90vh] overflow-hidden"
          >
            {/* Modal Header with enhanced gradient background */}
            <div className={`bg-gradient-to-r ${avatarColors.from} ${avatarColors.to} px-6 py-4 rounded-t-2xl`}>
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <svg className="w-6 h-6 mr-2 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                  </svg>
                  {title}
                </h3>
                <button 
                  onClick={onClose}
                  className="text-white hover:text-gray-200 bg-white/20 rounded-full p-2 transition-colors duration-200 hover:bg-white/30"
                  aria-label="Close modal"
                  disabled={isSubmitting}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className={`h-24 w-24 rounded-full bg-gradient-to-br ${avatarColors.from} ${avatarColors.to} flex items-center justify-center text-white font-bold text-2xl shadow-lg overflow-hidden border-4 border-white`}
                    style={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
                  >
                    {getInitials() || '?'}
                  </motion.div>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    type="button" 
                    className={`absolute bottom-0 right-0 ${avatarColors.from.replace('from-', 'bg-')} hover:brightness-110 text-white rounded-full p-2 shadow-md transition-all duration-200`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                  </motion.button>
                </div>
              </div>
              
              {submitError && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg shadow-sm"
                >
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700 font-medium">{submitError}</p>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div className="space-y-6">
                <div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-4 overflow-hidden">
                    <motion.div 
                      initial={{ width: `${((formStep - 1) / totalSteps) * 100}%` }}
                      animate={{ width: `${(formStep / totalSteps) * 100}%` }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className={`${avatarColors.from.replace('from-', 'bg-')} h-2 rounded-full`}
                    ></motion.div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <button 
                      onClick={() => setFormStep(1)} 
                      className={`flex flex-col items-center ${formStep >= 1 ? `${avatarColors.from.replace('from-', 'text-')}` : 'text-gray-400'} transition-colors duration-300`}
                    >
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full mb-1 border-2 transition-colors ${
                        formStep >= 1 
                          ? `${avatarColors.from.replace('from-', 'border-')} ${avatarColors.from.replace('from-', 'text-')}` 
                          : 'border-gray-200 text-gray-400'
                      }`}>
                        1
                      </div>
                      <span className="text-xs">Personal</span>
                    </button>
                    
                    <div className="flex-1 flex items-center justify-center">
                      <div className={`h-0.5 w-full ${formStep >= 2 ? `${avatarColors.from.replace('from-', 'bg-')}` : 'bg-gray-200'} transition-colors duration-300`}></div>
                    </div>
                    
                    <button 
                      onClick={() => validateStep(1) && setFormStep(2)} 
                      className={`flex flex-col items-center ${formStep >= 2 ? `${avatarColors.from.replace('from-', 'text-')}` : 'text-gray-400'} transition-colors duration-300`}
                    >
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full mb-1 border-2 transition-colors ${
                        formStep >= 2 
                          ? `${avatarColors.from.replace('from-', 'border-')} ${avatarColors.from.replace('from-', 'text-')}` 
                          : 'border-gray-200 text-gray-400'
                      }`}>
                        2
                      </div>
                      <span className="text-xs">Contact</span>
                    </button>
                    
                    <div className="flex-1 flex items-center justify-center">
                      <div className={`h-0.5 w-full ${formStep >= 3 ? `${avatarColors.from.replace('from-', 'bg-')}` : 'bg-gray-200'} transition-colors duration-300`}></div>
                    </div>
                    
                    <button 
                      onClick={() => validateStep(1) && validateStep(2) && setFormStep(3)} 
                      className={`flex flex-col items-center ${formStep >= 3 ? `${avatarColors.from.replace('from-', 'text-')}` : 'text-gray-400'} transition-colors duration-300`}
                    >
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full mb-1 border-2 transition-colors ${
                        formStep >= 3 
                          ? `${avatarColors.from.replace('from-', 'border-')} ${avatarColors.from.replace('from-', 'text-')}` 
                          : 'border-gray-200 text-gray-400'
                      }`}>
                        3
                      </div>
                      <span className="text-xs">Enrollment</span>
                    </button>
                  </div>
                </div>
                
                <AnimatePresence mode="wait">
                  {formStep === 1 && (
                    <motion.div 
                      key="step1"
                      variants={contentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-5"
                    >
                      <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <span className={`mr-2 ${avatarColors.from.replace('from-', 'text-')}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </span>
                        Personal Information
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                            First Name <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <input
                              type="text"
                              id="firstName"
                              className={`block w-full pl-10 border ${
                                errors.firstName 
                                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-gray-50'
                              } rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 transition duration-200 ease-in-out`}
                              value={student.firstName || ''}
                              onChange={(e) => {
                                setStudent({...student, firstName: e.target.value});
                                if (errors.firstName) setErrors({...errors, firstName: ''});
                              }}
                              placeholder="First name"
                              required
                            />
                          </div>
                          {errors.firstName && (
                            <motion.p 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-1.5 text-sm text-red-600 flex items-center"
                            >
                              <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {errors.firstName}
                            </motion.p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <input
                              type="text"
                              id="lastName"
                              className={`block w-full pl-10 border ${
                                errors.lastName 
                                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-gray-50'
                              } rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 transition duration-200 ease-in-out`}
                              value={student.lastName || ''}
                              onChange={(e) => {
                                setStudent({...student, lastName: e.target.value});
                                if (errors.lastName) setErrors({...errors, lastName: ''});
                              }}
                              placeholder="Last name"
                              required
                            />
                          </div>
                          {errors.lastName && (
                            <motion.p 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-1.5 text-sm text-red-600 flex items-center"
                            >
                              <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {errors.lastName}
                            </motion.p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                          Date of Birth
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <input
                            type="date"
                            id="dateOfBirth"
                            className="block w-full pl-10 border border-gray-300 rounded-xl shadow-sm py-3 px-4 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
                            value={student.dateOfBirth || ''}
                            onChange={(e) => setStudent({...student, dateOfBirth: e.target.value})}
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          The student's date of birth helps determine eligibility for certain programs.
                        </p>
                      </div>
                    </motion.div>
                  )}
                  
                  {formStep === 2 && (
                    <motion.div 
                      key="step2"
                      variants={contentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-5"
                    >
                      <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <span className={`mr-2 ${avatarColors.from.replace('from-', 'text-')}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </span>
                        Contact Information
                      </h4>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <input
                            type="email"
                            id="email"
                            className={`block w-full pl-10 border ${
                              errors.email 
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-gray-50'
                            } rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 transition duration-200 ease-in-out`}
                            value={student.email || ''}
                            onChange={(e) => {
                              setStudent({...student, email: e.target.value});
                              if (errors.email) setErrors({...errors, email: ''});
                            }}
                            placeholder="student@example.com"
                            required
                          />
                        </div>
                        {errors.email && (
                          <motion.p 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1.5 text-sm text-red-600 flex items-center"
                          >
                            <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {errors.email}
                          </motion.p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </div>
                          <input
                            type="tel"
                            id="phoneNumber"
                            className="block w-full pl-10 border border-gray-300 rounded-xl shadow-sm py-3 px-4 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
                            value={student.phoneNumber || ''}
                            onChange={(e) => setStudent({...student, phoneNumber: e.target.value})}
                            placeholder="(123) 456-7890"
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Optional, but recommended for emergency contact</p>
                      </div>
                      
                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            id="address"
                            className="block w-full pl-10 border border-gray-300 rounded-xl shadow-sm py-3 px-4 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
                            value={student.address || ''}
                            onChange={(e) => setStudent({...student, address: e.target.value})}
                            placeholder="123 Main St, City, State, Zip"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {formStep === 3 && (
                    <motion.div 
                      key="step3"
                      variants={contentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-5"
                    >
                      <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <span className={`mr-2 ${avatarColors.from.replace('from-', 'text-')}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                          </svg>
                        </span>
                        Enrollment Information
                      </h4>
                      
                      <div>
                        <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
                          Course/Program
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M12 14l9-5-9-5-9 5 9 5z" />
                              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998a12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                            </svg>
                          </div>
                          <select
                            id="course"
                            className="block w-full pl-10 border border-gray-300 rounded-xl shadow-sm py-3 px-4 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out appearance-none"
                            value={student.course || ''}
                            onChange={(e) => setStudent({...student, course: e.target.value})}
                          >
                            <option value="">Select a course</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Mathematics">Mathematics</option>
                            <option value="Physics">Physics</option>
                            <option value="Biology">Biology</option>
                            <option value="Chemistry">Chemistry</option>
                            <option value="Business Administration">Business Administration</option>
                            <option value="Economics">Economics</option>
                            <option value="Literature">Literature</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>                      </div>
                      
                      <div>
                        <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-1">
                          Link to Parent
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          {loadingParents ? (
                            <div className="block w-full pl-10 border border-gray-300 rounded-xl shadow-sm py-3 px-4 bg-gray-50 text-gray-400">
                              Loading parents...
                            </div>
                          ) : (
                            <select
                              id="parentId"
                              className="block w-full pl-10 border border-gray-300 rounded-xl shadow-sm py-3 px-4 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out appearance-none"
                              value={student.parentId || ''}
                              onChange={(e) => setStudent({...student, parentId: e.target.value})}
                            >
                              <option value="">No parent (optional)</option>
                              {parents.map(parent => (
                                <option key={parent.id} value={parent.id}>
                                  {parent.firstName} {parent.lastName} - {parent.email}
                                </option>
                              ))}
                            </select>
                          )}
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Link this student to a parent account or leave empty if not applicable.
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <div className="flex flex-col space-y-2">
                          <label className={`relative flex items-center p-3 rounded-lg border ${
                            student.status === "active" 
                              ? `${avatarColors.from.replace('from-', 'border-')} ${avatarColors.from.replace('from-', 'bg-')}/5` 
                              : 'border-gray-200'
                          } cursor-pointer transition-colors duration-200`}>
                            <input
                              type="radio"
                              name="status"
                              className={`h-5 w-5 ${avatarColors.from.replace('from-', 'text-')} border-gray-300 focus:ring-blue-500`}
                              checked={student.status === "active"}
                              onChange={() => setStudent({...student, status: "active"})}
                            />
                            <div className="ml-3">
                              <span className="text-gray-900 font-medium">Active</span>
                              <p className="text-xs text-gray-500">Student is currently enrolled and attending classes</p>
                            </div>
                          </label>
                          <label className={`relative flex items-center p-3 rounded-lg border ${
                            student.status === "inactive" 
                              ? 'border-red-300 bg-red-50' 
                              : 'border-gray-200'
                          } cursor-pointer transition-colors duration-200`}>
                            <input
                              type="radio"
                              name="status"
                              className="h-5 w-5 text-red-600 border-gray-300 focus:ring-red-500"
                              checked={student.status === "inactive"}
                              onChange={() => setStudent({...student, status: "inactive"})}
                            />
                            <div className="ml-3">
                              <span className="text-gray-900 font-medium">Inactive</span>
                              <p className="text-xs text-gray-500">Student is not currently enrolled or attending</p>
                            </div>
                          </label>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                          Additional Notes
                        </label>
                        <textarea
                          id="notes"
                          rows="3"
                          className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
                          placeholder="Any additional information about the student..."
                          value={student.notes || ''}
                          onChange={(e) => setStudent({...student, notes: e.target.value})}
                        ></textarea>
                      </div>
                      
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Student Summary
                        </h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Name:</span>
                            <span className="font-medium">{student.firstName} {student.lastName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Email:</span>
                            <span className="font-medium">{student.email || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Course:</span>
                            <span className="font-medium">{student.course || 'Not selected'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Status:</span>
                            <span className={`font-medium ${student.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                              {student.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="flex justify-between mt-8">
                  <motion.button
                    whileHover={{ scale: formStep > 1 ? 1.03 : 1 }}
                    whileTap={{ scale: formStep > 1 ? 0.98 : 1 }}
                    type="button"
                    className={`py-3 px-6 rounded-xl text-sm font-medium transition-all duration-200 ${
                      formStep === 1
                        ? 'opacity-0 cursor-default'
                        : `border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow ${avatarColors.from.replace('from-', 'hover:text-')}`
                    }`}
                    onClick={moveToPrevStep}
                    disabled={formStep === 1 || isSubmitting}
                  >
                    <div className="flex items-center">
                      <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Back
                    </div>
                  </motion.button>
                  
                  {formStep < totalSteps ? (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      className={`bg-gradient-to-r ${avatarColors.from} ${avatarColors.to} py-3 px-6 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${avatarColors.from.replace('from-', 'focus:ring-')} transition-all duration-200`}
                      onClick={moveToNextStep}
                      disabled={isSubmitting}
                    >
                      <div className="flex items-center">
                        Continue
                        <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: isSubmitting ? 1 : 1.03 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                      type="button"
                      className={`inline-flex items-center bg-gradient-to-r ${avatarColors.from} ${avatarColors.to} py-3 px-6 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${avatarColors.from.replace('from-', 'focus:ring-')} transition-all duration-200 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {isEdit ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          <svg className="mr-2 -ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {isEdit ? 'Update Student' : 'Complete Registration'}
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-3 rounded-b-2xl border-t border-gray-100">
              <p className="text-xs text-gray-500 flex items-center">
                <svg className="h-3 w-3 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-500 mr-1">*</span> Required fields. Student information can be edited after creation.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

StudentFormModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  title: PropTypes.string,
  isEdit: PropTypes.bool
};

export default StudentFormModal;