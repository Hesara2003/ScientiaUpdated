import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      setMessage('');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call with a timeout
    setTimeout(() => {
      // In a real app, this would call an API to send a password reset email
      setError('');
      setMessage('Password reset instructions have been sent to your email. Please check your inbox.');
      setIsLoading(false);
    }, 1000);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08 // Slightly faster stagger
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 }, // Reduced y distance
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 14
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div 
        className="bg-white w-full rounded-xl shadow-lg overflow-hidden border border-gray-100"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="relative">
          {/* Reduced height of top gradient element */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-500 h-16 rounded-t-xl" />
          <motion.div 
            className="relative pt-5 px-8 flex items-center justify-center" // Less top padding
            variants={itemVariants}
          >
            {/* Smaller icon */}
            <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg z-10 mb-2 border-4 border-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
          </motion.div>
        </div>

        <div className="p-6 pt-2"> {/* Reduced overall padding */}
          <motion.div variants={itemVariants} className="text-center mb-4"> {/* Reduced margin */}
            <h1 className="text-xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">Forgot Password</h1>
            <p className="text-gray-600 mt-1 text-sm"> {/* Smaller text and margin */}
              Enter your email and we'll send you a reset link
            </p>
          </motion.div>

          {message && (
            <motion.div 
              className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg flex items-center gap-2 text-sm" /* More compact alert */
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{message}</span>
            </motion.div>
          )}
          
          {error && (
            <motion.div 
              className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-center gap-2 text-sm" /* More compact alert */
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </motion.div>
          )}

          <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-4"> {/* Reduced space between form elements */}
            <div className="mb-4"> {/* Reduced margin */}
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1"> {/* Reduced margin */}
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm" /* Reduced height and smaller text */
                  placeholder="name@example.com"
                  required
                  autoFocus
                />
              </div>
            </div>

            <motion.button
              type="submit"
              className={`w-full py-2 px-4 rounded-lg text-white font-medium shadow-md text-sm ${
                isLoading 
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform transition-all'
              }`} /* Reduced height and smaller text */
              disabled={isLoading}
              whileTap={{ scale: 0.98 }}
              variants={itemVariants}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending Reset Link...
                </span>
              ) : (
                'Send Password Reset Link'
              )}
            </motion.button>
            
            <motion.div className="mt-4 text-center text-sm" variants={itemVariants}> {/* Reduced margin */}
              <button
                type="button"
                onClick={() => navigate('/auth/login')}
                className="inline-flex items-center justify-center text-indigo-600 hover:text-indigo-800 transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Login
              </button>
            </motion.div>
          </motion.form>
        </div>
      </motion.div>
      
      <motion.div 
        className="text-center mt-3 text-xs text-gray-500" /* Smaller margin and text */
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Need help? <a href="#" className="text-indigo-600 hover:text-indigo-800">Contact support</a>
      </motion.div>
    </div>
  );
}
