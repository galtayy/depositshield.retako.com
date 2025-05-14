import { useEffect, useState, useCallback } from 'react';
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

export default function MoveOutRooms() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { propertyId } = router.query;
  const [property, setProperty] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [roomPhotos, setRoomPhotos] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [allRoomsCompleted, setAllRoomsCompleted] = useState(false);
  
  // Fetch photos for a specific room
  const fetchRoomPhotos = useCallback(async (roomId) => {
    if (!propertyId || !roomId) return;
    
    try {
      console.log(`Fetching photos for room ${roomId}`);
      const photosResponse = await apiService.photos.getByRoom(propertyId, roomId);
      
      if (photosResponse.data && photosResponse.data.length > 0) {
        console.log(`Found ${photosResponse.data.length} photos for room ${roomId}`);
        
        // Get the first 4 photos for thumbnails
        const thumbnails = photosResponse.data.slice(0, 4).map(photo => {
          return {
            id: photo.id,
            src: apiService.getPhotoUrl(photo) || ''
          };
        });
        
        // Update the roomPhotos state with these thumbnails
        setRoomPhotos(prev => ({
          ...prev,
          [roomId]: thumbnails
        }));
      }
    } catch (error) {
      console.error(`Error fetching photos for room ${roomId}:`, error);
    }
  }, [propertyId]);

  // Fetch photos for all rooms
  const fetchAllRoomPhotos = useCallback(async (roomsList) => {
    if (!roomsList || !roomsList.length) return;
    
    // Process rooms in batches to avoid too many parallel requests
    const batchSize = 3;
    for (let i = 0; i < roomsList.length; i += batchSize) {
      const batch = roomsList.slice(i, i + batchSize);
      
      // Create promises for each room in the current batch
      const batchPromises = batch.map(room => fetchRoomPhotos(room.id));
      
      // Wait for the current batch to complete before moving to the next
      await Promise.all(batchPromises);
    }
  }, [fetchRoomPhotos]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/welcome');
      return;
    }
    
    if (router.isReady && propertyId) {
      fetchPropertyData(propertyId);
    }
  }, [user, loading, router, propertyId, router.isReady]);
  
  // Fetch photos when rooms are loaded
  useEffect(() => {
    if (rooms.length > 0) {
      fetchAllRoomPhotos(rooms);
      checkAllRoomsCompleted();
    }
  }, [rooms, fetchAllRoomPhotos]);
  
  // Check if all rooms have completed the move-out process
  const checkAllRoomsCompleted = () => {
    if (rooms.length === 0) {
      setAllRoomsCompleted(false);
      return;
    }
    
    // A room is considered complete if it has moveOutPhotoCount or moveOutNotes
    const allComplete = rooms.every(room => 
      (room.moveOutPhotoCount && room.moveOutPhotoCount > 0) || 
      (room.moveOutNotes && room.moveOutNotes.length > 0)
    );
    
    console.log('All rooms completed:', allComplete);
    setAllRoomsCompleted(allComplete);
  };

  const fetchPropertyData = async (id) => {
    try {
      setIsLoading(true);
      console.log(`Fetching property data for ID: ${id}`);
      
      // API'den veriyi çek
      const axios = (await import('axios')).default;
      const token = localStorage.getItem('token');
      const headers = { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      // Environment Check
      const isProduction = typeof window !== 'undefined' ? window.location.hostname !== 'localhost' : false;
      const apiUrl = isProduction ? 'https://api.depositshield.retako.com' : 'http://localhost:5050';
      
      // Property verisini çek
      try {
        console.log('Fetching property from', `${apiUrl}/api/properties/${id}`);
        
        let propertyData;
        
        try {
          const propertyResponse = await axios.get(`${apiUrl}/api/properties/${id}`, { headers });
          propertyData = propertyResponse.data;
        } catch (apiError) {
          console.error('API error:', apiError);
          // Örnek mülk verisi
          propertyData = { 
            id: id, 
            address: id == 1 ? '123 Main St, Apt 4B' : (id == 2 ? '456 Park Ave' : '789 Broadway, Unit 7C'),
            property_type: id == 1 ? 'Apartment' : (id == 2 ? 'House' : 'Condo'),
            description: id == 1 ? 'Two bedroom apartment' : (id == 2 ? 'Single family home' : 'Modern condo with view')
          };
        }
        
        console.log(`Loaded property data:`, propertyData);
        
        // Property'i state'e kaydet
        setProperty(propertyData);
        
        // Önce localStorage'dan odaları yüklemeyi dene
        const savedRooms = JSON.parse(localStorage.getItem(`property_${id}_rooms`) || '[]');
        console.log('Rooms from localStorage:', savedRooms);
        
        if (savedRooms.length > 0) {
          // localStorage'dan oda verileri varsa formatlayıp göster
          const formattedRooms = savedRooms.map(room => ({
            id: room.roomId,
            name: room.roomName,
            type: room.roomType,
            photoCount: room.photoCount || 0,
            moveOutPhotoCount: room.moveOutPhotoCount || 0,
            roomQuality: room.roomQuality || null,
            roomIssueNotes: room.roomIssueNotes || [],
            moveOutNotes: room.moveOutNotes || [],
            moveOutDate: room.moveOutDate || null,
            description: `${room.roomType.charAt(0).toUpperCase() + room.roomType.slice(1)} area`
          }));
          console.log('Formatted rooms from localStorage:', formattedRooms);
          setRooms(formattedRooms);
          
          // Check if all rooms are completed
          const allComplete = formattedRooms.every(room => 
            (room.moveOutPhotoCount && room.moveOutPhotoCount > 0) || 
            (room.moveOutNotes && room.moveOutNotes.length > 0)
          );
          setAllRoomsCompleted(allComplete);
        } else {
          // localStorage'da oda verisi yoksa API'den yüklemeyi dene
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
                moveOutDate: room.moveOutDate || null,
                description: "" // Removed area description as requested
              }));
              console.log('Rooms from API:', apiRooms);
              setRooms(apiRooms);
              
              // Check if all rooms are completed
              const allComplete = apiRooms.every(room => 
                (room.moveOutPhotoCount && room.moveOutPhotoCount > 0) || 
                (room.moveOutNotes && room.moveOutNotes.length > 0)
              );
              setAllRoomsCompleted(allComplete);
            } else {
              // API'den oda verisi alamadığımız için hata mesajı göster
              console.log('No rooms found in localStorage or API, showing error message');
              console.error('Room data could not be loaded.');
              // Boş oda dizisi gönder
              setRooms([]);
            }
          } catch (error) {
            console.error('Failed to load rooms from API:', error);
            // Örnek odalar göster
            setRooms([
              { id: 'sample_1', name: 'Living Room', description: '', type: 'living', photoCount: 0 },
              { id: 'sample_2', name: 'Bedroom at Entrance', description: '', type: 'bedroom', photoCount: 0 },
              { id: 'sample_3', name: 'Master Bedroom', description: '', type: 'bedroom', photoCount: 0 },
              { id: 'sample_4', name: 'Kitchen', description: '', type: 'kitchen', photoCount: 0 },
              { id: 'sample_5', name: 'Bathroom', description: '', type: 'bathroom', photoCount: 0 }
            ]);
          }
        }
        
      } catch (propError) {
        console.error('Failed to load property:', propError);
        console.error('Error loading property information');
        
        // Örnek property
        setProperty({ 
          id: id, 
          address: id == 1 ? '123 Main St, Apt 4B' : (id == 2 ? '456 Park Ave' : '789 Broadway, Unit 7C'),
          property_type: id == 1 ? 'Apartment' : (id == 2 ? 'House' : 'Condo'),
          description: id == 1 ? 'Two bedroom apartment' : (id == 2 ? 'Single family home' : 'Modern condo with view')
        });
        
        // API'den oda verisi alamadığımız için hata mesajı gösteriyoruz
        console.error('Room data could not be loaded. Please set up your property rooms first or contact support.');
        // Boş oda dizisi atayarak kullanıcının gerekli action'u almasını sağlıyoruz
        setRooms([]);
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching property data:', error);
      setIsLoading(false);
      console.error('An error occurred. Please try again.');
      
      // Mülk bilgisi alamadığımızda basit bir nesne döndürüyor ve hata mesajı gösteriyoruz
      setProperty({ 
        id: id, 
        address: 'Property data could not be loaded',
        property_type: '',
        description: ''
      });
      
      // Hata mesajı göster
      console.error('Property data could not be loaded. Please contact support.');
      
      // Boş oda dizisi
      setRooms([]);
    }
  };

  if (loading || isLoading) {
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
          Mülk bilgileri bulunamadı. Lütfen geçerli bir mülk seçin.
        </p>
        <button
          onClick={() => router.push('/move-out')}
          className="mt-4 px-6 py-3 bg-[#1C2C40] rounded-[16px] text-[#D1E7E2] font-bold text-[16px]"
        >
          Geri Dön
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-[#FBF5DA] font-['Nunito'] min-h-screen">
      <Head>
        <title>Move Out - Room Selection</title>
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
              onClick={() => router.push('/')}
              aria-label="Go back"
            >
              <BackIcon />
            </button>
            <h1 className="font-semibold text-[18px] leading-[140%] text-center text-[#0B1420]">
              Room Management
            </h1>
          </div>
        </div>
      
        {/* Main Content */}
        <div className="w-full px-5 pb-32">
          <div className="w-full mx-auto">
            <h2 className="font-bold text-[16px] leading-[22px] text-[#0B1420] mb-1">
              Let's document your move-out condition
            </h2>
            <p className="font-normal text-[14px] leading-[19px] text-[#515964] mb-6">
              Select a room to document its current condition. We'll compare with your previous photos.
            </p>
          </div>
          
          <div className="w-full mx-auto">
            <div className="flex flex-col gap-[10px] w-full mb-6">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="w-full p-[16px] bg-white border border-[#D1E7D5] rounded-[16px] cursor-pointer relative active:bg-gray-50 transition-colors touch-manipulation"
                  onClick={() => router.push(`/move-out/room?propertyId=${propertyId}&roomId=${room.id}`)}
                >
                  <div className="flex flex-row justify-between w-full">
                    <div className="flex flex-col gap-2">
                      {/* Room completion status above the name - with fixed width */}
                      {((room.moveOutPhotoCount && room.moveOutPhotoCount > 0) || (room.moveOutNotes && room.moveOutNotes.length > 0)) ? (
                        <span className="bg-[#4D935A] px-2 py-0.5 rounded-full text-[10px] font-semibold text-white inline-block mb-1 min-w-[80px] text-center">
                          Completed
                        </span>
                      ) : (
                        <span className="bg-[#F3F4F6] px-2 py-0.5 rounded-full text-[10px] font-semibold text-[#6B7280] inline-block mb-1 min-w-[80px] text-center">
                          Not Complete
                        </span>
                      )}
                      <div className="flex flex-row items-center gap-1">
                        <span className="font-bold text-[14px] leading-[19px] text-[#0B1420]">
                          {room.name}
                        </span>
                      </div>
{/* Room description removed as requested */}
                      <div className="flex flex-row items-center gap-1">
                        <div className="flex">
                          {/* Real photo thumbnails */}
                          {roomPhotos[room.id] ? (
                            roomPhotos[room.id].map((photo, i) => (
                              <div 
                                key={i} 
                                className="w-[24px] h-[24px] rounded-[14px] bg-gray-200 border border-[#D1E7E2] overflow-hidden"
                                style={{ marginLeft: i > 0 ? '-8px' : '0', zIndex: 4 - i }}
                              >
                                <img 
                                  src={photo.src} 
                                  alt={`Room photo ${i + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    console.error(`Error loading thumbnail ${i} for room ${room.id}`);
                                    e.target.onerror = null;
                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IiNFRkVGRUYiLz48cGF0aCBkPSJNOSAxNkgxNVYxN0g5VjE2WiIgZmlsbD0iIzk5OSIvPjxwYXRoIGQ9Ik0xMiA3QzEwLjM0IDcgOSA4LjM0IDkgMTBDOSAxMS42NiAxMC4zNCAxMyAxMiAxM0MxMy42NiAxMyAxNSAxMS42NiAxNSAxMEMxNSA4LjM0IDEzLjY2IDcgMTIgN1pNMTIgMTJDMTAuOSAxMiAxMCAxMS4xIDEwIDEwQzEwIDguOSAxMC45IDggMTIgOEMxMy4xIDggMTQgOC45IDE0IDEwQzE0IDExLjEgMTMuMSAxMiAxMiAxMloiIGZpbGw9IiM5OTkiLz48L3N2Zz4=';
                                  }}
                                />
                              </div>
                            ))
                          ) : (
                            // Fallback to placeholder thumbnails if photos aren't loaded yet
                            Array.from({ length: Math.min(room.photoCount || 0, 4) }).map((_, i) => (
                              <div 
                                key={i} 
                                className="w-[24px] h-[24px] rounded-[14px] bg-gray-200 border border-[#D1E7E2]"
                                style={{ marginLeft: i > 0 ? '-8px' : '0', zIndex: 4 - i }}
                              >
                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                  {i+1}
                                </div>
                              </div>
                            ))
                          )}
                          
                          {/* Show the '+X more' indicator if there are more than 4 photos */}
                          {room.photoCount > 4 && (
                            <div 
                              className="w-[24px] h-[24px] rounded-[14px] bg-[#1C2C40] border border-[#D1E7E2] flex items-center justify-center text-[10px] text-white font-bold"
                              style={{ marginLeft: '-8px', zIndex: 0 }}
                            >
                              +{room.photoCount - 4}
                            </div>
                          )}
                        </div>
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
        </div>
        
        {/* Send Report Button - Fixed at bottom */}
        <div className="fixed left-0 right-0 bottom-0 w-full px-5 py-4 bg-[#FBF5DA] safe-area-bottom border-t border-[#E5E7EB]">
          <div className="max-w-[390px] mx-auto">
            <button
              disabled={!allRoomsCompleted}
              onClick={async () => {
                if (allRoomsCompleted) {
                  try {
                    console.log('Move-out report is being prepared...');
                    setAllRoomsCompleted(false); // Disable button while sending
                    
                    // Generate a unique ID for the report
                    const reportUuid = await import('uuid').then(module => module.v4());
                    
                    // Collect all photos from all rooms
                    const allPhotos = [];
                    for (const room of rooms) {
                      if (roomPhotos[room.id]) {
                        roomPhotos[room.id].forEach(photo => {
                          allPhotos.push({
                            ...photo,
                            roomId: room.id,
                            roomName: room.name,
                            roomType: room.type
                          });
                        });
                      }
                    }
                    
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
                    
                    try {
                      // Create the report - UUID önce konsola yazdıralım
                      console.log('Creating report with UUID:', reportUuid);
                      
                      // Report oluşturma verilerini kontrol edelim
                      const reportPayload = {
                        uuid: reportUuid,
                        title: reportData.title,
                        type: 'move-out',
                        description: `Move-out report for ${property.address}`,
                        property_id: property.id,
                        address: property.address,
                        property_type: property.property_type || 'unknown',
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
                          moveOutNotes: room.moveOutNotes, // Using moveOutNotes consistently
                          notes: room.moveOutNotes, // For backward compatibility
                          photo_count: room.moveOutPhotoCount,
                          move_out_date: room.moveOutDate,
                          address: property.address // Include address with each room
                        }))
                      };
                      
                      console.log('Report payload:', JSON.stringify(reportPayload));
                      
                      // Create the report
                      const response = await apiService.reports.create(reportPayload);
                      
                      console.log('Report created:', response.data);
                      
                      // Backend'in döndürdüğü UUID'yi kullan (varsa)
                      const returnedUuid = response.data.uuid || reportUuid;
                      console.log('Using UUID for sharing:', returnedUuid);
                      
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
                      
                      // Set the report URL - backend'in döndürdüğü UUID'yi kullan
                      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
                      const shareableUrl = `${baseUrl}/reports/shared/${returnedUuid}`;
                      
                      // Send email to landlord
                      try {
                        // Backend'den dönen UUID'yi kullan
                        const notificationUuid = response.data.uuid || reportUuid;
                        await apiService.reports.sendNotification(response.data.id, {
                          recipientEmail: property.landlord_email,
                          recipientName: property.landlord_name || 'Property Owner',
                          subject: 'New Move-Out Report Available',
                          message: `A new move-out report has been created for your property at ${property.address}. Click the link below to view the report.`,
                          reportId: response.data.id,
                          reportUuid: notificationUuid,
                          reportUrl: shareableUrl
                        });
                        
                        console.log('Report sent to landlord successfully!');
                        
                        // Store success in local storage so we can redirect
                        localStorage.setItem('report_share_success', 'true');
                        localStorage.setItem('report_share_url', shareableUrl);
                        localStorage.setItem('report_uuid', notificationUuid);
                        
                        // Log the exact sharing URL for debugging
                        console.log('Sharing report with URL:', shareableUrl);
                        console.log('Using UUID:', returnedUuid);
                        
                        // Redirect to success page
                        router.push({
                          pathname: '/reports/share-success',
                          query: { url: shareableUrl, uuid: notificationUuid }
                        });
                      } catch (emailError) {
                        console.error('Error sending notification email:', emailError);
                        console.warn('Report created but email notification could not be sent');
                        
                        // Still redirect to success page
                        localStorage.setItem('report_share_success', 'true');
                        localStorage.setItem('report_share_url', shareableUrl);
                        
                        router.push({
                          pathname: '/reports/share-success',
                          query: { url: shareableUrl }
                        });
                      }
                    } catch (reportError) {
                      console.error('Error creating report:', reportError);
                      console.error('Failed to create report. Please try again.');
                      setAllRoomsCompleted(true); // Re-enable button
                    }
                  } catch (error) {
                    console.error('Error in send report process:', error);
                    console.error('Failed to send report. Please try again later.');
                    setAllRoomsCompleted(true); // Re-enable button
                  }
                } else {
                  console.warn('Complete all room documentation before sending the report');
                }
              }}
              className={`w-full h-[56px] flex justify-center items-center rounded-[16px] shadow-sm font-bold text-[16px] leading-[22px] text-center ${
                allRoomsCompleted 
                  ? 'bg-[#1C2C40] text-[#D1E7E2] cursor-pointer' 
                  : 'bg-[#C6CCD5] text-[#6B7280] cursor-not-allowed'
              }`}
            >
              Send Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}