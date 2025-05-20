import React from 'react';
import { usePortal } from '../../contexts/PortalContext';

/**
 * A reusable component for navigating between portals
 */
const PortalNavigation = ({ minimized = false }) => {
  const { availablePortals, currentPortal, switchPortal, loading } = usePortal();
  
  if (loading) {
    return (
      <div className="animate-pulse flex items-center space-x-2">
        <div className="h-6 w-20 bg-gray-200 rounded"></div>
      </div>
    );
  }
  
  if (availablePortals.length <= 1) {
    return null; // Don't show if user only has one portal
  }
  
  // Get portal color and icon
  const getPortalStyles = (portalName) => {
    switch (portalName.toLowerCase()) {
      case 'admin':
        return { 
          color: 'bg-indigo-500 hover:bg-indigo-600', 
          icon: '🛠️',
          text: 'Admin Portal'
        };
      case 'tutor':
        return { 
          color: 'bg-green-500 hover:bg-green-600', 
          icon: '👨‍🏫',
          text: 'Tutor Portal'
        };
      case 'student':
        return { 
          color: 'bg-blue-500 hover:bg-blue-600', 
          icon: '🧑‍🎓',
          text: 'Student Portal'
        };
      case 'parent':
        return { 
          color: 'bg-amber-500 hover:bg-amber-600', 
          icon: '👪',
          text: 'Parent Portal'
        };
      default:
        return { 
          color: 'bg-gray-500 hover:bg-gray-600', 
          icon: '🔍',
          text: portalName
        };
    }
  };
  
  return minimized ? (
    <div className="relative group">
      <button
        className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
        aria-label="Switch portals"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </button>
      
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden group-hover:block z-50">
        <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
          {availablePortals.map((portal, index) => {
            const portalName = portal.role || portal.name || portal;
            const { color, icon, text } = getPortalStyles(portalName);
            const isActive = currentPortal === portalName.toLowerCase();
            
            return (
              <button
                key={index}
                className={`
                  w-full text-left px-4 py-2 text-sm flex items-center space-x-2
                  ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}
                `}
                onClick={() => switchPortal(portalName)}
              >
                <span className={`w-6 h-6 flex items-center justify-center rounded-full ${color} text-white`}>
                  {icon}
                </span>
                <span>{text}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  ) : (
    <div className="flex space-x-2">
      {availablePortals.map((portal, index) => {
        const portalName = portal.role || portal.name || portal;
        const { color, icon, text } = getPortalStyles(portalName);
        const isActive = currentPortal === portalName.toLowerCase();
        
        return (
          <button
            key={index}
            className={`
              px-3 py-2 rounded-md flex items-center space-x-2
              ${isActive ? `${color} text-white` : 'bg-gray-200 hover:bg-gray-300'}
            `}
            onClick={() => switchPortal(portalName)}
            disabled={isActive}
          >
            <span>{icon}</span>
            <span>{text}</span>
          </button>
        );
      })}
    </div>
  );
};

export default PortalNavigation;