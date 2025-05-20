// Test attendance endpoints
import api from './api';

// Get the current role and token
const userRole = localStorage.getItem('userRole');
const token = localStorage.getItem('token');

// Add additional headers to ensure authorization works
const headers = {
  'Authorization': `Bearer ${token}`,
  'X-User-Role': userRole || 'TUTOR'
};

// Test function for attendance endpoint
async function testAttendanceEndpoint() {
  try {
    console.log('Testing attendance endpoint with token and role...');
    console.log('Current token:', token ? token.substring(0, 20) + '...' : 'No token found');
    console.log('Current role:', userRole);
    
    const response = await api.get('/attendance', { headers });
    
    console.log('Attendance endpoint response status:', response.status);
    console.log('Attendance data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error testing attendance endpoint:', error);
    return null;
  }
}

// Expose function to global scope for testing in browser console
window.testAttendanceEndpoint = testAttendanceEndpoint;

export default testAttendanceEndpoint;
