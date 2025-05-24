import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { login as loginService, logout as logoutService, initAuth, getCurrentUser } from '../services/authService';
import { getUserRole, formatAuthError } from '../utils/authUtils';

// Create auth context
const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Function to ensure admin role is set correctly when in admin pages (memoized)
  const ensureAdminRole = useCallback((pathname) => {
    if (pathname && pathname.startsWith('/admin')) {
      console.log('Setting admin role for admin section access');
      localStorage.setItem('userRole', 'admin');
      if (user && user.role !== 'admin') {
        setUser(prev => ({...prev, role: 'admin'}));
      }
    }
  }, [user]);

  // Initialize auth state on component mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        console.log('Initializing authentication from stored token');
        const initialUser = initAuth();
        if (initialUser) {
          console.log('User authenticated from stored token:', initialUser);
          
          // Ensure user object has all necessary properties
          const role = initialUser.role || localStorage.getItem('userRole');
          const userId = initialUser.id || initialUser.sub || localStorage.getItem('userId');
          
          if (role) {
            initialUser.role = role;
            localStorage.setItem('userRole', role);
          }
          
          if (userId) {
            initialUser.id = userId;
            localStorage.setItem('userId', userId);
          }
          
          setUser(initialUser);
        } else {
          console.log('No valid authentication token found');
          
          // Check if we have enough information stored to reconstruct a minimal user object
          const storedRole = localStorage.getItem('userRole');
          const storedUserId = localStorage.getItem('userId');
          const storedToken = localStorage.getItem('token');
          
          if (storedRole && storedUserId && storedToken) {
            console.log('Creating minimal user object from stored data');
            setUser({
              role: storedRole,
              id: storedUserId
            });
          }
        }
      } catch (err) {
        console.error('Error during auth initialization:', err);
        // Handle initialization error, but don't block the app
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      console.log('AuthContext: Calling login service with username:', username);
      
      // Check if there was a recent student registration
      const lastRegisteredRole = localStorage.getItem('lastRegisteredRole');
      console.log('AuthContext: Last registered role before login:', lastRegisteredRole);
        const userData = await loginService(username, password);
      
      // Set role if available
      if (userData) {
        // Store the role from server response
        if (userData.role) {
          console.log('AuthContext: User authenticated with role from server:', userData.role);
          localStorage.setItem('userRole', userData.role);
        }
        
        // Ensure user ID is saved in localStorage
        if (userData.id || userData.sub) {
          localStorage.setItem('userId', userData.id || userData.sub);
        }
      }
      
      setUser(userData);
      return userData;
    } catch (err) {
      console.error('AuthContext: Login error:', err);
      const errorMessage = formatAuthError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    logoutService();
    setUser(null);
  };

  // Refresh user data
  const refreshUser = () => {
    const userData = getCurrentUser();
    setUser(userData);
  };
  
  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    refreshUser,
    ensureAdminRole,
    isAuthenticated: !!user || !!localStorage.getItem('token'),
    hasRole: (role) => {
      if (!user || !user.role) {
        // If no user object or role in memory, check localStorage as fallback
        const storedRole = localStorage.getItem('userRole');
        if (!storedRole) return false;
        
        // Handle special case for student roles
        if (localStorage.getItem('lastRegisteredRole') === 'student') {
          return role === 'student';
        }
        
        // Compare with stored role
        if (Array.isArray(role)) {
          return role.some(r => storedRole.toLowerCase() === r.toLowerCase());
        }
        return storedRole.toLowerCase() === role.toLowerCase();
      }
      
      // Handle special case for student roles
      if (localStorage.getItem('lastRegisteredRole') === 'student') {
        return role === 'student';
      }
      
      // Case-insensitive role comparison
      if (Array.isArray(role)) {
        return role.some(r => user.role.toLowerCase() === r.toLowerCase());
      }
      
      return user.role.toLowerCase() === role.toLowerCase();
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
