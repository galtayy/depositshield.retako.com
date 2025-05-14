import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import axios from 'axios';

// API base URL
const API_URL = typeof window !== 'undefined' 
  ? window.location.hostname !== 'localhost' 
    ? 'https://api.depositshield.retako.com'
    : 'http://localhost:5050'
  : 'https://api.depositshield.retako.com';
  
const logApiUrl = () => {
  if (typeof window !== 'undefined') {
    console.log('Using API_URL:', API_URL);
    console.log('Window hostname:', window.location.hostname);
  }
};

export default function SharedMoveOutReport() {
  const router = useRouter();
  const { uuid } = router.query;
  
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [propertyInfo, setPropertyInfo] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [activeRoomTab, setActiveRoomTab] = useState({});
  const [propertyDetailsOpen, setPropertyDetailsOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  
  useEffect(() => {
    if (!router.isReady || !uuid) return;
    
    // Log API URL for debugging
    logApiUrl();
    
    // Rapor yükleniyor
    console.log(`[Report Viewer] Fetching report with UUID: ${uuid}`);
    fetchReport();
  }, [router.isReady, uuid]);
  
  const fetchReport = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching shared report with UUID:', uuid);
      
      // Fetch the report by UUID from the API
      try {
        // Get report data
        const reportResponse = await axios.get(`${API_URL}/api/reports/uuid/${uuid}`, {
          headers: { 'Accept': 'application/json' }
        });
        
        const reportData = reportResponse.data;
        console.log('Report data:', reportData);
        
        // Log report baseUrl if provided
        if (reportData && reportData.baseUrl) {
          console.log('Report base URL:', reportData.baseUrl);
        }
        
        // Backend dönüşünde rooms alanı var mı kontrol et
        if (reportData) {
          // Rooms direkt olarak API'den geliyorsa kullan
          const roomsData = reportData.rooms || [];
          console.log(`Found ${roomsData.length} rooms from API response`);
          
          // Log rooms ve fotoğraflarını (debug için)
          if (roomsData.length > 0) {
            roomsData.forEach(room => {
              console.log(`Room ${room.name}: ${room.photos ? room.photos.length : 0} photos`);
              if (room.photos && room.photos.length > 0) {
                room.photos.forEach((photo, i) => {
                  console.log(`Room ${room.name} Photo ${i+1}:`, photo);
                });
              }
            });
          }
          
          // Ayrıca reportData.photos varsa, onları da odalarla birleştir
          if (reportData.photos && reportData.photos.length > 0) {
            console.log(`Found ${reportData.photos.length} photos at report level, distributing to rooms`);
            
            reportData.photos.forEach(photo => {
              // Her fotoğrafın oda ID'sine göre odaya ekle
              if (photo.room_id) {
                const room = roomsData.find(r => r.id === photo.room_id);
                if (room) {
                  // Odaya fotoğraf ekle
                  if (!room.photos) room.photos = [];
                  room.photos.push(photo);
                  console.log(`Added photo ${photo.id} to room ${room.name}`);
                }
              }
            });
          }
          
          // Eğer odalar API'den geliyorsa fotoğrafları da zaten içeriyor olmalı
          // Set the report data and rooms
          setReport(reportData);
          setPropertyInfo(reportData.property);
          setRooms(roomsData);
          
          // Initialize active tab for each room
          const initialActiveRoomTab = {};
          roomsData.forEach(room => {
            initialActiveRoomTab[room.id] = 'photos';
          });
          setActiveRoomTab(initialActiveRoomTab);
          
          setIsLoading(false);
          return;
        }
      } catch (reportError) {
        console.error('Failed to fetch report:', reportError);
      }
      
      // Rapor verisini API'den alamadık, hata göster ve kullanıcıyı bilgilendir
      console.warn('API error or data not available for this report');
      const reportData = {
        id: uuid,
        title: 'Report Not Available',
        type: 'error',
        address: 'Report data could not be loaded',
        description: 'Unable to load move-out report details',
        created_at: new Date().toISOString(),
        property: {
          id: uuid,
          address: 'Property information not available',
          property_type: '',
          description: ''
        },
        tenant: {
          name: '',
          email: '',
          phone: ''
        },
        landlord: {
          name: '',
          email: '',
          phone: ''
        },
        rooms: []
      };
      
      // Kullanıcıya gösterilecek bir hata mesajı
      console.error('Report data could not be loaded. Please try again or contact support.');
      
      setReport(reportData);
      setPropertyInfo(reportData.property);
      setRooms(reportData.rooms);
      
      // Initialize active tab for each room
      const initialActiveRoomTab = {};
      reportData.rooms.forEach(room => {
        initialActiveRoomTab[room.id] = 'photos';
      });
      setActiveRoomTab(initialActiveRoomTab);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching report:', error);
      setIsLoading(false);
    }
  };
  
  // Get photo URL - handles various photo object structures
  const getPhotoUrl = (photo) => {
    if (!photo) return 'https://via.placeholder.com/300x200?text=No+Photo';
    
    console.log('Processing photo:', photo);
    
    // Basit direktif - öncelikle her fotoğraf objesi için tüm yolları dene
    try {
      // Direct URL property
      if (photo.url) {
        // Eğer url /uploads ile başlıyorsa önüne API_URL ekle
        if (photo.url.startsWith('/uploads')) {
          return `${API_URL}${photo.url}`;
        }
        return photo.url;
      }
      
      // file_path property (Backend'den gelen en güvenilir yöntem)
      if (photo.file_path) {
        console.log(`Constructing URL from file_path: ${photo.file_path}`);
        return `${API_URL}/uploads/${photo.file_path}`;
      }
      
      // id property - genelde çalışan bir yöntem 
      if (photo.id && typeof photo.id === 'number') {
        console.log(`Constructing URL from photo ID: ${photo.id}`);
        return `${API_URL}/api/photos/${photo.id}/public`;
      }
      
      // Path property (common in API responses)
      if (photo.path) {
        // If path already contains http/https, return as is
        if (photo.path.startsWith('http')) return photo.path;
        // Otherwise, construct URL from API base
        return `${API_URL}/${photo.path.replace(/^\//, '')}`;
      }
      
      // Filename property
      if (photo.filename) return `${API_URL}/uploads/${photo.filename}`;
      
      // If photo is just a string (path or URL)
      if (typeof photo === 'string') {
        if (photo.startsWith('http')) return photo;
        return `${API_URL}/${photo.replace(/^\//, '')}`;
      }
    } catch (error) {
      console.error('Error constructing photo URL:', error);
    }
    
    // Fallback
    console.log('Falling back to placeholder for photo:', photo);
    return 'https://via.placeholder.com/300x200?text=Error+Loading';
  };
  
  // Toggle tabs
  const toggleRoomTab = (roomId, tab) => {
    setActiveRoomTab(prev => ({
      ...prev,
      [roomId]: tab
    }));
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#FBF5DA]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C2C40]"></div>
      </div>
    );
  }
  
  if (!report || report.error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FBF5DA] px-4">
        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h1 className="text-xl font-bold text-[#1C2C40] mb-4">Report Not Available</h1>
        <p className="text-[#515964] text-center mb-6">
          {report && report.error ? report.description : "The report you are looking for could not be found. The link may be invalid or the report has been deleted."}
        </p>
        <button 
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-[#3B7145] text-white rounded-md hover:bg-[#2A5A32] transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen max-w-[390px] mx-auto bg-[#FBF5DA] font-['Nunito']">
      {/* Photo Lightbox */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-full max-h-full">
            <img 
              src={selectedPhoto.url} 
              alt={selectedPhoto.alt}
              className="max-w-full max-h-[90vh] object-contain"
            />
            <button 
              className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white bg-opacity-70 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPhoto(null);
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L4 12" stroke="#0B1420" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 4L12 12" stroke="#0B1420" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
      <Head>
        <title>Move-Out Report - DepositShield</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#FBF5DA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </Head>
      
      {/* Status Bar Space */}
      <div className="w-full h-[40px]"></div>
      
      {/* Title + Subtext */}
      <div className="flex flex-col items-start px-5 gap-1 mt-[32px]">
        <div className="flex flex-row items-center justify-between w-full">
          <h1 className="font-bold text-[20px] leading-[27px] text-[#0B1420]">
            Walkthrough Details
          </h1>
          <button className="p-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.75 22.16c-.41 0-.75-.34-.75-.75v-2.04c0-.36.06-.7.17-1.01l.07-.2c.05-.12.1-.25.15-.37.43-1.01 1.32-1.99 3.05-3.35l.3-.23c.51-.4.81-1.01.81-1.65v-2.6c0-.89-.26-1.75-.76-2.48C19.21 6.64 18.21 6 17.09 6H7c-1.06 0-2.02.57-2.55 1.48-.52.91-.52 2.03 0 2.95.53.92 1.49 1.48 2.55 1.48.41 0 .75.34.75.75s-.34.75-.75.75c-1.47 0-2.81-.79-3.56-2.06-.76-1.29-.76-2.86 0-4.15C4.19 5.89 5.53 5.1 7 5.1h10.09c1.49 0 2.86.86 3.55 2.19.63.93.97 2.03.97 3.19v2.6c0 1.11-.54 2.17-1.44 2.83l-.3.24c-1.56 1.23-2.33 2.04-2.66 2.79-.03.07-.07.15-.1.22l-.06.18c-.05.15-.08.31-.08.47v2.04c.04.42-.3.76-.72.76z" fill="#292D32"/>
              <path d="M12 18.75c-.42 0-.75-.33-.75-.75v-4.25c0-.41.33-.75.75-.75s.75.34.75.75V18c0 .42-.33.75-.75.75zM12 8.25c-.41 0-.75-.34-.75-.75s.34-.75.75-.75.75.33.75.75-.34.75-.75.75z" fill="#292D32"/>
            </svg>
          </button>
        </div>
        <p className="font-normal text-[14px] leading-[19px] text-[#515964]">
          Move-out details uploaded by the tenant
        </p>
      </div>
      
      {/* Property Selector - Now a dropdown */}
      <div className="px-5 mt-[24px]">
        <div 
          className={`flex flex-col bg-white border border-[#D1E7D5] rounded-[16px] overflow-hidden transition-all duration-300 ${propertyDetailsOpen ? 'mb-0' : 'mb-0'}`}
          onClick={() => setPropertyDetailsOpen(!propertyDetailsOpen)}
        >
          {/* Header always visible */}
          <div className="flex flex-row items-center p-[18px] gap-2 cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.8334 6.29166C17.6084 6.29166 17.3917 6.19999 17.2334 6.04166C17.0667 5.87499 16.9834 5.65833 16.9834 5.42499V3.56666L12.65 7.90833C12.3334 8.22499 11.8167 8.22499 11.5 7.90833C11.1834 7.59166 11.1834 7.07499 11.5 6.75833L15.825 2.43333H13.9667C13.4834 2.43333 13.0834 2.03333 13.0834 1.54999C13.0834 1.06666 13.4834 0.666656 13.9667 0.666656H17.8334C18.3167 0.666656 18.7167 1.06666 18.7167 1.54999V5.41666C18.7167 5.89999 18.3167 6.29999 17.8334 6.29999V6.29166Z" fill="#515964"/>
              <path d="M7.4583 19.3333H3.5583C1.59997 19.3333 0.833301 18.5667 0.833301 16.6083V3.3917C0.833301 1.43336 1.59997 0.666693 3.5583 0.666693H7.4583C7.94163 0.666693 8.3333 1.06669 8.3333 1.55003C8.3333 2.03336 7.94163 2.43336 7.4583 2.43336H3.5583C2.59163 2.43336 2.59163 2.44169 2.59163 3.40003V16.6167C2.59163 17.5667 2.59997 17.575 3.5583 17.575H7.4583C7.94163 17.575 8.3333 17.975 8.3333 18.4583C8.3333 18.9417 7.94163 19.3417 7.4583 19.3417V19.3333Z" fill="#515964"/>
              <path d="M11.6583 19.3333H8.33329C7.84996 19.3333 7.44995 18.9333 7.44995 18.45C7.44995 17.9667 7.84996 17.5666 8.33329 17.5666H11.6583C12.6166 17.5666 12.6166 17.5583 12.6166 16.6V3.3917C12.6166 2.44169 12.6166 2.43336 11.6583 2.43336H8.33329C7.84996 2.43336 7.44995 2.03336 7.44995 1.55003C7.44995 1.06669 7.84996 0.666693 8.33329 0.666693H11.6583C13.6166 0.666693 14.3833 1.43336 14.3833 3.3917V16.6083C14.3833 18.5667 13.6166 19.3333 11.6583 19.3333Z" fill="#515964"/>
            </svg>

            <div className="flex-grow">
              <span className="font-bold text-[14px] leading-[19px] text-[#515964]">
                Home & Lease Details
              </span>
            </div>
            
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 20 20" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className={`transition-transform duration-300 ${propertyDetailsOpen ? 'rotate-180' : ''}`}
            >
              <path d="M16.6 7.45834L11.1667 12.8917C10.525 13.5333 9.47503 13.5333 8.83336 12.8917L3.40002 7.45834" stroke="#515964" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          {/* Dropdown content - only visible when open */}
          <div 
            className={`transition-all duration-300 overflow-hidden ${propertyDetailsOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
          >
            <div className="px-4 pb-4 pt-1 border-t border-[#F3F4F6]">
              <div className="grid grid-cols-1 gap-3 text-[14px]">
                <div className="flex flex-col">
                  <span className="text-[#515964] text-[12px]">Tenant:</span>
                  <p className="font-medium text-[#0B1420] text-[14px]">
                    {report.tenant_name || report.tenant?.name || report.creator_name || 'Tenant Name'}
                  </p>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-[#515964] text-[12px]">Property Address:</span>
                  <p className="font-medium text-[#0B1420] text-[14px]">
                    {propertyInfo?.description || propertyInfo?.address || 'Property Address'}
                  </p>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-[#515964] text-[12px]">Lease Duration:</span>
                  <p className="font-medium text-[#0B1420] text-[14px]">
                    {report.lease_duration ? `${report.lease_duration} ${report.lease_duration_type || 'months'}` : '12 months'}
                  </p>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-[#515964] text-[12px]">Move-out Date:</span>
                  <p className="font-medium text-[#0B1420] text-[14px]">
                    {report.contract_end_date 
                      ? new Date(report.contract_end_date).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })
                      : 'Not specified'
                    }
                  </p>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-[#515964] text-[12px]">Deposit Amount:</span>
                  <p className="font-medium text-[#0B1420] text-[14px]">
                    {report.deposit_amount ? `$${report.deposit_amount}` : 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      
      {/* Rooms Header */}
      <h2 className="font-bold text-[20px] leading-[27px] text-[#0B1420] px-5 mt-[24px]">
        Rooms
      </h2>
      
      {/* Room Sections */}
      <div className="mt-4 pb-20">
        {rooms.map((room, index) => (
          <div key={room.id} className="mb-12">
            {/* Room Name */}
            <h3 className="font-bold text-[16px] leading-[22px] text-[#0B1420] px-5 mb-4">
              {room.name} {room.type && `(${room.type.charAt(0).toUpperCase() + room.type.slice(1)})`}
            </h3>
            
            {/* Tabs */}
            <div className="flex flex-row items-start px-5 gap-4 mb-4">
              <div 
                className={`flex flex-col gap-1 cursor-pointer ${activeRoomTab[room.id] === 'photos' ? 'text-[#3B7145]' : 'text-[#515964]'}`}
                onClick={() => toggleRoomTab(room.id, 'photos')}
              >
                <span className="font-semibold text-[16px] leading-[22px]">
                  Photos ({room.photos ? room.photos.length : (room.photo_count || 0)})
                </span>
                {activeRoomTab[room.id] === 'photos' && 
                  <div className="h-[1.5px] bg-[#3B7145]"></div>
                }
              </div>
              
              <div 
                className={`flex flex-col gap-1 cursor-pointer ${activeRoomTab[room.id] === 'notes' ? 'text-[#3B7145]' : 'text-[#515964]'}`}
                onClick={() => toggleRoomTab(room.id, 'notes')}
              >
                <span className="font-semibold text-[16px] leading-[22px]">
                  Notes ({room.moveOutNotes ? room.moveOutNotes.length : (room.notes ? room.notes.length : 0)})
                </span>
                {activeRoomTab[room.id] === 'notes' && 
                  <div className="h-[1.5px] bg-[#3B7145]"></div>
                }
              </div>
            </div>
            
            {/* Photos Grid */}
            {activeRoomTab[room.id] === 'photos' && (
              <div className="px-5">
                <div className="grid grid-cols-3 gap-4">
                  {room.photos && room.photos.length > 0 ? (
                    room.photos.slice(0, 6).map((photo, idx) => {
                      // Try different URL options with fallbacks
                      let photoUrl;
                      if (photo.absolute_url) {
                        photoUrl = photo.absolute_url;
                      } else if (photo.url && photo.url.startsWith('/uploads') && report.baseUrl) {
                        photoUrl = `${report.baseUrl}${photo.url}`;
                      } else if (photo.file_path) {
                        photoUrl = `${API_URL}/uploads/${photo.file_path}`;
                      } else {
                        photoUrl = getPhotoUrl(photo);
                      }
                      console.log(`Displaying photo ${idx+1} for room ${room.name}:`, photoUrl);
                      console.log('Photo object:', photo);
                      return (
                        <div 
                          key={photo.id || idx} 
                          className="aspect-square bg-gray-200 rounded-[16px] overflow-hidden cursor-pointer"
                          onClick={() => setSelectedPhoto({ url: photoUrl, alt: `${room.name} photo ${idx + 1}` })}
                        >
                          <img 
                            src={photoUrl} 
                            alt={`${room.name} photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error(`Error loading image at ${photoUrl}`);
                              e.target.src = 'https://via.placeholder.com/150?text=Photo';
                            }}
                          />
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-3 py-4 text-center text-gray-500">
                      No photos available for this room
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Notes */}
            {activeRoomTab[room.id] === 'notes' && (
              <div className="px-5">
                {room.moveOutNotes && room.moveOutNotes.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-2">
                    {room.moveOutNotes.map((note, noteIdx) => (
                      <li key={noteIdx} className="font-medium text-[14px] leading-[19px] text-[#0B1420]">
                        {note}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="font-medium text-[14px] leading-[19px] text-[#6B7280]">
                    No notes available for this room.
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}