import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getCartItems, 
  removeFromCart, 
  getCartTotal, 
  clearCart 
} from '../../services/tutePurchaseService';
import AuthContext from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const ShoppingCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const { currentUser, userRole } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser?.id) {
      loadCartItems();
      
      window.addEventListener('cartUpdated', loadCartItems);
      
      return () => {
        window.removeEventListener('cartUpdated', loadCartItems);
      };
    }
  }, [currentUser]);

  const loadCartItems = () => {
    setLoading(true);
    try {
      const items = getCartItems(currentUser.id);
      setCartItems(items);
      setTotal(getCartTotal(currentUser.id));
    } catch (error) {
      console.error('Error loading cart:', error);
      toast.error('Failed to load your cart');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = (tuteId, studentId) => {
    try {
      removeFromCart(currentUser.id, tuteId, studentId);
      loadCartItems();
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    }
  };

  const handleClearCart = () => {
    try {
      clearCart(currentUser.id);
      loadCartItems();
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.warning('Your cart is empty');
      return;
    }
    
    navigate('/checkout');
  };

  if (loading) {
    return <div className="text-center py-12 text-lg text-gray-600">Loading your cart...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Your Shopping Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 mb-6">Your cart is empty</p>
          <button 
            className="px-6 py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors"
            onClick={() => navigate(`/${userRole.toLowerCase()}/tutorials`)}
          >
            Browse Tutorials
          </button>
        </div>
      ) : (
        <>
          <div className="mb-8 space-y-4">
            {cartItems.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-6 bg-white rounded-lg shadow-sm">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{item.title}</h3>
                  <p className="text-lg font-semibold text-blue-600 mb-1">${parseFloat(item.price).toFixed(2)}</p>
                  {userRole === 'PARENT' && (
                    <p className="text-sm text-gray-600 mb-1">For: Student ID {item.studentId}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Added: {new Date(item.addedAt).toLocaleDateString()}
                  </p>
                </div>
                <button 
                  className="ml-4 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  onClick={() => handleRemoveItem(item.tuteId, item.studentId)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <div className="flex justify-between text-xl font-semibold mb-6 pb-4 border-b border-gray-200">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <button 
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                onClick={handleClearCart}
              >
                Clear Cart
              </button>
              
              <button 
                className="px-6 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition-colors"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ShoppingCart;