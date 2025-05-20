import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAllTutes, getTuteById } from '../../services/tuteService';
import { 
  purchaseTute, 
  hasStudentPurchasedTute,
  getPurchasesByStudentId 
} from '../../services/tutePurchaseService';

export default function TutorialMarketplace() {
  const navigate = useNavigate();
  const [tutorials, setTutorials] = useState([]);
  const [purchasedTutorials, setPurchasedTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [studentId, setStudentId] = useState(''); // Would come from auth context in a real app
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all available tutorials and student's purchased tutorials
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Assuming we get studentId from auth or local storage in a real app        const mockStudentId = '1'; // This would be the actual student ID in a real app
        setStudentId(mockStudentId);
        
        // Fetch all tutorials
        const tutesData = await getAllTutes();
        setTutorials(tutesData || []);
        
        // Fetch student's purchased tutorials
        if (mockStudentId) {
          const purchases = await getPurchasesByStudentId(mockStudentId);
          const purchasedIds = purchases.map(purchase => purchase.tuteId);
          setPurchasedTutorials(purchasedIds);
        }
      } catch (err) {
        console.error('Error fetching tutorials:', err);
        setError('Failed to load tutorials. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter tutorials based on search term and category
  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesSearch = tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tutorial.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || tutorial.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle tutorial purchase
  const handlePurchase = async () => {
    if (!selectedTutorial || !studentId) return;
    
    try {
      setProcessing(true);
      setError('');
      
      // Check if already purchased
      const alreadyPurchased = await hasStudentPurchasedTute(studentId, selectedTutorial.id);
      
      if (alreadyPurchased) {
        setError('You have already purchased this tutorial.');
        return;
      }
      
      // Create purchase object
      const purchaseData = {
        studentId: studentId,
        tuteId: selectedTutorial.id,
        price: selectedTutorial.price,
        purchaseDate: new Date().toISOString(),
        status: 'COMPLETED'
      };
      
      // Process purchase
      await purchaseTute(purchaseData);
      
      // Update UI
      setPurchasedTutorials(prev => [...prev, selectedTutorial.id]);
      setSuccess('Tutorial purchased successfully! You can now access its content.');
      
      // Close modal after a short delay
      setTimeout(() => {
        setShowPurchaseModal(false);
        setSelectedTutorial(null);
        setSuccess('');
      }, 2000);
      
    } catch (err) {
      console.error('Error purchasing tutorial:', err);
      setError('Failed to complete purchase. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Open purchase confirmation modal
  const openPurchaseModal = (tutorial) => {
    setSelectedTutorial(tutorial);
    setShowPurchaseModal(true);
    setError('');
    setSuccess('');
  };

  // Check if tutorial is purchased
  const isPurchased = (tuteId) => {
    return purchasedTutorials.includes(tuteId);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Tutorial Marketplace</h1>
          <p className="text-gray-600 mt-2">Browse and purchase premium tutorials to enhance your learning experience</p>
        </header>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Tutorials
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  placeholder="Search by title or description..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-64">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Category
              </label>
              <select
                id="category"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="math">Mathematics</option>
                <option value="science">Science</option>
                <option value="language">Languages</option>
                <option value="programming">Programming</option>
                <option value="humanities">Humanities</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && !showPurchaseModal && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Tutorials Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {filteredTutorials.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No tutorials found</h3>
                <p className="mt-1 text-gray-500">
                  {searchTerm 
                    ? `No tutorials match "${searchTerm}". Try different search terms.` 
                    : 'No tutorials available in this category.'}
                </p>
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {filteredTutorials.map((tutorial) => (
                  <motion.div
                    key={tutorial.id}
                    className="bg-white rounded-lg shadow overflow-hidden"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {tutorial.imageUrl ? (
                      <img src={tutorial.imageUrl} alt={tutorial.title} className="w-full h-48 object-cover" />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xl font-bold">
                        {tutorial.title}
                      </div>
                    )}
                    
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{tutorial.title}</h3>
                        <span className="px-2 py-1 bg-cyan-100 text-cyan-800 text-xs font-medium rounded">
                          {tutorial.category || 'General'}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4">
                        {tutorial.description && tutorial.description.length > 120
                          ? `${tutorial.description.substring(0, 120)}...`
                          : tutorial.description}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">${tutorial.price?.toFixed(2) || '0.00'}</span>
                        
                        {isPurchased(tutorial.id) ? (
                          <Link
                            to={`/student/tutorials/${tutorial.id}`}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Access Tutorial
                          </Link>
                        ) : (
                          <button
                            onClick={() => openPurchaseModal(tutorial)}
                            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                          >
                            Purchase
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}
        
        {/* Purchase Modal */}
        {showPurchaseModal && selectedTutorial && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div 
              className="bg-white rounded-lg shadow-lg max-w-md w-full overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Purchase</h3>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                    {success}
                  </div>
                )}
                
                <div className="mb-6">
                  <p className="text-gray-600 mb-4">
                    You are about to purchase the following tutorial:
                  </p>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold text-gray-900">{selectedTutorial.title}</h4>
                    <p className="text-gray-500 text-sm mt-1">{selectedTutorial.category || 'General'}</p>
                    <div className="mt-2 text-cyan-600 font-bold">${selectedTutorial.price?.toFixed(2) || '0.00'}</div>
                  </div>
                  
                  <p className="text-sm text-gray-500">
                    Once purchased, you will have unlimited access to this tutorial's content.
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowPurchaseModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    disabled={processing}
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handlePurchase}
                    className={`px-4 py-2 bg-cyan-600 text-white rounded-lg ${
                      processing ? 'opacity-75 cursor-wait' : 'hover:bg-cyan-700'
                    }`}
                    disabled={processing}
                  >
                    {processing ? 'Processing...' : 'Confirm Purchase'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
