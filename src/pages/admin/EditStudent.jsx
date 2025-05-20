import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getStudents, updateStudent } from "../../services/studentService";
import { getAllParents } from "../../services/parentService";
import { getParentStudents, addParentStudent, deleteParentStudent } from "../../services/parentStudentService";
import { toast } from "react-hot-toast";
import axios from 'axios'; 
import { getStudentFees, addFeePayment } from "../../services/feeService";

export default function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    dateOfBirth: "",
    enrollmentDate: "",
    status: "active",
    parentId: ""
  });
  const [showStatusNotification, setShowStatusNotification] = useState(false);
  const [fees, setFees] = useState([]);
  const [parents, setParents] = useState([]);
  const [loadingParents, setLoadingParents] = useState(false);
  const [currentParentId, setCurrentParentId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount: '',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'paid'
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [networkError, setNetworkError] = useState(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setIsLoading(true);
        const data = await getStudents();
        const student = data.find(s => s.studentId.toString() === id.toString());
        
        if (!student) {
          setError("Student not found");
          toast.error("Could not find student with ID: " + id);
          return;
        }
        
        const formatDate = (dateString) => {
          if (!dateString) return "";
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        };
        
        setFormData({
          firstName: student.firstName || "",
          lastName: student.lastName || "",
          email: student.email || "",
          phoneNumber: student.phoneNumber || "",
          address: student.address || "",
          dateOfBirth: formatDate(student.dateOfBirth),
          enrollmentDate: formatDate(student.enrollmentDate),
          status: student.status || "active"
        });
      } catch (err) {
        setError("Failed to load student data");
        toast.error("Error loading student data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [id]);

  useEffect(() => {
    console.log("Current fees state:", fees);
    
    if (fees.length > 0) {
      setNetworkError(null);
    }
  }, [fees]);

  const fetchStudentFees = useCallback(async () => {
    if (!id) return;
    
    try {
      console.log("Fetching fees for student ID:", id);
      setNetworkError(null);
      const feeData = await getStudentFees(id);
      console.log("Received fee data:", feeData);
      setFees(feeData || []);
    } catch (err) {
      console.error("Failed to fetch student fee history:", err);
      setNetworkError(`Error loading fees: ${err.message}`);
    }
  }, [id]);
  useEffect(() => {
    if (!isLoading && !error) {
      fetchStudentFees();
      fetchParents();
      fetchParentStudent();
    }
  }, [fetchStudentFees, isLoading, error]);
  
  const fetchParents = async () => {
    try {
      setLoadingParents(true);
      const parentsList = await getAllParents();
      setParents(parentsList);
    } catch (err) {
      console.error("Failed to fetch parents:", err);
      toast.error("Error loading parent data");
    } finally {
      setLoadingParents(false);
    }
  };
  const fetchParentStudent = async () => {
    try {
      const relations = await getParentStudents();
      console.log(`Fetched ${relations.length} parent-student relationships`, relations);
      
      // Check if relations is an array before using find
      if (Array.isArray(relations)) {
        const studentRelation = relations.find(r => {
          const relationStudentId = r.studentId?.toString();
          const currentStudentId = id?.toString();
          const isMatch = relationStudentId === currentStudentId;
          
          if (isMatch) {
            console.log(`Found parent-student relationship for student ${id}:`, r);
          }
          
          return isMatch;
        });
        
        if (studentRelation) {
          console.log(`Setting current parent ID to: ${studentRelation.parentId}`);
          setCurrentParentId(studentRelation.parentId);
          setFormData(prevData => ({...prevData, parentId: studentRelation.parentId}));
        } else {
          console.log(`No parent relationship found for student ${id}`);
        }
      } else {
        console.warn("Parent-student relations is not an array:", relations);
      }
    } catch (err) {
      console.error("Failed to fetch parent-student relationship:", err);
      // Continue execution - the UI should still work without this data
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() || !formData.email.trim()) {
      toast.error("First name and email are required fields");
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Update student information
      await updateStudent(id, formData);
      console.log(`Updated student ${id} info successfully`);
      
      // Handle parent-student relationship
      const newParentId = formData.parentId || null;
      console.log(`Current parent ID: ${currentParentId}, New parent ID: ${newParentId}`);
      
      // If parent changed
      if (newParentId !== currentParentId) {
        console.log(`Parent relationship changed from ${currentParentId} to ${newParentId}`);
        
        // Remove existing relationship if any
        if (currentParentId) {
          try {
            console.log(`Removing relationship between parent ${currentParentId} and student ${id}`);
            await deleteParentStudent(currentParentId, id);
            console.log("Previous parent relationship removed successfully");
          } catch (err) {
            console.error("Failed to remove previous parent relationship:", err);
          }
        }
          // Add new relationship if parent selected
        if (newParentId) {
          try {
            // Validate IDs before creating relationship
            if (!newParentId || !id) {
              console.error("Invalid parent or student ID for relationship:", { parentId: newParentId, studentId: id });
              toast.error("Cannot link to parent: Missing or invalid ID information");
            } else {
              const relationData = {
                parentId: newParentId,
                studentId: id
              };
              console.log("Creating new parent-student relationship:", relationData);
              const result = await addParentStudent(relationData);
              console.log("New parent relationship created successfully:", result);
              toast.success("Student linked to parent successfully");
            }
          } catch (err) {
            console.error("Failed to add new parent relationship:", err);
            toast.error(`Unable to link to parent: ${err.message || "Unknown error"}`);
          }
        }
        
        // Update current parent id
        setCurrentParentId(newParentId);
      } else {
        console.log("Parent relationship unchanged");
      }
      
      toast.success("Student updated successfully");
      setSaveSuccess(true);
      // Stay on the edit page instead of redirecting
      // navigate("/admin/students");
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      toast.error("Failed to update student information");
      setSaveSuccess(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusToggle = () => {
    const newStatus = formData.status === 'active' ? 'inactive' : 'active';
    setFormData({
      ...formData,
      status: newStatus
    });
    
    setShowStatusNotification(true);
    setTimeout(() => {
      setShowStatusNotification(false);
    }, 2000);
  };

  const handleAddPayment = async () => {
    if (!newPayment.amount || isNaN(parseFloat(newPayment.amount))) {
      toast.error("Please enter a valid payment amount");
      return;
    }
    
    try {
      const paymentData = {
        studentId: Number(id), 
        amount: Number(newPayment.amount), 
        dueDate: newPayment.dueDate, 
        status: newPayment.status
      };
      
      console.log("Sending payment data:", paymentData);
      
      const response = await addFeePayment(paymentData);
      console.log("Payment response:", response);
      
      const newFee = response.feeId ? response : { ...response, feeId: Date.now() };
      
      setFees(prevFees => [...prevFees, newFee]);
      
      setShowPaymentModal(false);
      setNewPayment({
        amount: '',
        dueDate: new Date().toISOString().split('T')[0],
        status: 'paid'
      });
      
      toast.success("Payment added successfully");
    } catch (err) {
      console.error("Payment error details:", err);
      toast.error("Failed to add payment: " + (err.response?.data?.message || err.message));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4 py-20">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-xl font-medium text-gray-700 mb-1">Loading Student Data</h3>
          <p className="text-gray-500">Please wait while we fetch the student information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4 py-12">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-6 mx-auto">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">Error Loading Student</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            to="/students" 
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            Back to Students
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-10">
      <div className="max-w-4xl mx-auto px-4">        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link 
              to="/admin/students"
              className="mr-4 bg-white p-2 rounded-lg shadow-sm text-gray-500 hover:text-blue-600 transition-all duration-200 hover:shadow-md"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">Edit Student</h1>
          </div>
          <div className="bg-blue-100 text-blue-600 px-4 py-1.5 rounded-full text-sm font-medium">
            Student ID: {id}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-10 flex flex-col items-center justify-center text-white relative">
            <div className="h-28 w-28 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl font-semibold mb-4 shadow-lg ring-4 ring-white/30">
              {(formData.firstName?.[0] || '') + (formData.lastName?.[0] || '')}
            </div>
            <h2 className="text-xl font-semibold">{`${formData.firstName} ${formData.lastName}`}</h2>
            <p className="text-blue-100">{formData.email}</p>
            
            <div className={`mt-3 px-4 py-1 rounded-full text-xs font-semibold ${
              formData.status === 'active' 
                ? 'bg-green-500/30 text-green-100' 
                : 'bg-red-500/30 text-red-100'
            }`}>
              {formData.status === 'active' ? 'ACTIVE' : 'INACTIVE'}
            </div>
            
            {fees.length > 0 && (
              <div className="flex items-center mt-2 space-x-2">
                <div className="px-3 py-1 rounded-lg bg-white/10 text-xs flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>{fees.length} Payments</span>
                </div>
                <div className="px-3 py-1 rounded-lg bg-white/10 text-xs">
                  Total: ${fees.reduce((sum, fee) => sum + fee.amount, 0).toFixed(2)}
                </div>
              </div>
            )}
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10"></div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4 pb-2 border-b border-gray-200">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative group">
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                    <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-blue-600 transition-all duration-300 group-focus-within:w-full"></div>
                  </div>
                  
                  <div className="relative group">
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                    <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-blue-600 transition-all duration-300 group-focus-within:w-full"></div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4 pb-2 border-b border-gray-200">Contact Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative group">
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
                        name="email"
                        className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 pl-10 pr-4 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="relative group">
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
                        name="phoneNumber"
                        className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 pl-10 pr-4 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <textarea
                      id="address"
                      name="address"
                      rows="3"
                      className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 pl-10 pr-4 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      value={formData.address}
                      onChange={handleChange}
                    ></textarea>                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4 pb-2 border-b border-gray-200">Parent Information</h3>
                <div className="mt-6">
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
                        name="parentId"
                        className="block w-full pl-10 border border-gray-300 rounded-xl shadow-sm py-3 px-4 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none"
                        value={formData.parentId || ''}
                        onChange={handleChange}
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
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4 pb-2 border-b border-gray-200">Important Dates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative group">
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
                        name="dateOfBirth"
                        className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 pl-10 pr-4 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <label htmlFor="enrollmentDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Enrollment Date
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <input
                        type="date"
                        id="enrollmentDate"
                        name="enrollmentDate"
                        className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 pl-10 pr-4 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        value={formData.enrollmentDate}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4 pb-2 border-b border-gray-200">Account Status</h3>
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-800">Student Status</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.status === 'active' 
                        ? 'Student account is currently active and can access all resources.' 
                        : 'Student account is currently inactive and access is restricted.'}
                    </p>
                  </div>
                  
                  <div 
                    className="relative cursor-pointer"
                    onClick={handleStatusToggle}
                  >
                    <div className={`w-14 h-7 rounded-full transition-all duration-300 ${
                      formData.status === 'active' ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transform transition-all duration-300 shadow-md ${
                        formData.status === 'active' ? 'right-1' : 'left-1'
                      }`}></div>
                    </div>
                    <span className="block text-xs font-medium text-center mt-1.5 w-14">
                      {formData.status === 'active' ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4 pb-2 border-b border-gray-200">Payment History</h3>
                <div className="mb-4 flex justify-between items-center">
                  <p className="text-sm text-gray-600">View and manage student payments</p>
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center text-sm font-medium transition-colors duration-150"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Add Payment
                  </button>
                </div>
                
                {fees.length > 0 ? (
                  <div className="bg-gray-50 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {fees.map((fee) => (
                            <tr key={fee.feeId || `fee-${Math.random()}`} className="hover:bg-gray-100 transition-colors duration-150">
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                                {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : 'No date'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">
                                ${fee.amount ? fee.amount.toFixed(2) : '0.00'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  fee.status === 'paid' 
                                    ? 'bg-green-100 text-green-800' 
                                    : fee.status === 'pending' 
                                      ? 'bg-yellow-100 text-yellow-800' 
                                      : 'bg-red-100 text-red-800'
                                }`}>
                                  {fee.status ? fee.status.charAt(0).toUpperCase() + fee.status.slice(1) : 'Unknown'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-6 text-center">
                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p className="text-gray-600">No payment records found for this student.</p>
                    <button
                      type="button"
                      onClick={() => setShowPaymentModal(true)}
                      className="mt-4 bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-150"
                    >
                      Record First Payment
                    </button>
                  </div>
                )}
              </div>
              
              <div className="pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row-reverse sm:justify-between sm:items-center gap-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className={`relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 py-3 px-6 border border-transparent rounded-xl shadow-md text-sm font-medium text-white hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 flex items-center justify-center ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      <span className="absolute right-0 top-0 h-4 w-4 bg-white/30 rounded-full -mr-1 -mt-1 transform scale-0 animate-ping origin-center"></span>
                      
                      {isSaving && (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {isSaving ? "Saving Changes..." : "Save Changes"}
                    </button>
                      <button
                      type="button"
                      onClick={() => navigate(`/admin/students/${id}`)}
                      className="bg-indigo-50 hover:bg-indigo-100 py-3 px-6 border border-transparent rounded-xl shadow-sm text-sm font-medium text-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Profile
                    </button>
                  </div>
                    <Link
                    to="/admin/students"
                    className="bg-white hover:bg-gray-50 py-3 px-6 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </Link>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      {saveSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-white rounded-xl p-4 shadow-lg border border-green-200 flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-gray-800 font-medium">Changes saved successfully!</p>
            <button 
              onClick={() => navigate("/admin/students")}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Return to Students List
            </button>
          </div>
          <button 
            onClick={() => setSaveSuccess(false)} 
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      )}
      {showStatusNotification && (
        <div className={`fixed bottom-5 right-5 px-6 py-3 rounded-xl shadow-lg text-white font-medium transition-all duration-300 transform ${
          formData.status === 'active'
            ? 'bg-green-600'
            : 'bg-red-600'
        }`}>
          <div className="flex items-center space-x-2">
            {formData.status === 'active' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            )}
            <span>
              Student status changed to {formData.status === 'active' ? 'active' : 'inactive'}
            </span>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-10 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Add Payment
              </h3>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-500 bg-gray-100 rounded-full p-2 transition-colors duration-150"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="text"
                    id="amount"
                    className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 pl-8 pr-4 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="date"
                    id="paymentDate"
                    className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 pl-10 pr-4 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150"
                    value={newPayment.dueDate}
                    onChange={(e) => setNewPayment({...newPayment, dueDate: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Status
                </label>
                <select
                  id="status"
                  className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150"
                  value={newPayment.status}
                  onChange={(e) => setNewPayment({...newPayment, status: e.target.value})}
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 mt-8">
                <button
                  type="button"
                  className="bg-white py-3 px-6 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="bg-green-600 py-3 px-6 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150"
                  onClick={handleAddPayment}
                >
                  Add Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}