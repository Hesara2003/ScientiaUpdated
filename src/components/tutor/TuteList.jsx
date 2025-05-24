import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getAllTutes, deleteTute } from '../../services/tuteService';
import AuthContext from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const TutorTuteList = () => {
  const [tutes, setTutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(AuthContext);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Add debug logging for the current user
  useEffect(() => {
    console.log('Current user in TutorTuteList:', currentUser);
  }, [currentUser]);

  useEffect(() => {
    loadTutorTutes();
  }, []);

  const loadTutorTutes = async () => {
    try {
      setLoading(true);
      
      // Fetch all tutorials
      const allTutes = await getAllTutes();
      console.log('Loaded tutorials:', allTutes);
      setTutes(allTutes || []);
    } catch (error) {
      console.error('Error loading tutorials:', error);
      toast.error('Failed to load your tutorials');
      setTutes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (tuteId) => {
    setDeleteConfirm(tuteId);
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };
  
  const handleConfirmDelete = async (tuteId) => {
    try {
      console.log(`Confirming deletion of tutorial with ID: ${tuteId}`);
      
      // Validate tutorial ID before proceeding
      if (!tuteId) {
        toast.error('Invalid tutorial ID. Cannot delete.', {
          position: "top-center",
          icon: "❌",
          className: "font-medium"
        });
        setDeleteConfirm(null);
        return;
      }
      
      // Display an appealing deletion in progress message
      toast.info(
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Deleting tutorial...</span>
        </div>, 
        { 
          autoClose: false, 
          toastId: 'delete-progress',
          className: "bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500"
        }
      );
      
      const result = await deleteTute(tuteId);
      console.log('Delete result:', result);
      
      // Close the "in progress" toast
      toast.dismiss('delete-progress');
      
      if (result) {
        toast.success('Tutorial deleted successfully');
        
        // Wait a short time to ensure backend processing is complete
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Refresh the list after deletion
        await loadTutorTutes();
      } else {
        toast.error('Could not delete tutorial. Please try again.');
      }
    } catch (error) {
      // Close the "in progress" toast
      toast.dismiss('delete-progress');
      
      console.error('Error deleting tutorial:', error);
      
      // Check for different error types
      if (error.response && error.response.status === 403) {
        toast.error('You do not have permission to delete this tutorial');
      } else if (error.response && error.response.status === 404) {
        toast.error('Tutorial not found. It may have been already deleted.');
        // Refresh list anyway since the tutorial doesn't exist
        await loadTutorTutes();
      } else {
        toast.error(`Failed to delete tutorial: ${error.message}`);
      }
    } finally {
      setDeleteConfirm(null);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-lg text-gray-600">Loading your tutorials...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Enhanced header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 mb-10 flex flex-col md:flex-row justify-between items-center">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            My Tutorials
            <span className="block text-sm font-medium text-indigo-100 mt-1">Manage your educational content</span>
          </h1>
        </div>
        <Link
          to="/tutor/tutorials/create"
          className="px-5 py-3 bg-white text-indigo-700 rounded-lg hover:bg-indigo-50 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1 flex items-center font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Tutorial
        </Link>
      </div>

      {tutes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <img 
            src="https://cdn-icons-png.flaticon.com/512/3588/3588284.png" 
            alt="No tutorials" 
            className="w-32 h-32 mx-auto mb-6 opacity-70"
          />
          <p className="text-xl text-gray-600 mb-6">You haven't created any tutorials yet</p>
          <Link
            to="/tutor/tutorials/create"
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Your First Tutorial
          </Link>
        </div>
      ) : (
        <div className="bg-white overflow-hidden shadow-md rounded-xl border border-gray-100">
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">Your tutorial library</h2>
            <p className="text-sm text-gray-500">Manage, edit or delete your educational content</p>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th scope="col" className="py-4 pl-6 pr-3 text-left text-sm font-semibold text-gray-900 border-b-2 border-gray-200">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Title
                  </div>
                </th>
                <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-gray-900 border-b-2 border-gray-200">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Price
                  </div>
                </th>
                <th scope="col" className="relative py-4 pl-3 pr-6 border-b-2 border-gray-200">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {tutes.map(tute => (
                <tr key={tute.id} className="hover:bg-indigo-50 transition-colors duration-150">
                  <td className="whitespace-nowrap py-5 pl-6 pr-3 text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold mr-4 shadow-md">
                        {tute.title.charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate max-w-xs font-medium group">
                        {tute.title}
                        <p className="text-xs text-gray-500 mt-1">Created: {new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-5 text-sm">
                    <span className="px-4 py-2 text-sm font-medium rounded-full bg-green-100 text-green-800 border border-green-200">
                      ${parseFloat(tute.price).toFixed(2)}
                    </span>
                  </td>
                  <td className="relative whitespace-nowrap py-5 pl-3 pr-6 text-right text-sm font-medium">
                    {deleteConfirm === tute.id ? (
                      <div className="flex space-x-2 justify-end items-center bg-red-50 p-3 rounded-lg border border-red-100 shadow-sm">
                        <span className="text-sm text-gray-700 mr-2">Confirm delete?</span>
                        <button
                          onClick={() => handleConfirmDelete(tute.id)}
                          className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-xs font-medium"
                        >
                          Yes, Delete
                        </button>
                        <button
                          onClick={handleCancelDelete}
                          className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors text-xs font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-4 justify-end">
                        <Link
                          to={`/tutor/tutorials/edit/${tute.id}`}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(tute.id)}
                          className="px-3 py-1.5 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TutorTuteList;