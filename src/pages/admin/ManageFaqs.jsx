import React, { useState, useEffect } from 'react';
import { 
  addFaq, 
  getAllFaqs, 
  getFaqById, 
  deleteFaq, 
  updateFaq, 
  searchFaqs 
} from '../../services/faqService';

const ManageFaqs = () => {
  const [faqs, setFaqs] = useState([]);
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFaq, setCurrentFaq] = useState({
    question: '',
    answer: '',
    category: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Fetch FAQs on component mount
  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const data = await getAllFaqs();
      setFaqs(data);
      setFilteredFaqs(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      setError('Failed to load FAQs. Please try again later.');
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim() === '') {
      setFilteredFaqs(faqs);
    } else {
      try {
        const results = await searchFaqs(value);
        setFilteredFaqs(results);
      } catch (err) {
        console.error('Error searching FAQs:', err);
        setError('Search failed. Please try again.');
      }
    }
  };

  // Open modal for adding a new FAQ
  const handleAddNew = () => {
    setCurrentFaq({
      question: '',
      answer: '',
      category: ''
    });
    setIsEditing(false);
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open modal for editing an existing FAQ
  const handleEdit = async (id) => {
    try {
      const faqData = await getFaqById(id);
      setCurrentFaq(faqData);
      setIsEditing(true);
      setFormErrors({});
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error fetching FAQ details:', err);
      setError('Could not load FAQ details. Please try again.');
    }
  };

  // Handle FAQ deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      try {
        await deleteFaq(id);
        // Update state without refetching from server
        const updatedFaqs = faqs.filter(faq => faq.id !== id);
        setFaqs(updatedFaqs);
        setFilteredFaqs(updatedFaqs);
      } catch (err) {
        console.error('Error deleting FAQ:', err);
        setError('Failed to delete FAQ. Please try again.');
      }
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentFaq({
      ...currentFaq,
      [name]: value
    });
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  // Validate form inputs
  const validateForm = () => {
    const errors = {};
    
    if (!currentFaq.question.trim()) {
      errors.question = 'Question is required';
    }
    
    if (!currentFaq.answer.trim()) {
      errors.answer = 'Answer is required';
    }
    
    if (!currentFaq.category.trim()) {
      errors.category = 'Category is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit form to add or update FAQ
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (isEditing) {
        await updateFaq(currentFaq.id, currentFaq);
      } else {
        await addFaq(currentFaq);
      }
      
      // Refresh FAQ list
      await fetchFaqs();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving FAQ:', err);
      setError(`Failed to ${isEditing ? 'update' : 'add'} FAQ. Please try again.`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage FAQs</h1>
        <button
          onClick={handleAddNew}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add New FAQ
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search FAQs..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => (
                  <tr key={faq.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{faq.question}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                        {faq.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(faq.id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(faq.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                    No FAQs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit FAQ Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                {isEditing ? 'Edit FAQ' : 'Add New FAQ'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                  <input
                    type="text"
                    name="question"
                    value={currentFaq.question}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-md ${formErrors.question ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter question"
                  />
                  {formErrors.question && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.question}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                  <textarea
                    name="answer"
                    value={currentFaq.answer}
                    onChange={handleInputChange}
                    rows="4"
                    className={`w-full p-2 border rounded-md ${formErrors.answer ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter answer"
                  ></textarea>
                  {formErrors.answer && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.answer}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={currentFaq.category}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-md ${formErrors.category ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter category (e.g., General, Pricing, Courses)"
                  />
                  {formErrors.category && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>
                  )}
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 flex justify-end rounded-b-lg">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700"
                >
                  {isEditing ? 'Update' : 'Add'} FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFaqs;
