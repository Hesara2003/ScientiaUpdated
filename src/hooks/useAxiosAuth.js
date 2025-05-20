import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';

/**
 * Hook to handle auth-related axios interceptors
 * This will automatically handle 401 errors and redirect to login
 * 
 * Use this hook in components that are already wrapped by the Router
 */
export const useAxiosAuth = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    // Add a response interceptor to handle auth errors
    const responseInterceptor = api.interceptors.response.use(
      response => response, 
      error => {
        if (error.response) {
          // Handle 401 Unauthorized errors
          if (error.response.status === 401) {
            logout();
            toast.error('Your session has expired. Please log in again.');
            navigate('/auth/login');
          }
          
          // Handle 403 Forbidden errors
          if (error.response.status === 403) {
            toast.error('You do not have permission to perform this action');
            // Optionally navigate to unauthorized page
            // navigate('/unauthorized');
          }
        }
        
        return Promise.reject(error);
      }
    );

    // Clean up interceptor when component unmounts
    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [logout, navigate]);
  
  return api;
};
