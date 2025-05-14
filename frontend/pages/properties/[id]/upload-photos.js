import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../../../lib/auth';
import { apiService } from '../../../lib/api';

// Icons
const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19.9201L8.47997 13.4001C7.70997 12.6301 7.70997 11.3701 8.47997 10.6001L15 4.08008" 
      stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Orijinal camera icon
const CameraIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.76 22H17.24C20 22 21.1 20.31 21.23 18.25L21.75 9.99C21.89 7.83 20.17 6 18 6C17.39 6 16.83 5.65 16.55 5.11L15.83 3.66C15.37 2.75 14.17 2 13.15 2H10.86C9.83 2 8.63 2.75 8.17 3.66L7.45 5.11C7.17 5.65 6.61 6 6 6C3.83 6 2.11 7.83 2.25 9.99L2.77 18.25C2.89 20.31 4 22 6.76 22Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.5 8H13.5" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 18C13.79 18 15.25 16.54 15.25 14.75C15.25 12.96 13.79 11.5 12 11.5C10.21 11.5 8.75 12.96 8.75 14.75C8.75 16.54 10.21 18 12 18Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Kullanılabilecek galeri ikonu
const GalleryIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 10C10.1046 10 11 9.10457 11 8C11 6.89543 10.1046 6 9 6C7.89543 6 7 6.89543 7 8C7 9.10457 7.89543 10 9 10Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.67 18.95L7.6 15.64C8.39 15.11 9.53 15.17 10.24 15.78L10.57 16.07C11.35 16.74 12.61 16.74 13.39 16.07L17.55 12.5C18.33 11.83 19.59 11.83 20.37 12.5L22 13.9" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const InfoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 18.3334C14.5834 18.3334 18.3334 14.5834 18.3334 10.0001C18.3334 5.41675 14.5834 1.66675 10 1.66675C5.41669 1.66675 1.66669 5.41675 1.66669 10.0001C1.66669 14.5834 5.41669 18.3334 10 18.3334Z" stroke="#1C2C40" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 6.66675V10.8334" stroke="#1C2C40" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.99579 13.3333H10.0041" stroke="#2E3642" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
);

