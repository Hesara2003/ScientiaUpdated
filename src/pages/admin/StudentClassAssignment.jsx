import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import userService from '../../services/userService';
import classService, { 
  enrollStudentInClass, 
  unenrollStudentFromClass, 
  getAllClasses 
} from '../../services/classService';

const StudentClassAssignment = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [allClasses, setAllClasses] = useState([]);
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch the student details, all classes, and the student's enrolled classes
        const [studentData, classes] = await Promise.all([
          userService.getUserById(studentId),
          getAllClasses()
        ]);
        
        setStudent(studentData);
        setAllClasses(classes);
        
        // Fetch enrolled classes for this student
        if (studentData.id) {
          try {
            const studentClasses = await api.get(`/students/${studentId}/classes`);
            setEnrolledClasses(studentClasses.data || []);
            
            // Determine available classes (not yet enrolled)
            const enrolledClassIds = studentClasses.data.map(c => c.id?.toString());
            setAvailableClasses(
              classes.filter(c => !enrolledClassIds.includes(c.id?.toString()))
            );
          } catch (error) {
            console.error("Error fetching student classes:", error);
            setEnrolledClasses([]);
            setAvailableClasses(classes);
          }
        }
      } catch (error) {
        toast.error("Failed to load data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [studentId]);

  const handleClassSelection = (classId) => {
    setSelectedClasses(prev => {
      if (prev.includes(classId)) {
        return prev.filter(id => id !== classId);
      } else {
        return [...prev, classId];
      }
    });
  };

  const handleEnrollStudent = async () => {
    if (selectedClasses.length === 0) {
      toast.error("Please select at least one class");
      return;
    }
    
    setEnrolling(true);
    
    try {
      // Enroll the student in each selected class
      const enrollmentPromises = selectedClasses.map(classId => 
        enrollStudentInClass(classId, studentId)
      );
      
      await Promise.all(enrollmentPromises);
      
      toast.success("Student enrolled successfully");
      
      // Refresh the lists
      const enrolledResponse = await api.get(`/students/${studentId}/classes`);
      setEnrolledClasses(enrolledResponse.data || []);
      
      // Update available classes
      const enrolledClassIds = enrolledResponse.data.map(c => c.id?.toString());
      setAvailableClasses(
        allClasses.filter(c => !enrolledClassIds.includes(c.id?.toString()))
      );
      
      // Clear selection
      setSelectedClasses([]);
    } catch (error) {
      toast.error("Failed to enroll student");
      console.error(error);
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async (classId) => {
    try {
      await unenrollStudentFromClass(classId, studentId);
      
      toast.success("Student unenrolled from class");
      
      // Remove from enrolled classes
      setEnrolledClasses(prev => prev.filter(c => c.id?.toString() !== classId.toString()));
      
      // Add back to available classes
      const classToAdd = allClasses.find(c => c.id?.toString() === classId.toString());
      if (classToAdd) {
        setAvailableClasses(prev => [...prev, classToAdd]);
      }
    } catch (error) {
      toast.error("Failed to unenroll student");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-lg text-gray-700">Loading...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          <p>Student not found</p>
        </div>
        <button 
          onClick={() => navigate('/admin/students')}
          className="mt-4 px-4 py-2 bg-gray-200 rounded-md"
        >
          Return to Students
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Assign Classes</h1>
            <p className="text-gray-600">
              Manage class assignments for {student.firstName} {student.lastName}
            </p>
          </div>
          <button 
            onClick={() => navigate('/admin/students')}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Back to Students
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Currently Enrolled Classes */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Currently Enrolled Classes</h2>
          {enrolledClasses.length === 0 ? (
            <div className="bg-gray-50 p-4 rounded-md text-gray-500 text-center">
              Student is not enrolled in any classes yet.
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {enrolledClasses.map(cls => (
                  <li key={cls.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{cls.name}</h3>
                        <p className="text-sm text-gray-500">{cls.subjectName || cls.subject?.name}</p>
                        <p className="text-xs text-gray-400">
                          {cls.schedule || 'Schedule not set'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleUnenroll(cls.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200"
                      >
                        Unenroll
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Available Classes */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Available Classes</h2>
          {availableClasses.length === 0 ? (
            <div className="bg-gray-50 p-4 rounded-md text-gray-500 text-center">
              No available classes found.
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
                <ul className="divide-y divide-gray-200">
                  {availableClasses.map(cls => (
                    <li key={cls.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`class-${cls.id}`}
                          checked={selectedClasses.includes(cls.id)}
                          onChange={() => handleClassSelection(cls.id)}
                          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label 
                          htmlFor={`class-${cls.id}`}
                          className="ml-3 flex-1 cursor-pointer"
                        >
                          <h3 className="font-medium text-gray-900">{cls.name}</h3>
                          <p className="text-sm text-gray-500">{cls.subjectName || cls.subject?.name}</p>
                          <p className="text-xs text-gray-400">
                            {cls.schedule || 'Schedule not set'}
                          </p>
                        </label>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleEnrollStudent}
                  disabled={selectedClasses.length === 0 || enrolling}
                  className={`px-4 py-2 rounded-md text-white ${
                    selectedClasses.length === 0 || enrolling
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {enrolling ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enrolling...
                    </span>
                  ) : (
                    `Enroll in Selected Classes (${selectedClasses.length})`
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentClassAssignment;