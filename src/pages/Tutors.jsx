import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAllTutors, deleteTutor, bulkDeleteTutors, createTutor, updateTutor } from "../services/tutorService";

const Tutors = () => {
  const THEME = {
    primary: '#4F46E5',    // Indigo
    secondary: '#10B981',  // Emerald
    accent: '#8B5CF6',     // Violet
    warning: '#F59E0B',    // Amber
    danger: '#EF4444',     // Red
    success: '#10B981',    // Green
    info: '#3B82F6',       // Blue
    light: '#F3F4F6',      // Gray-100
    dark: '#1F2937',       // Gray-800
    gradient: {
      primary: 'from-indigo-600 to-purple-600',
      secondary: 'from-cyan-500 to-blue-500',
      accent: 'from-purple-600 to-pink-600',
      success: 'from-emerald-500 to-green-500',
      warning: 'from-amber-500 to-yellow-500'
    }
  };
  
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentTutor, setCurrentTutor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTutors, setSelectedTutors] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "firstName",
    direction: "ascending"
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tutorToDelete, setTutorToDelete] = useState(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialization: '',
    hourlyRate: '',
    availability: 'full-time',
    bio: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (showEditModal && currentTutor) {
      setFormData({
        firstName: currentTutor.firstName || '',
        lastName: currentTutor.lastName || '',
        email: currentTutor.email || '',
        phone: currentTutor.phone || '',
        specialization: currentTutor.specialization || '',
        hourlyRate: currentTutor.hourlyRate?.toString() || '',
        availability: currentTutor.availability || 'full-time',
        bio: currentTutor.bio || ''
      });
    } else if (showAddModal) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        specialization: '',
        hourlyRate: '',
        availability: 'full-time',
        bio: ''
      });
    }
    setFormErrors({});
  }, [showAddModal, showEditModal, currentTutor]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!emailPattern.test(formData.email)) {
      errors.email = "Invalid email address";
    }
    
    if (!formData.specialization.trim()) errors.specialization = "Specialization is required";
    
    if (!formData.hourlyRate) {
      errors.hourlyRate = "Hourly rate is required";
    } else if (isNaN(formData.hourlyRate) || parseFloat(formData.hourlyRate) <= 0) {
      errors.hourlyRate = "Hourly rate must be a positive number";
    }
    
    return errors;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      const tutorData = {
        ...formData,
        hourlyRate: parseFloat(formData.hourlyRate)
      };
      
      if (showEditModal && currentTutor) {
        tutorData.id = currentTutor.id || currentTutor._id;
      }
      
      // Call appropriate handler
      if (showEditModal) {
        await handleUpdateTutor(tutorData);
      } else {
        await handleAddTutor(tutorData);
      }
    } catch (err) {
      console.error("Form submission error:", err);
    }
  };

  const fetchTutors = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllTutors();
      setTutors(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching tutors:", err);
      setError("Failed to load tutors. Please try again later.");
      setTutors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTutors();
  }, [fetchTutors]);

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedTutors = [...tutors].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  const filteredTutors = sortedTutors.filter((tutor) => {
    const searchRegex = new RegExp(searchTerm, "i");
    return (
      searchRegex.test(tutor.firstName) ||
      searchRegex.test(tutor.lastName) ||
      searchRegex.test(tutor.email) ||
      searchRegex.test(tutor.specialization)
    );
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedTutors(filteredTutors.map((tutor) => tutor.id || tutor._id));
    } else {
      setSelectedTutors([]);
    }
  };

  const handleSelectTutor = (tutorId) => {
    setSelectedTutors((prev) =>
      prev.includes(tutorId)
        ? prev.filter((id) => id !== tutorId)
        : [...prev, tutorId]
    );
  };

  const handleAddTutor = async (tutorData) => {
    try {
      await createTutor(tutorData);
      setShowAddModal(false);
      setDeleteSuccess("Tutor has been added successfully.");
      setTimeout(() => setDeleteSuccess(null), 3000);
      await fetchTutors();
    } catch (err) {
      console.error("Error adding tutor:", err);
      setDeleteError("Failed to add tutor. Please try again.");
      setTimeout(() => setDeleteError(null), 3000);
    }
  };

  const handleEditTutor = (tutor) => {
    setCurrentTutor(tutor);
    setShowEditModal(true);
  };

  const handleUpdateTutor = async (tutorData) => {
    try {
      const id = tutorData.id;
      await updateTutor(id, tutorData);
      setShowEditModal(false);
      setDeleteSuccess(`${tutorData.firstName} ${tutorData.lastName} has been updated successfully.`);
      setTimeout(() => setDeleteSuccess(null), 3000);
      await fetchTutors();
    } catch (err) {
      console.error("Error updating tutor:", err);
      setDeleteError(`Failed to update ${tutorData.firstName} ${tutorData.lastName}. Please try again.`);
      setTimeout(() => setDeleteError(null), 3000);
    }
  };

  const confirmDelete = (tutor) => {
    setTutorToDelete(tutor);
    setShowDeleteConfirm(true);
  };

  const handleDeleteTutor = async () => {
    try {
      await deleteTutor(tutorToDelete.id || tutorToDelete._id);
      setShowDeleteConfirm(false);
      setDeleteSuccess(`${tutorToDelete.firstName} ${tutorToDelete.lastName} has been deleted successfully.`);
      setTimeout(() => setDeleteSuccess(null), 3000);
      fetchTutors();
    } catch (err) {
      console.error("Error deleting tutor:", err);
      setDeleteError(`Failed to delete ${tutorToDelete.firstName} ${tutorToDelete.lastName}. Please try again.`);
      setTimeout(() => setDeleteError(null), 3000);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTutors.length === 0) return;
    
    setShowBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = async () => {
    try {
      await bulkDeleteTutors(selectedTutors);
      setDeleteSuccess(`${selectedTutors.length} tutors have been deleted successfully.`);
      setTimeout(() => setDeleteSuccess(null), 3000);
      setSelectedTutors([]);
      setShowBulkDeleteConfirm(false);
      fetchTutors();
    } catch (err) {
      console.error("Error bulk deleting tutors:", err);
      setDeleteError("Failed to delete selected tutors. Please try again.");
      setTimeout(() => setDeleteError(null), 3000);
    }
  };

  const getInitials = (firstName, lastName) => {
    return (firstName?.[0] || "") + (lastName?.[0] || "");
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1, y: 0,
      transition: { type: "spring", stiffness: 100 }
    }
  };
  return (    <div className="px-6 py-8 max-w-7xl mx-auto">
      <div className="relative mb-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl transform -skew-y-1">
          <div className="absolute top-0 left-0 w-40 h-40 bg-blue-100 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-blob"></div>
          <div className="absolute top-5 right-0 w-40 h-40 bg-purple-100 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-5 left-20 w-40 h-40 bg-pink-100 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col md:flex-row md:items-center justify-between px-6 pt-8 pb-6"
          >
            <div>
              <div className="flex items-center mb-2">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight ml-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                  Tutors Management
                  <span className="ml-3 px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full inline-flex items-center">
                    <span className="w-2 h-2 bg-indigo-600 rounded-full mr-1"></span>
                    {tutors.length} Total
                  </span>
                </h1>
              </div>
              <p className="text-gray-600 text-lg max-w-2xl ml-16 pl-1">
                Manage your educational team, track specializations, and monitor teaching performance
              </p>
            </div>

            <div className="flex items-center mt-4 md:mt-0 space-x-3">
              {selectedTutors.length > 0 && (
                <motion.button
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.03, backgroundColor: "#FEE2E2" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBulkDelete}
                  className="px-4 py-2.5 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-medium flex items-center transition-all shadow-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  Delete Selected ({selectedTutors.length})
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium flex items-center shadow-md transition-all"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add New Tutor
              </motion.button>
            </div>
          </motion.div>          {/* Stats Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 px-6 pb-6 mt-2"
          >
            {/* Active Tutors Card */}
            <motion.div 
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 overflow-hidden relative group transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-full -mt-10 -mr-10 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
                <div className="ml-4 relative z-10">
                  <h3 className="text-lg font-semibold text-gray-700">Active Tutors</h3>
                  <p className="text-3xl font-bold text-gray-800 flex items-baseline">
                    {tutors.length || 0}
                    <span className="text-sm font-normal text-gray-500 ml-1">tutors</span>
                  </p>
                  <p className="text-sm text-green-600 flex items-center mt-1 font-medium">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-100 mr-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                      </svg>
                    </span>
                    <span>3.2% this week</span>
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Math Specialists Card */}
            <motion.div 
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 overflow-hidden relative group transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-50 rounded-full -mt-10 -mr-10 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div className="ml-4 relative z-10">
                  <h3 className="text-lg font-semibold text-gray-700">Math Specialists</h3>
                  <p className="text-3xl font-bold text-gray-800 flex items-baseline">
                    {tutors.filter(t => t.specialization === 'Mathematics').length || 0}
                    <span className="text-sm font-normal text-gray-500 ml-1">tutors</span>
                  </p>
                  <p className="text-sm text-purple-600 flex items-center mt-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mr-1"></span>
                    <span>Most requested specialty</span>
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Average Rate Card */}
            <motion.div 
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 overflow-hidden relative group transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full -mt-10 -mr-10 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div className="ml-4 relative z-10">
                  <h3 className="text-lg font-semibold text-gray-700">Average Rate</h3>
                  <p className="text-3xl font-bold text-gray-800">
                    ${tutors.length ? (tutors.reduce((acc, t) => acc + (t.hourlyRate || 0), 0) / tutors.length).toFixed(2) : '0.00'}/hr
                  </p>
                  <p className="text-sm text-emerald-600 flex items-center mt-1 font-medium">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 mr-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                      </svg>
                    </span>
                    <span>5.4% increase</span>
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Full-time Tutors Card */}
            <motion.div 
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 overflow-hidden relative group transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-50 rounded-full -mt-10 -mr-10 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div className="ml-4 relative z-10">
                  <h3 className="text-lg font-semibold text-gray-700">Full-time Tutors</h3>
                  <p className="text-3xl font-bold text-gray-800 flex items-baseline">
                    {tutors.filter(t => t.availability === 'full-time').length || 0}
                    <span className="text-sm font-normal text-gray-500 ml-1">tutors</span>
                  </p>
                  <div className="mt-1 w-full bg-gray-100 rounded-full h-1.5">
                    <div 
                      className="bg-amber-500 h-1.5 rounded-full" 
                      style={{ width: `${tutors.length ? Math.round((tutors.filter(t => t.availability === 'full-time').length / tutors.length) * 100) : 0}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-amber-600 mt-1 font-medium">
                    {tutors.length ? Math.round((tutors.filter(t => t.availability === 'full-time').length / tutors.length) * 100) : 0}% of total
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>      <div className="mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 space-y-3 md:space-y-0">
            <div className="relative w-full md:w-80 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring focus:ring-indigo-200 focus:border-indigo-500 bg-gray-50/30 shadow-sm transition-all"
                placeholder="Search tutors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-sm text-gray-400">
                {searchTerm && `${filteredTutors.length} results`}
              </div>
            </div>

            <div className="flex space-x-3">
              <div className="relative">
                <select
                  className="appearance-none block border border-gray-200 rounded-lg focus:ring focus:ring-indigo-200 focus:border-indigo-500 bg-gray-50/30 py-2.5 pl-4 pr-10 text-sm shadow-sm transition-all"
                  defaultValue="all"
                >
                  <option value="all">All Specializations</option>
                  <option value="math">Mathematics</option>
                  <option value="science">Science</option>
                  <option value="cs">Computer Science</option>
                  <option value="lang">Languages</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>

              <div className="relative">
                <select
                  className="appearance-none block border border-gray-200 rounded-lg focus:ring focus:ring-indigo-200 focus:border-indigo-500 bg-gray-50/30 py-2.5 pl-4 pr-10 text-sm shadow-sm transition-all"
                  defaultValue="all"
                >
                  <option value="all">All Availability</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="weekends">Weekends</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>          <AnimatePresence>
            {deleteSuccess && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 bg-green-50 border border-green-100 p-4 rounded-lg shadow-sm"
              >
                <div className="flex">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-green-800">{deleteSuccess}</p>
                  </div>
                  <button 
                    onClick={() => setDeleteSuccess(null)}
                    className="text-green-500 hover:text-green-700"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {deleteError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 bg-red-50 border border-red-100 p-4 rounded-lg shadow-sm"
              >
                <div className="flex">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-red-800">{deleteError}</p>
                  </div>
                  <button 
                    onClick={() => setDeleteError(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>          <div className="overflow-x-auto -mx-6">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden">
                {loading ? (
                  <div className="flex flex-col justify-center items-center py-16">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-100"></div>
                      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 absolute top-0 left-0"></div>
                    </div>
                    <p className="mt-4 text-sm text-gray-500 animate-pulse">Loading tutors...</p>
                  </div>
                ) : error ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-12 text-center"
                  >
                    <div className="mx-auto h-20 w-20 rounded-full bg-red-50 flex items-center justify-center mb-4">
                      <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <h3 className="mt-2 text-xl font-medium text-gray-900">Error Loading Data</h3>
                    <p className="mt-3 text-base text-gray-500 max-w-md mx-auto">{error}</p>
                    <div className="mt-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => fetchTutors()}
                        className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        Retry
                      </motion.button>
                    </div>
                  </motion.div>
                ) : filteredTutors.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-12 text-center"
                  >
                    <div className="mx-auto h-20 w-20 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                      <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <h3 className="mt-2 text-xl font-medium text-gray-900">No Tutors Found</h3>
                    <p className="mt-3 text-base text-gray-500 max-w-md mx-auto">
                      {searchTerm
                        ? `No tutors match your search "${searchTerm}"`
                        : "There are no tutors in the system yet"}
                    </p>
                    <div className="mt-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        Add your first tutor
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative rounded-xl overflow-hidden shadow-sm"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    <table className="min-w-full divide-y divide-gray-200 table-fixed">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="w-12 px-6 py-3.5 text-left">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                              checked={selectedTutors.length === filteredTutors.length && filteredTutors.length > 0}
                              onChange={handleSelectAll}
                            />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                          onClick={() => handleSort("firstName")}
                        >
                          <div className="flex items-center space-x-1">
                            <span className="group-hover:text-indigo-600">Tutor</span>
                            <span className={`transition-transform duration-200 ${sortConfig.key === "firstName" ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d={
                                    sortConfig.direction === "ascending"
                                      ? "M5 15l7-7 7 7"
                                      : "M19 9l-7 7-7-7"
                                  }
                                ></path>
                              </svg>
                            </span>
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                          onClick={() => handleSort("specialization")}
                        >
                          <div className="flex items-center space-x-1">
                            <span className="group-hover:text-indigo-600">Specialization</span>
                            <span className={`transition-transform duration-200 ${sortConfig.key === "specialization" ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d={
                                    sortConfig.direction === "ascending"
                                      ? "M5 15l7-7 7 7"
                                      : "M19 9l-7 7-7-7"
                                  }
                                ></path>
                              </svg>
                            </span>
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                          onClick={() => handleSort("hourlyRate")}
                        >
                          <div className="flex items-center space-x-1">
                            <span className="group-hover:text-indigo-600">Rate</span>
                            <span className={`transition-transform duration-200 ${sortConfig.key === "hourlyRate" ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d={
                                    sortConfig.direction === "ascending"
                                      ? "M5 15l7-7 7 7"
                                      : "M19 9l-7 7-7-7"
                                  }
                                ></path>
                              </svg>
                            </span>
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Availability
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTutors.map((tutor, index) => (
                        <motion.tr
                          key={tutor.id || tutor._id}
                          variants={itemVariants}
                          className={`hover:bg-gray-50 ${
                            selectedTutors.includes(tutor.id || tutor._id)
                              ? "bg-blue-50"
                              : ""
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                checked={selectedTutors.includes(
                                  tutor.id || tutor._id
                                )}
                                onChange={() =>
                                  handleSelectTutor(tutor.id || tutor._id)
                                }
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white font-medium">
                                  {getInitials(tutor.firstName, tutor.lastName)}
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {tutor.firstName} {tutor.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{tutor.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {tutor.specialization}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${tutor.hourlyRate?.toFixed(2)}/hr
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="capitalize">
                              {(tutor.availability || "full-time").replace("-", " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleEditTutor(tutor)}
                                className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                              </button>
                              <button
                                onClick={() => confirmDelete(tutor)}
                                className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}                    </tbody>
                  </table>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
          
          {filteredTutors.length > 0 && !loading && !error && (
            <div className="py-3 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{filteredTutors.length}</span> of{" "}
                <span className="font-medium">{tutors.length}</span> tutors
              </div>
              <div className="flex-1 flex justify-end">
                <button
                  disabled
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 opacity-50 cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  disabled
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 opacity-50 cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showDeleteConfirm && tutorToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-gray-900/50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center mb-1">
                Delete Tutor
              </h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                Are you sure you want to delete{" "}
                <span className="font-medium text-gray-700">
                  {tutorToDelete.firstName} {tutorToDelete.lastName}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTutor}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBulkDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-gray-900/50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center mb-1">
                Delete Multiple Tutors
              </h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                Are you sure you want to delete {selectedTutors.length} selected tutors? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowBulkDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBulkDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md"
                >
                  Delete All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => showAddModal ? setShowAddModal(false) : setShowEditModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-lg w-full relative z-10 mx-auto"
            >
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <h3 className="text-lg font-medium text-gray-900">
                  {showAddModal ? "Add New Tutor" : `Edit ${currentTutor?.firstName} ${currentTutor?.lastName}`}
                </h3>
                <button
                  onClick={() => showAddModal ? setShowAddModal(false) : setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                        formErrors.firstName ? "border-red-300" : ""
                      }`}
                    />
                    {formErrors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                        formErrors.lastName ? "border-red-300" : ""
                      }`}
                    />
                    {formErrors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                        formErrors.email ? "border-red-300" : ""
                      }`}
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
                      Specialization <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="specialization"
                      id="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                        formErrors.specialization ? "border-red-300" : ""
                      }`}
                    >
                      <option value="">Select a specialization</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Languages">Languages</option>
                    </select>
                    {formErrors.specialization && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.specialization}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700">
                      Hourly Rate ($) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="hourlyRate"
                      id="hourlyRate"
                      min="0"
                      step="0.01"
                      value={formData.hourlyRate}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                        formErrors.hourlyRate ? "border-red-300" : ""
                      }`}
                    />
                    {formErrors.hourlyRate && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.hourlyRate}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="availability" className="block text-sm font-medium text-gray-700">
                      Availability
                    </label>
                    <select
                      name="availability"
                      id="availability"
                      value={formData.availability}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="weekends">Weekends only</option>
                      <option value="evenings">Evenings only</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                      Bio / Description
                    </label>
                    <textarea
                      name="bio"
                      id="bio"
                      rows={3}
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    ></textarea>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => showAddModal ? setShowAddModal(false) : setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {showAddModal ? "Add Tutor" : "Update Tutor"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tutors;