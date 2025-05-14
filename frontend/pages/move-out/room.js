import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../../lib/auth';
import { apiService } from '../../lib/api';

// Back icon component
const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19L8 12L15 5" stroke="#2E3642" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Camera icon component - You can replace this with your custom PNG
// To use a custom PNG, replace this component with the img tag below:
// <img src="/images/your-custom-icon.png" alt="Camera" width="40" height="40" />
const CameraIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.0004 11.26V6.00049H26.0004V11.26" fill="#B0BEC5" />
    <path d="M28.0004 13.3339V30.0006H5.33374V13.3339H28.0004Z" fill="#ECEFF1" />
    <path d="M23.3333 16.6667C22.4167 16.6667 21.6667 17.4167 21.6667 18.3333C21.6667 19.25 22.4167 20 23.3333 20C24.25 20 25 19.25 25 18.3333C25 17.4167 24.25 16.6667 23.3333 16.6667Z" fill="#FFC107" />
    <path d="M13.9334 24.0195C13.5667 25.0195 12.5334 25.6862 11.3334 25.6862C9.33339 25.6862 7.73339 24.0862 7.73339 22.0862C7.73339 20.0862 9.33339 18.4862 11.3334 18.4862C12.5334 18.4862 13.5667 19.1528 13.9334 20.1528" fill="#4CAF50" />
    <path d="M16.7334 22.0195C16.7334 18.8528 19.3 16.2861 22.4667 16.2861C25.6334 16.2861 28.2 18.8528 28.2 22.0195C28.2 25.1861 25.6334 27.7528 22.4667 27.7528C19.3 27.7528 16.7334 25.1861 16.7334 22.0195Z" fill="#388E3C" />
  </svg>
);

// Simple photo viewer component that shows only the photo
const PhotoViewer = ({ show, onClose, photo }) => {
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
        className={`absolute inset-0 bg-black bg-opacity-90 photo-viewer-overlay ${animationClass}`}
        onClick={handleClose}
      ></div>
      
      {/* Photo Viewer Content */}
      <div className={`absolute inset-0 flex items-center justify-center photo-viewer ${animationClass}`}>
        {/* Close button */}
        <button 
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-black bg-opacity-50 rounded-full"
          onClick={handleClose}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4L4 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 4L12 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        {/* Photo - full screen */}
        <div className="w-full h-full flex items-center justify-center p-4">
          <img 
            src={photo?.src || ''}
            alt="Room photo"
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              console.error(`Error loading full-size image`);
              e.target.onerror = null;
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFRkVGRUYiLz48cGF0aCBkPSJNODUgMTEwSDExNVYxMTVIODVWMTEwWiIgZmlsbD0iIzk5OSIvPjxwYXRoIGQ9Ik0xMDAgNzBDOTEuNzE1IDcwIDg1IDc2LjcxNSA4NSA4NUM4NSA5My4yODUgOTEuNzE1IDEwMCAxMDAgMTAwQzEwOC4yODUgMTAwIDExNSA5My4yODUgMTE1IDg1QzExNSA3Ni43MTUgMTA4LjI4NSA3MCAxMDAgNzBaTTEwMCA5NUM5NC40NzcgOTUgOTAgOTAuNTIzIDkwIDg1QzkwIDc5LjQ3NyA5NC40NzcgNzUgMTAwIDc1QzEwNS41MjMgNzUgMTEwIDc5LjQ3NyAxMTAgODVDMTEwIDkwLjUyMyAxMDUuNTIzIDk1IDEwMCA5NVoiIGZpbGw9IiM5OTkiLz48L3N2Zz4=';
            }}
          />
        </div>
      </div>
    </div>
  );
};

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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.76 22H17.24C20 22 21.1 20.31 21.23 18.25L21.75 9.99C21.89 7.83 20.17 6 18 6C17.39 6 16.83 5.65 16.55 5.11L15.83 3.66C15.37 2.75 14.17 2 13.15 2H10.86C9.83 2 8.63 2.75 8.17 3.66L7.45 5.11C7.17 5.65 6.61 6 6 6C3.83 6 2.11 7.83 2.25 9.99L2.77 18.25C2.89 20.31 4 22 6.76 22Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.5 8H13.5" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 18C13.79 18 15.25 16.54 15.25 14.75C15.25 12.96 13.79 11.5 12 11.5C10.21 11.5 8.75 12.96 8.75 14.75C8.75 16.54 10.21 18 12 18Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 10C10.1046 10 11 9.10457 11 8C11 6.89543 10.1046 6 9 6C7.89543 6 7 6.89543 7 8C7 9.10457 7.89543 10 9 10Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2.67 18.95L7.6 15.64C8.39 15.11 9.53 15.17 10.24 15.78L10.57 16.07C11.35 16.74 12.61 16.74 13.39 16.07L17.55 12.5C18.33 11.83 19.59 11.83 20.37 12.5L22 13.9" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
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

