import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import api from '../services/api';

// Create the context
const PortalContext = createContext();

// Create a provider component
export const PortalProvider = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [availablePortals, setAvailablePortals] = useState([]);
  const [currentPortal, setCurrentPortal] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user's available portals when user changes
  useEffect(() => {
    const fetchUserPortals = async () => {
      if (!user?.id) {
        setAvailablePortals([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(`/users/${user.id}/roles`);
        const portals = response.data || [];
        setAvailablePortals(portals);
        
        // Set current portal based on URL path if possible
        const path = window.location.pathname;
        let detectedPortal = null;
        
        if (path.includes('/admin')) detectedPortal = 'admin';
        else if (path.includes('/tutor')) detectedPortal = 'tutor';
        else if (path.includes('/student')) detectedPortal = 'student';
        else if (path.includes('/parent')) detectedPortal = 'parent';
        
        // Check if detected portal is valid for this user
        if (detectedPortal && portals.some(p => p.role?.toLowerCase() === detectedPortal)) {
          setCurrentPortal(detectedPortal);
        } else if (portals.length > 0) {
          // Default to first available portal
          setCurrentPortal(portals[0].role.toLowerCase());
        }
      } catch (error) {
        console.error('Error fetching user portals:', error);
        // Fallback to user.role if available
        if (user?.role) {
          setAvailablePortals([{ role: user.role }]);
          setCurrentPortal(user.role.toLowerCase());
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserPortals();
  }, [user]);

  // Switch to a different portal
  const switchPortal = (portalName) => {
    if (!portalName) return false;
    
    const normalizedPortalName = portalName.toLowerCase();
    const isAvailable = availablePortals.some(p => 
      p.role?.toLowerCase() === normalizedPortalName
    );
    
    if (!isAvailable) {
      console.error(`Portal ${portalName} is not available for this user`);
      return false;
    }
    
    setCurrentPortal(normalizedPortalName);
    
    // Navigate to the appropriate dashboard
    navigate(`/${normalizedPortalName}/dashboard`);
    return true;
  };

  // Get dashboard path for a portal
  const getPortalDashboardPath = (portalName) => {
    if (!portalName) return '/';
    return `/${portalName.toLowerCase()}/dashboard`;
  };

  // Value to be provided by the context
  const value = {
    availablePortals,
    currentPortal,
    switchPortal,
    getPortalDashboardPath,
    loading,
  };

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
};

// Custom hook for using the portal context
export const usePortal = () => {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
};

export default PortalContext;