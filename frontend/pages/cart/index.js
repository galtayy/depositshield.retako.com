import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import CartList from '../../components/cart/CartList';
import { useCart } from '../../lib/cartContext';
import { useAuth } from '../../lib/auth';
import { toast } from 'react-toastify';

const CartPage = () => {
  const router = useRouter();
  const { cart } = useCart();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Function to handle checkout button click
  const handleCheckout = () => {
    // If user is not authenticated, redirect to login
    if (!isAuthenticated) {
      // Store current path to redirect back after login
      localStorage.setItem('auth_redirect', '/cart/checkout');
      router.push('/login');
      return;
    }

    // Otherwise, proceed to checkout
    router.push('/cart/checkout');
  };

  // Function to handle continue shopping button click
  const handleContinueShopping = () => {
    router.push('/products');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Your Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items (takes up 2/3 of the space on large screens) */}
          <div className="lg:col-span-2">
            <CartList />
          </div>
          
          {/* Order summary (takes up 1/3 of the space on large screens) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.itemCount} items)</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>
                
                <div className="pt-3 border-t border-gray-200 flex justify-between font-medium text-gray-800">
                  <span>Estimated Total</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Checkout button */}
              <button
                onClick={handleCheckout}
                disabled={isLoading || cart.itemCount === 0}
                className={`w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors mb-3 ${
                  (isLoading || cart.itemCount === 0) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Processing...' : 'Proceed to Checkout'}
              </button>
              
              {/* Continue shopping button */}
              <button
                onClick={handleContinueShopping}
                className="w-full py-3 px-4 bg-gray-100 text-gray-800 font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;