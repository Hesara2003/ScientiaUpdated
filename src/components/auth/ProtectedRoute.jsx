import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  
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

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (location.pathname.startsWith('/student')) {
    const lastRegisteredRole = localStorage.getItem('lastRegisteredRole');
    const storedRole = localStorage.getItem('userRole');
    
    if (lastRegisteredRole === 'student' || storedRole === 'student') {
      console.log('Access granted to student portal based on registration/stored role');
      return children;
    }
  }

  const hasAccess = checkRoleAccess(user, allowedRoles);
  
  if (!hasAccess) {
    console.log('Access denied - insufficient permissions');
    return <Navigate to="/unauthorized" replace />;
  }
  
  console.log('Access granted to', location.pathname);
  return children;
};

function checkRoleAccess(user, allowedRoles) {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }
  
  const pathname = window.location.pathname;
  if (pathname.startsWith('/admin')) {
    console.log('Using admin role for admin path access check');
    if (allowedRoles.includes('admin')) {
      return true;
    }
  }
  
  let userRole = localStorage.getItem('userRole');
  
  if (!userRole && user) {
    userRole = user.role;
  }
  
  if (userRole === 'parent' && localStorage.getItem('lastRegisteredRole') === 'student') {
    userRole = 'student';
  }
  
  console.log('Checking role access - User role:', userRole, 'Required roles:', allowedRoles);
  
  return allowedRoles.some(role => 
    userRole?.toLowerCase() === role.toLowerCase()
  );
}

export default ProtectedRoute;
