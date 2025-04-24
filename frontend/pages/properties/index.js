import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import { apiService } from '../../lib/api';
import { useAuth } from '../../lib/auth';

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await apiService.properties.getAll();
      setProperties(response.data);
    } catch (error) {
      console.error('Properties fetch error:', error);
      toast.error('An error occurred while loading the property list.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this property? This action cannot be undone and all associated reports will also be deleted.')) {
      try {
        await apiService.properties.delete(id);
        toast.success('Property successfully deleted.');
        fetchProperties(); // Refresh property list
      } catch (error) {
        console.error('Property delete error:', error);
        toast.error('An error occurred while deleting the property.');
      }
    }
  };

  // Helper function to display role badge
  const getRoleBadge = (role) => {
    if (role === 'landlord') {
      return <span className="badge-landlord">Landlord</span>;
    } else if (role === 'renter') {
      return <span className="badge-tenant">Tenant</span>;
    } else {
      return <span className="badge-other">Other</span>;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">My Properties</h1>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Properties</h1>
          <Link href="/properties/new" className="btn btn-primary">
            + Add New Property
          </Link>
        </div>

        {properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">No properties added yet</h2>
            <p className="text-gray-600 mb-6">
              You need to add a property first in order to create reports.
            </p>
            <Link href="/properties/new" className="btn btn-primary">
              Add Your First Property
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="bg-indigo-50 p-4">
                  <h2 className="text-lg font-semibold truncate text-indigo-700" title={property.address}>
                    {property.address}
                  </h2>
                </div>
                
                <div className="p-4">
                  <p className="text-gray-600 mb-4 line-clamp-2" title={property.description}>
                    {property.description}
                  </p>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => router.push(`/properties/${property.id}`)}
                        className="btn btn-primary px-3 py-1 text-sm flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </button>
                      <button
                        onClick={() => router.push(`/properties/${property.id}/edit`)}
                        className="btn btn-secondary px-3 py-1 text-sm flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit
                      </button>
                    </div>
                    
                    <button
                      onClick={() => handleDelete(property.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-full hover:bg-red-50"
                      aria-label="Delete"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
