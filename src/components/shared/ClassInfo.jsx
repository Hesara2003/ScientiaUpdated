import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import portalClassService from '../../services/portalClassService';

/**
 * A component that displays class information based on the user's role
 * Can be used across all portals
 */
const ClassInfo = ({ classId, showEnrollment = false }) => {
  const { user } = useAuth();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        setLoading(true);
        const data = await portalClassService.getClassDetails(classId, user.role, user.id);
        setClassData(data);
      } catch (err) {
        setError('Failed to load class information');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      fetchClassData();
    }
  }, [classId, user.role, user.id]);

  if (loading) return <div className="p-4 animate-pulse">Loading class information...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!classData) return <div className="p-4">No class information available</div>;

  // Format date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold mb-2">{classData.name || 'Unnamed Class'}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-gray-600">Subject: {classData.subjectName || 'Unknown'}</p>
          <p className="text-gray-600">Start Time: {formatDateTime(classData.startTime)}</p>
          <p className="text-gray-600">End Time: {formatDateTime(classData.endTime)}</p>
          {classData.location && (
            <p className="text-gray-600">Location: {classData.location}</p>
          )}
        </div>

        <div>
          {classData.tutorName && (
            <p className="text-gray-600">Instructor: {classData.tutorName}</p>
          )}
          {classData.enrollmentCount !== undefined && (
            <p className="text-gray-600">
              Enrollment: {classData.enrollmentCount} students
            </p>
          )}
          {classData.maxCapacity && (
            <p className="text-gray-600">
              Capacity: {classData.maxCapacity} students
            </p>
          )}
        </div>
      </div>

      {/* Role-specific information */}
      {user.role === 'admin' && classData.revenue !== undefined && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <h3 className="font-bold text-blue-800">Admin Information</h3>
          <p className="text-blue-700">Revenue: ${classData.revenue}</p>
          <p className="text-blue-700">Enrollment Status: {classData.enrollmentCount >= classData.maxCapacity ? 'Full' : 'Open'}</p>
        </div>
      )}

      {user.role === 'tutor' && classData.attendanceStats && (
        <div className="mt-4 p-3 bg-green-50 rounded-md">
          <h3 className="font-bold text-green-800">Class Statistics</h3>
          <p className="text-green-700">Average Attendance: {classData.attendanceStats.averageAttendance}%</p>
          <p className="text-green-700">Last Session Attendance: {classData.attendanceStats.lastSessionAttendance}%</p>
        </div>
      )}

      {user.role === 'student' && classData.myPerformance && (
        <div className="mt-4 p-3 bg-purple-50 rounded-md">
          <h3 className="font-bold text-purple-800">My Performance</h3>
          <p className="text-purple-700">Attendance: {classData.myPerformance.attendancePercentage}%</p>
          <p className="text-purple-700">Last Session: {classData.myPerformance.lastSessionStatus}</p>
        </div>
      )}

      {user.role === 'parent' && classData.childPerformance && (
        <div className="mt-4 p-3 bg-amber-50 rounded-md">
          <h3 className="font-bold text-amber-800">Child's Performance</h3>
          <p className="text-amber-700">Attendance: {classData.childPerformance.attendancePercentage}%</p>
          <p className="text-amber-700">Last Session: {classData.childPerformance.lastSessionStatus}</p>
        </div>
      )}

      {/* Description */}
      {classData.description && (
        <div className="mt-4">
          <h3 className="font-semibold">Description</h3>
          <p className="text-gray-700">{classData.description}</p>
        </div>
      )}
      
      {/* Show enrollment button if requested */}
      {showEnrollment && user.role === 'parent' && (
        <div className="mt-4">
          <button 
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
            onClick={() => {/* Add enrollment handler */}}
          >
            Enroll My Child
          </button>
        </div>
      )}
    </div>
  );
};

export default ClassInfo;