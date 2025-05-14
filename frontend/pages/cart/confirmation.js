import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { apiService } from '../../lib/api';
import { useAuth } from '../../lib/auth';

const OrderConfirmationPage = () => {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { order_id } = router.query;
  
  // Fetch order details
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // Fetch order details if we have an order ID
    if (order_id && isAuthenticated) {
      setIsLoading(true);
      
      apiService.cart.getOrderById(order_id)
        .then(response => {
          setOrder(response.data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch order details:', err);
          setError('Unable to load your order details. Please try again later.');
          setIsLoading(false);
        });
    } else if (!order_id && !loading) {
      // If no order ID is provided and not loading auth, redirect to the cart page
      router.push('/cart');
    }
  }, [order_id, isAuthenticated, loading, router]);
  
  // If loading or not authenticated, show loading spinner
  if (loading || !isAuthenticated) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-800 mt-4 mb-2">Error Loading Order</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Link href="/cart">
                <a className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                  Return to Cart
                </a>
              </Link>
            </div>
          ) : order ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Success header */}
              <div className="bg-green-100 p-6 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h1 className="text-2xl font-bold text-gray-800 mt-4">Order Confirmed!</h1>
                <p className="text-gray-600 mt-2">
                  Thank you for your purchase. Your order has been received and is being processed.
                </p>
              </div>
              
              {/* Order details */}
              <div className="p-6">
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <h2 className="text-lg font-medium text-gray-800 mb-2">Order Details</h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Order Number:</p>
                      <p className="font-medium">{order.id || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Date:</p>
                      <p className="font-medium">
                        {order.created_at 
                          ? new Date(order.created_at).toLocaleDateString() 
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total:</p>
                      <p className="font-medium">${parseFloat(order.total || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Payment Method:</p>
                      <p className="font-medium">
                        {order.payment?.method === 'credit_card' 
                          ? `Credit Card (ending in ${order.payment?.card_details?.last_four || 'xxxx'})` 
                          : order.payment?.method === 'paypal' 
                            ? 'PayPal' 
                            : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Shipping details */}
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <h2 className="text-lg font-medium text-gray-800 mb-2">Shipping Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Shipping Address:</p>
                      <p className="font-medium">
                        {order.shipping ? (
                          <>
                            {order.shipping.first_name} {order.shipping.last_name}<br />
                            {order.shipping.address}<br />
                            {order.shipping.city}, {order.shipping.state} {order.shipping.postal_code}<br />
                            {order.shipping.country}
                          </>
                        ) : (
                          'N/A'
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Contact:</p>
                      <p className="font-medium">
                        {order.shipping?.email || 'N/A'}<br />
                        {order.shipping?.phone || 'N/A'}
                      </p>
                      
                      <p className="text-gray-600 mt-3">Shipping Method:</p>
                      <p className="font-medium">
                        {order.shipping?.method === 'standard' 
                          ? 'Standard Shipping (3-5 business days)' 
                          : order.shipping?.method === 'express' 
                            ? 'Express Shipping (1-2 business days)' 
                            : order.shipping?.method === 'free' 
                              ? 'Free Shipping (5-7 business days)' 
                              : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Order items */}
                <div className="mb-6">
                  <h2 className="text-lg font-medium text-gray-800 mb-4">Order Items</h2>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {order.items?.map((item, index) => (
                          <tr key={item.id || index}>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-800">{item.name || 'Product'}</div>
                              {item.id && (
                                <div className="text-xs text-gray-500">SKU: {item.id}</div>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-gray-800">
                              {item.quantity || 1}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-gray-800">
                              ${parseFloat(item.price || 0).toFixed(2)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right font-medium text-gray-800">
                              ${parseFloat((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <th colSpan="3" className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                            Subtotal
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-800">
                            ${parseFloat(order.subtotal || 0).toFixed(2)}
                          </th>
                        </tr>
                        <tr>
                          <th colSpan="3" className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                            Shipping
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-800">
                            ${parseFloat(order.shipping_cost || 0).toFixed(2)}
                          </th>
                        </tr>
                        <tr>
                          <th colSpan="3" className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                            Tax
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-800">
                            ${parseFloat(order.tax || 0).toFixed(2)}
                          </th>
                        </tr>
                        <tr>
                          <th colSpan="3" className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                            Total
                          </th>
                          <th className="px-4 py-3 text-right text-base font-bold text-gray-900">
                            ${parseFloat(order.total || 0).toFixed(2)}
                          </th>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                  <Link href="/products">
                    <a className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-center">
                      Continue Shopping
                    </a>
                  </Link>
                  
                  <Link href={`/orders/${order.id}`}>
                    <a className="inline-block px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-center">
                      View Order Details
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <h2 className="text-xl font-medium text-gray-800 mb-4">
                No order information found.
              </h2>
              <Link href="/cart">
                <a className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                  Return to Cart
                </a>
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default OrderConfirmationPage;