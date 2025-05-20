/**
 * Utility for debugging API responses and data structures
 */

/**
 * Log detailed information about any JavaScript object
 * @param {string} label - Label for the debug info
 * @param {any} data - The data to analyze
 * @param {Object} options - Additional options
 * @param {boolean} options.showMockData - Whether to show suggested mock data if empty response
 */
export const debugData = (label, data, options = {}) => {
  console.group(`📊 Debug: ${label}`);
  
  try {
    console.log('Value:', data);
    console.log('Type:', typeof data);
    console.log('Is null:', data === null);
    console.log('Is undefined:', data === undefined);
    console.log('Is array:', Array.isArray(data));
    
    // Special handling for empty responses
    if (data === '' || data === null || data === undefined) {
      console.warn('⚠️ EMPTY RESPONSE DETECTED');
      console.log('This may indicate a permissions issue or server error');
      
      if (options.showMockData) {
        console.log('💡 Suggestion: Use mock data as fallback');
      }
    }
    
    if (data !== null && typeof data === 'object') {
      console.log('Keys:', Object.keys(data));
      console.log('Has toString:', typeof data.toString === 'function');
      console.log('Constructor:', data.constructor?.name);
      
      if (Array.isArray(data)) {
        console.log('Array length:', data.length);
        console.log('First few items:', data.slice(0, 3));
      }
    }
      if (typeof data === 'string') {
      console.log('String length:', data.length);
      
      // Empty string detection
      if (data === '') {
        console.warn('⚠️ Empty string detected - this could indicate an API error');
        console.log('Common causes of empty responses:');
        console.log('1. Authorization issues (403 errors)');
        console.log('2. Server errors');
        console.log('3. Rate limiting');
        console.log('4. Incorrect endpoint');
      } else if (data.startsWith('{') || data.startsWith('[')) {
        console.log('Might be JSON string. Attempting to parse:');
        try {
          const parsed = JSON.parse(data);
          console.log('Parsed result:', parsed);
        } catch (e) {
          console.log('Not valid JSON');
        }
      }
    }
  } catch (error) {
    console.error('Error analyzing data:', error);
  }
  
  console.groupEnd();
};

/**
 * Debug HTTP error responses with detailed information
 * @param {Error} error - The error object from axios or fetch
 * @param {string} apiName - Name of the API for labeling
 */
export const debugHttpError = (error, apiName = 'API') => {
  console.group(`🔥 HTTP Error in ${apiName}:`);
  
  try {
    console.log('Error message:', error.message);
    
    // Handle Axios-style errors
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Status text:', error.response.statusText);
      
      // Specific error code handling
      switch (error.response.status) {
        case 401:
          console.warn('AUTHENTICATION ERROR: User is not authenticated');
          console.log('Suggestion: Check if token is valid or refresh token');
          break;
        case 403:
          console.warn('AUTHORIZATION ERROR: User lacks permission');
          console.log('Suggestion: Check user role and permissions');
          console.log('Verify that the token includes necessary scopes/claims');
          break;
        case 404:
          console.warn('NOT FOUND: Resource or endpoint does not exist');
          console.log('Suggestion: Verify the API URL and parameter values');
          break;
        case 429:
          console.warn('RATE LIMIT: Too many requests');
          console.log('Suggestion: Implement rate limiting handling or retry logic');
          break;
        case 500:
          console.warn('SERVER ERROR: Backend issue detected');
          console.log('Suggestion: Check server logs, this is not a client-side issue');
          break;
      }
      
      // Check response headers for useful information
      if (error.response.headers) {
        const importantHeaders = ['content-type', 'www-authenticate', 'retry-after', 'x-ratelimit-reset'];
        console.log('Important headers:');
        importantHeaders.forEach(header => {
          if (error.response.headers[header]) {
            console.log(`- ${header}: ${error.response.headers[header]}`);
          }
        });
      }
      
      // Check response data
      if (error.response.data) {
        console.log('Response data:');
        console.log(error.response.data);
      }
    } else if (error.request) {
      // Request was made but no response received (network error)
      console.warn('NETWORK ERROR: Request sent but no response received');
      console.log('Suggestion: Check network connectivity and server status');
    } else {
      // Error during request setup
      console.warn('REQUEST SETUP ERROR: Error occurred while setting up the request');
      console.log('Suggestion: Check request configuration and parameters');
    }
    
    // Log the error stack for debugging
    console.log('Error stack:', error.stack);
  } catch (debugError) {
    console.error('Error analyzing HTTP error:', debugError);
  }
  
  console.groupEnd();
};

/**
 * Wrap API response handling with debug info
 * @param {Promise} apiPromise - Promise returned by an API call
 * @param {string} apiName - Name of the API for labeling
 * @returns {Promise} The original API response
 */
