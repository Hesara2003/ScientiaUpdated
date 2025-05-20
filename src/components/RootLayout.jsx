import React, { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAxiosAuth } from '../hooks/useAxiosAuth';

/**
 * Root layout component that:
 * 1. Sets up global API interceptors for auth
 * 2. Handles automatic redirect based on user role
 * 3. Manages role-based access to admin section
 */
const RootLayout = ({ children }) => {
  const { user, isAuthenticated, ensureAdminRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Set up auth interceptors
  useAxiosAuth();
  
  // Make ensureAdminRole callback memoized to avoid unnecessary re-renders
  const handlePathChange = useCallback((pathname) => {
    ensureAdminRole(pathname);
  }, [ensureAdminRole]);
  
  // Call ensureAdminRole whenever location changes
  useEffect(() => {
    handlePathChange(location.pathname);
  }, [location.pathname, handlePathChange]);
  
  // Effect for automatic redirect based on role
  useEffect(() => {
    // Skip redirect if we're already on a protected or auth route
    if (location.pathname.startsWith('/admin') || 
        location.pathname.startsWith('/student') ||
        location.pathname.startsWith('/parent') ||
        location.pathname.startsWith('/tutor') ||
        location.pathname.startsWith('/auth')) {
      return;
    }
    
    // Redirect based on role if authenticated and on an ambiguous route (like /)
    if (isAuthenticated && user?.role && location.pathname === '/') {
      switch(user.role.toLowerCase()) {
        case 'admin':
          navigate('/admin');
          break;
        case 'tutor':
          navigate('/tutor');
          break;
        case 'student':
          navigate('/student');
          break;
        case 'parent':
          navigate('/parent');
          break;
        default:
          break;
      }
    }
  }, [user, isAuthenticated, navigate, location.pathname]);
  
  return <>{children}</>;
};

export default RootLayout;
