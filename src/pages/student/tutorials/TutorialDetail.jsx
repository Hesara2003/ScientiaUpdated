import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTuteById } from '../../../services/tuteService';
import { hasStudentPurchasedTute } from '../../../services/tutePurchaseService';
import  AuthContext  from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';

const TutorialDetail = () => {
  const [tute, setTute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasPurchased, setHasPurchased] = useState(false);
  const { id } = useParams();
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    loadTuteDetails();
  }, [id, currentUser]);

  const loadTuteDetails = async () => {
    try {
      setLoading(true);
      
      // Get tutorial details
      const tuteData = await getTuteById(id);
      setTute(tuteData);
      
      // Check if the student has purchased this tutorial
      const purchased = await hasStudentPurchasedTute(currentUser.id, id);
      setHasPurchased(purchased);
      
      // If not purchased, redirect to tutorials page
      if (!purchased) {
        toast.warning('You need to purchase this tutorial first');
        navigate('/student/tutorials');
      }
    } catch (error) {
      console.error('Error loading tutorial details:', error);
      toast.error('Failed to load tutorial details');
      navigate('/student/my-tutorials');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-lg text-gray-600">Loading tutorial...</div>;
  }

  if (!tute) {
    return <div className="text-center py-12 text-lg text-red-600">Tutorial not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{tute.title}</h1>
        <p className="text-md font-medium text-blue-600 mb-6">{tute.subject}</p>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">Description</h2>
          <p className="text-gray-600">{tute.description}</p>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Tutorial Content</h2>
          <div className="prose max-w-none">
            {/* Render tutorial content here */}
            <div dangerouslySetInnerHTML={{ __html: tute.content || '<p>No content available</p>' }} />
          </div>
        </div>
        
        {tute.resources && tute.resources.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Resources</h2>
            <ul className="space-y-2">
              {tute.resources.map((resource, index) => (
                <li key={index} className="flex items-center">
                  <i className="fas fa-file-alt mr-2 text-blue-500"></i>
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {resource.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button 
            onClick={() => navigate('/student/my-tutorials')}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors"
          >
            Back to My Tutorials
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialDetail;