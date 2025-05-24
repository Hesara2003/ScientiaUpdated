import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllFaqs, searchFaqs, getFaqsByCategory } from '../../services/faqService';

const FaqPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data fallback
  const mockFaqs = [
    {
      id: 1,
      question: "How do I register for tutoring sessions?",
      answer: "You can register by clicking the 'Sign Up' button and creating an account. Once registered, you can browse available tutors and book sessions.",
      category: "Registration"
    },
    {
      id: 2,
      question: "What subjects are available for tutoring?",
      answer: "We offer tutoring in Mathematics, Physics, Chemistry, English Literature, Computer Science, and many other subjects.",
      category: "Subjects"
    },
    {
      id: 3,
      question: "How much do tutoring sessions cost?",
      answer: "Pricing varies by tutor and subject. You can view individual tutor rates on their profiles.",
      category: "Pricing"
    },
    {
      id: 4,
      question: "Can I cancel or reschedule a session?",
      answer: "Yes, you can cancel or reschedule sessions up to 24 hours before the scheduled time without any penalty.",
      category: "Scheduling"
    }
  ];

  // Fetch FAQs on component mount
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true);
        const data = await getAllFaqs();
        
        // Ensure data is an array
        const faqsArray = Array.isArray(data) ? data : mockFaqs;
        setFaqs(faqsArray);
        setFilteredFaqs(faqsArray);

        // Extract unique categories
        const uniqueCategories = [...new Set(faqsArray.map(faq => faq.category))].filter(Boolean);
        setCategories(uniqueCategories);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching FAQs:', err);
        // Use mock data as fallback
        setFaqs(mockFaqs);
        setFilteredFaqs(mockFaqs);
        const uniqueCategories = [...new Set(mockFaqs.map(faq => faq.category))].filter(Boolean);
        setCategories(uniqueCategories);
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  // Handle search input change
  const handleSearchChange = async (e) => {
    const searchValue = e.target.value;
    setSearchTerm(searchValue);
    
    if (searchValue.trim() === '') {
      // If search is cleared, show all or filtered by category
      if (selectedCategory) {
        const categorizedFaqs = await getFaqsByCategory(selectedCategory);
        setFilteredFaqs(categorizedFaqs);
      } else {
        setFilteredFaqs(faqs);
      }
    } else {
      // Search with term
      try {
        const results = await searchFaqs(searchValue);
        // If a category is selected, filter the search results by that category
        if (selectedCategory) {
          setFilteredFaqs(results.filter(faq => 
            faq.category?.toLowerCase() === selectedCategory.toLowerCase()
          ));
        } else {
          setFilteredFaqs(results);
        }
      } catch (err) {
        console.error('Error searching FAQs:', err);
        setError('Search failed. Please try again.');
      }
    }
  };

  // Handle category selection
  const handleCategoryChange = async (category) => {
    setSelectedCategory(category);
    setExpandedId(null); // Close any open FAQs
    
    if (!category) {
      // If no category selected (All), show all FAQs or filtered by search
      if (searchTerm) {
        const results = await searchFaqs(searchTerm);
        setFilteredFaqs(results);
      } else {
        setFilteredFaqs(faqs);
      }
    } else {
      // Filter by selected category
      try {
        const categorizedFaqs = await getFaqsByCategory(category);
        // If there's a search term, further filter the results
        if (searchTerm) {
          const searchResults = await searchFaqs(searchTerm);
          setFilteredFaqs(
            categorizedFaqs.filter(faq => 
              searchResults.some(result => result.id === faq.id)
            )
          );
        } else {
          setFilteredFaqs(categorizedFaqs);
        }
      } catch (err) {
        console.error('Error filtering FAQs by category:', err);
        setError('Category filtering failed. Please try again.');
      }
    }
  };

  // Toggle FAQ expansion
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h1>
        
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search FAQs..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div className="md:w-1/3">
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => (
              <motion.div
                key={faq.id}
                className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  className="w-full text-left p-4 focus:outline-none flex justify-between items-center"
                  onClick={() => toggleExpand(faq.id)}
                >
                  <h2 className="text-lg font-medium text-gray-900">{faq.question}</h2>
                  <span className="text-indigo-600">
                    {expandedId === faq.id ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </span>
                </button>
                
                {expandedId === faq.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className="p-4 bg-gray-50 border-t border-gray-200"
                  >
                    <p className="text-gray-700">{faq.answer}</p>
                    {faq.category && (
                      <div className="mt-2">
                        <span 
                          className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full"
                          onClick={() => handleCategoryChange(faq.category)}
                          style={{ cursor: 'pointer' }}
                        >
                          {faq.category}
                        </span>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No FAQs found. Please try a different search term or category.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default FaqPage;
