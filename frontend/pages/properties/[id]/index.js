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
      
      // API URL'yi kontrol et
      const isProduction = typeof window !== 'undefined' ? window.location.hostname !== 'localhost' : process.env.NODE_ENV === 'production';
      console.log('Property Details - Environment:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');
      
      // ServiceWorker sorunlarını önlemek için doğrudan URL oluştur
      const apiUrl = isProduction ? 'https://api.depositshield.retako.com' : 'http://localhost:5050';
      console.log('Using API URL:', apiUrl);
      
      let response;
      try {
        // Önce normal yöntemi dene
        response = await apiService.properties.getById(id);
        console.log('Property details response:', response.data);
      } catch (mainError) {
        console.error('Standard API call failed:', mainError);
        
        // Alternatif yöntem: Doğrudan axios kullan
        try {
          const axios = (await import('axios')).default;
          const token = localStorage.getItem('token');
          
          const altResponse = await axios.get(`${apiUrl}/api/properties/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
          
          console.log('Alternative API call successful:', altResponse.data);
          response = altResponse;
        } catch (altError) {
          console.error('Alternative API call also failed:', altError);
          throw mainError; // Orijinal hatayı fırlat
        }
      }
      
      setProperty(response.data);

      // Backend'den property_details alanı gelmiyor olabilir,
      // localStorage'dan alıp kullanmayı deneyelim
      if (!response.data.property_details) {
        try {
          const existingDetailsStr = localStorage.getItem('propertyDetails');
          
          if (existingDetailsStr) {
            const existingDetails = JSON.parse(existingDetailsStr);
            
            if (existingDetails[id]) {
              console.log('Loading property details from localStorage for ID:', id);
              response.data.property_details = existingDetails[id];
            } else {
              console.log('No property details found in localStorage for ID:', id);
              response.data.property_details = {
                property_type: '',
                bedrooms: '',
                bathrooms: '',
                living_rooms: '',
                kitchen_count: '',
                square_footage: '',
                year_built: '',
                parking_spaces: '',
                deposit_amount: '',
                contract_start_date: '',
                contract_end_date: '',
                additional_spaces: {}
              };
            }
          } else {
            console.log('No property details found in localStorage');
            response.data.property_details = {
              property_type: '',
              bedrooms: '',
              bathrooms: '',
              living_rooms: '',
              kitchen_count: '',
              square_footage: '',
              year_built: '',
              parking_spaces: '',
              deposit_amount: '',
              contract_start_date: '',
              contract_end_date: '',
              additional_spaces: {}
            };
          }
        } catch (error) {
          console.error('Error loading property details from localStorage:', error);
          response.data.property_details = {
            property_type: '',
            bedrooms: '',
            bathrooms: '',
            living_rooms: '',
            kitchen_count: '',
            square_footage: '',
            year_built: '',
            parking_spaces: '',
            deposit_amount: '',
            contract_start_date: '',
            contract_end_date: '',
            additional_spaces: {}
          };
        }
      }
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
      
      // API URL'yi kontrol et
      const isProduction = typeof window !== 'undefined' ? window.location.hostname !== 'localhost' : process.env.NODE_ENV === 'production';
      console.log('Property Reports - Environment:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');
      
      // ServiceWorker sorunlarını önlemek için doğrudan URL oluştur
      const apiUrl = isProduction ? 'https://api.depositshield.retako.com' : 'http://localhost:5050';
      console.log('Using API URL:', apiUrl);
      
      try {
        // Önce normal yöntemi dene
        const response = await apiService.reports.getByProperty(id);
        console.log('Reports response:', response.data);
        setReports(response.data);
      } catch (mainError) {
        console.error('Standard API call failed:', mainError);
        
        // Alternatif yöntem: Doğrudan axios kullan
        try {
          const axios = (await import('axios')).default;
          const token = localStorage.getItem('token');
          
          const altResponse = await axios.get(`${apiUrl}/api/reports/property/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
          
          console.log('Alternative API call successful:', altResponse.data);
          setReports(altResponse.data);
        } catch (altError) {
          console.error('Alternative API call also failed:', altError);
          
          // Her ikisi de başarısız olursa boş dizi ile devam et
          setReports([]);
          throw mainError; // Orijinal hatayı fırlat (aşağıdaki catch bloğuna gidecek)
        }
      }
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
        
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="bg-indigo-50 p-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-indigo-700">{property.address}</h2>
              <div className="hidden">{getRoleBadge(property.role_at_this_property)}</div>
            </div>
            
            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-gray-700 font-medium mb-2">Description</h3>
                <p className="text-gray-700">{property.description}</p>
              </div>
              
              {/* Property Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-gray-700 font-medium mb-3">Property Details</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {property.property_details?.property_type && (
                    <div>
                      <span className="text-xs text-gray-500 block">Property Type:</span>
                      <span className="text-sm text-gray-800 capitalize">{property.property_details.property_type}</span>
                    </div>
                  )}
                  
                  {property.property_details?.bedrooms && (
                    <div>
                      <span className="text-xs text-gray-500 block">Bedrooms:</span>
                      <span className="text-sm text-gray-800">{property.property_details.bedrooms}</span>
                    </div>
                  )}
                  
                  {property.property_details?.bathrooms && (
                    <div>
                      <span className="text-xs text-gray-500 block">Bathrooms:</span>
                      <span className="text-sm text-gray-800">{property.property_details.bathrooms}</span>
                    </div>
                  )}
                  
                  {property.property_details?.living_rooms && (
                    <div>
                      <span className="text-xs text-gray-500 block">Living Rooms:</span>
                      <span className="text-sm text-gray-800">{property.property_details.living_rooms}</span>
                    </div>
                  )}
                  
                  {property.property_details?.kitchen_count && (
                    <div>
                      <span className="text-xs text-gray-500 block">Kitchen:</span>
                      <span className="text-sm text-gray-800">{property.property_details.kitchen_count}</span>
                    </div>
                  )}
                  
                  {property.property_details?.square_footage && (
                    <div>
                      <span className="text-xs text-gray-500 block">Square Footage:</span>
                      <span className="text-sm text-gray-800">{property.property_details.square_footage} sq ft</span>
                    </div>
                  )}
                  
                  {property.property_details?.year_built && (
                    <div>
                      <span className="text-xs text-gray-500 block">Year Built:</span>
                      <span className="text-sm text-gray-800">{property.property_details.year_built}</span>
                    </div>
                  )}
                  
                  {property.property_details?.parking_spaces && (
                    <div>
                      <span className="text-xs text-gray-500 block">Parking Spaces:</span>
                      <span className="text-sm text-gray-800">{property.property_details.parking_spaces}</span>
                    </div>
                  )}
                  
                  {property.property_details?.deposit_amount && (
                    <div>
                      <span className="text-xs text-gray-500 block">Deposit Amount:</span>
                      <span className="text-sm text-gray-800">${property.property_details.deposit_amount}</span>
                    </div>
                  )}
                  
                  {property.property_details?.contract_start_date && property.property_details?.contract_end_date && (
                    <div>
                      <span className="text-xs text-gray-500 block">Contract Dates:</span>
                      <span className="text-sm text-gray-800">{property.property_details.contract_start_date} to {property.property_details.contract_end_date}</span>
                    </div>
                  )}
                </div>
                
                {property.property_details?.additional_spaces && typeof property.property_details.additional_spaces === 'object' && Object.values(property.property_details.additional_spaces).some(v => v) && (
                  <div className="mt-4">
                    <span className="text-xs text-gray-500 block mb-1">Additional Spaces:</span>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(property.property_details.additional_spaces)
                        .filter(([_, value]) => value)
                        .map(([key]) => (
                          <span key={key} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full capitalize">{key}</span>
                        ))}
                    </div>
                  </div>
                )}
                
                {(!property.property_details || 
                  (!property.property_details.property_type &&
                   !property.property_details.bedrooms &&
                   !property.property_details.bathrooms &&
                   !property.property_details.living_rooms &&
                   !property.property_details.kitchen_count &&
                   !property.property_details.square_footage &&
                   !property.property_details.year_built &&
                   !property.property_details.parking_spaces &&
                   !property.property_details.deposit_amount &&
                   !property.property_details.contract_start_date &&
                   (!property.property_details.additional_spaces || 
                     Object.keys(property.property_details.additional_spaces).length === 0 || 
                     Object.values(property.property_details.additional_spaces).every(v => !v))
                  )) && (
                  <p className="text-sm text-gray-500 italic">No detailed information available. Update property details by clicking Edit Property button.</p>
                )}
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Link href={`/properties/${property.id}/edit`} className="btn btn-secondary hover:bg-gray-100 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit Property
                </Link>
                <button onClick={handleDelete} className="btn bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Property
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Reports</h2>
            <Link href={`/reports/new?propertyId=${property.id}`} className="btn btn-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Report
            </Link>
          </div>
          
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
