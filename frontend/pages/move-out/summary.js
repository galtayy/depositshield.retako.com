import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
// Use native JavaScript Date formatting instead of date-fns
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../../lib/auth';
import { apiService } from '../../lib/api';

// Back icon component
const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19L8 12L15 5" stroke="#2E3642" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function MoveOutSummary() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { propertyId } = router.query;
  
  const [property, setProperty] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [roomPhotos, setRoomPhotos] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [reportUrl, setReportUrl] = useState('');
  const [shareSuccess, setShareSuccess] = useState(false);
  
  // Fetch property and room data
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/welcome');
      return;
    }
    
    if (router.isReady && propertyId) {
      fetchPropertyData(propertyId);
    }
  }, [user, authLoading, router, propertyId, router.isReady]);
  
  const fetchPropertyData = async (id) => {
    try {
      setIsLoading(true);
      console.log(`Fetching property data for ID: ${id}`);
      
      // Fetch property data
      try {
        const propertyResponse = await apiService.properties.getById(id);
        setProperty(propertyResponse.data);
        
        // Load rooms from localStorage or API
        const savedRooms = JSON.parse(localStorage.getItem(`property_${id}_rooms`) || '[]');
        
        if (savedRooms.length > 0) {
          // Format rooms from localStorage
          const formattedRooms = savedRooms.map(room => ({
            id: room.roomId,
            name: room.roomName,
            type: room.roomType,
            photoCount: room.photoCount || 0,
            moveOutPhotoCount: room.moveOutPhotoCount || 0,
            roomQuality: room.roomQuality || null,
            roomIssueNotes: room.roomIssueNotes || [],
            moveOutNotes: room.moveOutNotes || [],
            moveOutDate: room.moveOutDate || null
          }));
          
          console.log('Rooms from localStorage:', formattedRooms);
          setRooms(formattedRooms);
          
          // Fetch photos for each room
          for (const room of formattedRooms) {
            if (room.id) {
              await fetchRoomPhotos(room.id);
            }
          }
        } else {
          // Try to get rooms from API
          try {
            const roomsResponse = await apiService.properties.getRooms(id);
            if (roomsResponse.data && roomsResponse.data.length > 0) {
              const apiRooms = roomsResponse.data.map(room => ({
                id: room.roomId,
                name: room.roomName,
                type: room.roomType,
                photoCount: room.photoCount || 0,
                moveOutPhotoCount: room.moveOutPhotoCount || 0,
                roomQuality: room.roomQuality || null,
                roomIssueNotes: room.roomIssueNotes || [],
                moveOutNotes: room.moveOutNotes || [],
                moveOutDate: room.moveOutDate || null
              }));
              
              console.log('Rooms from API:', apiRooms);
              setRooms(apiRooms);
              
              // Fetch photos for each room
              for (const room of apiRooms) {
                if (room.id) {
                  await fetchRoomPhotos(room.id);
                }
              }
            }
          } catch (error) {
            console.error('Failed to load rooms from API:', error);
            console.error('Failed to load room data');
          }
        }
      } catch (error) {
        console.error('Failed to load property:', error);
        console.error('Property details could not be loaded');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      console.error('Could not load data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch photos for a specific room
  const fetchRoomPhotos = async (roomId) => {
    if (!propertyId || !roomId) return;
    
    try {
      console.log(`Fetching photos for room ${roomId}`);
      const photosResponse = await apiService.photos.getByRoom(propertyId, roomId);
      
      if (photosResponse.data && photosResponse.data.length > 0) {
        console.log(`Found ${photosResponse.data.length} photos for room ${roomId}`);
        
        // Process photos
        const photos = photosResponse.data.map(photo => {
          return {
            id: photo.id,
            src: apiService.getPhotoUrl(photo) || '',
            note: photo.note || '',
            tags: photo.tags || [],
            timestamp: photo.created_at || null
          };
        });
        
        // Update state with these photos
        setRoomPhotos(prev => ({
          ...prev,
          [roomId]: photos
        }));
      }
    } catch (error) {
      console.error(`Error fetching photos for room ${roomId}:`, error);
    }
  };

  // Send report to landlord
  const sendReport = async () => {
    try {
      setIsSending(true);
      
      // Generate a unique ID for the report
      const reportUuid = uuidv4();
      
      // Collect all photos from all rooms
      const allPhotos = [];
      Object.keys(roomPhotos).forEach(roomId => {
        // Find the room data
        const room = rooms.find(r => r.id === roomId);
        
        // Add room data to each photo
        if (room) {
          roomPhotos[roomId].forEach(photo => {
            allPhotos.push({
              ...photo,
              roomId,
              roomName: room.name,
              roomType: room.type
            });
          });
        }
      });
      
      // Create the report data
      const reportData = {
        uuid: reportUuid,
        title: `Move-Out Report - ${property.address}`,
        propertyId: property.id,
        property: {
          id: property.id,
          address: property.address,
          property_type: property.property_type,
          description: property.description
        },
        createdAt: new Date().toISOString(),
        tenant: {
          name: user.name,
          email: user.email,
          phone: user.phone || ''
        },
        landlord: {
          name: property.landlord_name || 'Property Owner',
          email: property.landlord_email || '',
          phone: property.landlord_phone || ''
        },
        rooms: rooms.map(room => ({
          id: room.id,
          name: room.name,
          type: room.type,
          moveOutPhotoCount: room.moveOutPhotoCount || 0,
          moveOutNotes: room.moveOutNotes || [],
          moveOutDate: room.moveOutDate || new Date().toISOString(),
          photos: roomPhotos[room.id] || []
        }))
      };
      
      // Save the report to API
      try {
        // Create the report
        const response = await apiService.reports.create({
          uuid: reportUuid,
          title: reportData.title,
          type: 'move-out',
          description: `Move-out report for ${property.address}`,
          property_id: property.id,
          address: property.address,
          tenant_name: user.name,
          tenant_email: user.email,
          tenant_phone: user.phone || '',
          landlord_name: property.landlord_name || 'Property Owner',
          landlord_email: property.landlord_email || '',
          landlord_phone: property.landlord_phone || '',
          rooms: reportData.rooms.map(room => ({
            id: room.id,
            name: room.name,
            type: room.type,
            notes: room.moveOutNotes,
            photo_count: room.moveOutPhotoCount,
            move_out_date: room.moveOutDate
          }))
        });
        
        console.log('Report created:', response.data);
        
        // Upload photos to be associated with the report
        if (allPhotos.length > 0) {
          for (const photo of allPhotos) {
            try {
              await apiService.photos.associateWithReport(photo.id, response.data.id, {
                roomId: photo.roomId,
                roomName: photo.roomName
              });
            } catch (photoError) {
              console.error('Error associating photo with report:', photoError);
            }
          }
        }
        
        // Set the report URL
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const shareableUrl = `${baseUrl}/reports/shared/${reportUuid}`;
        setReportUrl(shareableUrl);
        
        // Send email to landlord
        try {
          await apiService.reports.sendNotification(response.data.id, {
            recipientEmail: property.landlord_email,
            recipientName: property.landlord_name || 'Property Owner',
            subject: 'New Move-Out Report Available',
            message: `A new move-out report has been created for your property at ${property.address}. Click the link below to view the report.`,
            reportId: response.data.id,
            reportUuid: reportUuid,
            reportUrl: shareableUrl
          });
          
          console.log('Report sent to landlord successfully!');
          setShareSuccess(true);
          
          // Store success in local storage so we can redirect
          localStorage.setItem('report_share_success', 'true');
          localStorage.setItem('report_share_url', shareableUrl);
          
          // Redirect to success page
          router.push({
            pathname: '/reports/share-success',
            query: { url: shareableUrl }
          });
        } catch (emailError) {
          console.error('Error sending notification email:', emailError);
          console.warn('Report created but email notification could not be sent');
          setShareSuccess(true);
          setReportUrl(shareableUrl);
        }
      } catch (reportError) {
        console.error('Error creating report:', reportError);
        console.error('Failed to create report. Please try again.');
      }
    } catch (error) {
      console.error('Error in send report process:', error);
      console.error('Failed to send report. Please try again later.');
    } finally {
      setIsSending(false);
    }
  };
  
  // Format date for display using native JS
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Date unavailable';
      }
      
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    } catch (e) {
      return 'Date unavailable';
    }
  };
  
  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#FBF5DA]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C2C40]"></div>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect to welcome page
  }
  
  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#FBF5DA] px-4">
        <p className="text-[#515964] text-center">
          Property details could not be loaded. Please try again.
        </p>
        <button
          onClick={() => router.push('/move-out')}
          className="mt-4 px-6 py-3 bg-[#1C2C40] rounded-[16px] text-[#D1E7E2] font-bold text-[16px]"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-[#FBF5DA] font-['Nunito'] min-h-screen">
      <Head>
        <title>Move-Out Report Summary</title>
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
        `}</style>
      </Head>
      
      <div className="w-full max-w-[390px] relative">
        {/* Status Bar Space */}
        <div className="h-[40px] w-full safe-area-top"></div>
        
        {/* Header with Back Button */}
        <div className="w-full h-[65px] border-b border-[#ECF0F5]">
          <div className="flex flex-row justify-center items-center px-[10px] py-[20px] w-full h-[65px] relative">
            <button 
              className="absolute left-[20px] top-[50%] transform -translate-y-1/2 z-[2] flex items-center justify-center w-[40px] h-[40px]"
              onClick={() => router.push(`/move-out/rooms?propertyId=${propertyId}`)}
              aria-label="Go back"
            >
              <BackIcon />
            </button>
            <h1 className="font-semibold text-[18px] leading-[140%] text-center text-[#0B1420]">
              Move-Out Report
            </h1>
          </div>
        </div>
      
        {/* Main Content */}
        <div className="w-full px-5 pb-32">
          <div className="w-full mx-auto mt-6">
            <h2 className="font-bold text-[16px] leading-[22px] text-[#0B1420] mb-1">
              Review Your Move-Out Report
            </h2>
            <p className="font-normal text-[14px] leading-[19px] text-[#515964] mb-6">
              Here's a summary of the property and room conditions at move-out. Send this report to your landlord.
            </p>
          </div>
          
          {/* Property Card */}
          <div className="w-full mx-auto mb-6">
            <div className="bg-white rounded-[16px] p-5 shadow-sm">
              <h3 className="font-bold text-[16px] leading-[22px] text-[#0B1420] mb-3">
                Property Information
              </h3>
              <div className="space-y-2">
                <p className="font-medium text-[14px] leading-[19px] text-[#0B1420]">
                  <span className="text-[#6B7280]">Address:</span> {property.address || 'Address not available'}
                </p>
                <p className="font-medium text-[14px] leading-[19px] text-[#0B1420]">
                  <span className="text-[#6B7280]">Type:</span> {property.property_type || 'Not specified'}
                </p>
                <p className="font-medium text-[14px] leading-[19px] text-[#0B1420]">
                  <span className="text-[#6B7280]">Move-out Date:</span> {formatDate(new Date())}
                </p>
              </div>
            </div>
          </div>
          
          {/* Room Summaries */}
          <div className="w-full mx-auto">
            <h3 className="font-bold text-[16px] leading-[22px] text-[#0B1420] mb-3">
              Room Summaries
            </h3>
            
            {rooms.length === 0 ? (
              <div className="bg-white rounded-[16px] p-5 shadow-sm text-center">
                <p className="text-[#515964]">No rooms have been documented yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rooms.map(room => (
                  <div key={room.id} className="bg-white rounded-[16px] p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-[15px] leading-[20px] text-[#0B1420]">
                        {room.name}
                      </h4>
                      {((room.moveOutPhotoCount && room.moveOutPhotoCount > 0) || (room.moveOutNotes && room.moveOutNotes.length > 0)) ? (
                        <span className="bg-[#4D935A] px-2 py-0.5 rounded-full text-[10px] font-semibold text-white">
                          Completed
                        </span>
                      ) : (
                        <span className="bg-[#F3F4F6] px-2 py-0.5 rounded-full text-[10px] font-semibold text-[#6B7280]">
                          Not Complete
                        </span>
                      )}
                    </div>
                    
                    {/* Notes Section */}
                    <div className="mb-3">
                      <h5 className="font-semibold text-[13px] leading-[18px] text-[#6B7280] mb-1">
                        Move-Out Notes
                      </h5>
                      {room.moveOutNotes && room.moveOutNotes.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-1">
                          {room.moveOutNotes.map((note, noteIndex) => (
                            <li key={noteIndex} className="font-medium text-[13px] leading-[18px] text-[#0B1420]">
                              {note}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="font-medium text-[13px] leading-[18px] text-[#6B7280]">
                          No notes provided
                        </p>
                      )}
                    </div>
                    
                    {/* Photo Thumbnails */}
                    <div>
                      <h5 className="font-semibold text-[13px] leading-[18px] text-[#6B7280] mb-1">
                        Photos
                      </h5>
                      
                      {roomPhotos[room.id] && roomPhotos[room.id].length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {roomPhotos[room.id].slice(0, 4).map((photo, photoIndex) => (
                            <div 
                              key={photoIndex} 
                              className="w-[60px] h-[60px] rounded-[8px] bg-gray-200 overflow-hidden"
                            >
                              <img 
                                src={photo.src} 
                                alt={`${room.name} photo ${photoIndex + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.error(`Error loading thumbnail ${photoIndex} for room ${room.id}`);
                                  e.target.onerror = null;
                                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IiNFRkVGRUYiLz48cGF0aCBkPSJNOSAxNkgxNVYxN0g5VjE2WiIgZmlsbD0iIzk5OSIvPjxwYXRoIGQ9Ik0xMiA3QzEwLjM0IDcgOSA4LjM0IDkgMTBDOSAxMS42NiAxMC4zNCAxMyAxMiAxM0MxMy42NiAxMyAxNSAxMS42NiAxNSAxMEMxNSA4LjM0IDEzLjY2IDcgMTIgN1pNMTIgMTJDMTAuOSAxMiAxMCAxMS4xIDEwIDEwQzEwIDguOSAxMC45IDggMTIgOEMxMy4xIDggMTQgOC45IDE0IDEwQzE0IDExLjEgMTMuMSAxMiAxMiAxMloiIGZpbGw9IiM5OTkiLz48L3N2Zz4=';
                                }}
                              />
                            </div>
                          ))}
                          
                          {roomPhotos[room.id].length > 4 && (
                            <div className="w-[60px] h-[60px] rounded-[8px] bg-[#1C2C40] flex items-center justify-center text-white font-bold text-sm">
                              +{roomPhotos[room.id].length - 4}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="font-medium text-[13px] leading-[18px] text-[#6B7280]">
                          No photos available
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Send Report Button - Fixed at bottom */}
        <div className="fixed left-0 right-0 bottom-0 w-full px-5 py-4 bg-[#FBF5DA] safe-area-bottom border-t border-[#E5E7EB]">
          <div className="max-w-[390px] mx-auto">
            <button
              disabled={isSending}
              onClick={sendReport}
              className={`w-full h-[56px] flex justify-center items-center rounded-[16px] shadow-sm font-bold text-[16px] leading-[22px] text-center
                ${isSending 
                  ? 'bg-[#C6CCD5] text-[#6B7280] cursor-not-allowed' 
                  : 'bg-[#1C2C40] text-[#D1E7E2] cursor-pointer'
                }`}
            >
              {isSending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#6B7280]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending Report...
                </>
              ) : "Send Report to Landlord"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}