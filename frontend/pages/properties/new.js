import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import { apiService } from '../../lib/api';
import Image from 'next/image';

export default function NewProperty() {
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [livingRooms, setLivingRooms] = useState('');
  const [kitchenCount, setKitchenCount] = useState('');
  const [squareFootage, setSquareFootage] = useState('');
  const [yearBuilt, setYearBuilt] = useState('');
  const [parkingSpaces, setParkingSpaces] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [contractStartDate, setContractStartDate] = useState('');
  const [contractEndDate, setContractEndDate] = useState('');
  const [additionalSpaces, setAdditionalSpaces] = useState({
    balcony: false,
    patio: false,
    garden: false,
    garage: false,
    basement: false,
    attic: false,
    terrace: false,
    pool: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [allowSubmit, setAllowSubmit] = useState(false);
  const router = useRouter();

  // Prevent automatic submission
  useEffect(() => {
    // Only allow form submission when save button is pressed
    const handleBeforeUnload = (e) => {
      if (step === 3 && !allowSubmit) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [step, allowSubmit]);

  const handleSubmit = async (e) => {
    console.log('Form submission requested');
    e.preventDefault();

    // If form is submitted automatically without clicking the save button
    if (!allowSubmit) {
      console.log('Blocking automatic submission');
      return;
    }
    
    if (!address || !description || !propertyType) {
      toast.error('Please fill in all required fields.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Tüm gerekli alanları içeren property verilerini hazırla
      const propertyData = {
        address,
        description,
        role_at_this_property: 'other', // Backend sadece 'landlord', 'renter', 'other' değerlerini kabul ediyor
        deposit_amount: depositAmount,
        contract_start_date: contractStartDate,
        contract_end_date: contractEndDate,
        kitchen_count: kitchenCount,
        additional_spaces: JSON.stringify(additionalSpaces)
      };
      
      // Detaylı bilgileri konsolda görelim (debugging amaçlı)
      console.log('Property details sent to backend:', {
        property_type: propertyType,
        bedrooms: bedrooms || null,
        bathrooms: bathrooms || null,
        living_rooms: livingRooms || null,
        kitchen_count: kitchenCount || null,
        square_footage: squareFootage || null,
        year_built: yearBuilt || null,
        parking_spaces: parkingSpaces || null,
        deposit_amount: depositAmount || null,
        contract_start_date: contractStartDate || null,
        contract_end_date: contractEndDate || null,
        additional_spaces: additionalSpaces
      });
      
      console.log('Sending property creation request:', propertyData);
      
      const response = await apiService.properties.create(propertyData);
      
      console.log('Property creation response:', response.data);
      
      // Başarılı yanıtı göster
      toast.success('Property added successfully!');
      console.log('Successfully created property with ID:', response.data.id);
      
      // Property detaylarını localStorage'a da kaydet
      try {
        const propertyDetails = {
          property_type: propertyType,
          bedrooms: bedrooms || '',
          bathrooms: bathrooms || '',
          living_rooms: livingRooms || '',
          kitchen_count: kitchenCount || '',
          square_footage: squareFootage || '',
          year_built: yearBuilt || '',
          parking_spaces: parkingSpaces || '',
          deposit_amount: depositAmount || '',
          contract_start_date: contractStartDate || '',
          contract_end_date: contractEndDate || '',
          additional_spaces: additionalSpaces
        };
        
        const existingDetailsStr = localStorage.getItem('propertyDetails');
        const existingDetails = existingDetailsStr ? JSON.parse(existingDetailsStr) : {};
        
        existingDetails[response.data.id] = propertyDetails;
        localStorage.setItem('propertyDetails', JSON.stringify(existingDetails));
        console.log('Property details saved to localStorage for ID:', response.data.id);
      } catch (error) {
        console.error('Error saving property details to localStorage:', error);
      }
      
      // Başarılı kaydetme sonrası property detay sayfasına yönlendir
      setTimeout(() => {
        router.push(`/properties/${response.data.id}`);
      }, 1000); // Biraz bekleyerek toast mesajının görünmesini sağla
    } catch (error) {
      console.error('Property creation error:', error);
      console.error('Error full details:', JSON.stringify(error, null, 2));
      let errorMessage = 'An error occurred while adding the property.';
      
      if (error.response) {
        console.error('API response error:', error.response.data);
        console.error('API response status:', error.response.status);
        errorMessage = error.response.data.message || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      setAllowSubmit(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl animate-fadeIn">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-700 mb-2">Add New Property</h1>
          <p className="text-gray-600">Provide details about your property to get started</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          {/* Progress indicator */}
          <div className="bg-indigo-50 p-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span className="font-medium text-indigo-700">Step {step} of 3</span>
              <span>{step === 1 ? 'Basic Information' : step === 2 ? 'Property Details' : 'Confirmation'}</span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            {step === 1 ? (
              <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      Property Address* 
                    </label>
                    <input
                      id="address"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="input focus:border-indigo-500 transition-all duration-300"
                      placeholder="Enter full address"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">Include street number, name, city, state and zip code</p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Property Description*
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="input focus:border-indigo-500 transition-all duration-300"
                      placeholder="Enter general information about the property"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">Provide a general description of the property</p>
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-2">
                      Property Type*
                    </label>
                    <select
                      id="propertyType"
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="input focus:border-indigo-500 transition-all duration-300"
                      required
                    >
                      <option value="">Select a property type</option>
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="villa">Villa</option>
                      <option value="townhouse">Townhouse</option>
                      <option value="condo">Condominium</option>
                      <option value="studio">Studio</option>
                      <option value="duplex">Duplex</option>
                      <option value="commercial">Commercial Property</option>
                      <option value="other">Other</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">Select the type that best describes your property</p>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-between items-center border-t border-gray-100 mt-6">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="btn btn-secondary hover:bg-gray-100 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      if (address && description && propertyType) {
                        setStep(2);
                      } else {
                        toast.error('Please fill in all required fields.');
                      }
                    }}
                    className="btn btn-primary hover:bg-indigo-500 transition-all duration-300"
                  >
                    Continue
                  </button>
                </div>
              </div>
            ) : step === 2 ? (
              <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="col-span-1">
                    <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-2">
                      Bedrooms
                    </label>
                    <select
                      id="bedrooms"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      className="input focus:border-indigo-500 transition-all duration-300"
                    >
                      <option value="">Select</option>
                      <option value="0">Studio (0)</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6+">6+</option>
                    </select>
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-2">
                      Bathrooms
                    </label>
                    <select
                      id="bathrooms"
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value)}
                      className="input focus:border-indigo-500 transition-all duration-300"
                    >
                      <option value="">Select</option>
                      <option value="1">1</option>
                      <option value="1.5">1.5</option>
                      <option value="2">2</option>
                      <option value="2.5">2.5</option>
                      <option value="3">3</option>
                      <option value="3.5">3.5</option>
                      <option value="4+">4+</option>
                    </select>
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="livingRooms" className="block text-sm font-medium text-gray-700 mb-2">
                      Living Rooms
                    </label>
                    <select
                      id="livingRooms"
                      value={livingRooms}
                      onChange={(e) => setLivingRooms(e.target.value)}
                      className="input focus:border-indigo-500 transition-all duration-300"
                    >
                      <option value="">Select</option>
                      <option value="0">0</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4+">4+</option>
                    </select>
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="kitchenCount" className="block text-sm font-medium text-gray-700 mb-2">
                      Kitchen
                    </label>
                    <select
                      id="kitchenCount"
                      value={kitchenCount}
                      onChange={(e) => setKitchenCount(e.target.value)}
                      className="input focus:border-indigo-500 transition-all duration-300"
                    >
                      <option value="">Select</option>
                      <option value="0">0</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4+">4+</option>
                    </select>
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="squareFootage" className="block text-sm font-medium text-gray-700 mb-2">
                      Square Footage
                    </label>
                    <input
                      id="squareFootage"
                      type="number"
                      value={squareFootage}
                      onChange={(e) => setSquareFootage(e.target.value)}
                      className="input focus:border-indigo-500 transition-all duration-300"
                      placeholder="e.g. 1200"
                    />
                    <p className="mt-1 text-xs text-gray-500">In square feet</p>
                  </div>

                  <div className="col-span-1">
                    <label htmlFor="yearBuilt" className="block text-sm font-medium text-gray-700 mb-2">
                      Year Built
                    </label>
                    <input
                      id="yearBuilt"
                      type="number"
                      value={yearBuilt}
                      onChange={(e) => setYearBuilt(e.target.value)}
                      className="input focus:border-indigo-500 transition-all duration-300"
                      placeholder="e.g. 2005"
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="parkingSpaces" className="block text-sm font-medium text-gray-700 mb-2">
                      Parking Spaces
                    </label>
                    <select
                      id="parkingSpaces"
                      value={parkingSpaces}
                      onChange={(e) => setParkingSpaces(e.target.value)}
                      className="input focus:border-indigo-500 transition-all duration-300"
                    >
                      <option value="">Select</option>
                      <option value="0">0</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4+">4+</option>
                    </select>
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="depositAmount" className="block text-sm font-medium text-gray-700 mb-2">
                      Deposit Amount ($)
                    </label>
                    <div className="relative mt-1 rounded-md shadow-sm">
                      <input
                        id="depositAmount"
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="input focus:border-indigo-500 transition-all duration-300"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="col-span-1">
                    <label htmlFor="contractStartDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Contract Start Date
                    </label>
                    <input
                      id="contractStartDate"
                      type="date"
                      value={contractStartDate}
                      onChange={(e) => setContractStartDate(e.target.value)}
                      className="input focus:border-indigo-500 transition-all duration-300"
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="contractEndDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Contract End Date
                    </label>
                    <input
                      id="contractEndDate"
                      type="date"
                      value={contractEndDate}
                      onChange={(e) => setContractEndDate(e.target.value)}
                      className="input focus:border-indigo-500 transition-all duration-300"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Additional Spaces
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex items-center">
                      <input
                        id="balcony"
                        type="checkbox"
                        checked={additionalSpaces.balcony}
                        onChange={(e) => setAdditionalSpaces({...additionalSpaces, balcony: e.target.checked})}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="balcony" className="ml-2 text-sm text-gray-700">Balcony</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="patio"
                        type="checkbox"
                        checked={additionalSpaces.patio}
                        onChange={(e) => setAdditionalSpaces({...additionalSpaces, patio: e.target.checked})}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="patio" className="ml-2 text-sm text-gray-700">Patio</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="garden"
                        type="checkbox"
                        checked={additionalSpaces.garden}
                        onChange={(e) => setAdditionalSpaces({...additionalSpaces, garden: e.target.checked})}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="garden" className="ml-2 text-sm text-gray-700">Garden</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="garage"
                        type="checkbox"
                        checked={additionalSpaces.garage}
                        onChange={(e) => setAdditionalSpaces({...additionalSpaces, garage: e.target.checked})}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="garage" className="ml-2 text-sm text-gray-700">Garage</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="basement"
                        type="checkbox"
                        checked={additionalSpaces.basement}
                        onChange={(e) => setAdditionalSpaces({...additionalSpaces, basement: e.target.checked})}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="basement" className="ml-2 text-sm text-gray-700">Basement</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="attic"
                        type="checkbox"
                        checked={additionalSpaces.attic}
                        onChange={(e) => setAdditionalSpaces({...additionalSpaces, attic: e.target.checked})}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="attic" className="ml-2 text-sm text-gray-700">Attic</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="terrace"
                        type="checkbox"
                        checked={additionalSpaces.terrace}
                        onChange={(e) => setAdditionalSpaces({...additionalSpaces, terrace: e.target.checked})}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="terrace" className="ml-2 text-sm text-gray-700">Terrace</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="pool"
                        type="checkbox"
                        checked={additionalSpaces.pool}
                        onChange={(e) => setAdditionalSpaces({...additionalSpaces, pool: e.target.checked})}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="pool" className="ml-2 text-sm text-gray-700">Pool</label>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-between items-center border-t border-gray-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn btn-secondary hover:bg-gray-100 transition-all duration-300"
                  >
                    Back
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="btn btn-primary hover:bg-indigo-500 transition-all duration-300"
                  >
                    Continue
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="font-medium text-green-800 text-sm">Ready to Save</h3>
                    <p className="text-green-700 text-xs mt-1">Please review your property details before saving</p>
                  </div>
                </div>
              
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-700 mb-3">Basic Information</h3>
                    
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-gray-500">Address:</span>
                        <p className="text-sm">{address}</p>
                      </div>
                      
                      <div>
                        <span className="text-xs text-gray-500">Description:</span>
                        <p className="text-sm">{description}</p>
                      </div>
                      
                      <div>
                        <span className="text-xs text-gray-500">Property Type:</span>
                        <p className="text-sm capitalize">{propertyType}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-700 mb-3">Property Details</h3>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-xs text-gray-500">Bedrooms:</span>
                        <p className="text-sm">{bedrooms || 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <span className="text-xs text-gray-500">Bathrooms:</span>
                        <p className="text-sm">{bathrooms || 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <span className="text-xs text-gray-500">Living Rooms:</span>
                        <p className="text-sm">{livingRooms || 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <span className="text-xs text-gray-500">Kitchen:</span>
                        <p className="text-sm">{kitchenCount || 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <span className="text-xs text-gray-500">Square Footage:</span>
                        <p className="text-sm">{squareFootage ? `${squareFootage} sq ft` : 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <span className="text-xs text-gray-500">Year Built:</span>
                        <p className="text-sm">{yearBuilt || 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <span className="text-xs text-gray-500">Parking Spaces:</span>
                        <p className="text-sm">{parkingSpaces || 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <span className="text-xs text-gray-500">Deposit Amount:</span>
                        <p className="text-sm">{depositAmount ? `$${depositAmount}` : 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <span className="text-xs text-gray-500">Contract Dates:</span>
                        <p className="text-sm">{contractStartDate && contractEndDate ? `${contractStartDate} to ${contractEndDate}` : 'Not specified'}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <span className="text-xs text-gray-500">Additional Spaces:</span>
                      <div className="grid grid-cols-2 gap-1 mt-1">
                        {Object.entries(additionalSpaces).filter(([_, value]) => value).map(([key]) => (
                          <p key={key} className="text-sm capitalize">{key}</p>
                        ))}
                        {Object.values(additionalSpaces).every(v => !v) && <p className="text-sm">None selected</p>}
                      </div>
                    </div>
                  </div>
                </div>
              
                <div className="pt-4 flex justify-between items-center border-t border-gray-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn btn-secondary hover:bg-gray-100 transition-all duration-300"
                  >
                    Back
                  </button>
                  
                  <button
                    type="submit"
                    className="btn btn-primary hover:bg-indigo-500 transition-all duration-300"
                    disabled={isSubmitting}
                    onClick={() => setAllowSubmit(true)}
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
              </div>
            )}
          </form>
        </div>
      </div>
    </Layout>
  );
}