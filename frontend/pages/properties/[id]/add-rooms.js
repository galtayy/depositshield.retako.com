import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import Head from 'next/head';
import { useAuth } from '../../../lib/auth';
import { apiService } from '../../../lib/api';

const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19.9201L8.47997 13.4001C7.70997 12.6301 7.70997 11.3701 8.47997 10.6001L15 4.08008" 
      stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AddIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 3V13" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 8H13" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Living Room icon
const LivingRoomIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 22H22" stroke="#1C2C40" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.95 22L3 9L6 11V14H18V11L21 9V22" stroke="#1C2C40" strokeWidth="1.5" strokeMiterlimit="10" strokeLinejoin="round"/>
    <path d="M4 6V4C4 2.9 4.9 2 6 2H18C19.1 2 20 2.9 20 4V6" stroke="#1C2C40" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 11H6V7C6 5.9 6.9 5 8 5H16C17.1 5 18 5.9 18 7V11Z" stroke="#1C2C40" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Bedroom icon
const BedroomIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20Z" stroke="#1C2C40" strokeWidth="1.5"/>
    <path d="M4 8H20" stroke="#1C2C40" strokeWidth="1.5"/>
    <path d="M12 8V20" stroke="#1C2C40" strokeWidth="1.5"/>
  </svg>
);

// Kitchen icon
const KitchenIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="2" width="16" height="20" rx="2" stroke="#1C2C40" strokeWidth="1.5"/>
    <path d="M7.5 5V19" stroke="#1C2C40" strokeWidth="1.5"/>
    <path d="M12 12H16" stroke="#1C2C40" strokeWidth="1.5"/>
  </svg>
);

// Bathroom icon
const BathroomIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 9H20V18C20 20 18.5 22 16 22H8C5.5 22 4 20 4 18V9Z" stroke="#1C2C40" strokeWidth="1.5"/>
    <path d="M4 5C4 3 5 2 7 2H17C19 2 20 3 20 5V9H4V5Z" stroke="#1C2C40" strokeWidth="1.5"/>
    <circle cx="16" cy="5.5" r="1.5" stroke="#1C2C40" strokeWidth="1.5"/>
  </svg>
);

// Other icon
const OtherIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 8H22V20C22 21.1 21.1 22 20 22H4C2.9 22 2 21.1 2 20V8Z" stroke="#0B1420" strokeWidth="1.5"/>
    <path d="M5 2V8" stroke="#0B1420" strokeWidth="1.5"/>
    <path d="M9 2V8" stroke="#0B1420" strokeWidth="1.5"/>
    <path d="M15 2V8" stroke="#0B1420" strokeWidth="1.5"/>
    <path d="M19 2V8" stroke="#0B1420" strokeWidth="1.5"/>
  </svg>
);

// Room type selection component
const RoomTypeSelector = ({ show, onSelect, onClose }) => {
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
  const handleSelect = (type) => {
    setAnimationClass('');
    // Wait for animation to finish before selecting
    setTimeout(() => {
      onSelect(type);
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
        className={`absolute inset-0 bg-black bg-opacity-40 bottom-sheet-overlay ${animationClass}`}
        onClick={handleClose}
      ></div>
      
      {/* Bottom Sheet */}
      <div className={`absolute bottom-0 left-0 right-0 w-full h-[385px] bg-white rounded-t-[24px] overflow-hidden bottom-sheet ${animationClass} safe-area-bottom`}>
        {/* Handle Bar */}
        <div className="flex justify-center items-center pt-[10px] pb-0">
          <div className="w-[95px] h-[6px] bg-[#ECECEC] rounded-[24px]"></div>
        </div>
        
        {/* Title */}
        <div className="flex justify-center items-center h-[55px]">
          <h3 className="font-bold text-[18px] leading-[25px] text-[#0B1420]">
            Choose Room Type
          </h3>
        </div>
        
        {/* Room Type Options */}
        <div className="w-full max-w-[350px] mx-auto">
          {/* Living Room Option */}
          <div 
            className="flex flex-row justify-between items-center h-[56px] border-b border-[#ECF0F5] px-0 py-[16px]"
            onClick={() => handleSelect('living')}
          >
            <div className="flex flex-row items-center gap-[12px]">
              <LivingRoomIcon />
              <div className="font-bold text-[14px] leading-[19px] text-[#0B1420]">
                Living Room
              </div>
            </div>
          </div>
          
          {/* Bedroom Option */}
          <div 
            className="flex flex-row justify-between items-center h-[56px] border-b border-[#ECF0F5] px-0 py-[16px]"
            onClick={() => handleSelect('bedroom')}
          >
            <div className="flex flex-row items-center gap-[12px]">
              <BedroomIcon />
              <div className="font-bold text-[14px] leading-[19px] text-[#0B1420]">
                Bedroom
              </div>
            </div>
          </div>
          
          {/* Kitchen Option */}
          <div 
            className="flex flex-row justify-between items-center h-[56px] border-b border-[#ECF0F5] px-0 py-[16px]"
            onClick={() => handleSelect('kitchen')}
          >
            <div className="flex flex-row items-center gap-[12px]">
              <KitchenIcon />
              <div className="font-bold text-[14px] leading-[19px] text-[#0B1420]">
                Kitchen
              </div>
            </div>
          </div>
          
          {/* Bathroom Option */}
          <div 
            className="flex flex-row justify-between items-center h-[56px] border-b border-[#ECF0F5] px-0 py-[16px]"
            onClick={() => handleSelect('bathroom')}
          >
            <div className="flex flex-row items-center gap-[12px]">
              <BathroomIcon />
              <div className="font-bold text-[14px] leading-[19px] text-[#0B1420]">
                Bathroom
              </div>
            </div>
          </div>
          
          {/* Other Option */}
          <div 
            className="flex flex-row justify-between items-center h-[56px] px-0 py-[16px]"
            onClick={() => handleSelect('other')}
          >
            <div className="flex flex-row items-center gap-[12px]">
              <OtherIcon />
              <div className="font-bold text-[14px] leading-[19px] text-[#0B1420]">
                Other
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AddRooms() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRoomTypeSelector, setShowRoomTypeSelector] = useState(false);
  const [currentEditingRoom, setCurrentEditingRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  
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
  
  useEffect(() => {
    const fetchProperty = async () => {
      if (id) {
        try {
          setIsLoading(true);

          // First try to load from localStorage for immediate feedback
          const savedRooms = JSON.parse(localStorage.getItem(`property_${id}_rooms`) || '[]');
          console.log('[FETCH DEBUG] Loading rooms from localStorage:', savedRooms);

          if (savedRooms.length > 0) {
            console.log('[FETCH DEBUG] Found rooms in localStorage, formatting...');
            // Convert the saved room data to the format expected by the component
            const formattedRooms = savedRooms.map(room => ({
              id: room.roomId,
              name: room.roomName,
              type: room.roomType,
              photoCount: room.photoCount || 0,
              roomQuality: room.roomQuality || null,
              roomIssueNotes: room.roomIssueNotes || [],
              timestamp: room.timestamp
            }));
            console.log('[FETCH DEBUG] Setting rooms state with formatted rooms:', formattedRooms);
            setRooms(formattedRooms);
          } else {
            console.log('[FETCH DEBUG] No rooms found in localStorage, trying database');

            // Try to load from database API
            try {
              const roomsResponse = await apiService.properties.getRooms(id);
              console.log('[FETCH DEBUG] API response for rooms:', roomsResponse.data);

              if (roomsResponse.data && roomsResponse.data.length > 0) {
                // Format and use the rooms from the database
                const apiRooms = roomsResponse.data.map(room => ({
                  id: room.roomId,
                  name: room.roomName,
                  type: room.roomType,
                  photoCount: room.photoCount || 0,
                  roomQuality: room.roomQuality || null,
                  roomIssueNotes: room.roomIssueNotes || [],
                  timestamp: room.timestamp
                }));

                // Store in localStorage for later use
                localStorage.setItem(`property_${id}_rooms`, JSON.stringify(roomsResponse.data));

                // Set state
                console.log('[FETCH DEBUG] Setting rooms state with API rooms:', apiRooms);
                setRooms(apiRooms);
              } else {
                console.log('[FETCH DEBUG] No rooms found in database either');
              }
            } catch (error) {
              console.error('Error loading rooms from API:', error);
            }
          }
          
          // Fetch property data from API
          const response = await apiService.properties.getById(id);
          console.log('[FETCH DEBUG] Property data from API:', response.data);
          setProperty(response.data);
        } catch (error) {
          console.error('Error fetching property:', error);
          toast.error('Failed to load property details');
          
          // Even if API fails, we want to try loading rooms from localStorage
          try {
            const savedRooms = JSON.parse(localStorage.getItem(`property_${id}_rooms`) || '[]');
            if (savedRooms.length > 0) {
              const formattedRooms = savedRooms.map(room => ({
                id: room.roomId,
                name: room.roomName,
                type: room.roomType,
                photoCount: room.photoCount || 0,
                roomQuality: room.roomQuality || null,
                roomIssueNotes: room.roomIssueNotes || [],
                timestamp: room.timestamp
              }));
              setRooms(formattedRooms);
            }
          } catch (e) {
            console.error('Error loading rooms from localStorage:', e);
          }
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchProperty();
  }, [id]);
  
  // Handle the return from configure-room page or upload-photos page
  useEffect(() => {
    // Değişkeni saklamak için
    const success = router.query.success;
    const roomName = router.query.roomName;
    const roomType = router.query.roomType;
    const roomId = router.query.roomId;
    
    // Debug logları ekleyelim
    console.log('[DEBUG] Current router.query:', router.query);
    console.log('[DEBUG] Current ID param:', id);
    console.log('[DEBUG] Current success param:', success);
    console.log('[DEBUG] Current localStorage rooms:', JSON.parse(localStorage.getItem(`property_${id}_rooms`) || '[]'));
    
    // If we got a success parameter, we're returning from another page
    if (success) {
      // Check if we're returning from the upload-photos page
      if (success === 'true' && !roomName) {
        console.log('Returning from upload-photos page with success');
        // Just make sure we have the latest room data from localStorage
        if (id) {
          const savedRooms = JSON.parse(localStorage.getItem(`property_${id}_rooms`) || '[]');
          if (savedRooms.length > 0) {
            const formattedRooms = savedRooms.map(room => ({
              id: room.roomId,
              name: room.roomName,
              type: room.roomType,
              photoCount: room.photoCount || 0,
              roomQuality: room.roomQuality || null,
              roomIssueNotes: room.roomIssueNotes || [],
              timestamp: room.timestamp
            }));
            setRooms(formattedRooms);
          }
        }
      }
      // Check if we're returning from the configure-room page
      else if (roomName && roomType) {
        // Add or update room
        if (roomId === 'new') {
          // Add new room
          setRooms(prev => [...prev, { 
            id: `room_${Date.now()}`,
            name: roomName,
            type: roomType,
            photoCount: 0
          }]);
          toast.success('Room added successfully!');
        } else {
          // Update existing room
          const roomIdToUpdate = roomId;
          
          // Use setRooms with function to avoid dependency on rooms state
          setRooms(prevRooms => {
            const roomIndexToUpdate = prevRooms.findIndex(r => r.id === roomIdToUpdate);
            
            if (roomIndexToUpdate >= 0) {
              const newRooms = [...prevRooms];
              newRooms[roomIndexToUpdate] = {
                ...newRooms[roomIndexToUpdate],
                name: roomName,
                type: roomType
              };
              toast.success('Room updated successfully!');
              return newRooms;
            }
            
            return prevRooms;
          });
        }
      }
      
      // Use setTimeout to avoid potential React render issues
      setTimeout(() => {
        // Clean up query parameters after processing using window.history
        if (typeof window !== 'undefined') {
          const url = window.location.pathname;
          window.history.replaceState({}, document.title, url);
        }
      }, 0);
    }
  }, [router.query, id]);
  
  const addNewRoom = () => {
    setShowRoomTypeSelector(true);
    setCurrentEditingRoom('new');
  };
  
  const handleRoomTypeSelect = (type) => {
    setShowRoomTypeSelector(false);
    
    // Make sure ID is available before navigation
    if (!id) {
      console.error('Missing ID parameter for navigation');
      toast.error('Missing property ID. Please try again.');
      return;
    }
    
    // Navigate to the room configuration page
    if (currentEditingRoom === 'new') {
      // Creating a new room
      // Use window.location for direct navigation
      window.location.href = `/properties/${id}/configure-room?roomType=${encodeURIComponent(type)}`;
    } else {
      // Editing an existing room - currentEditingRoom is the index
      const roomToEdit = rooms[currentEditingRoom];
      if (roomToEdit) {
        // Use window.location for direct navigation
        window.location.href = `/properties/${id}/configure-room?roomType=${encodeURIComponent(type)}&roomId=${encodeURIComponent(roomToEdit.id)}&initialName=${encodeURIComponent(roomToEdit.name)}`;
      }
    }
  };
  
  const getRoomIcon = (type) => {
    switch (type) {
      case 'living':
        return <LivingRoomIcon />;
      case 'bedroom':
        return <BedroomIcon />;
      case 'kitchen':
        return <KitchenIcon />;
      case 'bathroom':
        return <BathroomIcon />;
      default:
        return <OtherIcon />;
    }
  };
  
  const deleteRoom = (roomId) => {
    // Find the room and remove from state
    const newRooms = rooms.filter(room => room.id !== roomId);
    setRooms(newRooms);
    
    // Also remove from localStorage
    if (id) {
      const savedRooms = JSON.parse(localStorage.getItem(`property_${id}_rooms`) || '[]');
      const updatedSavedRooms = savedRooms.filter(room => room.roomId !== roomId);
      localStorage.setItem(`property_${id}_rooms`, JSON.stringify(updatedSavedRooms));
    }
  };
  
  const updateRoomName = (roomId, newName) => {
    // Update the room name in the state
    const roomIndex = rooms.findIndex(room => room.id === roomId);
    if (roomIndex >= 0) {
      const newRooms = [...rooms];
      newRooms[roomIndex].name = newName;
      setRooms(newRooms);
      
      // Also update in localStorage
      if (id) {
        const savedRooms = JSON.parse(localStorage.getItem(`property_${id}_rooms`) || '[]');
        const savedRoomIndex = savedRooms.findIndex(room => room.roomId === roomId);
        if (savedRoomIndex >= 0) {
          savedRooms[savedRoomIndex].roomName = newName;
          localStorage.setItem(`property_${id}_rooms`, JSON.stringify(savedRooms));
        }
      }
    }
  };
  
  const openRoomTypeSelector = (index) => {
    setCurrentEditingRoom(index);
    setShowRoomTypeSelector(true);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!id) {
      toast.error('Missing property ID. Please try again.');
      return;
    }

    try {
      // Save to localStorage
      const roomsToSave = rooms.map(room => ({
        roomId: room.id,
        roomName: room.name,
        roomType: room.type,
        photoCount: room.photoCount || 0,
        roomQuality: room.roomQuality || null,
        roomIssueNotes: room.roomIssueNotes || [],
        timestamp: room.timestamp || new Date().toISOString()
      }));

      localStorage.setItem(`property_${id}_rooms`, JSON.stringify(roomsToSave));

      // Save to database API
      console.log('Saving rooms to API:', roomsToSave);
      await apiService.properties.saveRooms(id, roomsToSave);

      toast.success('Rooms saved to database successfully!');
    } catch (error) {
      console.error('Error saving rooms to database:', error);
      toast.error('Rooms saved locally, but failed to sync with database. You can continue.');
    }

    // Navigate to the property details page
    setTimeout(() => {
      // Use window.location for most reliable navigation
      window.location.href = `/properties/${id}`;
    }, 1000);
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#FBF5DA]">
        <div className="text-[#1C2C40] text-lg">Loading...</div>
      </div>
    );
  }
  
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
          }
          
          .safe-area-top {
            padding-top: env(safe-area-inset-top, 40px);
          }
          
          .safe-area-bottom {
            padding-bottom: env(safe-area-inset-bottom, 20px);
          }
          
          /* iPhone X and newer notch handling */
          @supports (padding: max(0px)) {
            .safe-area-top {
              padding-top: max(env(safe-area-inset-top), 40px);
            }
            .safe-area-bottom {
              padding-bottom: max(env(safe-area-inset-bottom), 20px);
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
        `}</style>
      </Head>
      
      {/* Status Bar Space */}
      <div className="w-full h-[40px] safe-area-top"></div>
      
      {/* Header */}
      <div className="w-full h-[65px] flex flex-col">
        <div className="flex flex-row justify-center items-center w-full h-[65px] px-[10px] py-[20px] relative">
          <button 
            className="absolute left-[20px] top-[50%] transform -translate-y-1/2 z-[2]"
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <ArrowLeftIcon />
          </button>
          <h1 className="w-full max-w-[270px] font-semibold text-[18px] leading-[140%] text-center text-[#0B1420]">
            Room Management
          </h1>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="fixed left-0 right-0 w-full px-5 bg-[#FBF5DA]" style={{top: '105px'}}>
        <div className="max-w-[350px] mx-auto">
          <h2 className="font-bold text-[16px] leading-[22px] text-[#0B1420]">
            Let's build your walkthrough one room at a time 📂
          </h2>
          <p className="font-normal text-[14px] leading-[19px] text-[#515964] mt-1">
            Add rooms one by one so we can help you document everything properly.
          </p>
        </div>
      </div>
      
      {/* Add New Room Button */}
      <div className="fixed left-0 right-0 w-full px-5 py-4 bg-[#FBF5DA]" style={{top: '210px'}}>
        <div className="max-w-[350px] mx-auto">
          <button 
            type="button"
            onClick={addNewRoom}
            className="w-full h-[56px] flex justify-center items-center bg-white border border-[#D1E7D5] rounded-[16px]"
          >
            <div className="flex flex-row items-center gap-[4px]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 12H18" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 18V6" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-bold text-[14px] leading-[19px] text-[#515964]">
                Add New Room
              </span>
            </div>
          </button>
        </div>
      </div>
      
      {/* Room List */}
      <div className="w-full max-w-[350px] mx-auto px-5 mt-4 mb-24">
        <div className="flex flex-col gap-[10px]">
          {rooms.map((room, index) => (
            <div 
              key={index} 
              className="box-border flex flex-col w-full p-[16px] bg-white border border-[#D1E7D5] rounded-[16px] cursor-pointer"
              onClick={() => {
                if (id) {
                  // Use window.location for direct navigation
                  const url = `/properties/${id}/upload-photos?roomName=${encodeURIComponent(room.name)}&roomType=${encodeURIComponent(room.type)}&roomId=${encodeURIComponent(room.id)}`;
                  window.location.href = url;
                } else {
                  console.error('Missing ID parameter for navigation');
                }
              }}
            >
              <div className="flex flex-row justify-between w-full">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-row items-center gap-1">
                    <span className="font-bold text-[14px] leading-[19px] text-[#0B1420]">
                      {room.name}
                    </span>
                    {room.roomQuality === 'attention' && room.roomIssueNotes && room.roomIssueNotes.length > 0 && (
                      <span className="font-semibold text-[14px] leading-[19px] text-[#515964]">
                        ({room.roomIssueNotes.length} {room.roomIssueNotes.length === 1 ? 'item' : 'items'} noted)
                      </span>
                    )}
                  </div>
                  <div className="flex flex-row items-center gap-1">
                    <div className="flex">
                      {/* Photo thumbnails (simulated) */}
                      {Array.from({ length: Math.min(room.photoCount, 4) }).map((_, i) => (
                        <div 
                          key={i} 
                          className="w-[18px] h-[18px] rounded-[14px] bg-gray-200 border border-[#D1E7E2]"
                          style={{ marginLeft: i > 0 ? '-8px' : '0' }}
                        ></div>
                      ))}
                    </div>
                    {room.photoCount > 0 && (
                      <span className="font-semibold text-[12px] leading-[16px] text-[#515964] ml-2">
                        ({room.photoCount} {room.photoCount === 1 ? 'Photo' : 'Photos'})
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.94001 13.2799L10.6 8.61989C11.14 8.07989 11.14 7.17989 10.6 6.63989L5.94001 1.97989" 
                      stroke="#1C2C40" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Submit Button */}
      <div className="fixed left-0 right-0 bottom-0 w-full px-5 py-4 bg-[#FBF5DA] safe-area-bottom">
        <div className="max-w-[350px] mx-auto">
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full h-[56px] flex justify-center items-center bg-[#1C2C40] rounded-[16px]"
          >
            <span className="font-bold text-[16px] leading-[22px] text-center text-[#D1E7E2]">
              Save and Return
            </span>
          </button>
        </div>
      </div>
      
      {/* Room Type Selector Bottom Sheet */}
      <RoomTypeSelector 
        show={showRoomTypeSelector}
        onSelect={handleRoomTypeSelect}
        onClose={() => {
          setShowRoomTypeSelector(false);
          setCurrentEditingRoom(null);
        }}
      />
    </div>
  );
}