export const withDebug = async (apiPromise, apiName = 'API') => {
  try {
    console.log(`⏳ ${apiName} call initiated`);
    const startTime = performance.now();
    
    const response = await apiPromise;
    
    const endTime = performance.now();
    console.log(`✅ ${apiName} call completed in ${(endTime - startTime).toFixed(2)}ms`);
    
    // Check for empty response data
    if (response && (response.data === undefined || response.data === '' || 
        (Array.isArray(response.data) && response.data.length === 0))) {
      console.warn(`⚠️ ${apiName} returned empty data`);
    }
    
    debugData(`${apiName} Response`, response);
    
    if (response && response.data) {
      debugData(`${apiName} Response Data`, response.data, { showMockData: true });
    }
    
    return response;
  } catch (error) {
    console.error(`❌ ${apiName} call failed`);
    
    // Use our specialized HTTP error debugging
    debugHttpError(error, apiName);
    
    // Re-throw to maintain the error flow
    throw error;
  }
};

/**
 * Generate mock data based on the expected type
 * @param {string} type - The type of data to mock ('students', 'parents', 'fees', etc.)
 * @param {number} count - How many items to generate
 * @returns {Array} Array of mock data objects
 */
export const generateMockData = (type, count = 5) => {
  const mockData = {
    students: () => Array.from({ length: count }, (_, i) => ({
      id: 1000 + i,
      studentId: `ST-${1000 + i}`,
      firstName: ['John', 'Jane', 'Michael', 'Sarah', 'David'][i % 5],
      lastName: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][i % 5],
      status: i % 4 === 0 ? 'inactive' : 'active',
      enrollmentDate: new Date(2025, i % 12, (i % 28) + 1).toISOString(),
      email: `student${i}@example.com`,
      role: 'student'
    })),
    
    parents: () => Array.from({ length: count }, (_, i) => ({
      id: 2000 + i,
      parentId: `P-${2000 + i}`,
      firstName: ['Robert', 'Mary', 'James', 'Patricia', 'Richard'][i % 5],
      lastName: ['Taylor', 'Anderson', 'Wilson', 'Moore', 'Harris'][i % 5],
      status: i % 5 === 0 ? 'inactive' : 'active',
      createdAt: new Date(2025, i % 12, (i % 28) + 1).toISOString(),
      email: `parent${i}@example.com`,
      role: 'parent'
    })),
    
    fees: () => Array.from({ length: count }, (_, i) => ({
      id: 3000 + i,
      feeId: `F-${3000 + i}`,
      studentId: 1000 + (i % 5),
      amount: 1000 + (i * 500),
      dueDate: new Date(2025, (i % 12), 15).toISOString(),
      status: i % 2 === 0 ? 'paid' : 'pending',
      description: `Tuition Fee - ${['Spring', 'Summer', 'Fall', 'Winter'][i % 4]} semester`
    }))
  };
  
  if (type in mockData) {
    return mockData[type]();
  }
  
  // Default generic mock data
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Mock Item ${i + 1}`,
    createdAt: new Date().toISOString()
  }));
};

/**
 * Debug utility to check parent-student relationship data for issues
 * @param {Object} relationData - The relationship data to test
 * @param {string} [source] - Optional source identifier (e.g., "addParentStudent")
 * @returns {boolean} - True if valid, false if issues detected
 */
export const debugRelationship = (relationData, source = 'unknown') => {
  console.group(`🔍 Validating parent-student relationship from ${source}`);
  
  try {
    if (!relationData) {
      console.error('❌ Relationship data is null or undefined');
      return false;
    }
    
    console.log('Relationship data:', relationData);
    
    // Check parent ID
    const hasParentId = 'parentId' in relationData;
    const validParentId = hasParentId && 
                         relationData.parentId !== null && 
                         relationData.parentId !== undefined &&
                         relationData.parentId !== 'null' &&
                         relationData.parentId !== 'undefined';
    
    console.log('Parent ID exists:', hasParentId);
    console.log('Parent ID value:', relationData.parentId);
    console.log('Parent ID valid:', validParentId);
    
    // Check student ID
    const hasStudentId = 'studentId' in relationData;
    const validStudentId = hasStudentId && 
                          relationData.studentId !== null && 
                          relationData.studentId !== undefined &&
                          relationData.studentId !== 'null' &&
                          relationData.studentId !== 'undefined';
    
    console.log('Student ID exists:', hasStudentId);
    console.log('Student ID value:', relationData.studentId);
    console.log('Student ID valid:', validStudentId);
    
    // Overall validity
    const isValid = validParentId && validStudentId;
    
    if (!isValid) {
      console.error('❌ Invalid parent-student relationship detected');
      
      if (!hasParentId || !validParentId) {
        console.error('  - Parent ID issue detected');
      }
      
      if (!hasStudentId || !validStudentId) {
        console.error('  - Student ID issue detected');
      }
    } else {
      console.log('✅ Relationship data is valid');
    }
    
    return isValid;
  } catch (error) {
    console.error('Error validating relationship:', error);
    return false;
  } finally {
    console.groupEnd();
  }
};

// Export as default for easier importing
export default { 
  debugData, 
  withDebug, 
  debugHttpError,
  generateMockData,
  debugRelationship
};