export default function MoveOutRoom() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { propertyId, roomId } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const [roomData, setRoomData] = useState(null);
  const [roomName, setRoomName] = useState('');
  const [roomType, setRoomType] = useState('');
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [notes, setNotes] = useState('');
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [previousNotes, setPreviousNotes] = useState([]);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/welcome');
      return;
    }
    
    if (router.isReady && propertyId && roomId) {
      fetchRoomData();
    }
  }, [user, loading, router, propertyId, roomId, router.isReady]);

  const fetchRoomData = async () => {
    try {
      setIsLoading(true);
      console.log(`Fetching room data for property ${propertyId}, room ${roomId}`);
      
      // Önce localStorage'dan oda bilgilerini al
      const savedRooms = JSON.parse(localStorage.getItem(`property_${propertyId}_rooms`) || '[]');
      console.log('Rooms from localStorage:', savedRooms);
      
      const roomFromStorage = savedRooms.find(room => room.roomId === roomId);
      if (roomFromStorage) {
        console.log('Found room in localStorage:', roomFromStorage);
        
        // Oda bilgilerini ayarla
        setRoomData(roomFromStorage);
        setRoomName(roomFromStorage.roomName || 'Room');
        setRoomType(roomFromStorage.roomType || 'other');
        
        // Önceki notları ayarla
        if (roomFromStorage.roomIssueNotes && roomFromStorage.roomIssueNotes.length > 0) {
          setPreviousNotes(roomFromStorage.roomIssueNotes);
        } else {
          setPreviousNotes([]);
        }
        
        // Fotoğrafları getir
        try {
          console.log('Fetching photos for room:', roomId);
          const photosResponse = await apiService.photos.getByRoom(propertyId, roomId);
          
          console.log('Raw photo API response:', photosResponse);
          
          if (photosResponse.data && photosResponse.data.length > 0) {
            console.log('Found photos for room:', photosResponse.data);
            
            // Check the structure of the first photo to debug
            const samplePhoto = photosResponse.data[0];
            console.log('Sample photo data structure:', {
              id: samplePhoto.id,
              path: samplePhoto.path,
              url: samplePhoto.url,
              fullPath: samplePhoto.path || samplePhoto.url,
              hasHttp: (samplePhoto.path || samplePhoto.url || '').startsWith('http')
            });
            
            // API URL'ini al
            const apiUrl = apiService.getBaseUrl();
            
            // Use the helper function to construct photo URLs
            const photoUrls = photosResponse.data.map(photo => {
              // Log the photo object to debug
              console.log('Processing photo:', photo);
              
              // Use the helper function from apiService
              const fullUrl = apiService.getPhotoUrl(photo);
              
              console.log('Constructed photo URL:', fullUrl);
              
              return {
                id: photo.id,
                src: fullUrl || '',
                note: photo.note || '',
                timestamp: photo.created_at || photo.timestamp || '',
                roomId: photo.room_id || roomId,
                propertyId: photo.property_id || propertyId,
                isMoveIn: true
              };
            });
            
            console.log('Final photo URLs:', photoUrls);
            setExistingPhotos(photoUrls);
          } else {
            console.log('No photos found for room');
            setExistingPhotos([]);
          }
        } catch (photosError) {
          console.error('Failed to fetch photos:', photosError);
          setExistingPhotos([]);
        }
      } else {
        console.log('Room not found in localStorage, trying API');
        
        // API'den oda bilgilerini getir
        try {
          const roomsResponse = await apiService.properties.getRooms(propertyId);
          console.log('Rooms from API:', roomsResponse.data);
          
          if (roomsResponse.data && roomsResponse.data.length > 0) {
            const roomFromAPI = roomsResponse.data.find(room => room.roomId === roomId);
            
            if (roomFromAPI) {
              console.log('Found room in API:', roomFromAPI);
              
              // Oda bilgilerini ayarla
              setRoomData(roomFromAPI);
              setRoomName(roomFromAPI.roomName || 'Room');
              setRoomType(roomFromAPI.roomType || 'other');
              
              // Önceki notları ayarla
              if (roomFromAPI.roomIssueNotes && roomFromAPI.roomIssueNotes.length > 0) {
                setPreviousNotes(roomFromAPI.roomIssueNotes);
              } else {
                setPreviousNotes([]);
              }
              
              // Fotoğrafları getir
              try {
                console.log('Fetching photos for room from API:', roomId);
                const photosResponse = await apiService.photos.getByRoom(propertyId, roomId);
                
                console.log('Raw photo API response from API path:', photosResponse);
                
                if (photosResponse.data && photosResponse.data.length > 0) {
                  // Check the structure of the first photo to debug
                  const samplePhoto = photosResponse.data[0];
                  console.log('Sample photo data structure from API path:', {
                    id: samplePhoto.id,
                    path: samplePhoto.path,
                    url: samplePhoto.url,
                    fullPath: samplePhoto.path || samplePhoto.url,
                    hasHttp: (samplePhoto.path || samplePhoto.url || '').startsWith('http')
                  });
                  // API URL'ini al
                  const apiUrl = apiService.getBaseUrl();
                  
                  // Use the helper function to construct photo URLs
                  const photoUrls = photosResponse.data.map(photo => {
                    // Log the photo object to debug
                    console.log('Processing photo (from API):', photo);
                    
                    // Use the helper function from apiService
                    const fullUrl = apiService.getPhotoUrl(photo);
                    
                    console.log('Constructed photo URL (from API):', fullUrl);
                    
                    return {
                      id: photo.id,
                      src: fullUrl || '',
                      note: photo.note || '',
                      timestamp: photo.created_at || photo.timestamp || '',
                      roomId: photo.room_id || roomId,
                      propertyId: photo.property_id || propertyId,
                      isMoveIn: true
                    };
                  });
                  
                  console.log('Final photo URLs (from API):', photoUrls);
                  setExistingPhotos(photoUrls);
                } else {
                  setExistingPhotos([]);
                }
              } catch (photosError) {
                console.error('Failed to fetch photos:', photosError);
                setExistingPhotos([]);
              }
            } else {
              console.log('Room not found in API');
              console.error('Room information not found');
              router.back();
            }
          } else {
            console.log('No rooms found in API');
            console.error('Room information not found');
            router.back();
          }
        } catch (roomsError) {
          console.error('Failed to fetch rooms from API:', roomsError);
          console.error('Failed to get room information');
          router.back();
        }
      }
    } catch (error) {
      console.error('Error fetching room data:', error);
      console.error('Error loading room information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };
  
  const handleTakePhoto = () => {
    try {
      // Create a file input element programmatically
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*'; // Accept all image types
      fileInput.capture = 'environment'; // Prefer the back camera
      
      // Listen for the change event on the file input
      fileInput.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
          // Process the image file
          setNewPhotos(prevPhotos => [...prevPhotos, {
            id: `new_${Date.now()}`,
            src: URL.createObjectURL(file),
            file: file,
            name: file.name
          }]);
        }
      };
      
      // Trigger the file input click event to open the camera
      fileInput.click();
    } catch (error) {
      console.error('Error accessing camera:', error);
      console.error('Camera access failed');
    }
    
    setShowPhotoOptions(false);
  };

  const handleChooseFromGallery = () => {
    try {
      // Create a file input element programmatically
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*'; // Accept all image types
      fileInput.multiple = true; // Allow selecting multiple images
      
      // Listen for the change event on the file input
      fileInput.onchange = (event) => {
        const files = event.target.files;
        if (files && files.length > 0) {
          // Process the selected image files
          const newUploadedPhotos = Array.from(files).map(file => ({
            id: `new_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            src: URL.createObjectURL(file),
            file: file,
            name: file.name
          }));
          
          // Add the new photos to the existing photos array
          setNewPhotos(prevPhotos => [...prevPhotos, ...newUploadedPhotos]);
        }
      };
      
      // Trigger the file input click event to open the gallery
      fileInput.click();
    } catch (error) {
      console.error('Error accessing gallery:', error);
      console.error('Gallery access failed');
    }
    
    setShowPhotoOptions(false);
  };
  
  const handleDeletePhoto = (index) => {
    // For new photos, remove from photos array
    setNewPhotos(prevPhotos => {
      const newPhotoArray = [...prevPhotos];
      newPhotoArray.splice(index, 1);
      return newPhotoArray;
    });
  };
  
  const handlePhotoClick = (photo) => {
    console.log('Photo clicked:', photo);
    setSelectedPhoto(photo);
    setShowPhotoViewer(true);
  };
  
  const handleSubmit = async () => {
    if (!propertyId || !roomId) {
      console.error('Room or property information is missing');
      return;
    }
    
    if (newPhotos.length === 0 && !notes.trim()) {
      console.error('Please add at least one photo or note');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Mevcut odayı kaydet
      const savedRooms = JSON.parse(localStorage.getItem(`property_${propertyId}_rooms`) || '[]');
      const roomIndex = savedRooms.findIndex(room => room.roomId === roomId);
      
      // Taşınma notu olarak mevcut giriş değerini ekle
      const moveOutNotes = notes.trim() ? [notes.trim()] : [];
      
      if (roomIndex >= 0) {
        // Mevcut oda bilgilerini güncelle
        savedRooms[roomIndex] = {
          ...savedRooms[roomIndex],
          moveOutNotes: moveOutNotes,
          moveOutPhotoCount: newPhotos.length,
          moveOutDate: new Date().toISOString()
        };
      } else {
        // Yeni oda oluştur
        savedRooms.push({
          roomId: roomId,
          roomName: roomName,
          roomType: roomType,
          moveOutNotes: moveOutNotes,
          moveOutPhotoCount: newPhotos.length,
          moveOutDate: new Date().toISOString()
        });
      }
      
      // localStorage'a kaydet
      localStorage.setItem(`property_${propertyId}_rooms`, JSON.stringify(savedRooms));
      
      // Fotoğrafları sunucuya yükle
      if (newPhotos.length > 0) {
        for (let i = 0; i < newPhotos.length; i++) {
          const photo = newPhotos[i];
          
          try {
            // Create form data with the actual file
            const formData = new FormData();
            formData.append('photo', photo.file, photo.name || `moveout_photo_${Date.now()}_${i}.jpg`);
            formData.append('note', 'Move-out photo');
            formData.append('property_id', propertyId);
            formData.append('room_id', roomId);
            formData.append('move_out', 'true');
            
            // Upload photo
            await apiService.photos.uploadForRoom(propertyId, roomId, formData);
            console.log(`Photo ${i+1} uploaded successfully`);
          } catch (uploadError) {
            console.error(`Failed to upload photo ${i+1}:`, uploadError);
          }
        }
      }
      
      // API'ye odayı kaydet
      try {
        await apiService.properties.saveRooms(propertyId, savedRooms);
        console.log('Rooms saved to API successfully');
      } catch (saveError) {
        console.error('Failed to save rooms to API:', saveError);
        // Sadece localStorage'a kaydedildi, tamamen başarısız değil
      }
      
      console.log('Your changes have been saved!');
      
      // Odalar sayfasına geri dön
      setTimeout(() => {
        router.push(`/move-out/rooms?propertyId=${propertyId}`);
      }, 1000);
    } catch (error) {
      console.error('Error submitting room data:', error);
      console.error('Error saving changes');
      setIsSubmitting(false);
    }
  };
  
  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#FBF5DA]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C2C40]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-[#FBF5DA] font-['Nunito'] min-h-screen">
      <Head>
        <title>Move Out - Room Documentation</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#FBF5DA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <style jsx global>{`
          body {
            background-color: #FBF5DA;
            margin: 0;
            padding: 0;
            min-height: 100vh;
            width: 100%;
            font-family: 'Nunito', sans-serif;
          }
          .safe-area-top {
            padding-top: env(safe-area-inset-top, 40px);
          }
          .safe-area-bottom {
            padding-bottom: env(safe-area-inset-bottom, 20px);
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
          
          /* Photo viewer animations */
          .photo-viewer-overlay {
            opacity: 0;
            transition: opacity 0.2s ease-out;
          }
          
          .photo-viewer-overlay.visible {
            opacity: 1;
          }
          
          .photo-viewer {
            opacity: 0;
            transform: scale(0.95);
            transition: opacity 0.2s ease-out, transform 0.2s ease-out;
          }
          
          .photo-viewer.visible {
            opacity: 1;
            transform: scale(1);
          }
        `}</style>
      </Head>
      
      <div className="w-full max-w-[390px] relative min-h-screen">
        {/* Status Bar Space */}
        <div className="h-[40px] w-full safe-area-top"></div>
        
        {/* Header with Back Button */}
        <div className="w-full h-[65px] border-b border-[#ECF0F5]">
          <div className="flex flex-row justify-center items-center w-full h-[65px] px-[10px] py-[20px] relative">
            <button 
              className="absolute left-[20px] top-[50%] transform -translate-y-1/2 z-[2] flex items-center justify-center w-[40px] h-[40px]"
              onClick={() => router.push(`/move-out/rooms?propertyId=${propertyId}`)}
              aria-label="Go back"
            >
              <BackIcon />
            </button>
            <h1 className="w-full max-w-[270px] font-semibold text-[18px] leading-[140%] text-center text-[#0B1420]">
              Room Documentation
            </h1>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="px-5 w-full">
          <h2 className="font-bold text-[18px] text-[#0B1420] mt-4">
            {roomName}
          </h2>
          
          {/* Previous Photos Section */}
          {existingPhotos.length > 0 && (
            <div className="mt-8">
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-[14px] text-[#0B1420]">
                  Photos from Move-In
                </h3>
                <p className="font-normal text-[14px] text-[#515964]">
                  These photos were taken during move-in — please review them for comparison.
                </p>
              </div>
              
              <div className="flex flex-row flex-wrap gap-2 mt-4">
                {existingPhotos.map((photo, index) => (
                  <div 
                    key={index} 
                    className="w-[81.5px] h-[81.5px] bg-gray-200 rounded-2xl overflow-hidden cursor-pointer relative"
                    onClick={() => handlePhotoClick(photo)}
                  >
                    <img 
                      src={photo.src}
                      alt={`Room photo ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error(`Error loading image ${index}:`, photo.src);
                        e.target.onerror = null; 
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iODAiIGZpbGw9IiNFRkVGRUYiLz48cGF0aCBkPSJNMzAgNTVINTBWNTdIMzBWNTVaIiBmaWxsPSIjOTk5Ii8+PHBhdGggZD0iTTQwIDI1QzM0LjQ4IDI1IDMwIDI5LjQ4IDMwIDM1QzMwIDQwLjUyIDM0LjQ4IDQ1IDQwIDQ1QzQ1LjUyIDQ1IDUwIDQwLjUyIDUwIDM1QzUwIDI5LjQ4IDQ1LjUyIDI1IDQwIDI1Wk00MCA0M0MzNS41OCA0MyAzMiAzOS40MiAzMiAzNUMzMiAzMC41OCAzNS41OCAyNyA0MCAyN0M0NC40MiAyNyA0OCAzMC41OCA0OCAzNUM0OCAzOS40MiA0NC40MiA0MyA0MCA0M1oiIGZpbGw9IiM5OTkiLz48L3N2Zz4=';
                        e.target.classList.add('error-image');
                      }}
                    />
                    {photo.note && (
                      <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#4D935A] rounded-full flex items-center justify-center m-1">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1.5 8V9C1.5 9.39782 1.65804 9.77936 1.93934 10.0607C2.22064 10.342 2.60218 10.5 3 10.5H9C9.39782 10.5 9.77936 10.342 10.0607 10.0607C10.342 9.77936 10.5 9.39782 10.5 9V8" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M3 5.25L6 8.25L9 5.25" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M6 8.25V1.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Previous Notes Section */}
          {previousNotes.length > 0 && (
            <div className="mt-8">
              <div className="flex flex-row justify-between items-center">
                <h3 className="font-bold text-[14px] text-[#0B1420]">
                  Issues noted at move-in
                </h3>
                <button
                  onClick={() => setShowAllNotes(!showAllNotes)}
                  className="font-bold text-[14px] text-[#4D935A]"
                >
                  {showAllNotes ? 'Show less' : 'Show more'}
                </button>
              </div>
              
              <div className="p-[18px] mt-4 bg-white border border-[#D1E7D5] rounded-2xl">
                <p className="font-semibold text-[14px] text-[#515964]">
                  {showAllNotes 
                    ? previousNotes.join(', ') 
                    : previousNotes.slice(0, 2).join(', ') + (previousNotes.length > 2 ? '...' : '')}
                </p>
              </div>
            </div>
          )}
          
          {/* Current Documentation Section */}
          <div className="mt-8">
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-[14px] text-[#0B1420]">
                Document the Room's Current Condition
              </h3>
              <p className="font-normal text-[14px] text-[#515964]">
                Add photos to show how the room looks as you move out.
              </p>
            </div>
            
            {/* New photos display */}
            {newPhotos.length > 0 && (
              <div className="flex flex-row flex-wrap gap-2 mt-4">
                {newPhotos.map((photo, index) => (
                  <div 
                    key={index} 
                    className="w-[81.5px] h-[81.5px] bg-gray-200 rounded-2xl overflow-hidden relative cursor-pointer"
                    onClick={() => handlePhotoClick({
                      id: photo.id,
                      src: photo.src,
                      note: photo.note || 'Move-out photo (new)',
                      timestamp: photo.timestamp || new Date().toISOString(),
                      roomId: roomId,
                      propertyId: propertyId,
                      isMoveOut: true
                    })}
                  >
                    <div 
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${photo.src})` }}
                    ></div>
                    
                    {/* Delete button */}
                    <button 
                      className="absolute top-2 right-2 z-10 w-[28px] h-[28px] flex items-center justify-center bg-[#D14848] rounded-full shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePhoto(index);
                      }}
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
            )}
            
            {/* Photo upload button */}
            <button
              onClick={() => setShowPhotoOptions(true)}
              className="box-border flex flex-col items-center justify-center w-full h-[99px] mt-4 bg-white border border-dashed border-[#D1E7D5] rounded-[16px] active:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col items-center justify-center gap-2 py-[14px]">
                {<img src="/images/iconss/camera.png"/>}
                <p className="font-bold text-[14px] leading-[19px] text-center text-[#515964]">
                  Take Photo & Add From Gallery
                </p>
              </div>
            </button>
            
            {/* Notes input */}
            <div className="mt-6">
              <label htmlFor="move-out-notes" className="font-bold text-[14px] text-[#0B1420] block mb-2">
                Move-Out Notes
              </label>
              <textarea
                id="move-out-notes"
                value={notes}
                onChange={handleNotesChange}
                placeholder="Add any notes about the current condition..."
                className="w-full h-[93px] p-[18px] bg-white border border-[#D1E7D5] rounded-[16px] resize-none focus:outline-none focus:ring-2 focus:ring-[#55A363] font-semibold text-[14px] text-[#515964]"
              />
            </div>
            
            {/* Add padding at the bottom to account for fixed button */}
            <div className="h-24"></div>
          </div>
        </div>
        
        {/* Submit button - fixed at bottom */}
        <div className="fixed left-0 right-0 bottom-0 w-full px-5 py-4 bg-[#FBF5DA] safe-area-bottom">
          <div className="max-w-[390px] mx-auto">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full h-[56px] flex justify-center items-center bg-[#1C2C40] rounded-[16px] shadow-sm"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                  <span className="font-bold text-[16px] leading-[22px] text-center text-[#D1E7E2]">
                    Saving...
                  </span>
                </div>
              ) : (
                <span className="font-bold text-[16px] leading-[22px] text-center text-[#D1E7E2]">
                  Finish This Room
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
        
        {/* Photo Viewer */}
        <PhotoViewer
          show={showPhotoViewer}
          onClose={() => setShowPhotoViewer(false)}
          photo={selectedPhoto}
        />
      </div>
    </div>
  );
}