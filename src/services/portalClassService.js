import api from './api';
import classService from './classService';
import { useAuth } from '../contexts/AuthContext';

/**
 * Unified class service that works across all portals
 * Adapts functionality based on the user's role
 */
const portalClassService = {
  /**
   * Get classes with role-specific filters and access controls
   * @param {Object} options - Filter options
   * @param {string} role - User role (admin, tutor, student, parent)
   * @param {string} userId - Current user ID
   * @returns {Promise<Array>} Filtered class list
   */
  getClasses: async (options = {}, role = null, userId = null) => {
    try {
      let classes = [];
      
      // If no role specified, try to get it from auth context
      if (!role || !userId) {
        const auth = useAuth();
        role = role || auth.user?.role;
        userId = userId || auth.user?.id;
      }
      
      switch (role?.toLowerCase()) {
        case 'admin':
          // Admins can see all classes
          classes = await classService.getAllClasses();
          break;
        
        case 'tutor':
          // Tutors see classes they teach
          if (options.viewAll) {
            // Allow tutors to see all classes if specifically requested
            classes = await classService.getAllClasses();
          } else {
            classes = await classService.getClassesByTutorId(userId);
          }
          break;
        
        case 'student':
          // Students see classes they're enrolled in
          classes = await portalClassService.getStudentEnrolledClasses(userId);
          break;
        
        case 'parent':
          // Parents see their children's classes
          if (options.childId) {
            classes = await portalClassService.getStudentEnrolledClasses(options.childId);
          } else {
            // Get all classes for all children
            const children = await portalClassService.getParentChildren(userId);
            const allClasses = await Promise.all(
              children.map(child => portalClassService.getStudentEnrolledClasses(child.id))
            );
            // Flatten array of arrays and remove duplicates
            classes = [...new Set(allClasses.flat())];
          }
          break;
          
        default:
          // Default - just get all classes with no role-specific filtering
          classes = await classService.getAllClasses();
      }
      
      // Apply common filters that work across all roles
      if (options.subjectId) {
        classes = classes.filter(c => c.subjectId?.toString() === options.subjectId.toString());
      }
      
      if (options.upcoming) {
        const now = new Date();
        classes = classes.filter(c => new Date(c.startTime) > now)
          .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      }
      
      if (options.date) {
        const targetDate = new Date(options.date);
        targetDate.setHours(0, 0, 0, 0);
        
        classes = classes.filter(c => {
          if (!c.startTime) return false;
          const classDate = new Date(c.startTime);
          classDate.setHours(0, 0, 0, 0);
          return classDate.getTime() === targetDate.getTime();
        });
      }
      
      return classes;
    } catch (error) {
      console.error('Error in portal class service:', error);
      return [];
    }
  },
  
  /**
   * Get classes a student is enrolled in
   * @param {string} studentId - Student ID
   * @returns {Promise<Array>} List of enrolled classes
   */
  getStudentEnrolledClasses: async (studentId) => {
    try {
      // This endpoint would need to be implemented in your backend
      const response = await api.get(`/students/${studentId}/classes`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student classes:', error);
      return [];
    }
  },
  
  /**
   * Get a parent's children
   * @param {string} parentId - Parent user ID
   * @returns {Promise<Array>} List of children
   */
  getParentChildren: async (parentId) => {
    try {
      const response = await api.get(`/parents/${parentId}/children`);
      return response.data;
    } catch (error) {
      console.error('Error fetching parent children:', error);
      return [];
    }
  },
  
  /**
   * Enroll a student in a class with role-specific checks
   * @param {string} classId - Class ID
   * @param {string} studentId - Student ID
   * @param {string} role - User role
   * @param {string} userId - Current user ID
   * @returns {Promise<Object>} Enrollment result
   */
  enrollStudent: async (classId, studentId, role, userId) => {
    try {
      // Validate enrollment permission based on role
      let canEnroll = false;
      
      switch (role?.toLowerCase()) {
        case 'admin':
          // Admins can enroll any student
          canEnroll = true;
          break;
        
        case 'tutor':
          // Tutors can only enroll students in their own classes
          const tutorClasses = await classService.getClassesByTutorId(userId);
          canEnroll = tutorClasses.some(c => c.id?.toString() === classId.toString());
          break;
        
        case 'parent':
          // Parents can only enroll their children
          const children = await portalClassService.getParentChildren(userId);
          canEnroll = children.some(child => child.id?.toString() === studentId.toString());
          break;
        
        default:
          canEnroll = false;
      }
      
      if (!canEnroll) {
        throw new Error('You do not have permission to enroll this student');
      }
      
      // If permission check passes, perform the enrollment
      return await classService.enrollStudentInClass(classId, studentId);
    } catch (error) {
      console.error('Error in portal enrollment:', error);
      throw error;
    }
  },
  
  /**
   * Get detailed class information with role-specific data
   * @param {string} classId - Class ID
   * @param {string} role - User role
   * @param {string} userId - Current user ID
   * @returns {Promise<Object>} Class details
   */
  getClassDetails: async (classId, role, userId) => {
    try {
      // First get base class data
      const classData = await classService.getClassById(classId);
      
      // Add role-specific data
      switch (role?.toLowerCase()) {
        case 'admin':
          // Get full details including financial data
          const adminDetails = await api.get(`/admin/classes/${classId}/details`);
          return {
            ...classData,
            ...adminDetails.data,
            enrollmentCount: (await classService.getEnrolledStudents(classId)).length
          };
        
        case 'tutor':
          // For tutors, include student performance data if they teach this class
          const tutorClasses = await classService.getClassesByTutorId(userId);
          const isTutorClass = tutorClasses.some(c => c.id?.toString() === classId.toString());
          
          if (isTutorClass) {
            const enrolledStudents = await classService.getEnrolledStudents(classId);
            // Get attendance stats for this class
            const attendanceStats = await api.get(`/attendance/class/${classId}/stats`);
            
            return {
              ...classData,
              students: enrolledStudents,
              attendanceStats: attendanceStats.data
            };
          }
          return classData;
        
        case 'student':
          // For students, include their own performance in the class
          const studentPerformance = await api.get(`/students/${userId}/classes/${classId}/performance`);
          return {
            ...classData,
            myPerformance: studentPerformance.data
          };
        
        case 'parent':
          // For parents, include their child's performance if the child is in this class
          if (classData.childId) {
            const childPerformance = await api.get(`/students/${classData.childId}/classes/${classId}/performance`);
            return {
              ...classData,
              childPerformance: childPerformance.data
            };
          }
          return classData;
          
        default:
          return classData;
      }
    } catch (error) {
      console.error(`Error getting class details for ${classId}:`, error);
      return null;
    }
  }
};

export default portalClassService;