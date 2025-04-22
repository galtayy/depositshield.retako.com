import { useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import { apiService } from '../../lib/api';

export default function NewProperty() {
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [role, setRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!address || !description || !role) {
      toast.error('Please fill in all fields.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const propertyData = {
        address,
        description,
        role_at_this_property: role
      };
      
      console.log('Sending property creation request:', propertyData);
      
      const response = await apiService.properties.create(propertyData);
      
      console.log('Property creation response:', response.data);
      
      toast.success('Property added successfully.');
      router.push(`/properties/${response.data.id}`);
    } catch (error) {
      console.error('Property creation error:', error);
      let errorMessage = 'An error occurred while adding the property.';
      
      if (error.response) {
        console.error('API response error:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Add New Property</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Property Address*
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input"
                placeholder="Enter full address"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Property Description*
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="input"
                placeholder="Enter detailed information about the property (unit number, floor, square footage, etc.)"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What is your role at this property?*
              </label>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    id="role-landlord"
                    name="role"
                    type="radio"
                    value="landlord"
                    checked={role === 'landlord'}
                    onChange={() => setRole('landlord')}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                    required
                  />
                  <label htmlFor="role-landlord" className="ml-3 block text-sm text-gray-700">
                    I am the landlord
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="role-renter"
                    name="role"
                    type="radio"
                    value="renter"
                    checked={role === 'renter'}
                    onChange={() => setRole('renter')}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <label htmlFor="role-renter" className="ml-3 block text-sm text-gray-700">
                    I am a tenant
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="role-other"
                    name="role"
                    type="radio"
                    value="other"
                    checked={role === 'other'}
                    onChange={() => setRole('other')}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <label htmlFor="role-other" className="ml-3 block text-sm text-gray-700">
                    Other
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : 'Save Property'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
