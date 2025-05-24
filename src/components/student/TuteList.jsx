import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getAllTutes } from '../../services/tuteService';
import { addToCart, getPurchasedTuteIds } from '../../services/tutePurchaseService';
import AuthContext from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const TuteList = () => {
  const [tutes, setTutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasedTuteIds, setPurchasedTuteIds] = useState([]);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    loadTutes();
    if (currentUser?.id) {
      checkPurchasedTutes();
    }
  }, [currentUser]);

  const loadTutes = async () => {
    try {
      const tutesData = await getAllTutes();
      setTutes(tutesData);
    } catch (error) {
      console.error('Error loading tutes:', error);
      toast.error('Failed to load tutorials');
    } finally {
      setLoading(false);
    }
  };

  const checkPurchasedTutes = async () => {
    try {
      const purchasedIds = await getPurchasedTuteIds(currentUser.id);
      setPurchasedTuteIds(purchasedIds);
    } catch (error) {
      console.error('Error checking purchased tutes:', error);
    }
  };

  const handleAddToCart = async (tute) => {
    try {
      // Check if user is logged in
      if (!currentUser?.id) {
        toast.error('Please log in to add items to cart');
        // Optionally redirect to login page
        // navigate('/login');
        return;
      }
      
      // Now safely use currentUser.id
      await addToCart(currentUser.id, tute);
      
      // Dispatch a custom event to update cart indicators
      window.dispatchEvent(new Event('cartUpdated'));
      
      toast.success(`${tute.title} added to cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-lg text-gray-600">Loading tutorials...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Available Tutorials</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {tutes.map(tute => {
          const isPurchased = purchasedTuteIds.includes(tute.id);
          
          return (
            <div key={tute.id} className="bg-white rounded-lg shadow-md p-6 transition-transform duration-200 hover:-translate-y-1">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{tute.title}</h3>
              <p className="text-sm font-medium text-gray-600 mb-1">{tute.subject}</p>
              <p className="text-base text-gray-700 mb-4 line-clamp-3">{tute.description}</p>
              <p className="text-xl font-bold text-blue-600 mb-4">${parseFloat(tute.price).toFixed(2)}</p>
              
              {isPurchased ? (
                <Link
                  to={`/student/tutes/${tute.id}`}
                  className="block w-full py-3 bg-blue-600 text-white rounded font-semibold text-center hover:bg-blue-700 transition-colors"
                >
                  View Tutorial
                </Link>
              ) : (
                <button 
                  className="w-full py-3 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition-colors cursor-pointer"
                  onClick={() => handleAddToCart(tute)}
                >
                  Add to Cart
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TuteList;