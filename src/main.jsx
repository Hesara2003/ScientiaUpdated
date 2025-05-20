import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { setupDebugTools } from './utils/debug'

// Initialize debugging tools for development
if (import.meta.env.DEV) {
  setupDebugTools();
  console.log('Debug tools initialized. Available tools in browser console:');
  console.log('- window.checkCurrentToken() - Check current token status');
  console.log('- window.fixToken() - Fix malformed tokens');
  console.log('- window.testAuthRequest() - Test regular API access');
  console.log('- window.testAdminAccess() - Test admin API access');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
