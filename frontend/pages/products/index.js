import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import AddToCartButton from '../../components/cart/AddToCartButton';
import CartIcon from '../../components/cart/CartIcon';
import { apiService } from '../../lib/api';
import { toast } from 'react-toastify';

// Product categories for filtering
const CATEGORIES = [
  { id: 'all', name: 'All Products' },
  { id: 'inspection', name: 'Property Inspection' },
  { id: 'documentation', name: 'Documentation' },
  { id: 'security', name: 'Security & Protection' },
  { id: 'services', name: 'Professional Services' },
];

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortOption, setSortOption] = useState('featured');
  
  // Fetch products from API
  useEffect(() => {
    setLoading(true);
    
    apiService.cart.getProducts()
      .then(response => {
        // If the API isn't fully implemented yet, use sample data
        const productData = response.data.length > 0 
          ? response.data 
          : getSampleProducts();
        
        setProducts(productData);
        setFilteredProducts(productData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again later.');
        setProducts(getSampleProducts());
        setFilteredProducts(getSampleProducts());
        setLoading(false);
      });
  }, []);
  
  // Filter and sort products when category or sort option changes
  useEffect(() => {
    // Filter by category
    let result = [...products];
    
    if (activeCategory !== 'all') {
      result = result.filter(product => product.category === activeCategory);
    }
    
    // Sort products
    switch (sortOption) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'featured':
      default:
        // Featured products are sorted by their order in the original list
        break;
    }
    
    setFilteredProducts(result);
  }, [activeCategory, sortOption, products]);
  
  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };
  
  // Handle sort option change
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">DepositShield Products</h1>
          
          <div className="flex items-center">
            {/* Sort dropdown */}
            <div className="mr-4">
              <select
                value={sortOption}
                onChange={handleSortChange}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
            
            {/* Cart icon */}
            <CartIcon />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Category sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Categories</h2>
              
              <ul className="space-y-2">
                {CATEGORIES.map(category => (
                  <li key={category.id}>
                    <button
                      onClick={() => handleCategoryChange(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        activeCategory === category.id
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Product grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-lg font-medium text-gray-800 mt-4 mb-2">Error Loading Products</h2>
                <p className="text-gray-600 mb-6">{error}</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h2 className="text-lg font-medium text-gray-800 mt-4 mb-2">No Products Found</h2>
                <p className="text-gray-600">
                  No products found in this category. Please try another category.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
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
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      
                      {/* Add to cart button */}
                      <div className="mt-4">
                        <AddToCartButton product={product} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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

export default ProductsPage;