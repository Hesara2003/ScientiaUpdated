import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createTute, getTuteById, updateTute } from '../../services/tuteService';
import { toast } from 'react-toastify';

const TuteForm = ({ editMode = false }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    price: '',
    content: '',
    resources: []
  });
  
  const [newResource, setNewResource] = useState({ name: '', url: '' });
  
  const navigate = useNavigate();
  const { id } = useParams();
  
  useEffect(() => {
    if (editMode) {
      if (id && id !== 'undefined') {
        loadTuteData();
      } else {
        // Handle case where ID is undefined
        toast.error('Tutorial ID is missing or invalid');
        navigate('/tutor/tutorials');
      }
    }
  }, [editMode, id, navigate]);
  
  const loadTuteData = async () => {
    try {
      setLoading(true);
      const tuteData = await getTuteById(id);
      
      if (!tuteData) {
        toast.error('Tutorial not found');
        navigate('/tutor/tutorials');
        return;
      }
      
      setFormData({
        title: tuteData.title || '',
        subject: tuteData.subject || '',
        description: tuteData.description || '',
        price: tuteData.price || '',
        content: tuteData.content || '',
        resources: tuteData.resources || []
      });
    } catch (error) {
      console.error('Error loading tutorial data:', error);
      toast.error('Failed to load tutorial data');
      navigate('/tutor/tutorials');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? (value === '' ? '' : parseFloat(value)) : value
    }));
  };
  
  const handleResourceChange = (e) => {
    const { name, value } = e.target;
    setNewResource(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const addResource = () => {
    if (!newResource.name || !newResource.url) {
      toast.warning('Please provide both name and URL for the resource');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      resources: [...prev.resources, { ...newResource }]
    }));
    
    setNewResource({ name: '', url: '' });
  };
  
  const removeResource = (index) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index)
    }));
  };
  
  const validateForm = () => {
    const required = ['title', 'subject', 'description', 'price'];
    const missing = required.filter(field => !formData[field]);
    
    if (missing.length > 0) {
      toast.error(`Please fill in all required fields: ${missing.join(', ')}`);
      return false;
    }
    
    if (isNaN(formData.price) || formData.price <= 0) {
      toast.error('Please provide a valid price');
      return false;
    }
    
    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      
      // Display a saving in progress message
      toast.info(editMode ? 'Updating tutorial...' : 'Creating tutorial...', 
        { autoClose: false, toastId: 'save-progress' });
      
      if (editMode && id) {
        console.log(`Updating tutorial with ID: ${id}`, formData);
        
        // Format the data - ensure price is a number
        const formattedData = {
          ...formData,
          price: typeof formData.price === 'string' ? parseFloat(formData.price) : formData.price
        };
        
        const updatedTute = await updateTute(id, formattedData);
        console.log('Updated tutorial:', updatedTute);
        
        // Dismiss the progress toast
        toast.dismiss('save-progress');
        toast.success('Tutorial updated successfully');
      } else {
        console.log('Creating new tutorial:', formData);
        
        // Format the data - ensure price is a number
        const formattedData = {
          ...formData,
          price: typeof formData.price === 'string' ? parseFloat(formData.price) : formData.price
        };
        
        const newTute = await createTute(formattedData);
        console.log('Created tutorial:', newTute);
        
        // Dismiss the progress toast
        toast.dismiss('save-progress');
        toast.success('Tutorial created successfully');
      }
      
      // Wait a moment before navigating
      setTimeout(() => {
        navigate('/tutor/tutorials');
      }, 500);
    } catch (error) {
      // Dismiss the progress toast
      toast.dismiss('save-progress');
      
      console.error('Error saving tutorial:', error);
      
      // Check for different error types
      if (error.response && error.response.status === 403) {
        toast.error('You do not have permission to modify this tutorial');
      } else if (error.response && error.response.status === 404) {
        toast.error('Tutorial not found. It may have been deleted.');
      } else if (error.response && error.response.status === 400) {
        toast.error(`Invalid data: ${error.response.data?.message || 'Please check your form fields'}`);
      } else {
        toast.error(`Failed to save tutorial: ${error.message}`);
      }
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return <div className="text-center py-12 text-lg text-gray-600">Loading tutorial data...</div>;
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        {editMode ? 'Edit Tutorial' : 'Create New Tutorial'}
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title*
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject*
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description*
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          ></textarea>
        </div>
        
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Price ($)*
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0.01"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Tutorial Content
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows="10"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
          <p className="text-xs text-gray-500 mt-1">
            You can use HTML for formatting. Leave empty if you prefer to upload files instead.
          </p>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Resources</h3>
          
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="resourceName" className="block text-sm font-medium text-gray-700 mb-1">
                  Resource Name
                </label>
                <input
                  type="text"
                  id="resourceName"
                  name="name"
                  value={newResource.name}
                  onChange={handleResourceChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="resourceUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Resource URL
                </label>
                <input
                  type="url"
                  id="resourceUrl"
                  name="url"
                  value={newResource.url}
                  onChange={handleResourceChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <button
              type="button"
              onClick={addResource}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Add Resource
            </button>
          </div>
          
          {formData.resources.length > 0 && (
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      URL
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.resources.map((resource, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {resource.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          {resource.url}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => removeResource(index)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/tutor/tutorials')}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={saving}
            className={`px-6 py-2 rounded text-white font-medium ${
              saving ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
            } transition-colors`}
          >
            {saving ? 'Saving...' : editMode ? 'Update Tutorial' : 'Create Tutorial'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TuteForm;