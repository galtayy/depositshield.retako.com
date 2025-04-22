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
  }, []);

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
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    try {
      // Request camera access via getUserMedia API
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Create video element
      const video = document.createElement('video');
      document.body.appendChild(video);
      video.srcObject = stream;
      video.play();
      
      // Show a capture button to the user
      const captureButton = document.createElement('button');
      captureButton.textContent = 'Take Photo';
      captureButton.className = 'btn btn-primary fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50';
      document.body.appendChild(captureButton);
      
      // Photo capture function
      return new Promise((resolve) => {
        captureButton.onclick = () => {
          // Create canvas and draw video frame
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.getContext('2d').drawImage(video, 0, 0);
          
          // Create blob from canvas
          canvas.toBlob((blob) => {
            // Stop stream and remove elements from DOM
            stream.getTracks().forEach(track => track.stop());
            video.remove();
            captureButton.remove();
            
            // Convert blob to File
            const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
            
            resolve(file);
          }, 'image/jpeg');
        };
      });
    } catch (error) {
      console.error('Camera access error:', error);
      toast.error('Could not access camera.');
      return null;
    }
  };

  const handleCameraCapture = async () => {
    const photo = await takePhoto();
    if (photo) {
      // CORRECTION: Getting current photo count from state
      const currentPhotoCount = photos.length;
      
      setPhotos(prevPhotos => [...prevPhotos, photo]);
      
      // Create note and tags for new photo
      setPhotoNotes({
        ...photoNotes,
        [currentPhotoCount]: ''
      });
      
      setTags({
        ...tags,
        [currentPhotoCount]: []
      });
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
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Create New Report</h1>
        
        {properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">You need to add a property first before creating a report</h2>
            <p className="text-gray-600 mb-6">
              Reports are used to document the condition of your properties. You need to add at least one property before continuing.
            </p>
            <button 
              onClick={() => router.push('/properties/new')}
              className="btn btn-primary"
            >
              Add Property
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="property" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Property*
                </label>
                <select
                  id="property"
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="input"
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
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Report Title*
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input"
                  placeholder="Enter a short title for the report"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Report Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="input"
                  placeholder="General description about the report (optional)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type*
                </label>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      id="type-move-in"
                      name="reportType"
                      type="radio"
                      value="move-in"
                      checked={reportType === 'move-in'}
                      onChange={() => setReportType('move-in')}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                      required
                    />
                    <label htmlFor="type-move-in" className="ml-3 block text-sm text-gray-700">
                      Pre-Move-In
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="type-move-out"
                      name="reportType"
                      type="radio"
                      value="move-out"
                      checked={reportType === 'move-out'}
                      onChange={() => setReportType('move-out')}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                    />
                    <label htmlFor="type-move-out" className="ml-3 block text-sm text-gray-700">
                      Post-Move-Out
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="type-general"
                      name="reportType"
                      type="radio"
                      value="general"
                      checked={reportType === 'general'}
                      onChange={() => setReportType('general')}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                    />
                    <label htmlFor="type-general" className="ml-3 block text-sm text-gray-700">
                      General Observation
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Photo Upload Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Photos</h3>
                
                <div className="flex flex-wrap gap-4 mb-6">
                  {previewPhotos.map((preview, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={preview} 
                        alt={`Photo ${index + 1}`} 
                        className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md"
                        aria-label="Remove photo"
                      >
                        ×
                      </button>
                      
                      <div className="mt-2 w-32">
                        <input
                          type="text"
                          placeholder="Add note"
                          value={photoNotes[index] || ''}
                          onChange={(e) => handleNoteChange(index, e.target.value)}
                          className="w-full text-xs p-1 border border-gray-300 rounded"
                        />
                        
                        <div className="mt-1">
                          <input
                            type="text"
                            placeholder="Add tag and press Enter"
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            className="w-full text-xs p-1 border border-gray-300 rounded"
                          />
                          
                          <div className="flex flex-wrap gap-1 mt-1">
                            {tags[index]?.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="inline-flex items-center text-xs bg-gray-100 rounded px-1.5 py-0.5"
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
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="btn btn-secondary"
                  >
                    Select Photos
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleCameraCapture}
                    className="btn btn-secondary"
                  >
                    Take Photo
                  </button>
                  
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
              
              <div className="flex justify-end space-x-3 pt-4 border-t">
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
                  ) : 'Create Report'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}
