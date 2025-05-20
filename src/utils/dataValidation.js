/**
 * Utility functions for validating and debugging data structures
 */

/**
 * Checks if a variable is a valid array that can be mapped over
 * @param {*} data - The data to check
 * @returns {boolean} - True if the data is a non-empty array
 */
export const isValidArray = (data) => {
  return Array.isArray(data) && data !== null;
};

/**
 * Safely gets an array from data, returns empty array if not valid
 * @param {*} data - The data to convert to an array
 * @returns {Array} - A safe array (empty if input was invalid)
 */
export const safeArray = (data) => {
  return isValidArray(data) ? data : [];
};

/**
 * Logs detailed object information for debugging
 * @param {string} label - Description of what's being logged
 * @param {*} obj - The object to inspect
 */
export const debugObject = (label, obj) => {
  console.log('----- DEBUG START: ' + label + ' -----');
  
  if (obj === null) {
    console.log('Object is null');
  } else if (obj === undefined) {
    console.log('Object is undefined');
  } else {
    console.log('Type:', typeof obj);
    
    if (Array.isArray(obj)) {
      console.log('Is Array: true, Length:', obj.length);
      if (obj.length > 0) {
        console.log('First item type:', typeof obj[0]);
        console.log('First item preview:', obj[0]);
      }
    } else if (typeof obj === 'object') {
      console.log('Keys:', Object.keys(obj));
      console.log('Preview:', obj);
    } else {
      console.log('Value:', obj);
    }
  }
  
  console.log('----- DEBUG END: ' + label + ' -----');
};

/**
 * Utility to safely stringify objects for logging
 * @param {*} obj - Object to stringify
 * @returns {string} - String representation
 */
export const safeStringify = (obj) => {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (e) {
    return `[Object could not be stringified: ${e.message}]`;
  }
};

export default {
  isValidArray,
  safeArray,
  debugObject,
  safeStringify
};