// Bottom sheet component for photo selection
const PhotoOptionBottomSheet = ({ show, onClose, onTakePhoto, onChooseFromGallery }) => {
  // Animation states
  const [animationClass, setAnimationClass] = useState('');
  
  // Handle animation timing
  useEffect(() => {
    let animationTimeout;
    if (show) {
      // Small delay to let the component render first, then add the visible class
      animationTimeout = setTimeout(() => {
        setAnimationClass('visible');
      }, 10);
    } else {
      setAnimationClass('');
    }
    
    return () => {
      if (animationTimeout) clearTimeout(animationTimeout);
    };
  }, [show]);
  
  // Handle selection with animation
  const handlePhotoOption = (callback) => {
    setAnimationClass('');
    // Wait for animation to finish before selecting
    setTimeout(() => {
      callback();
    }, 300);
  };
  
  // Handle close with animation
  const handleClose = () => {
    setAnimationClass('');
    // Wait for animation to finish before closing
    setTimeout(() => {
      onClose();
    }, 300);
  };
  
  if (!show && !animationClass) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay with fade animation */}
      <div 
        className={`absolute inset-0 bg-black bg-opacity-50 bottom-sheet-overlay ${animationClass}`}
        onClick={handleClose}
      ></div>
      
      {/* Bottom Sheet */}
      <div className={`absolute bottom-0 left-0 right-0 w-full h-[217px] bg-white rounded-t-[24px] overflow-hidden bottom-sheet ${animationClass} safe-area-bottom`}>
        {/* Handle Bar */}
        <div className="flex justify-center items-center pt-[10px] pb-0">
          <div className="w-[95px] h-[6px] bg-[#ECECEC] rounded-[24px]"></div>
        </div>
        
        {/* Title */}
        <div className="flex justify-center items-center h-[55px]">
          <h3 className="font-bold text-[18px] leading-[25px] text-[#0B1420]">
            Add a Photo
          </h3>
        </div>
        
        {/* Photo Options */}
        <div className="w-full max-w-[350px] mx-auto">
          {/* Take a Photo Option */}
          <div 
            className="flex flex-row items-center h-[56px] border-b border-[#ECF0F5] px-5 py-[16px]"
            onClick={() => handlePhotoOption(onTakePhoto)}
          >
            <div className="flex flex-row items-center gap-[12px]">
              <CameraIcon />
              <div className="font-bold text-[14px] leading-[19px] text-[#0B1420]">
                Take a Photo
              </div>
            </div>
          </div>
          
          {/* Choose From Gallery Option */}
          <div 
            className="flex flex-row items-center h-[56px] px-5 py-[16px]"
            onClick={() => handlePhotoOption(onChooseFromGallery)}
          >
            <div className="flex flex-row items-center gap-[12px]">
              <GalleryIcon />
              <div className="font-bold text-[14px] leading-[19px] text-[#0B1420]">
                Choose From Gallery
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function UploadPhotos() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id, roomName, roomType, roomId } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const [photos, setPhotos] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);  // Store existing photos from server
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [roomQuality, setRoomQuality] = useState(null); // null, 'good', or 'attention'
  const [roomIssueNote, setRoomIssueNote] = useState('');
  const [roomIssueNotes, setRoomIssueNotes] = useState([]);
  const [showIssueInput, setShowIssueInput] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/welcome');
    }
  }, [user, loading, router]);
  
  // Ensure we have ID parameter before attempting any navigation
  useEffect(() => {
    if (!id && !loading) {
      console.error('Missing ID parameter');
      // Redirect to a safe page if ID is missing
      router.push('/properties');
    }
  }, [id, router, loading]);

  // Load existing photos and room data when component mounts
  useEffect(() => {
    if (id && roomId) {
      const loadRoomData = async () => {
        try {
          setIsLoading(true);
          
          console.log(`[DEBUG] Loading room data for propertyId=${id}, roomId=${roomId}`);
          
          // Load existing photos from database
          const photosResponse = await apiService.photos.getByRoom(id, roomId);
          console.log(`[DEBUG] Room photos loaded from database:`, photosResponse.data);
          
          if (photosResponse.data && Array.isArray(photosResponse.data)) {
            setExistingPhotos(photosResponse.data.map(photo => ({
              id: photo.id,
              src: `${apiService.getBaseUrl()}${photo.url}`,
              url: photo.url,
              file_path: photo.file_path,
              note: photo.note || '',
              isExisting: true  // Flag to indicate this is from the server
            })));
          }
          
          // Load room data from DB
          try {
            const roomsResponse = await apiService.properties.getRooms(id);
            console.log(`[DEBUG] All rooms data loaded from database:`, roomsResponse.data);
            
            if (roomsResponse.data && Array.isArray(roomsResponse.data)) {
              // Find this specific room
              const roomData = roomsResponse.data.find(r => r.roomId === roomId);
              console.log(`[DEBUG] Room data for roomId=${roomId}:`, roomData);
              
              if (roomData) {
                // Set room quality if it exists
                if (roomData.roomQuality) {
                  setRoomQuality(roomData.roomQuality);
                  if (roomData.roomQuality === 'attention') {
                    setShowIssueInput(true);
                  }
                }
                
                // Set room issue notes if they exist
                if (roomData.roomIssueNotes && Array.isArray(roomData.roomIssueNotes)) {
                  setRoomIssueNotes(roomData.roomIssueNotes);
                }
              }
            }
          } catch (roomError) {
            console.error(`[ERROR] Failed to load room data:`, roomError);
          }
          
          setIsLoading(false);
        } catch (error) {
          console.error(`[ERROR] Failed to load room photos:`, error);
          setIsLoading(false);
        }
      };
      
      loadRoomData();
    } else {
      setIsLoading(false);
    }
  }, [id, roomId]);

  const handleUploadButtonClick = () => {
    setShowPhotoOptions(true);
  };

  const handleTakePhoto = () => {
    try {
      // First check if the device has a camera available
      if (navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Create a file input element programmatically
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.capture = 'environment'; // Prefer the back camera
        
        // Listen for the change event on the file input
        fileInput.onchange = (event) => {
          const file = event.target.files[0];
          if (file) {
            // Process the image file
            
            // Store file object for upload and create preview
            setPhotos(prevPhotos => [...prevPhotos, {
              id: `new_${Date.now()}`,
              src: URL.createObjectURL(file),
              file: file,  // Keep the actual file object for upload
              name: file.name,
              isNew: true  // Flag to indicate this is a new photo
            }]);
          }
        };
        
        // Trigger the file input click event to open the camera
        fileInput.click();
      } else {
        // Fallback if camera is not available
        console.error('Camera not available on this device');
      }
    } catch (error) {
      console.error('[ERROR] Error accessing camera:', error);
    }
    
    setShowPhotoOptions(false);
  };

  const handleChooseFromGallery = () => {
    try {
      // Create a file input element programmatically
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.multiple = true; // Allow selecting multiple images
      
      // Listen for the change event on the file input
      fileInput.onchange = (event) => {
        const files = event.target.files;
        if (files && files.length > 0) {
          // Process the selected image files
          const newPhotos = Array.from(files).map(file => ({
            id: `new_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            src: URL.createObjectURL(file),
            file: file,  // Keep the actual file object for upload
            name: file.name,
            isNew: true  // Flag to indicate this is a new photo
          }));
          
          // Add the new photos to the existing photos array
          setPhotos(prevPhotos => [...prevPhotos, ...newPhotos]);
        }
      };
      
      // Trigger the file input click event to open the gallery
      fileInput.click();
    } catch (error) {
      console.error('[ERROR] Error accessing gallery:', error);
    }
    
    setShowPhotoOptions(false);
  };

  const handleDeletePhoto = (index, isExisting) => {
    if (isExisting) {
      // For existing photos, remove from existingPhotos array
      setExistingPhotos(prevPhotos => {
        const newPhotos = [...prevPhotos];
        newPhotos.splice(index, 1);
        return newPhotos;
      });
    } else {
      // For new photos, remove from photos array
      setPhotos(prevPhotos => {
        const newPhotos = [...prevPhotos];
        newPhotos.splice(index, 1);
        return newPhotos;
      });
    }
  };

  const handleContinue = async () => {
    try {
      // Check if ID and roomId are available
      if (!id || !roomId) {
        return;
      }
      
      // Get the total photo count (existing + new)
      const totalPhotoCount = existingPhotos.length + photos.length;
      
      // Check if photos are added
      if (totalPhotoCount === 0) {
        return;
      }
      
      // Check if room quality is selected
      if (totalPhotoCount > 0 && !roomQuality) {
        return;
      }
      
      // Check if room quality is "needs attention" and at least one note is required
      if (roomQuality === 'attention' && roomIssueNotes.length === 0 && !roomIssueNote.trim()) {
        return;
      }
      
      // If there's an unsaved note but user clicks continue, add it to notes
      let finalNotes = [...roomIssueNotes];
      if (roomQuality === 'attention' && roomIssueNote.trim()) {
        finalNotes.push(roomIssueNote);
      }
      
      // Start submitting
      setIsSubmitting(true);
      
      // Prepare room data for database
      const roomData = {
        roomName: roomName || 'Unnamed Room',
        roomType: roomType || 'other',
        roomId: roomId,
        roomQuality: roomQuality,
        roomIssueNotes: roomQuality === 'attention' ? finalNotes : [],
        photoCount: totalPhotoCount,
        timestamp: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      console.log('[DEBUG] Room data with detailed quality:', {
        roomName: roomName || 'Unnamed Room',
        roomType: roomType || 'other',
        roomId: roomId,
        roomQuality: roomQuality,
        roomQualityType: typeof roomQuality,
        photoCount: totalPhotoCount,
        photoCountType: typeof totalPhotoCount,
        notesCount: roomQuality === 'attention' ? finalNotes.length : 0
      });
      
      console.log('[DEBUG] Room data to save:', roomData);
      
      // First, load all existing rooms from database
      try {
        const roomsResponse = await apiService.properties.getRooms(id);
        console.log('[DEBUG] Existing rooms from database:', roomsResponse.data);
        
        let allRooms = [];
        if (roomsResponse.data && Array.isArray(roomsResponse.data)) {
          allRooms = [...roomsResponse.data];
        }
        
        // Check if this room already exists in the database
        const existingRoomIndex = allRooms.findIndex(r => r.roomId === roomId);
        
        if (existingRoomIndex >= 0) {
          // Update existing room
          console.log('[DEBUG] Updating existing room at index:', existingRoomIndex);
          allRooms[existingRoomIndex] = {
            ...allRooms[existingRoomIndex],
            ...roomData
          };
        } else {
          // Add new room
          console.log('[DEBUG] Adding new room');
          allRooms.push(roomData);
        }
        
        // Save updated rooms to database
        await apiService.properties.saveRooms(id, allRooms);
        console.log('[DEBUG] Rooms saved to database');
      } catch (roomError) {
        console.error('[ERROR] Failed to save room data:', roomError);
      }
      
      // Handle existing photos that were deleted (not implemented yet)
      // This would require a DELETE API call for each deleted existing photo
      
      // Upload new photos to server (existing photos are already on the server)
      if (photos.length > 0) {
        console.log('[DEBUG] Uploading', photos.length, 'photos to server');
        
        // Upload each photo
        for (let i = 0; i < photos.length; i++) {
          const photo = photos[i];
          console.log(`[DEBUG] Uploading photo ${i+1}/${photos.length}`);
          
          try {
            // Create form data with the actual file
            const formData = new FormData();
            if (photo.file) {
              formData.append('photo', photo.file, photo.name || `photo_${Date.now()}_${i}.jpg`);
            } else {
              // If we don't have a file (unlikely), try to get one from the data URL
              const response = await fetch(photo.src);
              const blob = await response.blob();
              formData.append('photo', blob, photo.name || `photo_${Date.now()}_${i}.jpg`);
            }
            
            formData.append('note', photo.note || '');
            formData.append('property_id', id);
            formData.append('room_id', roomId);
            
            // Upload photo
            await apiService.photos.uploadForRoom(id, roomId, formData);
            console.log(`[DEBUG] Photo ${i+1} uploaded successfully`);
          } catch (uploadError) {
            console.error(`[ERROR] Failed to upload photo ${i+1}:`, uploadError);
          }
        }
      }
      
      // Navigate back to property details page
      console.log('[DEBUG] Room saved successfully, preparing to navigate back');
      
      // Add a small delay before navigation
      setTimeout(() => {
        try {
          if (id) {
            // Add timestamp to prevent cache issues
            const timestamp = new Date().getTime();
            router.push(`/properties/${id}?t=${timestamp}`);
          } else {
            console.error('[ERROR] Missing ID for navigation');
            router.push('/properties');
          }
        } catch (navError) {
          console.error('[ERROR] Router push failed, using location.href as fallback:', navError);
          if (id) {
            window.location.href = `/properties/${id}?t=${new Date().getTime()}`;
          } else {
            window.location.href = '/properties';
          }
        }
      }, 300);
    } catch (error) {
      console.error('[ERROR] Error saving room data:', error);
      console.error('[ERROR] Error details:', error.message);
      console.error('[ERROR] Error stack:', error.stack);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#FBF5DA]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C2C40]"></div>
        <div className="mt-4 text-[#1C2C40] text-lg">Loading photos...</div>
      </div>
    );
  }

  // Combine existing and new photos for display
  const allPhotos = [...existingPhotos, ...photos];

  return (
    <div className="relative w-[100%] min-h-[100vh] bg-[#FBF5DA] font-['Nunito'] overflow-hidden">
      {/* Meta tags for better PWA experience */}
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#FBF5DA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <link rel="manifest" href="/manifest.json" />
        <style jsx global>{`
          body {
            background-color: #FBF5DA;
            margin: 0;
            padding: 0;
            font-family: 'Nunito', sans-serif;
            min-height: 100vh;
            height: 100%;
            width: 100%;
            overflow-x: hidden;
          }
          
          .safe-area-top {
            padding-top: env(safe-area-inset-top, 40px);
          }
          
          .safe-area-bottom {
            padding-bottom: env(safe-area-inset-bottom, 20px);
          }
          
          .safe-area-inset-left {
            padding-left: env(safe-area-inset-left, 0px);
          }
          
          .safe-area-inset-right {
            padding-right: env(safe-area-inset-right, 0px);
          }
          
          /* iPhone X and newer notch handling */
          @supports (padding: max(0px)) {
            .safe-area-top {
              padding-top: max(env(safe-area-inset-top), 40px);
            }
            .safe-area-bottom {
              padding-bottom: max(env(safe-area-inset-bottom), 20px);
            }
            .safe-area-inset-left {
              padding-left: max(env(safe-area-inset-left), 0px);
            }
            .safe-area-inset-right {
              padding-right: max(env(safe-area-inset-right), 0px);
            }
          }
          
          /* Bottom sheet animations */
          .bottom-sheet {
            transform: translateY(100%);
            transition: transform 0.3s ease-out;
          }
          
          .bottom-sheet.visible {
            transform: translateY(0);
          }
          
          .bottom-sheet-overlay {
            opacity: 0;
            transition: opacity 0.3s ease-out;
          }
          
          .bottom-sheet-overlay.visible {
            opacity: 1;
          }
          
          /* Responsive adjustments */
          @media (max-width: 375px) {
            .grid-cols-4 {
              grid-template-columns: repeat(3, minmax(0, 1fr));
            }
          }
          
          /* Landscape orientation */
          @media screen and (orientation: landscape) {
            .fixed {
              position: absolute;
            }
          }
        `}</style>
      </Head>
      
      {/* Status Bar Space */}
      <div className="w-full h-[40px] safe-area-top"></div>
      
      {/* Header */}
      <div className="w-full h-[65px] flex flex-col">
        <div className="flex flex-row justify-center items-center w-full h-[65px] px-[10px] py-[20px] relative">
          <button
            className="absolute left-[20px] top-[50%] transform -translate-y-1/2 z-[2] flex justify-center items-center w-[44px] h-[44px]"
            onClick={(e) => {
              e.preventDefault();
              if (id) {
                router.push(`/properties/${id}`);
              } else {
                router.push('/');
              }
            }}
            aria-label="Go back"
          >
            <ArrowLeftIcon />
          </button>
          <h1 className="w-full max-w-[270px] font-semibold text-[18px] leading-[25px] text-center text-[#0B1420]">
            Upload Photos
          </h1>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="fixed left-0 right-0 w-full px-5 bg-[#FBF5DA]" style={{top: '105px', zIndex: 10}}>
        <div className="w-full max-w-[350px] mx-auto safe-area-inset-left safe-area-inset-right">
          <h2 className="font-bold text-[16px] sm:text-[18px] leading-[22px] text-[#0B1420]">
            Let's document "{roomName || 'Room'}" 📷
          </h2>
          <p className="font-normal text-[14px] leading-[19px] text-[#515964] mt-1">
            Capture the condition of this room so you're protected later
          </p>
        </div>
      </div>
      
      {/* Main Content Container - Scrollable */}
      <div className="fixed left-0 right-0 w-full px-5 bg-[#FBF5DA] overflow-y-auto overflow-x-hidden" 
           style={{top: '180px', bottom: '84px', paddingBottom: '20px'}}>
        <div className="w-full max-w-[350px] mx-auto safe-area-inset-left safe-area-inset-right">
          {/* Upload Button - Always show */}
          <button 
            onClick={handleUploadButtonClick}
            className="w-full h-[120px] flex flex-col justify-center items-center bg-white border border-dashed border-[#D1E7D5] rounded-[16px]"
          >
            <div className="flex flex-col items-center gap-3 p-4">
              <div className="w-[50px] h-[50px] flex items-center justify-center">
                <img 
                  src="/images/iconss/camera.png" 
                  alt="Camera Icon" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-bold text-[16px] leading-[22px] text-center text-[#515964]">
                Take Photo & Add From Gallery
              </span>
            </div>
          </button>
          
          {/* Photos Display - Show when photos are added */}
          {allPhotos.length > 0 && (
            <div className="flex flex-col gap-4 mt-6">
              {/* Upload Section */}
              <div>
                {/* Section Title */}
                <div className="flex flex-col gap-2">
                  <h3 className="font-bold text-[16px] leading-[22px] text-[#0B1420]">Photos of this Room</h3>
                  <p className="font-normal text-[14px] leading-[19px] text-[#515964]">These will be saved with your timestamped report.</p>
                </div>
                
                {/* Photo Grid */}
                <div className="mt-4 relative">
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 relative">
                    {existingPhotos.map((photo, index) => (
                      <div key={photo.id} className="relative">
                        <div className="w-[81.5px] h-[81.5px] sm:w-[90px] sm:h-[90px] rounded-[16px] overflow-hidden bg-gray-100">
                          <img 
                            src={photo.src} 
                            alt={`Room photo ${index + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        {/* Delete Button */}
                        <button 
                          className="absolute -top-2 -right-2 z-10 w-[28px] h-[28px] flex items-center justify-center bg-[#D14848] rounded-full touch-manipulation"
                          onClick={() => handleDeletePhoto(index, true)}
                          aria-label={`Delete photo ${index + 1}`}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 3.98667C11.78 3.76667 9.54667 3.65333 7.32 3.65333C6 3.65333 4.68 3.72 3.36 3.85333L2 3.98667" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M5.66669 3.31999L5.81335 2.43999C5.92002 1.80666 6.00002 1.33333 7.12669 1.33333H8.87335C10 1.33333 10.0867 1.83999 10.1867 2.44666L10.3334 3.31999" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12.5667 6.09333L12.1334 12.8067C12.06 13.8533 12 14.6667 10.14 14.6667H5.86002C4.00002 14.6667 3.94002 13.8533 3.86668 12.8067L3.43335 6.09333" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6.88669 11H9.10669" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6.33331 8.33333H9.66665" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                    
                    {photos.map((photo, index) => (
                      <div key={photo.id} className="relative">
                        <div className="w-[81.5px] h-[81.5px] sm:w-[90px] sm:h-[90px] rounded-[16px] overflow-hidden bg-gray-100">
                          <img 
                            src={photo.src} 
                            alt={`Room photo ${existingPhotos.length + index + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        {/* Delete Button */}
                        <button 
                          className="absolute -top-2 -right-2 z-10 w-[28px] h-[28px] flex items-center justify-center bg-[#D14848] rounded-full touch-manipulation"
                          onClick={() => handleDeletePhoto(index, false)}
                          aria-label={`Delete photo ${existingPhotos.length + index + 1}`}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 3.98667C11.78 3.76667 9.54667 3.65333 7.32 3.65333C6 3.65333 4.68 3.72 3.36 3.85333L2 3.98667" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M5.66669 3.31999L5.81335 2.43999C5.92002 1.80666 6.00002 1.33333 7.12669 1.33333H8.87335C10 1.33333 10.0867 1.83999 10.1867 2.44666L10.3334 3.31999" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12.5667 6.09333L12.1334 12.8067C12.06 13.8533 12 14.6667 10.14 14.6667H5.86002C4.00002 14.6667 3.94002 13.8533 3.86668 12.8067L3.43335 6.09333" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6.88669 11H9.10669" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6.33331 8.33333H9.66665" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Room Quality Assessment Section */}
              <div className="mt-4">
                <h3 className="font-bold text-[14px] sm:text-[16px] leading-[19px] text-[#0B1420]">How does this room look?</h3>
                <div className="flex flex-wrap gap-3 mt-2">
                  {/* Looks Good Option */}
                  <div 
                    className="flex flex-col items-center gap-1 cursor-pointer"
                    onClick={() => {
                      setRoomQuality('good');
                      setShowIssueInput(false);
                      setRoomIssueNote('');
                      setRoomIssueNotes([]);
                    }}
                  >
                    <div className={`w-[70px] h-[70px] rounded-full border ${roomQuality === 'good' ? 'border-[#4A9A53] border-2' : 'border-[#D1E7D5]'} flex items-center justify-center ${roomQuality === 'good' ? 'bg-[#F6FEF7]' : 'bg-white'} transition-all duration-200`}>
                      <div className="w-[40px] h-[40px] flex items-center justify-center">
                        <img 
                          src="/images/iconss/smile.png" 
                          alt="Looks Good Icon" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                    <span className={`font-bold text-[14px] leading-[19px] text-center ${roomQuality === 'good' ? 'text-[#4A9A53]' : 'text-[#2E3642]'}`}>Looks Good</span>
                  </div>
                  
                  {/* Needs Attention Option */}
                  <div 
                    className="flex flex-col items-center gap-1 cursor-pointer"
                    onClick={() => {
                      setRoomQuality('attention');
                      setShowIssueInput(true);
                    }}
                  >
                    <div className={`w-[70px] h-[70px] rounded-full border ${roomQuality === 'attention' ? 'border-[#4A9A53] border-2' : 'border-[#D1E7D5]'} flex items-center justify-center ${roomQuality === 'attention' ? 'bg-[#F6FEF7]' : 'bg-white'} transition-all duration-200`}>
                      <div className="w-[40px] h-[40px] flex items-center justify-center">
                        <img 
                          src="/images/iconss/sad.png" 
                          alt="Needs Attention Icon" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                    <span className={`font-bold text-[14px] leading-[19px] text-center ${roomQuality === 'attention' ? 'text-[#4A9A53]' : 'text-[#2E3642]'}`}>Needs Attention</span>
                  </div>
                </div>
                
                {/* Issue Description Input - Only shown when "Needs Attention" is selected */}
                {showIssueInput && (
                  <div className="mt-4 flex flex-col gap-4">
                    <div className="flex flex-row justify-between items-center">
                      <h3 className="font-bold text-[14px] sm:text-[16px] leading-[19px] text-[#0B1420]">What should we know about this room?</h3>
                      {roomIssueNote && (
                        <span 
                          className="font-bold text-[14px] leading-[19px] text-[#4D935A] cursor-pointer"
                          onClick={() => {
                            if (roomIssueNotes.length < 15 && roomIssueNote.trim()) {
                              setRoomIssueNotes([...roomIssueNotes, roomIssueNote]);
                              setRoomIssueNote('');
                            }
                          }}
                        >
                          Add
                        </span>
                      )}
                    </div>
                    
                    <textarea
                      value={roomIssueNote}
                      onChange={(e) => setRoomIssueNote(e.target.value)}
                      placeholder="e.g., cracked outlet cover"
                      className="w-full h-[74px] p-[18px_20px] bg-white border border-[#D1E7D5] rounded-[16px] font-semibold text-[14px] leading-[19px] text-[#515964] resize-none"
                      maxLength={150}
                      disabled={roomIssueNotes.length >= 15}
                    />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-[12px] leading-[16px] text-[#979FA9]">
                        {roomIssueNotes.length}/15 notes added
                      </span>
                      <span className="text-[12px] leading-[16px] text-[#979FA9]">
                        {roomIssueNote.length}/150
                      </span>
                    </div>
                    
                    {/* Display Added Notes */}
                    {roomIssueNotes.length > 0 && (
                      <div className="mt-2 flex flex-col gap-2">
                        {roomIssueNotes.map((note, index) => (
                          <div key={index} className="flex justify-between items-center p-[16px] bg-white border border-[#D1E7D5] rounded-[16px]">
                            <p className="font-semibold text-[14px] leading-[19px] text-[#515964]">{note}</p>
                            <button 
                              onClick={() => {
                                const newNotes = [...roomIssueNotes];
                                newNotes.splice(index, 1);
                                setRoomIssueNotes(newNotes);
                              }}
                              className="ml-2"
                            >
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 3.98667C11.78 3.76667 9.54667 3.65333 7.32 3.65333C6 3.65333 4.68 3.72 3.36 3.85333L2 3.98667" stroke="#D14848" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M5.66669 3.31999L5.81335 2.43999C5.92002 1.80666 6.00002 1.33333 7.12669 1.33333H8.87335C10 1.33333 10.0867 1.83999 10.1867 2.44666L10.3334 3.31999" stroke="#D14848" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M12.5667 6.09333L12.1334 12.8067C12.06 13.8533 12 14.6667 10.14 14.6667H5.86002C4.00002 14.6667 3.94002 13.8533 3.86668 12.8067L3.43335 6.09333" stroke="#D14848" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M6.88669 11H9.10669" stroke="#D14848" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M6.33331 8.33333H9.66665" stroke="#D14848" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Info Box - Only show if no photos */}
          {allPhotos.length === 0 && (
            <div className="mt-6 flex items-center p-[18px_20px] gap-2 bg-[#D1E7E2] rounded-[16px]">
              <InfoIcon />
              <p className="font-bold text-[14px] leading-[19px] text-[#2E3642]">
                Start with the basics. Check the door, closet, and window.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Continue Button */}
      <div className="fixed left-0 right-0 bottom-0 w-full px-5 py-4 bg-[#FBF5DA] safe-area-bottom z-20 border-t border-[#F3EED2]">
        <div className="w-full max-w-[350px] mx-auto safe-area-inset-left safe-area-inset-right">
          <button
            onClick={handleContinue}
            disabled={isSubmitting}
            className={`w-full h-[56px] flex justify-center items-center ${
              isSubmitting ? 'bg-[#1C2C40] opacity-70' : 
              allPhotos.length > 0 && roomQuality 
                ? 'bg-[#1C2C40]' 
                : 'bg-[#1C2C40] bg-opacity-70'
            } rounded-[16px] transition-all duration-200 active:opacity-90 hover:opacity-95`}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner />
                <span className="font-bold text-[16px] leading-[22px] text-center text-[#D1E7E2]">
                  Saving...
                </span>
              </div>
            ) : (
              <span className="font-bold text-[16px] leading-[22px] text-center text-[#D1E7E2]">
                {allPhotos.length === 0 
                  ? 'Add Photos to Continue' 
                  : !roomQuality 
                    ? 'Select Room Assessment to Continue' 
                    : 'Continue'}
              </span>
            )}
          </button>
        </div>
      </div>
      
      {/* Photo Options Bottom Sheet */}
      <PhotoOptionBottomSheet 
        show={showPhotoOptions}
        onClose={() => setShowPhotoOptions(false)}
        onTakePhoto={handleTakePhoto}
        onChooseFromGallery={handleChooseFromGallery}
      />
    </div>
  );
}