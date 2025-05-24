import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getCartItems } from '../../services/tutePurchaseService';
import { AuthContext } from '../../contexts/AuthContext';

const CartIndicator = ({ linkTo = '/cart' }) => {
  const [itemCount, setItemCount] = useState(0);
  const { currentUser } = useContext(AuthContext);
  
  useEffect(() => {
    if (currentUser?.id) {
      updateCartCount();
      
      // Set up event listener for cart updates
      window.addEventListener('cartUpdated', updateCartCount);
      
      return () => {
        window.removeEventListener('cartUpdated', updateCartCount);
      };
    }
  }, [currentUser]);
  
  const updateCartCount = () => {
    if (currentUser?.id) {
      const cartItems = getCartItems(currentUser.id);
      setItemCount(cartItems.length);
    }
  };
  
  if (!currentUser) return null;
  
  return (
    <Link to={linkTo} className="relative inline-block ml-4 text-gray-800">
      <i className="fas fa-shopping-cart"></i>
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </Link>
  );
};

export default CartIndicator;