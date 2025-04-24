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
  const [photos, setPhotos] = useState([]);
  const [previewPhotos, setPreviewPhotos] = useState([]);
  const [photoNotes, setPhotoNotes] = useState({});
  const [tags, setTags] = useState({});
  const fileInputRef = useRef(null);
  
  const router = useRouter();

  // Fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        // Bu token kontrolünü kaldırıyoruz çünkü sorun oluşturuyor
        // useAuth hook zaten oturum kontrolünü yapıyor
        /* 
        try {
          await apiService.auth.checkToken();
        } catch (tokenError) {
          console.error('Token check failed:', tokenError);
          toast.error('Please log in to create a report.');
          router.push('/login');
          return;
        }
        */
        
        const response = await apiService.properties.getAll();
        setProperties(response.data);
        setLoadingProperties(false);
      } catch (error) {
        console.error('Properties fetch error:', error);
        toast.error('An error occurred while loading properties.');
        setLoadingProperties(false);
      }
    };

    fetchProperties();
  }, [router]);

  // Preview photos
  useEffect(() => {
    if (!photos.length) {
      setPreviewPhotos([]);
      return;
    }

    const newPreviewPhotos = [];
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const photoURL = URL.createObjectURL(photo);
      newPreviewPhotos.push(photoURL);
    }

    setPreviewPhotos(newPreviewPhotos);

    // Cleanup function
    return () => {
      newPreviewPhotos.forEach(url => URL.revokeObjectURL(url));
    };
  }, [photos]);

  const handlePhotoUpload = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
      // CORRECTION: Getting current photo count from photos state
      const currentPhotoCount = photos.length;
      
      setPhotos(prevPhotos => [...prevPhotos, ...selectedFiles]);
      
      // Create empty notes and tags for new photos
      const newNotes = { ...photoNotes };
      const newTags = { ...tags };
      
      selectedFiles.forEach((_, index) => {
        const photoId = currentPhotoCount + index;
        newNotes[photoId] = '';
        newTags[photoId] = [];
      });
      
      setPhotoNotes(newNotes);
      setTags(newTags);
    }
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPreviewPhotos(previewPhotos.filter((_, i) => i !== index));
    
    // Update notes and tags
    const newNotes = { ...photoNotes };
    const newTags = { ...tags };
    
    delete newNotes[index];
    delete newTags[index];
    
    // Update indices for all remaining photos
    const updatedNotes = {};
    const updatedTags = {};
    
    let newIndex = 0;
    for (let i = 0; i < photos.length; i++) {
      if (i !== index) {
        updatedNotes[newIndex] = newNotes[i];
        updatedTags[newIndex] = newTags[i];
        newIndex++;
      }
    }
    
    setPhotoNotes(updatedNotes);
    setTags(updatedTags);
  };

  const handleNoteChange = (index, note) => {
    setPhotoNotes({
      ...photoNotes,
      [index]: note
    });
  };

  const addTag = (index, tag) => {
    if (!tag.trim()) return;
    
    setTags({
      ...tags,
      [index]: [...(tags[index] || []), tag.trim()]
    });
  };

  const removeTag = (photoIndex, tagIndex) => {
    setTags({
      ...tags,
      [photoIndex]: tags[photoIndex].filter((_, i) => i !== tagIndex)
    });
  };

  const handleKeyPress = (e, index) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      addTag(index, e.target.value);
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
      
      // Check if there are photos
      if (photos.length > 0) {
        // Upload photos
        for (let i = 0; i < photos.length; i++) {
          const formData = new FormData();
          formData.append('photo', photos[i]);
          
          if (photoNotes[i]) {
            formData.append('note', photoNotes[i]);
          }
          
          if (tags[i] && tags[i].length > 0) {
            formData.append('tags', JSON.stringify(tags[i]));
          }
          
          console.log(`Uploading photo ${i+1}...`);
          await apiService.photos.upload(reportId, formData);
          console.log(`Photo ${i+1} uploaded.`);
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
                    <p className="text-gray-600 mb-6">Upload photos to document the condition of your property</p>
                    
                    <div className="flex flex-wrap gap-6 mb-6">
                      {previewPhotos.map((preview, index) => (
                        <div key={index} className="relative bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <img 
                            src={preview} 
                            alt={`Photo ${index + 1}`} 
                            className="w-32 h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md"
                            aria-label="Remove photo"
                          >
                            ×
                          </button>
                          
                          <div className="mt-3 w-32">
                            <input
                              type="text"
                              placeholder="Add note"
                              value={photoNotes[index] || ''}
                              onChange={(e) => handleNoteChange(index, e.target.value)}
                              className="w-full text-xs p-2 border border-gray-300 rounded"
                            />
                            
                            <div className="mt-2">
                              <input
                                type="text"
                                placeholder="Add tag and press Enter"
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                className="w-full text-xs p-2 border border-gray-300 rounded"
                              />
                              
                              <div className="flex flex-wrap gap-1 mt-2">
                                {tags[index]?.map((tag, tagIndex) => (
                                  <span
                                    key={tagIndex}
                                    className="inline-flex items-center text-xs bg-indigo-50 text-indigo-700 rounded px-1.5 py-0.5"
                                  >
                                    {tag}
                                    <button
                                      type="button"
                                      onClick={() => removeTag(index, tagIndex)}
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
                           onClick={() => fileInputRef.current.click()}>
                        <div className="text-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span className="text-xs text-gray-500 mt-2 block">Add Photo</span>
                        </div>
                      </div>
                      
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handlePhotoUpload}
                        accept="image/*"
                        multiple
                        className="hidden"
                      />
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
                      
                      {photos.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {previewPhotos.map((preview, index) => (
                            <div key={index} className="relative">
                              <img 
                                src={preview} 
                                alt={`Photo ${index + 1}`} 
                                className="w-16 h-16 object-cover rounded border border-gray-200"
                              />
                            </div>
                          ))}
                          <div className="text-xs text-gray-500 mt-2 w-full">
                            {photos.length} photo{photos.length !== 1 ? 's' : ''} attached
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
