import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import { apiService } from '../../lib/api';
import { useAuth } from '../../lib/auth';

export default function PhotoDetail() {
  const { user, loading: authLoading } = useAuth();
  const [photo, setPhoto] = useState(null);
  const [report, setReport] = useState(null);
  const [note, setNote] = useState('');
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  const imageRef = useRef(null);
  const [selectedArea, setSelectedArea] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (id) {
      fetchPhoto();
    }
  }, [id, user, authLoading, router]);

  const fetchPhoto = async () => {
    try {
      console.log('Fetching photo details:', id);
      const response = await apiService.photos.getById(id);
      console.log('Photo details response:', response.data);
      
      const photoData = response.data;
      setPhoto(photoData);
      setNote(photoData.note || '');
      setTags(photoData.tags || []);
      
      // Rapor bilgisini al
      if (photoData.report_id) {
        const reportResponse = await apiService.reports.getById(photoData.report_id);
        setReport(reportResponse.data);
      }
    } catch (error) {
      console.error('Photo fetch error:', error);
      let errorMessage = 'An error occurred while loading photo information.';
      
      if (error.response) {
        console.error('API response error:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleNoteChange = async () => {
    try {
      setIsSubmitting(true);
      console.log('Updating note:', note);
      const response = await apiService.photos.updateNote(id, note);
      console.log('Note update response:', response.data);
      
      toast.success('Note updated successfully.');
    } catch (error) {
      console.error('Note update error:', error);
      let errorMessage = 'An error occurred while updating the note.';
      
      if (error.response) {
        console.error('API yanıt hatası:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    
    try {
      setIsSubmitting(true);
      console.log('Adding tag:', newTag);
      const response = await apiService.photos.addTag(id, newTag);
      console.log('Add tag response:', response.data);
      
      // Update tags
      setTags(response.data.photo.tags || []);
      setNewTag('');
      setSelectedArea(null); // Reset selected area after adding tag
      
      toast.success('Tag added successfully.');
    } catch (error) {
      console.error('Tag add error:', error);
      let errorMessage = 'An error occurred while adding the tag.';
      
      if (error.response) {
        console.error('API yanıt hatası:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveTag = async (tag) => {
    try {
      setIsSubmitting(true);
      console.log('Removing tag:', tag);
      const response = await apiService.photos.removeTag(id, tag);
      console.log('Remove tag response:', response.data);
      
      // Update tags
      setTags(response.data.photo.tags || []);
      
      toast.success('Tag removed successfully.');
    } catch (error) {
      console.error('Tag remove error:', error);
      let errorMessage = 'An error occurred while removing the tag.';
      
      if (error.response) {
        console.error('API yanıt hatası:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageClick = (e) => {
    if (!imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element
    const y = e.clientY - rect.top;  // y position within the element
    
    // Calculate percentage for responsive positioning
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    
    setSelectedArea({ x: xPercent, y: yPercent });
    
    // Focus on the input field
    setTimeout(() => {
    const tagInput = document.getElementById('tag-input');
    if (tagInput) {
    tagInput.focus();
    }
    }, 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddTag();
    }
  };

  const handleDeletePhoto = async () => {
    if (confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
      try {
        console.log('Deleting photo:', id);
        await apiService.photos.delete(id);
        console.log('Photo deleted');
        
        toast.success('Photo deleted successfully.');
        
        // If coming from a report page, go back to report details
        if (report) {
          router.push(`/reports/${report.id}`);
        } else {
          router.push('/reports');
        }
      } catch (error) {
        console.error('Photo delete error:', error);
        let errorMessage = 'An error occurred while deleting the photo.';
        
        if (error.response) {
          console.error('API yanıt hatası:', error.response.data);
          errorMessage = error.response.data.message || errorMessage;
        }
        
        toast.error(errorMessage);
      }
    }
  };

  if (loading || authLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-4xl animate-fadeIn">
          <h1 className="text-2xl font-bold text-indigo-700 mb-6">Photo Details</h1>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!photo) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-4xl animate-fadeIn">
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
            <h1 className="text-2xl font-bold text-indigo-700">Photo Not Found</h1>
          </div>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 p-6 text-center">
            <div className="py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Photo Not Found</h3>
              <p className="text-gray-600 mb-6">The requested photo was not found or you don't have access to it.</p>
              <button onClick={() => router.back()} className="btn btn-primary hover:bg-indigo-500 transition-all duration-300">
                Go Back
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl animate-fadeIn">
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
          <h1 className="text-2xl font-bold text-indigo-700">Photo Details</h1>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 mb-6">
          {report && (
            <div className="bg-indigo-50 p-4">
              <p className="text-sm text-gray-700">
                Report: <Link href={`/reports/${report.id}`} className="text-indigo-700 hover:underline font-medium">{report.title}</Link>
              </p>
            </div>
          )}
          
          <div className="p-6">
            <div className="relative mb-6">
              <p className="text-sm text-gray-500 mb-2">
                Click on the photo to add tags
              </p>
              <div className="relative">
                <img 
                  ref={imageRef}
                  src={photo.url?.startsWith('http') ? photo.url : `https://apidepositshield.retako.com${photo.url}`} 
                  alt={photo.note || "Report photo"} 
                  className="w-full rounded-lg cursor-crosshair"
                  onClick={handleImageClick}
                  onError={(e) => {
                    console.error('Image loading error');
                    // Try alternative URLs
                    if (photo.url && !photo.url.startsWith('http')) {
                      e.target.src = `https://apidepositshield.retako.com/uploads/${photo.url.split('/').pop()}`;
                    } else {
                      e.target.src = '/images/placeholder-image.svg';
                    }
                  }}
                />
                
                {/* Tags on photo */}
                {tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="absolute bg-indigo-600 text-white text-xs px-2 py-1 rounded transform -translate-x-1/2 -translate-y-1/2 shadow-md"
                    style={{ 
                      left: `${(index % 5) * 20 + 10}%`, 
                      top: `${Math.floor(index / 5) * 20 + 10}%` 
                    }}
                  >
                    {tag}
                    <button 
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-white hover:text-gray-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
                
                {/* Tag input in selected area */}
                {selectedArea && (
                  <div 
                    className="absolute bg-white shadow-lg rounded-md p-2 z-10 transform -translate-x-1/2"
                    style={{ 
                      left: `${selectedArea.x}%`, 
                      top: `${selectedArea.y + 7}%` 
                    }}
                  >
                    <div className="flex">
                      <input
                        id="tag-input"
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Tag"
                        className="text-sm border border-gray-300 rounded-l-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <button
                        onClick={handleAddTag}
                        disabled={isSubmitting}
                        className="bg-indigo-600 text-white text-sm rounded-r-md px-2 py-1 hover:bg-indigo-500 transition-all duration-300"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                  Note
                </label>
                <div className="flex">
                  <textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    className="flex-grow input focus:border-indigo-500 transition-all duration-300 mr-2"
                    placeholder="Add a note about this photo"
                  />
                  <button
                    onClick={handleNoteChange}
                    disabled={isSubmitting}
                    className="btn btn-primary hover:bg-indigo-500 transition-all duration-300 h-10 self-start"
                  >
                    Save
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="bg-indigo-50 text-indigo-700 text-sm px-2 py-1 rounded-full inline-flex items-center"
                      >
                        {tag}
                        <button 
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-indigo-400 hover:text-indigo-600 transition-colors"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    
                    {tags.length === 0 && (
                      <p className="text-sm text-gray-500">No tags added yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                {new Date(photo.timestamp).toLocaleString('en-US')}
              </div>
              
              <button
                onClick={handleDeletePhoto}
                className="btn bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all duration-300 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Photo
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
