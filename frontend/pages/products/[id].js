import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import AddToCartButton from '../../components/cart/AddToCartButton';
import CartIcon from '../../components/cart/CartIcon';
import { apiService } from '../../lib/api';
import { toast } from 'react-toastify';

// Product categories
const CATEGORIES = [
  { id: 'all', name: 'All Products' },
  { id: 'inspection', name: 'Property Inspection' },
  { id: 'documentation', name: 'Documentation' },
  { id: 'security', name: 'Security & Protection' },
  { id: 'services', name: 'Professional Services' },
];

const ProductDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Fetch product details
  useEffect(() => {
    if (!id) return;
    
    setLoading(true);
    
    // Fetch product details
    apiService.cart.getProductById(id)
      .then(response => {
        // If the API returns data, use it
        if (response.data && Object.keys(response.data).length > 0) {
          setProduct(response.data);
        } else {
          // Otherwise, use sample data
          const sampleProduct = getSampleProduct(parseInt(id));
          setProduct(sampleProduct);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching product details:', error);
        setError('Failed to load product details. Please try again later.');
        
        // Use sample data as fallback
        const sampleProduct = getSampleProduct(parseInt(id));
        if (sampleProduct) {
          setProduct(sampleProduct);
        }
        setLoading(false);
      });
  }, [id]);
  
  // Fetch related products
  useEffect(() => {
    if (!product) return;
    
    // In a real implementation, you would call the API to get related products
    // For now, we'll use sample data filtered by the same category
    apiService.cart.getProducts()
      .then(response => {
        let productData = response.data.length > 0 
          ? response.data 
          : getSampleProducts();
        
        // Filter out the current product and get products from the same category
        const related = productData
          .filter(p => p.id !== product.id && p.category === product.category)
          .slice(0, 3); // Limit to 3 related products
        
        setRelatedProducts(related);
      })
      .catch(error => {
        console.error('Error fetching related products:', error);
        
        // Use sample data as fallback
        const sampleData = getSampleProducts();
        const related = sampleData
          .filter(p => p.id !== product.id && p.category === product.category)
          .slice(0, 3);
        
        setRelatedProducts(related);
      });
  }, [product]);

  // Handle back to products button
  const handleBackToProducts = () => {
    router.push('/products');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-lg mx-auto bg-white rounded-lg shadow p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-medium text-gray-800 mt-4 mb-2">
              {error || "Product not found"}
            </h2>
            <p className="text-gray-600 mb-6">
              We couldn't find the product you're looking for. It may have been removed or doesn't exist.
            </p>
            <button
              onClick={handleBackToProducts}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Back to Products
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex items-center mb-8">
          <button
            onClick={handleBackToProducts}
            className="text-gray-600 hover:text-gray-800 flex items-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to Products
          </button>
          
          {/* Cart icon on the right */}
          <div className="ml-auto">
            <CartIcon />
          </div>
        </div>
        
        {/* Product details */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Product image */}
            <div className="flex justify-center items-center bg-gray-50 rounded-lg overflow-hidden h-80">
              <img
                src={product.image_url || 'https://via.placeholder.com/600x400'}
                alt={product.name}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/600x400';
                }}
              />
            </div>
            
            {/* Product info */}
            <div className="flex flex-col">
              <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-3">
                  {getCategoryName(product.category)}
                </span>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h1>
                <p className="text-3xl font-bold text-gray-800 mb-4">${product.price.toFixed(2)}</p>
                <p className="text-gray-600">{product.description}</p>
              </div>
              
              {/* Availability and shipping info */}
              <div className="border-t border-b border-gray-200 py-4 mb-6">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-600 font-medium">In Stock</span>
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-gray-600">Free shipping on orders over $199</span>
                </div>
              </div>
              
              {/* Add to cart */}
              <div className="mt-auto">
                <AddToCartButton 
                  product={product} 
                  showQuantity={true}
                  buttonText="Add to Cart"
                  className="w-full"
                />
              </div>
            </div>
          </div>
          
          {/* Product details tabs */}
          <div className="border-t border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Product Details</h2>
            <div className="prose max-w-none">
              <p>{product.long_description || product.description}</p>
              
              {/* Features list */}
              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">Features</h3>
              <ul className="list-disc pl-5 text-gray-600">
                <li>High-quality components and materials</li>
                <li>Professional-grade tools and equipment</li>
                <li>Easy to use and implement</li>
                <li>Comprehensive documentation included</li>
                <li>30-day money-back guarantee</li>
              </ul>
              
              {/* Specifications */}
              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-b border-gray-200 pb-2">
                  <span className="font-medium">Product ID:</span> {product.id}
                </div>
                <div className="border-b border-gray-200 pb-2">
                  <span className="font-medium">Category:</span> {getCategoryName(product.category)}
                </div>
                <div className="border-b border-gray-200 pb-2">
                  <span className="font-medium">Weight:</span> 2.5 lbs
                </div>
                <div className="border-b border-gray-200 pb-2">
                  <span className="font-medium">Dimensions:</span> 12" x 8" x 4"
                </div>
                <div className="border-b border-gray-200 pb-2">
                  <span className="font-medium">Warranty:</span> 1 Year Limited
                </div>
                <div className="border-b border-gray-200 pb-2">
                  <span className="font-medium">Support:</span> Email, Phone
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Related Products</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map(product => (
                <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden">
                  {/* Product image */}
                  <div className="h-48 overflow-hidden">
                    <img
                      src={product.image_url || 'https://via.placeholder.com/300x200'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x200';
                      }}
                    />
                  </div>
                  
                  {/* Product details */}
                  <div className="p-4">
                    <div className="mb-4">
                      <Link href={`/products/${product.id}`}>
                        <a className="text-lg font-medium text-gray-800 hover:text-blue-600 transition-colors">
                          {product.name}
                        </a>
                      </Link>
                      <p className="text-gray-500 text-sm mb-2">{getCategoryName(product.category)}</p>
                      <p className="text-xl font-bold text-gray-800">${product.price.toFixed(2)}</p>
                    </div>
                    
                    <div className="mt-4">
                      <AddToCartButton product={product} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

// Helper function to get category name from ID
function getCategoryName(categoryId) {
  const category = CATEGORIES.find(cat => cat.id === categoryId);
  return category ? category.name : 'Other';
}

// Sample products data (in case the API isn't fully implemented)
function getSampleProducts() {
  return [
    {
      id: 1,
      name: 'Premium Property Inspection Kit',
      description: 'Complete inspection kit for thorough property examinations including digital measuring tools, moisture detector, and inspection checklist templates.',
      price: 149.99,
      image_url: 'https://via.placeholder.com/300x200?text=Inspection+Kit',
      category: 'inspection'
    },
    {
      id: 2,
      name: 'Digital Documentation Bundle',
      description: 'A comprehensive package of digital templates, forms, and checklists for all your property documentation needs.',
      price: 79.99,
      image_url: 'https://via.placeholder.com/300x200?text=Documentation+Bundle',
      category: 'documentation'
    },
    {
      id: 3,
      name: 'Security Deposit Protection Plan',
      description: 'Advanced protection plan that safeguards both landlords and tenants during the leasing period. Includes legal support and dispute resolution.',
      price: 299.99,
      image_url: 'https://via.placeholder.com/300x200?text=Protection+Plan',
      category: 'security'
    },
    {
      id: 4,
      name: 'Property Inspection Service',
      description: 'Professional property inspection service by certified inspectors. Detailed reports with high-quality photos and recommendations.',
      price: 249.99,
      image_url: 'https://via.placeholder.com/300x200?text=Inspection+Service',
      category: 'services'
    },
    {
      id: 5,
      name: 'Thermal Imaging Camera',
      description: 'Professional-grade thermal imaging camera for detecting moisture, insulation problems, and electrical issues in properties.',
      price: 399.99,
      image_url: 'https://via.placeholder.com/300x200?text=Thermal+Camera',
      category: 'inspection'
    },
    {
      id: 6,
      name: 'Legal Document Templates',
      description: 'Lawyer-reviewed templates for leases, addendums, notices, and other essential property management documents.',
      price: 59.99,
      image_url: 'https://via.placeholder.com/300x200?text=Legal+Templates',
      category: 'documentation'
    },
    {
      id: 7,
      name: 'Smart Property Lock System',
      description: 'Secure, keyless entry system with mobile app control, temporary access codes, and activity logging for rental properties.',
      price: 189.99,
      image_url: 'https://via.placeholder.com/300x200?text=Smart+Lock',
      category: 'security'
    },
    {
      id: 8,
      name: 'Professional Photography Package',
      description: 'Professional photography service for your rental property. Includes interior and exterior shots, editing, and digital delivery.',
      price: 199.99,
      image_url: 'https://via.placeholder.com/300x200?text=Photography',
      category: 'services'
    },
    {
      id: 9,
      name: 'Deposit Dispute Resolution Service',
      description: 'Professional mediation service to resolve security deposit disputes between landlords and tenants.',
      price: 149.99,
      image_url: 'https://via.placeholder.com/300x200?text=Dispute+Resolution',
      category: 'services'
    }
  ];
}

// Get a specific sample product by ID
function getSampleProduct(id) {
  const products = getSampleProducts();
  return products.find(p => p.id === id) || null;
}

export default ProductDetailPage;