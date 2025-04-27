import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import { apiService } from '../../lib/api';

export default function NewReport() {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reportType, setReportType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [step, setStep] = useState(1);
  
  // For photo uploads
  const [photos, setPhotos] = useState({});
  const [previewPhotos, setPreviewPhotos] = useState({});
  const [photoNotes, setPhotoNotes] = useState({});
  const [tags, setTags] = useState({});
  const fileInputRefs = useRef({});
  const [propertyRooms, setPropertyRooms] = useState(null);
  const [selectedRoomType, setSelectedRoomType] = useState('');
  
  const router = useRouter();

  // Fetch properties and handle query parameters
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        console.log('Fetching all properties');
        const response = await apiService.properties.getAll();
        setProperties(response.data);
        
        // Check if there's a propertyId query parameter and set it as selected property
        if (router.query.propertyId) {
          console.log('Found propertyId in query params:', router.query.propertyId);
          setSelectedProperty(router.query.propertyId);
        }
        
        setLoadingProperties(false);
      } catch (error) {
        console.error('Properties fetch error:', error);
        toast.error('An error occurred while loading properties.');
        setLoadingProperties(false);
      }
    };

    if (router.isReady) {
      fetchProperties();
    }
  }, [router.isReady, router.query]);

  // Get property details when property is selected
  useEffect(() => {
    if (!selectedProperty) return;
    console.log('Selected property ID:', selectedProperty);
    
    const fetchPropertyDetails = async () => {
      try {
        console.log('Fetching property details for ID:', selectedProperty);
        const response = await apiService.properties.getById(selectedProperty);
        console.log('Property API Response:', response.data);
        let propertyData = response.data;
        
        // Try to get property details from localStorage if not available from API
        let propertyDetails = null;
        
        // Check if API returned property_details or bedrooms/bathrooms fields
        if (!propertyData.bedrooms && !propertyData.bathrooms && 
            !propertyData.living_rooms && !propertyData.kitchen_count) {
          
          console.log('Property details not available from API, checking localStorage');
          try {
            const existingDetailsStr = localStorage.getItem('propertyDetails');
            
            if (existingDetailsStr) {
              const existingDetails = JSON.parse(existingDetailsStr);
              
              if (existingDetails[selectedProperty]) {
                console.log('Found property details in localStorage:', existingDetails[selectedProperty]);
                propertyDetails = existingDetails[selectedProperty];
                
                // Add these properties to propertyData
                propertyData.bedrooms = propertyDetails.bedrooms;
                propertyData.bathrooms = propertyDetails.bathrooms;
                propertyData.living_rooms = propertyDetails.living_rooms;
                propertyData.kitchen_count = propertyDetails.kitchen_count;
                propertyData.additional_spaces = propertyDetails.additional_spaces;
              }
            }
          } catch (e) {
            console.error('Error loading property details from localStorage:', e);
          }
        }
        
        console.log('Final property data for room creation:', propertyData);
        
        // Initialize rooms structure
        const rooms = {};
        
        // Add bedrooms
        if (propertyData.bedrooms && propertyData.bedrooms !== '0') {
          console.log('Adding bedrooms:', propertyData.bedrooms);
          const bedroomCount = propertyData.bedrooms === '6+' ? 6 : parseInt(propertyData.bedrooms);
          for (let i = 1; i <= bedroomCount; i++) {
            rooms[`bedroom_${i}`] = `Bedroom ${i}`;
          }
        }
        
        // Add bathrooms
        if (propertyData.bathrooms) {
          console.log('Adding bathrooms:', propertyData.bathrooms);
          const bathroomCount = propertyData.bathrooms === '4+' ? 4 : 
                              propertyData.bathrooms.includes('.5') ? 
                              Math.floor(parseFloat(propertyData.bathrooms)) + 1 : 
                              parseInt(propertyData.bathrooms);
          
          for (let i = 1; i <= bathroomCount; i++) {
            rooms[`bathroom_${i}`] = `Bathroom ${i}`;
          }
        }
        
        // Add living rooms - check both living_rooms and livingRooms fields
        const livingRoomsValue = propertyData.living_rooms || propertyData.livingRooms;
        if (livingRoomsValue && livingRoomsValue !== '0') {
          console.log('Adding living rooms:', livingRoomsValue);
          const livingRoomCount = livingRoomsValue === '4+' ? 4 : parseInt(livingRoomsValue);
          for (let i = 1; i <= livingRoomCount; i++) {
            rooms[`livingroom_${i}`] = `Living Room ${i}`;
          }
        }
        
        // Add kitchen - check both kitchen_count and kitchenCount fields
        const kitchenValue = propertyData.kitchen_count || propertyData.kitchenCount;
        if (kitchenValue && kitchenValue !== '0') {
          console.log('Adding kitchens:', kitchenValue);
          const kitchenCount = kitchenValue === '4+' ? 4 : parseInt(kitchenValue);
          for (let i = 1; i <= kitchenCount; i++) {
            rooms[`kitchen_${i}`] = `Kitchen ${i}`;
          }
        }
        
        // Add additional spaces if checked
        if (propertyData.additional_spaces) {
          console.log('Adding additional spaces:', propertyData.additional_spaces);
          let additionalSpaces;
          try {
            additionalSpaces = typeof propertyData.additional_spaces === 'string' ? 
                                  JSON.parse(propertyData.additional_spaces) : 
                                  propertyData.additional_spaces;
            
            Object.entries(additionalSpaces).forEach(([key, value]) => {
              if (value) {
                rooms[key] = key.charAt(0).toUpperCase() + key.slice(1);
              }
            });
          } catch (e) {
            console.error('Error parsing additional spaces:', e);
          }
        }
        
        // If no rooms were found, add a default General room
        if (Object.keys(rooms).length === 0) {
          console.log('No rooms found, adding default room');
          rooms['general'] = 'General';
        }
        
        console.log('Final rooms structure:', rooms);
        
        // Initialize photo states for each room
        const initialPhotos = {};
        const initialPreviewPhotos = {};
        const initialPhotoNotes = {};
        const initialTags = {};
        
        Object.keys(rooms).forEach(roomKey => {
          initialPhotos[roomKey] = [];
          initialPreviewPhotos[roomKey] = [];
          initialPhotoNotes[roomKey] = {};
          initialTags[roomKey] = {};
        });
        
        // Set selected room type to the first room
        setSelectedRoomType(Object.keys(rooms)[0]);
        
        setPropertyRooms(rooms);
        setPhotos(initialPhotos);
        setPreviewPhotos(initialPreviewPhotos);
        setPhotoNotes(initialPhotoNotes);
        setTags(initialTags);
        
      } catch (error) {
        console.error('Error fetching property details:', error);
        toast.error('Failed to load property details.');
        
        // Create a default room in case of error
        const defaultRoom = { 'general': 'General' };
        setPropertyRooms(defaultRoom);
        setSelectedRoomType('general');
        setPhotos({ 'general': [] });
        setPreviewPhotos({ 'general': [] });
        setPhotoNotes({ 'general': {} });
        setTags({ 'general': {} });
      }
    };
    
    fetchPropertyDetails();
  }, [selectedProperty]);
  
  // Preview photos
  useEffect(() => {
    if (!propertyRooms) return;
    
    const newPreviewPhotos = {...previewPhotos};
    
    // Create cleanup URLs array
    const urlsToCleanup = [];
    
    Object.keys(propertyRooms).forEach(roomKey => {
      if (!photos[roomKey]?.length) {
        newPreviewPhotos[roomKey] = [];
        return;
      }
      
      newPreviewPhotos[roomKey] = [];
      
      for (let i = 0; i < photos[roomKey].length; i++) {
        const photo = photos[roomKey][i];
        const photoURL = URL.createObjectURL(photo);
        newPreviewPhotos[roomKey].push(photoURL);
        urlsToCleanup.push(photoURL);
      }
    });
    
    setPreviewPhotos(newPreviewPhotos);
    
    // Cleanup function
    return () => {
      urlsToCleanup.forEach(url => URL.revokeObjectURL(url));
    };
  }, [photos, propertyRooms]);

  const handlePhotoUpload = (e, roomKey) => {
    if (e.target.files && roomKey) {
      const selectedFiles = Array.from(e.target.files);
      
      // Get current photo count for this room
      const currentPhotoCount = photos[roomKey]?.length || 0;
      
      // Update photos for this room
      setPhotos(prevPhotos => ({
        ...prevPhotos,
        [roomKey]: [...(prevPhotos[roomKey] || []), ...selectedFiles]
      }));
      
      // Create empty notes and tags for new photos in this room
      const newNotes = { ...photoNotes[roomKey] };
      const newTags = { ...tags[roomKey] };
      
      selectedFiles.forEach((_, index) => {
        const photoId = currentPhotoCount + index;
        newNotes[photoId] = '';
        newTags[photoId] = [];
      });
      
      setPhotoNotes(prevNotes => ({
        ...prevNotes,
        [roomKey]: newNotes
      }));
      
      setTags(prevTags => ({
        ...prevTags,
        [roomKey]: newTags
      }));
    }
  };

  const removePhoto = (roomKey, index) => {
    // Update photos for this room
    setPhotos(prevPhotos => ({
      ...prevPhotos,
      [roomKey]: prevPhotos[roomKey].filter((_, i) => i !== index)
    }));
    
    // Update preview photos for this room
    setPreviewPhotos(prevPreviews => ({
      ...prevPreviews,
      [roomKey]: prevPreviews[roomKey].filter((_, i) => i !== index)
    }));
    
    // Update notes and tags for this room
    const newRoomNotes = { ...photoNotes[roomKey] };
    const newRoomTags = { ...tags[roomKey] };
    
    delete newRoomNotes[index];
    delete newRoomTags[index];
    
    // Update indices for all remaining photos in this room
    const updatedRoomNotes = {};
    const updatedRoomTags = {};
    
    let newIndex = 0;
    for (let i = 0; i < photos[roomKey].length; i++) {
      if (i !== index) {
        updatedRoomNotes[newIndex] = newRoomNotes[i];
        updatedRoomTags[newIndex] = newRoomTags[i];
        newIndex++;
      }
    }
    
    setPhotoNotes(prevNotes => ({
      ...prevNotes,
      [roomKey]: updatedRoomNotes
    }));
    
    setTags(prevTags => ({
      ...prevTags,
      [roomKey]: updatedRoomTags
    }));
  };

  const handleNoteChange = (roomKey, index, note) => {
    setPhotoNotes(prevNotes => ({
      ...prevNotes,
      [roomKey]: {
        ...prevNotes[roomKey],
        [index]: note
      }
    }));
  };

  const addTag = (roomKey, index, tag) => {
    if (!tag.trim()) return;
    
    setTags(prevTags => ({
      ...prevTags,
      [roomKey]: {
        ...prevTags[roomKey],
        [index]: [...(prevTags[roomKey][index] || []), tag.trim()]
      }
    }));
  };

  const removeTag = (roomKey, photoIndex, tagIndex) => {
    setTags(prevTags => ({
      ...prevTags,
      [roomKey]: {
        ...prevTags[roomKey],
        [photoIndex]: prevTags[roomKey][photoIndex].filter((_, i) => i !== tagIndex)
      }
    }));
  };

  const handleKeyPress = (e, roomKey, index) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      addTag(roomKey, index, e.target.value);
      e.target.value = '';
      e.preventDefault();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedProperty || !title || !reportType) {
      toast.error('Please fill in all required fields.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Önceki token kontrol kısmını kaldırıyoruz
      /*
      try {
        // Basit bir token check yap
        await apiService.auth.checkToken();
      } catch (tokenError) {
        console.error('Token check failed:', tokenError);
        toast.error('Your session has expired. Please log in again.');
        router.push('/login');
        return;
      }
      */
      
      // First create the report
      const reportData = {
        property_id: selectedProperty,
        title,
        description,
        type: reportType
      };
      
      console.log("Sending report creation request:", reportData);
      const response = await apiService.reports.create(reportData);
      console.log("Report creation response:", response.data);
      
      const reportId = response.data.id;
      
      // Check if there are photos in any room
      if (propertyRooms && Object.keys(propertyRooms).some(roomKey => photos[roomKey]?.length > 0)) {
        // Upload photos for each room
        for (const roomKey of Object.keys(propertyRooms)) {
          if (photos[roomKey]?.length > 0) {
            for (let i = 0; i < photos[roomKey].length; i++) {
              const formData = new FormData();
              formData.append('photo', photos[roomKey][i]);
              
              // Add room type as a tag
              const roomName = propertyRooms[roomKey];
              
              if (photoNotes[roomKey] && photoNotes[roomKey][i]) {
                formData.append('note', photoNotes[roomKey][i]);
              }
              
              // Create or update tags to include room type
              const photoTags = tags[roomKey] && tags[roomKey][i] ? [...tags[roomKey][i]] : [];
              
              // Add room name as a tag if it doesn't exist already
              if (!photoTags.includes(roomName)) {
                photoTags.push(roomName);
              }
              
              if (photoTags.length > 0) {
                formData.append('tags', JSON.stringify(photoTags));
              }
              
              console.log(`Uploading ${roomName} photo ${i+1}...`);
              await apiService.photos.upload(reportId, formData);
              console.log(`${roomName} photo ${i+1} uploaded.`);
            }
          }
        }
      }
      
      toast.success('Report created successfully.');
      router.push(`/reports/${reportId}`);
    } catch (error) {
      console.error('Report creation error:', error);
      let errorMessage = 'An error occurred while creating the report.';
      
      if (error.response) {
        console.error('API response error:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
        
        // 401 hatası için yönlendirme yap
        if (error.response.status === 401) {
          errorMessage = 'Your session has expired. Redirecting to login page...';
          setTimeout(() => {
            router.push('/login');
          }, 1500);
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };



  if (loadingProperties) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Create New Report</h1>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl animate-fadeIn">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-700 mb-2">Create New Report</h1>
          <p className="text-gray-600">Document the condition of your property</p>
        </div>
        
        {properties.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">You need to add a property first before creating a report</h2>
            <p className="text-gray-600 mb-6">
              Reports are used to document the condition of your properties. You need to add at least one property before continuing.
            </p>
            <button 
              onClick={() => router.push('/properties/new')}
              className="btn btn-primary hover:bg-indigo-500 transition-all duration-300"
            >
              Add Property
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            {/* Progress indicator */}
            <div className="bg-indigo-50 p-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}></div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span className="font-medium text-indigo-700">Step {step} of 3</span>
                <span>{step === 1 ? 'Basic Information' : step === 2 ? 'Photos' : 'Confirmation'}</span>
              </div>
            </div>
            
            <form onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()}>
              {step === 1 ? (
                <div className="p-6 space-y-6">
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="property" className="block text-sm font-medium text-gray-700 mb-2">
                        Select Property*
                      </label>
                      <select
                        id="property"
                        value={selectedProperty}
                        onChange={(e) => setSelectedProperty(e.target.value)}
                        className="input focus:border-indigo-500 transition-all duration-300"
                        required
                      >
                        <option value="">Select a property</option>
                        {properties.map((property) => (
                          <option key={property.id} value={property.id}>
                            {property.address}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                        Report Title*
                      </label>
                      <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="input focus:border-indigo-500 transition-all duration-300"
                        placeholder="Enter a short title for the report"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Report Description
                      </label>
                      <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="input focus:border-indigo-500 transition-all duration-300"
                        placeholder="General description about the report (optional)"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Report Type*
                      </label>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className={`p-4 rounded-lg border cursor-pointer text-center transition-all duration-300 ${
                          reportType === 'move-in' 
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50'
                        }`}
                        onClick={() => setReportType('move-in')}>
                          <input
                            id="type-move-in"
                            name="reportType"
                            type="radio"
                            value="move-in"
                            checked={reportType === 'move-in'}
                            onChange={() => setReportType('move-in')}
                            className="hidden"
                            required
                          />
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                          <label htmlFor="type-move-in" className="font-medium block">
                            Pre-Move-In
                          </label>
                        </div>
                        
                        <div className={`p-4 rounded-lg border cursor-pointer text-center transition-all duration-300 ${
                          reportType === 'move-out' 
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50'
                        }`}
                        onClick={() => setReportType('move-out')}>
                          <input
                            id="type-move-out"
                            name="reportType"
                            type="radio"
                            value="move-out"
                            checked={reportType === 'move-out'}
                            onChange={() => setReportType('move-out')}
                            className="hidden"
                          />
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <label htmlFor="type-move-out" className="font-medium block">
                            Post-Move-Out
                          </label>
                        </div>
                        
                        <div className={`p-4 rounded-lg border cursor-pointer text-center transition-all duration-300 ${
                          reportType === 'general' 
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50'
                        }`}
                        onClick={() => setReportType('general')}>
                          <input
                            id="type-general"
                            name="reportType"
                            type="radio"
                            value="general"
                            checked={reportType === 'general'}
                            onChange={() => setReportType('general')}
                            className="hidden"
                          />
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <label htmlFor="type-general" className="font-medium block">
                            General Observation
                          </label>
                        </div>
                      </div>
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
                        if (selectedProperty && title && reportType) {
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
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Upload Photos</h3>
                    <p className="text-gray-600 mb-6">Upload photos for each room to document the condition of your property</p>
                    
                    {propertyRooms ? (
                      <div className="space-y-8">
                        {/* Room selector as vertical list for mobile friendliness */}
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Select Room:</h4>
                          <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:gap-3">
                            {Object.entries(propertyRooms).map(([roomKey, roomName]) => (
                              <button
                                key={roomKey}
                                type="button"
                                onClick={() => setSelectedRoomType(roomKey)}
                                className={`flex items-center justify-between px-3 py-2 rounded-lg text-left w-full md:w-auto transition-all ${photos[roomKey]?.length > 0 
                                  ? 'bg-green-50 border border-green-200 text-green-700 font-medium' 
                                  : selectedRoomType === roomKey 
                                    ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 font-medium' 
                                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'}`}
                              >
                                <span className="whitespace-nowrap">{roomName}</span>
                                {photos[roomKey]?.length > 0 && (
                                  <span className="ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                                    {photos[roomKey].length}
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {selectedRoomType ? (
                          // Selected room photos
                          <div className="mt-6">
                            <h4 className="text-lg font-medium text-gray-800 mb-4">
                              {propertyRooms[selectedRoomType]} Photos
                            </h4>
                            
                            <div className="flex flex-wrap gap-6 mb-6">
                              {previewPhotos[selectedRoomType]?.map((preview, index) => (
                                <div key={index} className="relative bg-gray-50 p-4 rounded-lg border border-gray-200">
                                  <img 
                                    src={preview} 
                                    alt={`${propertyRooms[selectedRoomType]} Photo ${index + 1}`} 
                                    className="w-32 h-32 object-cover rounded-lg"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removePhoto(selectedRoomType, index)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md"
                                    aria-label="Remove photo"
                                  >
                                    ×
                                  </button>
                                  
                                  <div className="mt-3 w-32">
                                    <input
                                      type="text"
                                      placeholder="Add note"
                                      value={photoNotes[selectedRoomType] && photoNotes[selectedRoomType][index] || ''}
                                      onChange={(e) => handleNoteChange(selectedRoomType, index, e.target.value)}
                                      className="w-full text-xs p-2 border border-gray-300 rounded"
                                    />
                                    
                                    <div className="mt-2">
                                      <input
                                        type="text"
                                        placeholder="Add tag and press Enter"
                                        onKeyPress={(e) => handleKeyPress(e, selectedRoomType, index)}
                                        className="w-full text-xs p-2 border border-gray-300 rounded"
                                      />
                                      
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {tags[selectedRoomType] && tags[selectedRoomType][index]?.map((tag, tagIndex) => (
                                          <span
                                            key={tagIndex}
                                            className="inline-flex items-center text-xs bg-indigo-50 text-indigo-700 rounded px-1.5 py-0.5"
                                          >
                                            {tag}
                                            <button
                                              type="button"
                                              onClick={() => removeTag(selectedRoomType, index, tagIndex)}
                                              className="ml-1 text-gray-400 hover:text-gray-600"
                                            >
                                              ×
                                            </button>
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              
                              <div className="w-32 h-32 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition-all duration-300"
                                   onClick={() => fileInputRefs.current[selectedRoomType]?.click()}>
                                <div className="text-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                  <span className="text-xs text-gray-500 mt-2 block">Add Photo</span>
                                </div>
                              </div>
                              
                              <input
                                type="file"
                                ref={el => fileInputRefs.current[selectedRoomType] = el}
                                onChange={(e) => handlePhotoUpload(e, selectedRoomType)}
                                accept="image/*"
                                multiple
                                className="hidden"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <p className="text-gray-600">Please select a room to add photos</p>
                          </div>
                        )}
                        
                        {/* Photo summary */}
                        <div className="bg-gray-50 p-4 rounded-lg mt-6">
                          <h4 className="font-medium text-gray-700 mb-3">Photo Summary</h4>
                          <div className="grid gap-2">
                            {Object.entries(propertyRooms).map(([roomKey, roomName]) => (
                              <div key={roomKey} className="flex justify-between items-center">
                                <span className="text-sm">{roomName}:</span>
                                <span className="text-sm font-medium">
                                  {photos[roomKey]?.length || 0} photo{(photos[roomKey]?.length || 0) !== 1 ? 's' : ''}
                                </span>
                              </div>
                            ))}
                            <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between items-center">
                              <span className="text-sm font-medium">Total:</span>
                              <span className="text-sm font-medium">
                                {Object.values(photos).reduce((total, roomPhotos) => total + (roomPhotos?.length || 0), 0)} photos
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading property rooms...</p>
                      </div>
                    )}
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
                      <p className="text-green-700 text-xs mt-1">Please review your report details before saving</p>
                    </div>
                  </div>
                
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-700 mb-3">Report Information</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <span className="text-xs text-gray-500 block">Property:</span>
                          <p className="text-sm">{properties.find(p => p.id.toString() === selectedProperty.toString())?.address}</p>
                        </div>
                        
                        <div>
                          <span className="text-xs text-gray-500 block">Report Title:</span>
                          <p className="text-sm">{title}</p>
                        </div>
                        
                        <div>
                          <span className="text-xs text-gray-500 block">Report Type:</span>
                          <p className="text-sm">
                            {reportType === 'move-in' ? 'Pre-Move-In' : 
                             reportType === 'move-out' ? 'Post-Move-Out' : 'General Observation'}
                          </p>
                        </div>
                        
                        {description && (
                          <div>
                            <span className="text-xs text-gray-500 block">Description:</span>
                            <p className="text-sm">{description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-700 mb-3">Photos</h3>
                      
                      {propertyRooms && Object.values(photos).some(roomPhotos => roomPhotos?.length > 0) ? (
                        <div>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(propertyRooms).map(([roomKey, roomName]) => 
                              photos[roomKey]?.length > 0 && (
                                <div key={roomKey} className="mb-3">
                                  <p className="text-xs font-medium text-gray-600 mb-1">{roomName}:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {previewPhotos[roomKey]?.map((preview, index) => (
                                      <div key={index} className="relative">
                                        <img 
                                          src={preview} 
                                          alt={`${roomName} Photo ${index + 1}`} 
                                          className="w-12 h-12 object-cover rounded border border-gray-200"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-2 w-full">
                            {Object.values(photos).reduce((total, roomPhotos) => total + (roomPhotos?.length || 0), 0)} photo{Object.values(photos).reduce((total, roomPhotos) => total + (roomPhotos?.length || 0), 0) !== 1 ? 's' : ''} attached
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No photos attached</p>
                      )}
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
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </span>
                      ) : 'Create Report'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}
