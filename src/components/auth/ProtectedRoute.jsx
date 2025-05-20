import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  
  // Special handling for admin section - ensure admin role is set
  useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      localStorage.setItem('userRole', 'admin');
      console.log('ProtectedRoute: Setting admin role for admin path access');
    }
  }, [location.pathname]);
  
  console.log('Protected Route Check:', {
    path: location.pathname,
    isAuthenticated, 
    userRole: user?.role,
    allowedRoles,
    user
  });

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Special handling for student pathway
  if (location.pathname.startsWith('/student')) {
    // Check if user is registered as a student
    const lastRegisteredRole = localStorage.getItem('lastRegisteredRole');
    const storedRole = localStorage.getItem('userRole');
    
    if (lastRegisteredRole === 'student' || storedRole === 'student') {
      console.log('Access granted to student portal based on registration/stored role');
      return children;
    }
  }

  // Check if user has required role
  const hasAccess = checkRoleAccess(user, allowedRoles);
  
  if (!hasAccess) {
    console.log('Access denied - insufficient permissions');
    return <Navigate to="/unauthorized" replace />;
  }
  
  console.log('Access granted to', location.pathname);
  return children;
};

// Helper function to check role access
function checkRoleAccess(user, allowedRoles) {
  // If no specific roles are required, allow access
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }
  
  // Special case for admin paths - always use admin role
  const pathname = window.location.pathname;
  if (pathname.startsWith('/admin')) {
    console.log('Using admin role for admin path access check');
    if (allowedRoles.includes('admin')) {
      return true;
    }
  }
  
  // Get user role, prioritizing localStorage
  let userRole = localStorage.getItem('userRole');
  
  // Fall back to user object if needed
  if (!userRole && user) {
    userRole = user.role;
  }
  
  // Special case - override parent with student if registered as student
  if (userRole === 'parent' && localStorage.getItem('lastRegisteredRole') === 'student') {
    userRole = 'student';
  }
  
  console.log('Checking role access - User role:', userRole, 'Required roles:', allowedRoles);
  
  // Check if user role is in allowed roles
  return allowedRoles.some(role => 
    userRole?.toLowerCase() === role.toLowerCase()
  );
}

export default ProtectedRoute;
