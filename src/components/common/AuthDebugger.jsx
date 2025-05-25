import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';


const AuthDebugger = () => {
  if (!import.meta.env.DEV) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testEndpoint, setTestEndpoint] = useState('/students');
  const [isLoading, setIsLoading] = useState(false);

  const checkToken = () => {
    try {
      if (window.checkCurrentToken) {
        const result = window.checkCurrentToken();
        toast.success('Token info logged to console');
        
        if (!result) {
          setTestResult('No token found or token is invalid');
        } else {
          setTestResult(`Token valid: exp: ${new Date(result.exp * 1000).toLocaleString()}`);
        }
      } else {
        toast.error('Debug tools not available');
      }
    } catch (error) {
      console.error('Error checking token:', error);
      setTestResult(`Error: ${error.message}`);
    }
  };

  const testAuthRequest = async () => {
    setIsLoading(true);
    setTestResult('Testing...');
    try {
      if (window.testAuthRequest) {
        const result = await window.testAuthRequest(testEndpoint);
        console.log('Test request result:', result);
        setTestResult(JSON.stringify(result, null, 2).substring(0, 300) + '...');
        toast.success('Test complete - see console for details');
      } else {
        await manualTestRequest();
      }
    } catch (error) {
      console.error('Test request error:', error);
      setTestResult(`Error: ${error.message}`);
      toast.error('Test failed - see console for details');
    } finally {
      setIsLoading(false);
    }
  };

  const manualTestRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Current token in localStorage:', token ? 'exists' : 'missing');
      console.log('Current auth header:', api.defaults.headers.common['Authorization']);
      
      const response = await api.get(testEndpoint);
      console.log('Response:', response);
      setTestResult(JSON.stringify(response.data, null, 2).substring(0, 300) + '...');
      return response.data;
    } catch (error) {
      console.error('Auth request test failed:', error);
      console.log('Response status:', error.response?.status);
      console.log('Response data:', error.response?.data);
      setTestResult(`Error ${error.response?.status || ''}: ${error.message} - ${JSON.stringify(error.response?.data || {})}`);
      throw error;
    }
  };

  return (
    <div 
      className="fixed bottom-4 right-4 z-50"
      style={{ fontSize: '12px' }} 
    >
      {isOpen ? (
        <div className="bg-white shadow-lg rounded-lg p-4 w-96 border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-sm">Auth Debugger</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <button
                onClick={checkToken}
                className="bg-blue-500 text-white px-3 py-1 rounded-md text-xs mr-2"
              >
                Check Token
              </button>
              
              <div className="flex items-center mt-2">
                <input 
                  type="text"
                  value={testEndpoint}
                  onChange={(e) => setTestEndpoint(e.target.value)}
                  placeholder="/api/endpoint"
                  className="border border-gray-300 rounded-md px-2 py-1 text-xs flex-grow"
                />
                <button
                  onClick={testAuthRequest}
                  disabled={isLoading}
                  className="bg-green-500 text-white px-3 py-1 rounded-md text-xs ml-2"
                >
                  Test Request
                </button>
              </div>
            </div>
            
            {testResult && (
              <div className="mt-2">
                <h4 className="font-semibold text-xs mb-1">Result:</h4>
                <pre className="bg-gray-100 p-2 rounded-md text-xs overflow-auto max-h-40">
                  {testResult}
                </pre>
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-500 text-white px-3 py-1 rounded-full shadow-md hover:bg-blue-600 text-xs"
        >
          Debug Auth
        </button>
      )}
    </div>
  );
};

export default AuthDebugger;
