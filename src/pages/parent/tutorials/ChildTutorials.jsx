import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPurchasedTuteIds } from '../../../services/tutePurchaseService';
import { getAllTutes } from '../../../services/tuteService';
// Remove this import:
// import { getChildById } from '../../../services/parentService';
import AuthContext from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';

// Add this mock function
const getChildById = async (childId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const mockChildren = [
    { id: "1", name: "John Smith", grade: "6th Grade" },
    { id: "2", name: "Emma Smith", grade: "8th Grade" }
  ];
  
  // Find the child with the matching ID
  const child = mockChildren.find(c => c.id === childId);
  
  // If no child is found, return a default
  return child || { id: childId, name: "Unknown Child", grade: "Unknown" };
};

const ChildTutorials = () => {
  const [purchasedTutes, setPurchasedTutes] = useState([]);
  const [childInfo, setChildInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams(); // Child ID from URL
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadChildInfo();
      loadPurchasedTutes();
    } else {
      navigate('/parent/children');
    }
  }, [id, currentUser]);

  const loadChildInfo = async () => {
    try {
      const child = await getChildById(id);
      setChildInfo(child);
    } catch (error) {
      console.error('Error loading child information:', error);
      toast.error('Failed to load child information');
      navigate('/parent/children');
    }
  };

  const loadPurchasedTutes = async () => {
    try {
      setLoading(true);
      
      // Get all tute IDs that the child has access to
      const purchasedIds = await getPurchasedTuteIds(id);
      
      // Get details for all tutes
      const allTutes = await getAllTutes();
      
      // Filter to only include purchased tutes
      const purchased = allTutes.filter(tute => 
        purchasedIds.includes(tute.id)
      );
      
      setPurchasedTutes(purchased);
    } catch (error) {
      console.error('Error loading purchased tutorials:', error);
      toast.error('Failed to load tutorials');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-lg text-gray-600">Loading tutorials...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          {childInfo ? `${childInfo.name}'s Tutorials` : 'Child Tutorials'}
        </h1>
        <Link 
          to="/parent/tutorials" 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Buy More Tutorials
        </Link>
      </div>
      
      {purchasedTutes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-xl text-gray-600 mb-6">No tutorials purchased for this child yet</p>
          <Link 
            to="/parent/tutorials" 
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
              
              <div className="text-center py-3 bg-green-100 text-green-800 rounded-md">
                Already purchased
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChildTutorials;