import React, { useState, useEffect } from 'react';
import { getClassById, enrollStudentInClass, getEnrolledStudents } from '../../services/classService';
import { useParams, useNavigate } from 'react-router-dom';

/**
 * Component for displaying detailed information about a class
 * Includes class details, tutor information, enrolled students,
 * and options for enrollment (for students) or management (for tutors/admins)
 */
export default function ClassDetailView() {  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details'); // details, students, materials, attendance
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [enrolling, setEnrolling] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchClassData = async () => {
      try {
        setLoading(true);
        const data = await getClassById(id);
        setClassData(data);
        
        // Fetch enrolled students
        try {
          const studentsData = await getEnrolledStudents(id);
          setEnrolledStudents(studentsData);
        } catch (err) {
          console.error('Error fetching enrolled students:', err);
          // Continue with the class display even if student fetching fails
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching class data:', err);
        setError('Failed to load class data. Please try again later.');
        setLoading(false);
      }
    };

    fetchClassData();
  }, [id]);
  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      
      // In a real app, you would get the student ID from auth context
      // For now, we'll use a mock student ID
      const studentId = 1; // Example student ID
      
      await enrollStudentInClass(id, studentId);
      
      // Refresh the list of enrolled students
      const studentsData = await getEnrolledStudents(id);
      setEnrolledStudents(studentsData);
      
      // Show success feedback
      alert('You have successfully enrolled in this class!');
      setEnrolling(false);
    } catch (err) {
      console.error('Error enrolling in class:', err);
      alert('Failed to enroll in class. Please try again later.');
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-3xl">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-32 bg-gray-200 rounded w-full mt-4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-3xl w-full">
          <p>{error}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="p-6 flex justify-center">
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg max-w-3xl w-full">
          <p>Class not found</p>
          <button 
            onClick={() => navigate(-1)} 
            className="mt-2 text-sm font-medium text-amber-600 hover:text-amber-500"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{classData.name}</h1>
            <div className="flex items-center">
              <span className={`px-3 py-1 text-sm rounded-full ${
                classData.status === 'active' ? 'bg-green-100 text-green-800' :
                classData.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {classData.status?.charAt(0).toUpperCase() + classData.status?.slice(1) || 'Unknown Status'}
              </span>
              <button 
                onClick={() => navigate(-1)}
                className="ml-4 text-gray-400 hover:text-gray-500"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-500">
            <span className="bg-gray-100 rounded-md px-2 py-1">
              {classData.subject || 'No Subject'}
            </span>
            <span className="bg-gray-100 rounded-md px-2 py-1">
              {classData.grade || 'No Grade'}
            </span>
            <span className="bg-gray-100 rounded-md px-2 py-1">
              {classData.room || 'No Room Assigned'}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex -mb-px">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Class Details
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'students'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setActiveTab('materials')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'materials'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Materials
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'attendance'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Attendance
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          {activeTab === 'details' && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Class Information</h2>
              
              <div className="border-t border-gray-200 pt-4">
                <dl className="divide-y divide-gray-200">
                  <div className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Schedule</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{classData.schedule || 'Not specified'}</dd>
                  </div>
                  <div className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Tutor</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{classData.tutorName || 'Not assigned'}</dd>
                  </div>
                  <div className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Duration</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{classData.duration || '60'} minutes</dd>
                  </div>
                  <div className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Enrolled Students</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{classData.students || 0}</dd>
                  </div>
                  <div className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{classData.description || 'No description available'}</dd>
                  </div>
                </dl>
              </div>              <div className="mt-6">
                <button
                  onClick={handleEnroll}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={enrolling}
                >
                  {enrolling ? 'Enrolling...' : 'Enroll in Class'}
                </button>
              </div>
            </div>
          )}          {activeTab === 'students' && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Enrolled Students</h2>
              
              {enrolledStudents && enrolledStudents.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {enrolledStudents.map((student) => (
                    <li key={student.id} className="py-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full overflow-hidden">
                          {student.avatar ? (
                            <img src={student.avatar} alt={student.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-500">
                              {student.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-500">{student.email}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Joined {new Date(student.enrollDate).toLocaleDateString()}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No students enrolled yet</p>
              )}
            </div>
          )}

          {activeTab === 'materials' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Class Materials</h2>
                {/* Add button would be shown for tutors/admins */}
                <button className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Add Material
                </button>
              </div>
              
              {classData.materials && classData.materials.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {classData.materials.map((material, index) => (
                    <li key={index} className="py-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-indigo-100 rounded-md">
                          <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">{material.title}</p>
                          <p className="text-sm text-gray-500">Added {new Date(material.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                        Download
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No materials available yet</p>
              )}
            </div>
          )}

          {activeTab === 'attendance' && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Attendance Records</h2>
              
              {classData.attendance && classData.attendance.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {classData.attendance.map((record, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${record.status === 'present' ? 'bg-green-100 text-green-800' : 
                                record.status === 'absent' ? 'bg-red-100 text-red-800' : 
                                'bg-yellow-100 text-yellow-800'}`}>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {record.notes || 'No notes'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No attendance records available</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
