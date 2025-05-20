import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

export default function Login() {  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading: isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getRedirectPathByRole = (userRole) => {
    console.log('Getting redirect path for role:', userRole);
    switch (userRole?.toLowerCase()) {
      case 'admin': return '/admin';
      case 'parent': return '/parent';
      case 'student': return '/student';
      case 'tutor': return '/tutor';
      default:
        console.log('Unknown role, defaulting to /');
        return '/';
    }
  };
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password');
      toast.error('Missing credentials');
      return;
    }try {
      setError('');      console.log('Attempting login with:', { username, password: '******' });

      const userData = await login(username, password);
      console.log('Login successful, user data:', userData);

      // Get role from response
      const receivedRole = userData.role?.toLowerCase();
      if (!receivedRole) {
        setError('No role received from server');
        toast.error('Invalid role');
        return;
      }

      console.log('Using role for navigation:', receivedRole);
      localStorage.setItem('userRole', receivedRole);

      toast.success('Login successful');
      const redirectPath = getRedirectPathByRole(receivedRole);
      console.log('Redirecting to:', redirectPath);
      navigate(redirectPath);
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.status === 403 ? 'Access denied. Check credentials or permissions.'
        : err.status === 401 ? 'Invalid username or password.'
        : err.status >= 500 ? 'Server error. Try again later.'
        : err.message || 'Login failed. Check connection.';
      setError(errorMessage);
      toast.error('Login failed');
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 80, damping: 15 }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        className="bg-white w-full rounded-xl shadow-lg overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="p-6">
          <motion.div variants={itemVariants} className="text-center mb-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Welcome Back</h1>
            <p className="text-gray-600 mt-1 text-sm">Sign in to access your account</p>
          </motion.div>

          {error && (
            <motion.div
              className="mb-3 p-2 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg text-sm flex items-center gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </motion.div>
          )}

          <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="username" className="block text-xs font-medium text-gray-700 mb-1">Username <span className="text-xs text-red-500">(Not email)</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="Enter your username"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="Enter your password"
                  required
                />              </div>
            </div>

            <div className="pt-2">
              <motion.button
                type="submit"
                className={`w-full py-2 px-4 rounded-lg text-white font-medium text-sm ${isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'}`}
                disabled={isLoading}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </motion.button>

              {import.meta.env.DEV && (
                <div className="mt-2 flex justify-between flex-wrap gap-2">
                  <button type="button" onClick={() => window.checkBackendConnection().then(result => toast.info(`Backend: ${result.success ? 'Connected' : 'Failed'}`))} className="text-xs text-indigo-600 hover:underline">Test Backend</button>
                  <button type="button" onClick={() => { const token = prompt("Enter JWT token:"); if (token) window.debugJwtToken(token).then(decoded => toast.info(`Role: ${decoded?.role || 'None'}`)); }} className="text-xs text-indigo-600 hover:underline">Debug Token</button>
                  <button type="button" onClick={() => { const status = window.checkCurrentToken(); toast.info(status.message); }} className="text-xs text-indigo-600 hover:underline">Check Token</button>
                </div>
              )}

              <div className="mt-3 flex justify-between text-xs">
                <motion.button type="button" onClick={() => navigate('/auth/register')} className="text-indigo-600 hover:text-indigo-800" variants={itemVariants}>Register</motion.button>
                <motion.button type="button" onClick={() => navigate('/auth/forgot-password')} className="text-indigo-600 hover:text-indigo-800" variants={itemVariants}>Forgot password?</motion.button>
              </div>

              <div className="mt-2 text-center">
                <p className="text-xs text-gray-500"><span className="italic">Use username, not email</span></p>
                <p className="text-xs text-gray-600 mt-1">No account? <span className="text-indigo-600 cursor-pointer" onClick={() => navigate('/auth/register')}>Register now</span></p>
              </div>
            </div>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}