import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-toastify';
import Layout from '../../../components/Layout';
import { apiService } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';

export default function PropertyDetail() {
  const { user, loading: authLoading } = useAuth();
  const [property, setProperty] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (id) {
      fetchProperty();
      fetchPropertyReports();
    }
  }, [id, user, authLoading, router]);

  const fetchProperty = async () => {
    try {
      console.log('Fetching property details:', id);
      const response = await apiService.properties.getById(id);
      console.log('Property details response:', response.data);
      
      setProperty(response.data);
    } catch (error) {
      console.error('Property fetch error:', error);
      let errorMessage = 'An error occurred while loading property information.';
      
      if (error.response) {
        console.error('API response error:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchPropertyReports = async () => {
    try {
      console.log('Fetching reports for property:', id);
      const response = await apiService.reports.getByProperty(id);
      console.log('Reports response:', response.data);
      
      setReports(response.data);
    } catch (error) {
      console.error('Property reports fetch error:', error);
      let errorMessage = 'An error occurred while loading reports.';
      
      if (error.response) {
        console.error('API response error:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      }
      
      toast.error(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this property? This action cannot be undone and all associated reports will also be deleted.')) {
      try {
        console.log('Deleting property:', id);
        await apiService.properties.delete(id);
        console.log('Property deleted');
        
        toast.success('Property successfully deleted.');
        router.push('/properties');
      } catch (error) {
        console.error('Property delete error:', error);
        let errorMessage = 'An error occurred while deleting the property.';
        
        if (error.response) {
          console.error('API response error:', error.response.data);
          errorMessage = error.response.data.message || errorMessage;
        }
        
        toast.error(errorMessage);
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

  // Report type badge
  const getReportTypeBadge = (type) => {
    switch (type) {
      case 'move-in':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Pre-Move-In</span>;
      case 'move-out':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Post-Move-Out</span>;
      case 'general':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">General</span>;
      default:
        return null;
    }
  };

  if (loading || authLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Property Details</h1>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!property) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Property Not Found</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 mb-4">The requested property was not found or you don't have access to it.</p>
            <Link href="/properties" className="btn btn-primary">
              My Properties
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="mr-4 text-gray-600 hover:text-gray-900"
            aria-label="Back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold">Property Details</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">{property.address}</h2>
            <div>{getRoleBadge(property.role_at_this_property)}</div>
          </div>
          
          <p className="text-gray-700 mb-6">{property.description}</p>
          
          <div className="flex flex-wrap gap-2">
            <Link href={`/properties/${property.id}/edit`} className="btn btn-secondary">
              Edit
            </Link>
            <button onClick={handleDelete} className="btn bg-red-600 hover:bg-red-700 text-white">
              Delete
            </button>
            <Link href={`/reports/new?propertyId=${property.id}`} className="btn btn-primary">
              Create New Report
            </Link>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Reports</h2>
          
          {reports.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600 mb-4">No reports have been created for this property yet.</p>
              <Link href={`/reports/new?propertyId=${property.id}`} className="btn btn-primary">
                Create First Report
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{report.title}</h3>
                          <p className="text-gray-600 mt-1 text-sm">
                            {new Date(report.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                        <div>
                          {getReportTypeBadge(report.type)}
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mt-2 line-clamp-2">
                        {report.description || 'No description available.'}
                      </p>
                    </div>
                    
                    <div className="flex items-center mt-4 md:mt-0">
                      <Link href={`/reports/${report.id}`} className="btn btn-primary px-3 py-1 text-sm">
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
