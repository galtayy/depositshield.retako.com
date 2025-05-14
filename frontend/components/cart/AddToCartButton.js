import React, { useState } from 'react';
import { useCart } from '../../lib/cartContext';
import { toast } from 'react-toastify';

const AddToCartButton = ({ product, className = '', buttonText = 'Add to Cart', showQuantity = false }) => {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAddToCart = () => {
    setIsLoading(true);
    
    try {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.image_url,
        quantity: quantity
      });
      
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      toast.error('Failed to add item to cart');
      console.error('Error adding item to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className={`flex ${showQuantity ? 'items-center space-x-2' : ''} ${className}`}>
      {/* Quantity selector (optional) */}
      {showQuantity && (
        <div className="flex items-center border rounded">
          <button 
            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            aria-label="Decrease quantity"
            disabled={isLoading}
          >
            -
          </button>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-12 text-center border-0 focus:ring-0"
            aria-label="Quantity"
            disabled={isLoading}
          />
          <button 
            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
            onClick={() => setQuantity(quantity + 1)}
            aria-label="Increase quantity"
            disabled={isLoading}
          >
            +
          </button>
        </div>
      )}
      
      {/* Add to cart button */}
      <button
        onClick={handleAddToCart}
        disabled={isLoading}
        className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
          isLoading ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Adding...
          </span>
        ) : (
          buttonText
        )}
      </button>
    </div>
  );
};

export default AddToCartButton;