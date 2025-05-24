import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getCartItems, 
  getCartTotal, 
  processPayment, 
  checkoutCart 
} from '../../services/tutePurchaseService';
import AuthContext from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const { currentUser, userRole } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser?.id) {
      loadCartItems();
    }
  }, [currentUser]);

  const loadCartItems = () => {
    setLoading(true);
    try {
      const items = getCartItems(currentUser.id);
      setCartItems(items);
      setTotal(getCartTotal(currentUser.id));
      
      // If cart is empty, redirect to cart page
      if (items.length === 0) {
        toast.info('Your cart is empty');
        navigate('/cart');
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      toast.error('Failed to load your cart');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.cardName.trim()) {
      toast.error('Please enter the cardholder name');
      return false;
    }
    
    if (!formData.cardNumber.trim() || formData.cardNumber.replace(/\s/g, '').length !== 16) {
      toast.error('Please enter a valid 16-digit card number');
      return false;
    }
    
    if (!formData.expiryDate.trim() || !/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      toast.error('Please enter a valid expiry date (MM/YY)');
      return false;
    }
    
    if (!formData.cvv.trim() || !/^\d{3}$/.test(formData.cvv)) {
      toast.error('Please enter a valid 3-digit CVV');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setProcessing(true);
    
    try {
      // Process payment
      const paymentDetails = {
        cardName: formData.cardName,
        cardNumber: formData.cardNumber.replace(/\s/g, ''),
        expiryDate: formData.expiryDate,
        cvv: formData.cvv
      };
      
      const paymentResult = await processPayment(currentUser.id, paymentDetails);
      
      if (paymentResult.success) {
        // Create purchase records
        await checkoutCart(currentUser.id, paymentResult);
        
        toast.success('Payment successful! Your tutorials are now available.');
        navigate(`/${userRole.toLowerCase()}/my-tutorials`);
      } else {
        toast.error('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('An error occurred during checkout. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-lg text-gray-600">Loading checkout...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Order Summary</h2>
          <div className="space-y-3">
            {cartItems.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-gray-700">{item.title}</span>
                <span className="font-medium">${parseFloat(item.price).toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between mt-6 pt-4 border-t border-gray-200 text-xl font-semibold">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Payment Details</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
              <input 
                type="text" 
                id="cardName" 
                name="cardName" 
                value={formData.cardName}
                onChange={handleInputChange}
                placeholder="John Smith"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
              <input 
                type="text" 
                id="cardNumber" 
                name="cardNumber" 
                value={formData.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input 
                  type="text" 
                  id="expiryDate" 
                  name="expiryDate" 
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  placeholder="MM/YY"
                  maxLength="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                <input 
                  type="text" 
                  id="cvv" 
                  name="cvv" 
                  value={formData.cvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  maxLength="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              className={`w-full py-3 rounded-md font-semibold text-white ${processing ? 'bg-gray-500' : 'bg-green-600 hover:bg-green-700'} transition-colors`}
              disabled={processing}
            >
              {processing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;