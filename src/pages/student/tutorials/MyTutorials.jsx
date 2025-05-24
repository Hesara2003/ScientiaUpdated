import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getPurchasedTuteIds } from '../../../services/tutePurchaseService';
import { getAllTutes } from '../../../services/tuteService';
import AuthContext  from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';

const MyTutorials = () => {
  const [purchasedTutes, setPurchasedTutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    loadPurchasedTutes();
  }, [currentUser]);

  const loadPurchasedTutes = async () => {
    try {
      setLoading(true);
      
      // First get all tute IDs that the student has purchased
      const purchasedIds = await getPurchasedTuteIds(currentUser.id);
      
      // Then get details for all tutes
      const allTutes = await getAllTutes();
      
      // Filter to only include purchased tutes
      const purchased = allTutes.filter(tute => 
        purchasedIds.includes(tute.id)
      );
      
      setPurchasedTutes(purchased);
    } catch (error) {
      console.error('Error loading purchased tutorials:', error);
      toast.error('Failed to load your tutorials');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-lg text-gray-600">Loading your tutorials...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">My Tutorials</h1>
      
      {purchasedTutes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-xl text-gray-600 mb-6">You haven't purchased any tutorials yet</p>
          <Link 
            to="/student/tutorials" 
            className="px-6 py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors"
          >
            Browse Tutorials
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {purchasedTutes.map(tute => (
            <div key={tute.id} className="bg-white rounded-lg shadow-md p-6 transition-transform duration-200 hover:-translate-y-1">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{tute.title}</h3>
              <p className="text-sm font-medium text-gray-600 mb-1">{tute.subject}</p>
              <p className="text-base text-gray-700 mb-4 line-clamp-3">{tute.description}</p>
              
              <Link
                to={`/student/tutorial/${tute.id}`}
                className="block w-full py-3 bg-blue-600 text-white rounded font-semibold text-center hover:bg-blue-700 transition-colors"
              >
                View Tutorial
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTutorials;