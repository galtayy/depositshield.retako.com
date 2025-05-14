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

export default function ConfigureRoom() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id, roomType, roomId } = router.query;
  const [roomName, setRoomName] = useState('');
  const [initialRoomName, setInitialRoomName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/welcome');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    if (roomType) {
      // Set initial room name based on room type
      let defaultName = '';
      switch (roomType) {
        case 'living':
          defaultName = 'Living Room';
          break;
        case 'bedroom':
          defaultName = 'Bedroom';
          break;
        case 'kitchen':
          defaultName = 'Kitchen';
          break;
        case 'bathroom':
          defaultName = 'Bathroom';
          break;
        case 'other':
          defaultName = 'Other Room';
          break;
        default:
          defaultName = 'New Room';
      }
      setRoomName(defaultName);
      setInitialRoomName(defaultName);
    }
  }, [roomType]);
  
  const handleContinue = async () => {
    if (roomName.trim() === '') {
      toast.error('Please enter a room name');
      return;
    }

    setIsSubmitting(true);

    console.log('[DEBUG] Starting handleContinue() function');
    console.log('[DEBUG] Current ID from router.query:', id);
    console.log('[DEBUG] Current roomType from router.query:', roomType);
    console.log('[DEBUG] Current roomId from router.query:', roomId);
    console.log('[DEBUG] Room name entered:', roomName);

    try {
      // Ensure ID is available before navigation
      if (!id) {
        console.error('Missing ID parameter for navigation');
        toast.error('Missing property ID. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // First fetch existing rooms from the API instead of using localStorage
      // This ensures we always work with the most up-to-date data from the database
      let existingRooms = [];
      try {
        console.log('[DEBUG] Fetching existing rooms from API...');
        const response = await apiService.properties.getRooms(id);
        // The API returns an array directly, not nested under 'rooms'
        if (response.data && Array.isArray(response.data)) {
          existingRooms = response.data;
        } else {
          console.log('[DEBUG] API did not return an array:', response.data);
          existingRooms = [];
        }
        console.log('[DEBUG] Existing rooms from API:', existingRooms);
      } catch (fetchError) {
        console.error('Error fetching rooms from API:', fetchError);
        toast.error('Could not fetch existing rooms. Proceeding with new room.');
        // Continue with empty rooms array if fetch fails - we'll create a new room
      }

      // Generate or use existing roomId
      let finalRoomId = roomId;
      if (!roomId || roomId === 'new') {
        // Create unique ID using timestamp and random number
        finalRoomId = `room_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        console.log('[DEBUG] Generated new roomId:', finalRoomId);
      } else {
        console.log('[DEBUG] Using existing roomId:', finalRoomId);
      }

      // Create room data object
      const roomData = {
        roomName: roomName,
        roomType: roomType || 'other',
        roomId: finalRoomId,
        photoCount: 0,
        timestamp: new Date().toISOString()
      };

      console.log('[DEBUG] Room data to be saved:', roomData);

      // Update existing room or add new one
      const existingRoomIndex = existingRooms.findIndex(room => room.roomId === finalRoomId);

      if (existingRoomIndex >= 0) {
        // Update existing room but preserve important fields
        const existingRoom = existingRooms[existingRoomIndex];
        console.log('[DEBUG] Existing room data:', existingRoom);

        // Preserve existing values and only update modified ones
        existingRooms[existingRoomIndex] = {
          ...existingRoom,                     // Keep all existing data
          roomName: roomName,                  // Update only modified values
          roomType: roomType || existingRoom.roomType,
          timestamp: new Date().toISOString()
        };

        console.log('[DEBUG] Updated room data:', existingRooms[existingRoomIndex]);
      } else {
        // Add new room
        existingRooms.push(roomData);
        console.log('[DEBUG] Added new room:', roomData);
      }

      // Save rooms to the database via API - no longer using localStorage
      // This ensures data persistence and availability across devices
      try {
        console.log('[DEBUG] Saving rooms to database via API...');
        // Make sure we're passing the data correctly as {rooms: existingRooms}
        const saveResponse = await apiService.properties.saveRooms(id, existingRooms);
        console.log('[DEBUG] Successfully saved rooms to database:', saveResponse.data);

        // If API returns the saved rooms with server-generated IDs, use those instead
        if (saveResponse.data && saveResponse.data.rooms) {
          // Find the room we just saved in the response
          const savedRoom = saveResponse.data.rooms.find(room =>
            room.roomName === roomName && room.roomType === (roomType || 'other'));

          // Use the server-generated roomId if available
          if (savedRoom && savedRoom.roomId) {
            finalRoomId = savedRoom.roomId;
            console.log('[DEBUG] Using server-generated roomId:', finalRoomId);
          }
        }
      } catch (saveError) {
        console.error('Error saving rooms to database:', saveError);
        toast.error('Failed to save room. Please try again.');
        setIsSubmitting(false);
        return; // Stop execution if save fails - don't proceed to upload photos
      }

      // Navigate to photo upload page after successful API call
      // We only reach this point if the room was successfully saved to the database
      const timestamp = new Date().getTime();
      console.log("[DEBUG] Navigating to upload-photos page");

      // Log the final navigation parameters
      console.log("[DEBUG] Final navigation parameters:", {
        pathname: `/properties/${id}/upload-photos`,
        query: {
          roomName,
          roomType: roomType || '',
          roomId: finalRoomId, // Using the roomId from API or generated locally
          timestamp
        }
      });

      // Use Next.js router for client-side navigation
      // The roomId parameter is critical here - it must match what's in the database
      // so that uploaded photos are associated with the correct room
      router.push({
        pathname: `/properties/${id}/upload-photos`,
        query: {
          roomName,
          roomType: roomType || '',
          roomId: finalRoomId,
          t: timestamp // Cache-busting parameter
        }
      });
    } catch (error) {
      console.error('Error in room configuration process:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);

      // Show descriptive error message
      toast.error(`Failed to continue: ${error.message || 'Unknown error'}`);
      setIsSubmitting(false);
    }
  };
  
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
          
          /* Fix input focus zoom on iOS devices */
          @media screen and (-webkit-min-device-pixel-ratio: 0) { 
            select,
            textarea,
            input {
              font-size: 16px !important;
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
            className="absolute left-[20px] top-[50%] transform -translate-y-1/2 z-[2]"
            onClick={(e) => {
              e.preventDefault();
              if (id) {
                window.location.href = `/properties/${id}`;
              } else {
                window.location.href = "/properties";
              }
            }}
            aria-label="Go back"
          >
            <ArrowLeftIcon />
          </button>
          <h1 className="w-full max-w-[270px] font-semibold text-[18px] leading-[25px] text-center text-[#0B1420]">
            Configure Room
          </h1>
        </div>
      </div>
      
      {/* Room Configuration Section */}
      <div className="fixed left-0 right-0 w-full px-5 bg-[#FBF5DA]" style={{top: '105px'}}>
        <div className="max-w-[350px] mx-auto">
          <div className="font-bold text-[16px] leading-[22px] text-[#0B1420]">
            Give this room a name so you can easily recognize it later. Like "Bedroom 1" or "Guest Bath".
          </div>
          
          <div className="flex flex-col gap-[8px] w-full mt-6">
            <label className="font-bold text-[14px] leading-[19px] text-[#0B1420]">
              Name Of This Room
            </label>
          </div>
        </div>
      </div>
      
      {/* Name Input - Fixed Position */}
      <div className="fixed left-0 right-0 w-full px-5 py-4 bg-[#FBF5DA]" style={{top: '180px'}}>
        <div className="max-w-[350px] mx-auto">
          <div className="w-full h-[56px] flex items-center bg-[#F6FEF7] border border-[#D1E7D5] rounded-[16px] px-5">
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name"
              className="w-full font-bold text-[16px] leading-[22px] text-[#0B1420] bg-transparent border-none outline-none"
              autoFocus
            />
          </div>
        </div>
      </div>
      
      {/* Continue Button */}
      <div className="fixed left-0 right-0 bottom-0 w-full px-5 py-4 bg-[#FBF5DA] safe-area-bottom">
        <div className="max-w-[350px] mx-auto">
          <button
            onClick={handleContinue}
            disabled={isSubmitting}
            className="w-full h-[56px] flex justify-center items-center bg-[#1C2C40] rounded-[16px]"
          >
            <span className="font-bold text-[16px] leading-[22px] text-center text-[#D1E7E2]">
              {isSubmitting ? 'Saving...' : 'Continue'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}