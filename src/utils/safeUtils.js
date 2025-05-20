/**
 * Utility for safely accessing deep properties in objects without throwing errors
 * 
 * @param {Object} obj - The object to access
 * @param {String|Array} path - The path to the property, can be a dot notation string or array of keys
 * @param {*} defaultValue - The default value to return if the path doesn't exist
 * @returns {*} - The value at the path, or the default value if not found
 */
export const safeAccess = (obj, path, defaultValue = null) => {
  if (obj === null || obj === undefined) return defaultValue;
  
  const segments = Array.isArray(path) ? path : path.split('.');
  let current = obj;
  
  for (let i = 0; i < segments.length; i++) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[segments[i]];
  }
  
  return current !== undefined ? current : defaultValue;
};

/**
 * Create a safe version of an object that won't throw when accessing properties
 * Useful for working with API responses where you're not sure about the structure
 * 
 * @param {Object} obj - The original object
 * @returns {Proxy} - A proxy that returns null for undefined properties
 */
export const safeProp = (obj) => {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return new Proxy({}, {
      get: () => null
    });
  }
  
  return new Proxy(obj, {
    get: (target, prop) => {
      if (prop in target) {
        const value = target[prop];
        if (value !== null && typeof value === 'object') {
          return safeProp(value);
        }
        return value;
      }
      return null;
    }
  });
};

export default {
  safeAccess,
  safeProp
};
