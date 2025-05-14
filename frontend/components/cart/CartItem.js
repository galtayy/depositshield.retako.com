import React from 'react';
import { useCart } from '../../lib/cartContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();

  // Handle quantity change
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      updateQuantity(item.id, value);
    }
  };

  // Handle remove item
  const handleRemove = () => {
    removeItem(item.id);
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      <div className="flex items-center space-x-4">
        {/* Product image */}
        {item.imageUrl && (
          <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
            <img 
              src={item.imageUrl} 
              alt={item.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/150';
              }}
            />
          </div>
        )}
        
        {/* Product details */}
        <div>
          <h3 className="font-medium text-gray-800">{item.name}</h3>
          <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
        </div>
      </div>
      
      {/* Quantity controls */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center border rounded-md">
          <button 
            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
            aria-label="Decrease quantity"
          >
            -
          </button>
          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={handleQuantityChange}
            className="w-12 text-center border-0 focus:ring-0"
            aria-label="Quantity"
          />
          <button 
            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        
        {/* Remove button */}
        <button 
          onClick={handleRemove}
          className="text-red-500 hover:text-red-700"
          aria-label="Remove item"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {/* Item subtotal */}
      <div className="font-medium">
        ${(item.price * item.quantity).toFixed(2)}
      </div>
    </div>
  );
};

export default CartItem;