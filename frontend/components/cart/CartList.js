import React from 'react';
import CartItem from './CartItem';
import { useCart } from '../../lib/cartContext';

const CartList = () => {
  const { cart, clearCart } = useCart();
  
  // If cart is empty, show empty state
  if (cart.items.length === 0) {
    return (
      <div className="py-8 text-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-16 w-16 mx-auto text-gray-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-800">Your cart is empty</h3>
        <p className="mt-2 text-gray-500">Add items to your cart to continue shopping</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-800">Shopping Cart ({cart.itemCount} items)</h2>
        <button 
          onClick={clearCart}
          className="text-sm text-red-500 hover:text-red-700"
          aria-label="Clear cart"
        >
          Clear Cart
        </button>
      </div>
      
      {/* Cart items */}
      <div className="divide-y divide-gray-200">
        {cart.items.map(item => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>
      
      {/* Cart summary */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center text-gray-600">
          <span>Subtotal</span>
          <span>${cart.total.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center mt-2 text-gray-600">
          <span>Shipping</span>
          <span>Calculated at checkout</span>
        </div>
        
        <div className="flex justify-between items-center mt-4 text-lg font-medium text-gray-800">
          <span>Total</span>
          <span>${cart.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default CartList;