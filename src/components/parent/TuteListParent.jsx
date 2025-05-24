import React, { useState, useEffect, useContext } from 'react';
import { getAllTutes } from '../../services/tuteService';
import { addToCart, getPurchasedTuteIds } from '../../services/tutePurchaseService';
import AuthContext from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

// Mock function to simulate fetching children from an API
const getChildren = async (parentId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { id: 1, name: "John Smith", grade: "6th Grade" },
    { id: 2, name: "Emma Smith", grade: "8th Grade" }
  ];
};

const TuteListParent = () => {
  const [tutes, setTutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [purchasedByChild, setPurchasedByChild] = useState({});
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    loadTutes();
    loadChildren();
  }, [currentUser]);

  useEffect(() => {
    if (selectedChild) {
      checkPurchasedTutesForChild(selectedChild);
    }
  }, [selectedChild]);

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

  const loadChildren = async () => {
    try {
      const childrenData = await getChildren(currentUser.id);
      setChildren(childrenData);
      // Select first child by default if available
      if (childrenData.length > 0) {
        setSelectedChild(childrenData[0].id);
      }
    } catch (error) {
      console.error('Error loading children:', error);
      toast.error('Failed to load children data');
    }
  };

  const checkPurchasedTutesForChild = async (childId) => {
    try {
      const purchasedIds = await getPurchasedTuteIds(childId);
      setPurchasedByChild(prev => ({
        ...prev,
        [childId]: purchasedIds
      }));
    } catch (error) {
      console.error('Error checking purchased tutes:', error);
    }
  };

  const handleChildChange = (e) => {
    setSelectedChild(e.target.value);
  };

  const handleAddToCart = (tute) => {
    if (!selectedChild) {
      toast.warning('Please select a child first');
      return;
    }
    
    try {
      // Parents purchase for their selected child
      addToCart(currentUser.id, tute, selectedChild);
      toast.success(`${tute.title} added to cart for ${getChildName(selectedChild)}`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  const getChildName = (childId) => {
    const child = children.find(c => c.id == childId);
    return child ? child.name : 'Unknown Child';
  };

  const isChildPurchased = (tuteId) => {
    if (!selectedChild || !purchasedByChild[selectedChild]) return false;
    return purchasedByChild[selectedChild].includes(tuteId);
  };

  if (loading) {
    return <div className="text-center py-12 text-lg text-gray-600">Loading tutorials...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Buy Tutorials for Your Child</h1>
      
      <div className="mb-8 p-4 bg-blue-50 rounded-lg shadow-sm flex items-center justify-center flex-wrap">
        <label htmlFor="child-select" className="font-semibold mr-4 text-gray-700">Select child: </label>
        <select 
          id="child-select" 
          value={selectedChild || ''} 
          onChange={handleChildChange}
          className="p-2 rounded border border-gray-300 min-w-[200px] focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        >
          <option value="" disabled>Select a child</option>
          {children.map(child => (
            <option key={child.id} value={child.id}>
              {child.name}
            </option>
          ))}
        </select>
      </div>
      
      {selectedChild ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {tutes.map(tute => {
            const isPurchased = isChildPurchased(tute.id);
            
            return (
              <div key={tute.id} className="bg-white rounded-lg shadow-md p-6 transition-transform duration-200 hover:-translate-y-1">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{tute.title}</h3>
                <p className="text-sm font-medium text-gray-600 mb-1">{tute.subject}</p>
                <p className="text-base text-gray-700 mb-4 line-clamp-3">{tute.description}</p>
                <p className="text-xl font-bold text-blue-600 mb-4">${parseFloat(tute.price).toFixed(2)}</p>
                
                {isPurchased ? (
                  <div className="w-full py-3 text-center bg-gray-200 text-gray-700 rounded font-medium">
                    Already purchased for {getChildName(selectedChild)}
                  </div>
                ) : (
                  <button 
                    className="w-full py-3 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition-colors cursor-pointer"
                    onClick={() => handleAddToCart(tute)}
                  >
                    Add to Cart for {getChildName(selectedChild)}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg text-gray-600">
          Please select a child to view available tutorials
        </div>
      )}
    </div>
  );
};

export default TuteListParent;