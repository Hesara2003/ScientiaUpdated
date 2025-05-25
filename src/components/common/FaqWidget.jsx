import React, { useState, useEffect } from 'react';
import { getAllFaqs, getFaqsByCategory } from '../../services/faqService';

/**
 * A reusable component to display FAQs in dashboard widgets
 * @param {Object} props - Component props
 * @param {string} props.category - Optional category to filter FAQs by
 * @param {number} props.limit - Number of FAQs to display
 * @param {string} props.title - Title for the widget
 */
const FaqWidget = ({ category, limit = 3, title = "Frequently Asked Questions" }) => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true);
        
        let data;
        if (category) {
          data = await getFaqsByCategory(category);
        } else {
          data = await getAllFaqs();
        }
        
        setFaqs(data.slice(0, limit));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching FAQs for widget:', err);
        setError('Could not load FAQs');
        setLoading(false);
      }
    };

    fetchFaqs();
  }, [category, limit]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 h-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="animate-pulse space-y-3">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-12 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 h-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-full">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      
      {faqs.length > 0 ? (
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div key={faq.id} className="border border-gray-100 rounded-lg overflow-hidden">
              <button
                className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 focus:outline-none flex justify-between items-center"
                onClick={() => toggleExpand(faq.id)}
              >
                <h4 className="text-sm font-medium text-gray-900">{faq.question}</h4>
                <span className="text-indigo-600">
                  {expandedId === faq.id ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </span>
              </button>
              
              {expandedId === faq.id && (
                <div className="p-3 text-sm text-gray-700">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No FAQs available</p>
      )}
      
      <div className="mt-4 text-right">
        <a 
          href="/explore/faqs" 
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          View all FAQs →
        </a>
      </div>
    </div>
  );
};

export default FaqWidget;
