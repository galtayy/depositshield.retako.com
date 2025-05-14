import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import Head from 'next/head';
import { useAuth } from '../../../lib/auth';
import { apiService } from '../../../lib/api';

// Back arrow icon
const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19.9201L8.47997 13.4001C7.70997 12.6301 7.70997 11.3701 8.47997 10.6001L15 4.08008" 
      stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Arrow right icon
const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.42505 16.6L12.8584 11.1667C13.5 10.525 13.5 9.47502 12.8584 8.83336L7.42505 3.40002" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function PropertySummary() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [property, setProperty] = useState(null);
  const [propertyDetails, setPropertyDetails] = useState({
    address: 'Not specified',
    lease_duration: null,
    lease_duration_type: 'months',
    deposit_amount: null,
    contract_start_date: null,
    contract_end_date: null,
    move_in_date: null,
    moveout_date: null, // Calculated field
    landlord_email: null,
    landlord_phone: null
  });
  const [userData, setUserData] = useState(null);
  const [landlordData, setLandlordData] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [roomPhotos, setRoomPhotos] = useState({});
  
  // Make sure user is authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/welcome');
    }
  }, [user, authLoading, router]);
  
  // Load property data and user details
  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        // Load property data from API with retry mechanism
        let propertyData = null;
        try {
          const propertyResponse = await apiService.properties.getById(id);
          propertyData = propertyResponse.data;

          // Debug logs
          console.log("Property API response (success):", propertyData);
        } catch (apiError) {
          console.error("Error fetching property data from API:", apiError);

          // Try an alternative approach - direct API call
          try {
            console.log("Trying alternative API call for property data");
            const axios = (await import('axios')).default;
            const token = localStorage.getItem('token');
            const isProduction = typeof window !== 'undefined' ? window.location.hostname !== 'localhost' : process.env.NODE_ENV === 'production';
            const apiUrl = isProduction ? 'https://api.depositshield.retako.com' : 'http://localhost:5050';

            const altResponse = await axios.get(`${apiUrl}/api/properties/${id}`, {
              headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            propertyData = altResponse.data;
            console.log("Property API response (alternative):", propertyData);
          } catch (altError) {
            console.error("Alternative API call also failed:", altError);
            throw apiError; // Throw the original error
          }
        }

        if (!propertyData) {
          console.error("Failed to load property data");
          toast.error("Failed to load property information");
          return;
        }

        // Process property data - log all fields for debugging
        console.log("Property fields:", {
          address: propertyData.address,
          description: propertyData.description,
          lease_duration: propertyData.lease_duration,
          lease_duration_type: propertyData.lease_duration_type,
          deposit_amount: propertyData.deposit_amount,
          contract_start_date: propertyData.contract_start_date,
          contract_end_date: propertyData.contract_end_date,
          move_in_date: propertyData.move_in_date,
          landlord_email: propertyData.landlord_email,
          landlord_phone: propertyData.landlord_phone
        });

        // Create a clean copy to ensure no circular references
        const cleanPropertyData = {
          ...propertyData,
          // Format dates for consistency
          contract_start_date: propertyData.contract_start_date ? new Date(propertyData.contract_start_date).toISOString().split('T')[0] : null,
          contract_end_date: propertyData.contract_end_date ? new Date(propertyData.contract_end_date).toISOString().split('T')[0] : null,
          move_in_date: propertyData.move_in_date ? new Date(propertyData.move_in_date).toISOString().split('T')[0] : null,
        };

        setProperty(cleanPropertyData);

        // Prepare the detailed property information from API data and/or localStorage
        const addUnitKey = `property_${id}_addunit`;
        let storedAddUnitData = null;

        try {
          // Try to get data from localStorage if it exists
          const storedData = localStorage.getItem(addUnitKey);
          if (storedData) {
            storedAddUnitData = JSON.parse(storedData);
            console.log("Found stored addunit data:", storedAddUnitData);
          }
        } catch (e) {
          console.error("Error reading from localStorage:", e);
        }

        // Initialize details with values from API
        const details = {
          address: propertyData.address || 'Not specified',
          lease_duration: propertyData.lease_duration || null,
          lease_duration_type: propertyData.lease_duration_type || 'months',
          deposit_amount: propertyData.deposit_amount || null,
          contract_start_date: propertyData.contract_start_date || null,
          contract_end_date: propertyData.contract_end_date || null, // Will calculate if needed
          move_in_date: propertyData.move_in_date || null,
          landlord_email: propertyData.landlord_email || null,
          landlord_phone: propertyData.landlord_phone || null
        };

        // If we have stored addunit data, use it to supplement missing values
        if (storedAddUnitData) {
          // Use stored data for missing values
          if (!details.lease_duration && storedAddUnitData.leaseDuration) {
            details.lease_duration = storedAddUnitData.leaseDuration;
            console.log("Using stored lease duration:", details.lease_duration);
          }

          if (!details.lease_duration_type && storedAddUnitData.leaseDurationType) {
            details.lease_duration_type = storedAddUnitData.leaseDurationType;
            console.log("Using stored lease duration type:", details.lease_duration_type);
          }

          if (!details.deposit_amount && storedAddUnitData.depositAmount) {
            details.deposit_amount = storedAddUnitData.depositAmount;
            console.log("Using stored deposit amount:", details.deposit_amount);
          }

          if (!details.contract_start_date && storedAddUnitData.contractStartDate) {
            details.contract_start_date = storedAddUnitData.contractStartDate;
            console.log("Using stored contract start date:", details.contract_start_date);
          }

          if (!details.contract_end_date && storedAddUnitData.calculatedEndDate) {
            details.contract_end_date = storedAddUnitData.calculatedEndDate;
            console.log("Using stored contract end date:", details.contract_end_date);
          }

          if (!details.move_in_date && storedAddUnitData.moveInDate) {
            details.move_in_date = storedAddUnitData.moveInDate;
            console.log("Using stored move in date:", details.move_in_date);
          }
        }

        console.log("Initial property details (before address handling):", details);

        // Special handling for address - it could be in description or address field
        if ((details.address === 'Not specified' || !details.address) && propertyData.description) {
          details.address = propertyData.description;
          console.log("Using description as address:", details.address);
        }

        // If we have stored addunit data, make sure we use the proper address
        if (storedAddUnitData && storedAddUnitData.address) {
          // In addunit, the full address is stored in the 'address' field
          // while the user-friendly name is in 'propertyName'
          // We prefer to show the detailed address
          if (!details.address || details.address === 'Not specified' || details.address === propertyData.address) {
            details.address = storedAddUnitData.address;
            console.log("Using stored address from addunit:", details.address);
          }
        }

        // Calculate the move-out date if not explicitly provided
        if (!details.contract_end_date && (details.contract_start_date || details.move_in_date) && details.lease_duration) {
          const startDate = details.contract_start_date || details.move_in_date;
          console.log(`Calculating move-out date from: start=${startDate}, duration=${details.lease_duration}, type=${details.lease_duration_type}`);

          const calculatedMoveOutDate = calculateMoveOutDate(
            startDate,
            details.lease_duration,
            details.lease_duration_type
          );

          if (calculatedMoveOutDate) {
            details.contract_end_date = calculatedMoveOutDate.toISOString().split('T')[0];
            console.log(`Calculated move-out date: ${details.contract_end_date}`);
          }
        }

        // Set the property details for display
        setPropertyDetails(details);

        console.log("Processed property details:", details);

        // Load user data from localStorage
        const propertyKey = `property_${id}`;
        const savedUserDetails = localStorage.getItem(`${propertyKey}_user`);
        const savedLandlordDetails = localStorage.getItem(`${propertyKey}_landlord`);

        console.log("Local storage - user details:", savedUserDetails);
        console.log("Local storage - landlord details:", savedLandlordDetails);

        // Use landlord details from API if available
        if (propertyData.landlord_email || propertyData.landlord_phone) {
          const landlordFromApi = {
            email: propertyData.landlord_email || '',
            phone: propertyData.landlord_phone || ''
          };
          console.log("Using landlord details from API:", landlordFromApi);
          setLandlordData(landlordFromApi);
        } else if (savedLandlordDetails) {
          try {
            const parsedLandlordData = JSON.parse(savedLandlordDetails);
            console.log("Parsed landlord data from localStorage:", parsedLandlordData);
            setLandlordData(parsedLandlordData);
          } catch (e) {
            console.error("Error parsing landlord details:", e);
            setLandlordData({
              email: '',
              phone: ''
            });
          }
        } else {
          setLandlordData({
            email: '',
            phone: ''
          });
        }

        if (savedUserDetails) {
          try {
            const parsedUserData = JSON.parse(savedUserDetails);
            console.log("Parsed user data:", parsedUserData);
            setUserData(parsedUserData);
          } catch (e) {
            console.error("Error parsing user details:", e);
            // Use logged in user data as fallback
            setUserData({
              name: user?.name || '',
              email: user?.email || '',
              phone: ''
            });
          }
        } else {
          // Use logged in user data as fallback
          setUserData({
            name: user?.name || '',
            email: user?.email || '',
            phone: ''
          });
        }

        // Try to load photos for the property
        try {
          console.log("Attempting to load photos for property from API");

          // First try using our API service
          try {
            const photosResponse = await apiService.photos.getByProperty(id);
            if (photosResponse.data) {
              console.log("Property photos loaded from API:", photosResponse.data);

              // Process photos by room
              const photosByRoom = {};

              // Handle different possible response formats
              if (Array.isArray(photosResponse.data)) {
                // Format 1: Array of photo objects
                photosResponse.data.forEach(photo => {
                  if (photo.room_id) {
                    if (!photosByRoom[photo.room_id]) {
                      photosByRoom[photo.room_id] = { photos: [] };
                    }

                    // Ensure the URL is a complete URL
                    const fullUrl = photo.url && photo.url.startsWith('/')
                      ? `${apiService.getBaseUrl()}${photo.url}`
                      : photo.url;

                    photosByRoom[photo.room_id].photos.push({
                      ...photo,
                      url: fullUrl
                    });
                  }
                });
                console.log("Processed photos by room (format 1):", photosByRoom);
              } else if (photosResponse.data.photosByRoom) {
                // Format 2: Object with photosByRoom property
                const roomIds = Object.keys(photosResponse.data.photosByRoom);
                roomIds.forEach(roomId => {
                  const roomPhotos = photosResponse.data.photosByRoom[roomId];
                  photosByRoom[roomId] = {
                    photos: Array.isArray(roomPhotos.photos)
                      ? roomPhotos.photos.map(photo => ({
                          ...photo,
                          url: photo.url && photo.url.startsWith('/')
                            ? `${apiService.getBaseUrl()}${photo.url}`
                            : photo.url
                        }))
                      : []
                  };
                });
                console.log("Processed photos by room (format 2):", photosByRoom);
              }

              // Save processed photos
              setRoomPhotos(photosByRoom);
            }
          } catch (photoApiError) {
            console.error("Error loading photos from API:", photoApiError);
          }
        } catch (photosError) {
          console.error("Error in photos loading process:", photosError);
        }

        // Load rooms from localStorage
        const savedRooms = localStorage.getItem(`property_${id}_rooms`);
        console.log("Local storage - rooms:", savedRooms);
        let roomsFromLocalStorage = [];

        if (savedRooms) {
          try {
            const parsedRooms = JSON.parse(savedRooms);
            console.log("Parsed rooms from localStorage:", parsedRooms);
            roomsFromLocalStorage = parsedRooms;
          } catch (e) {
            console.error("Error parsing rooms from localStorage:", e);
          }
        }

        // Try to also load rooms from database as fallback
        try {
          console.log("Attempting to load rooms from database API");
          const roomsResponse = await apiService.properties.getRooms(id);
          if (roomsResponse.data && roomsResponse.data.length > 0) {
            console.log("Rooms loaded from database API:", roomsResponse.data);

            // If we have rooms from both sources, merge them intelligently
            if (roomsFromLocalStorage.length > 0) {
              // Create a map of room IDs to easily find and merge rooms
              const dbRoomsMap = {};
              roomsResponse.data.forEach(room => {
                const roomId = room.roomId || room.id;
                if (roomId) {
                  dbRoomsMap[roomId] = room;
                }
              });

              const localRoomsMap = {};
              roomsFromLocalStorage.forEach(room => {
                const roomId = room.roomId || room.id;
                if (roomId) {
                  localRoomsMap[roomId] = room;
                }
              });

              // Combine rooms from both sources, preferring the more recently updated ones
              const mergedRooms = [];
              const allRoomIds = [...new Set([
                ...Object.keys(dbRoomsMap),
                ...Object.keys(localRoomsMap)
              ])];

              allRoomIds.forEach(roomId => {
                const dbRoom = dbRoomsMap[roomId];
                const localRoom = localRoomsMap[roomId];

                if (dbRoom && localRoom) {
                  // Both sources have this room - use the more recently updated one
                  // (or local by default if no timestamp)
                  const dbTimestamp = dbRoom.timestamp || dbRoom.lastUpdated || '';
                  const localTimestamp = localRoom.timestamp || localRoom.lastUpdated || '';

                  // If local is newer, use it; otherwise use DB version
                  if (localTimestamp > dbTimestamp) {
                    mergedRooms.push(localRoom);
                  } else {
                    mergedRooms.push(dbRoom);
                  }
                } else if (dbRoom) {
                  // Only in database
                  mergedRooms.push(dbRoom);
                } else if (localRoom) {
                  // Only in localStorage
                  mergedRooms.push(localRoom);
                }
              });

              console.log("Using merged rooms from both sources:", mergedRooms);
              setRooms(mergedRooms);

              // Also update localStorage with the merged data
              localStorage.setItem(`property_${id}_rooms`, JSON.stringify(mergedRooms));

              // And update the database with our merged data
              try {
                console.log("Syncing merged rooms back to database");
                await apiService.properties.saveRooms(id, mergedRooms);
              } catch (syncError) {
                console.error("Error syncing merged rooms to database:", syncError);
                // Continue anyway, we've updated localStorage
              }
            } else {
              console.log("Using rooms from database API (no localStorage rooms)");
              setRooms(roomsResponse.data);
              // Also update localStorage for consistency
              localStorage.setItem(`property_${id}_rooms`, JSON.stringify(roomsResponse.data));
            }
          } else {
            console.log("No rooms found in database API, using localStorage rooms");
            setRooms(roomsFromLocalStorage);
          }
        } catch (error) {
          console.log("Error loading rooms from database API:", error);
          console.log("Falling back to localStorage rooms");
          setRooms(roomsFromLocalStorage);
        }

        // Load room photos
        const allRoomsPhotoKey = `property_${id}_room_photos`;
        const savedRoomPhotos = localStorage.getItem(allRoomsPhotoKey);
        console.log("Local storage - room photos:", savedRoomPhotos ? "Found" : "Not found");

        if (savedRoomPhotos) {
          try {
            const parsedRoomPhotos = JSON.parse(savedRoomPhotos);
            console.log("Parsed room photos:", parsedRoomPhotos);
            setRoomPhotos(parsedRoomPhotos);
          } catch (e) {
            console.error("Error parsing room photos:", e);
          }
        } else {
          // Try to load individual room photos
          console.log("Attempting to load individual room photos");
          const combinedPhotos = {};

          if (savedRooms) {
            const parsedRooms = JSON.parse(savedRooms);
            for (const room of parsedRooms) {
              const roomId = room.id;
              const roomPhotoKey = `property_${id}_room_${roomId}_photos`;
              const roomPhotoData = localStorage.getItem(roomPhotoKey);

              if (roomPhotoData) {
                try {
                  combinedPhotos[roomId] = {
                    photos: JSON.parse(roomPhotoData)
                  };
                } catch (e) {
                  console.error(`Error parsing photos for room ${roomId}:`, e);
                }
              }
            }

            if (Object.keys(combinedPhotos).length > 0) {
              console.log("Combined room photos:", combinedPhotos);
              setRoomPhotos(combinedPhotos);
            }
          }
        }
      } catch (error) {
        console.error('Error loading property data:', error);
        toast.error('Failed to load property details');
      }
    };

    loadData();
  }, [id, user]);
  
  // Handle sharing walkthrough
  const handleCreateReport = async () => {
    setIsSubmitting(true);
    
    try {
      // Get the most recent report for this property
      const reportResponse = await apiService.reports.getByProperty(id);
      
      // Check if we already have a move-in report for this property
      const moveInReports = reportResponse.data ? reportResponse.data.filter(r => r.type === 'move-in') : [];
      
      if (moveInReports.length === 0) {
        // No move-in report found, create one
        console.log("Creating new move-in report for property:", propertyDetails.address);
        
        // Create report data with all rooms
        const reportData = {
          property_id: id,
          title: `Move-in Walkthrough for ${propertyDetails.address}`,
          description: 'Automatically generated move-in walkthrough report',
          type: 'move-in',
          address: propertyDetails.address,
          tenant_name: userData?.name || user?.name || '',
          tenant_email: userData?.email || user?.email || '',
          tenant_phone: userData?.phone || '',
          landlord_name: 'Property Owner',
          landlord_email: landlordData?.email || propertyDetails.landlord_email || '',
          landlord_phone: landlordData?.phone || propertyDetails.landlord_phone || '',
          rooms: rooms.map(room => ({
            id: room.id || room.roomId,
            name: room.name || room.roomName,
            type: room.type || room.roomType,
            notes: (room.roomIssueNotes || room.issueNotes || [])
          }))
        };
        
        // Create the report
        const createResponse = await apiService.reports.create(reportData);
        const reportId = createResponse.data.id;
        const reportUuid = createResponse.data.uuid;
        
        // Associate photos with the report
        if (Object.keys(roomPhotos).length > 0) {
          console.log("Associating photos with the report");
          
          for (const roomId in roomPhotos) {
            const roomData = rooms.find(r => r.id === roomId || r.roomId === roomId);
            
            if (roomData && roomPhotos[roomId]) {
              let photos = [];
              
              // Handle different formats of roomPhotos
              if (Array.isArray(roomPhotos[roomId])) {
                photos = roomPhotos[roomId];
              } else if (roomPhotos[roomId].photos && Array.isArray(roomPhotos[roomId].photos)) {
                photos = roomPhotos[roomId].photos;
              }
              
              // Associate each photo with the report
              for (const photo of photos) {
                if (photo && photo.id) {
                  try {
                    await apiService.photos.associateWithReport(photo.id, reportId, {
                      roomId: roomId,
                      roomName: roomData.name || roomData.roomName
                    });
                  } catch (photoError) {
                    console.error(`Error associating photo ${photo.id} with report:`, photoError);
                  }
                }
              }
            }
          }
        }
        
        // Send email notification to landlord
        if (landlordData?.email || propertyDetails.landlord_email) {
          const recipientEmail = landlordData?.email || propertyDetails.landlord_email;
          console.log("Sending email notification to landlord:", recipientEmail);
          
          const notificationData = {
            recipientEmail: recipientEmail,
            recipientName: 'Property Owner',
            subject: 'New Move-in Walkthrough Report Shared',
            message: `A new move-in walkthrough report has been shared with you for property at ${propertyDetails.address}. You can view the report by clicking the button below.`,
            status: 'custom',
            reportId: reportId,
            reportUuid: reportUuid
          };
          
          await apiService.reports.sendNotification(reportId, notificationData);
        } else {
          console.log('No landlord email found to send notification');
        }
        
        // Store the property ID and report UUID to use on the details page
        localStorage.setItem('lastSharedPropertyId', id);
        if (reportUuid) {
          localStorage.setItem('report_uuid', reportUuid);
        }
        
        // Navigate to success page
        router.push('/reports/share-success');
      } else {
        // Use the most recent move-in report
        const report = moveInReports[0];
        console.log("Using existing move-in report:", report.id);
        
        // Send email notification to landlord
        if (landlordData?.email || propertyDetails.landlord_email) {
          const recipientEmail = landlordData?.email || propertyDetails.landlord_email;
          console.log("Sending email notification to landlord:", recipientEmail);
          
          const notificationData = {
            recipientEmail: recipientEmail,
            recipientName: 'Property Owner',
            subject: 'Move-in Walkthrough Report Shared',
            message: `A move-in walkthrough report has been shared with you for property at ${propertyDetails.address}. You can view the report by clicking the button below.`,
            status: 'custom',
            reportId: report.id,
            reportUuid: report.uuid
          };
          
          await apiService.reports.sendNotification(report.id, notificationData);
        } else {
          console.log('No landlord email found to send notification');
        }
        
        // Store the property ID and report UUID to use on the details page
        localStorage.setItem('lastSharedPropertyId', id);
        if (report.uuid) {
          localStorage.setItem('report_uuid', report.uuid);
        }
        
        // Navigate to success page
        router.push('/reports/share-success');
      }
    } catch (error) {
      console.error('Error sharing walkthrough:', error);
      console.error('Failed to share walkthrough. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  // Calculate number of photos for a room
  const getPhotoCount = (roomId) => {
    console.log("Checking photos for room", roomId, "in", roomPhotos);

    // First try to get photoCount directly from the room object
    const roomData = rooms.find(r => (r.id === roomId || r.roomId === roomId));
    if (roomData && roomData.photoCount) {
      console.log(`Found photoCount ${roomData.photoCount} directly in room object for ${roomId}`);
      return roomData.photoCount;
    }

    // Support different data structures for room photos
    if (roomPhotos[roomId]) {
      if (Array.isArray(roomPhotos[roomId])) {
        console.log(`Found ${roomPhotos[roomId].length} photos for ${roomId} in roomPhotos array`);
        return roomPhotos[roomId].length;
      } else if (roomPhotos[roomId].photos && Array.isArray(roomPhotos[roomId].photos)) {
        console.log(`Found ${roomPhotos[roomId].photos.length} photos for ${roomId} in roomPhotos.photos array`);
        return roomPhotos[roomId].photos.length;
      } else if (roomPhotos[roomId].photoCount) {
        console.log(`Found photoCount ${roomPhotos[roomId].photoCount} in roomPhotos object for ${roomId}`);
        return roomPhotos[roomId].photoCount;
      }
    }

    // Try to fetch directly from localStorage as fallback
    try {
      const roomPhotoKey = `property_${id}_room_${roomId}_photos`;
      const roomPhotoData = localStorage.getItem(roomPhotoKey);
      if (roomPhotoData) {
        const photos = JSON.parse(roomPhotoData);
        console.log(`Found ${Array.isArray(photos) ? photos.length : 0} photos for ${roomId} directly in localStorage`);
        return Array.isArray(photos) ? photos.length : 0;
      }
    } catch (e) {
      console.error(`Error getting photo count for room ${roomId}:`, e);
    }

    return 0;
  };

  // Get number of notes for a room
  const getNoteCount = (room) => {
    try {
      // Try different properties where notes might be stored
      if (room.notes && Array.isArray(room.notes)) {
        return room.notes.length;
      } else if (room.roomIssueNotes) {
        // Check the type before using split
        if (typeof room.roomIssueNotes === 'string') {
          return room.roomIssueNotes.split(',').filter(note => note.trim().length > 0).length;
        } else if (Array.isArray(room.roomIssueNotes)) {
          return room.roomIssueNotes.length;
        } else if (typeof room.roomIssueNotes === 'number') {
          return room.roomIssueNotes;
        }
        return 0; // Unknown type
      } else if (room.issueNotes) {
        // Check the type before using split
        if (typeof room.issueNotes === 'string') {
          return room.issueNotes.split(',').filter(note => note.trim().length > 0).length;
        } else if (Array.isArray(room.issueNotes)) {
          return room.issueNotes.length;
        } else if (typeof room.issueNotes === 'number') {
          return room.issueNotes;
        }
        return 0; // Unknown type
      } else if (room.noteCount !== undefined) {
        return room.noteCount;
      }
    } catch (error) {
      console.error("Error calculating note count:", error, room);
      return 0;
    }

    return 0;
  };
  
  // Calculate moveout date based on lease duration
  const calculateMoveOutDate = (startDate, leaseDuration, leaseDurationType) => {
    if (!startDate || !leaseDuration) return null;

    try {
      // Parse the start date
      const date = new Date(startDate);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error("Invalid start date for calculation:", startDate);
        return null;
      }

      // Convert lease duration to number
      const duration = parseInt(leaseDuration, 10);
      if (isNaN(duration) || duration <= 0) {
        console.error("Invalid lease duration:", leaseDuration);
        return null;
      }

      // Calculate end date based on duration type
      if (leaseDurationType === 'days') {
        date.setDate(date.getDate() + duration);
      } else if (leaseDurationType === 'weeks') {
        date.setDate(date.getDate() + (duration * 7));
      } else if (leaseDurationType === 'years') {
        date.setFullYear(date.getFullYear() + duration);
      } else {
        // Default is months
        date.setMonth(date.getMonth() + duration);
      }

      return date;
    } catch (error) {
      console.error("Error calculating move-out date:", error);
      return null;
    }
  };

  // Format date to display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';

    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error("Invalid date:", dateString);
        return 'Not specified';
      }

      return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '.');
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Not specified';
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'Not specified';

    try {
      // Parse the amount to make sure it's a number
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount)) {
        console.error("Invalid currency amount:", amount);
        return 'Not specified';
      }

      // Format with $ and two decimal places
      return `$${numericAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    } catch (error) {
      console.error("Error formatting currency:", error);
      return 'Not specified';
    }
  };
  
  if (!property || !id) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#FBF5DA]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C2C40]"></div>
      </div>
    );
  }
  
  return (
    <div className="relative w-full min-h-screen bg-[#FBF5DA] font-['Nunito'] overflow-x-hidden">
      {/* Meta tags for PWA and mobile compatibility */}
      <Head>
        <title>Property Summary - DepositShield</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#FBF5DA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="format-detection" content="telephone=no" />
        <style jsx global>{`
          body {
            background-color: #FBF5DA;
            margin: 0;
            padding: 0;
            font-family: 'Nunito', sans-serif;
            min-height: 100vh;
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
          
          /* Fix for iOS input zoom */
          @media screen and (-webkit-min-device-pixel-ratio: 0) { 
            select,
            textarea,
            input {
              font-size: 16px !important;
            }
          }
          
          /* Fix touch events */
          button, a {
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }
        `}</style>
      </Head>
      
      {/* Status Bar Space */}
      <div className="w-full h-[40px] safe-area-top"></div>

      {/* Header - Fixed positioning */}
      <div className="fixed w-full h-[65px] left-0 top-[40px] z-10 bg-[#FBF5DA]">
        <div className="flex flex-row justify-center items-center py-[20px] px-[10px] gap-[10px] w-full h-[65px] safe-area-inset-left safe-area-inset-right">
          <button
            className="absolute left-[20px] top-[50%] transform -translate-y-1/2 p-2"
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <ArrowLeftIcon />
          </button>
          <h1 className="w-full max-w-[270px] font-semibold text-[18px] leading-[140%] text-center text-[#0B1420]">
            Property Summary
          </h1>
        </div>
      </div>
      
      {/* Main Content - Start after header */}
      <div className="flex flex-col items-center w-full pt-[105px] px-4 px-safe pb-[100px]">
        <div className="w-full max-w-[350px] mx-auto">
          {/* Summary Card */}
          <div className="bg-white border border-[#D1E7D5] rounded-[16px] w-full">
            {/* Property & User Information List */}
            <div className="flex flex-col">
              {/* User Info */}
              <div className="flex flex-row justify-center items-center p-[0] gap-[209px] w-full h-[48px] border-b border-[#ECF0F5]">
                <div className="flex flex-row items-center p-[0] gap-[24px] w-[318px] h-[19px] mx-4">
                  <span className="font-normal text-[14px] leading-[19px] text-[#0B1420] flex-1">
                    Tenant
                  </span>
                  <span className="font-bold text-[14px] leading-[19px] text-[#1C2C40] text-right flex-1">
                    {userData?.name || user?.name || ''}
                  </span>
                </div>
              </div>
              
              {/* Property Address */}
              <div className="flex flex-row justify-center items-center p-[0] gap-[209px] w-full min-h-[48px] border-b border-[#ECF0F5]">
                <div className="flex flex-row items-center p-[0] gap-[24px] w-[318px] mx-4 py-2">
                  <span className="font-normal text-[14px] leading-[19px] text-[#0B1420] min-w-[95px]">
                    Address
                  </span>
                  <span className="font-bold text-[14px] leading-[19px] text-[#1C2C40] text-right flex-grow">
                    {propertyDetails.address && propertyDetails.address !== 'Not specified' ? propertyDetails.address : 'Not specified'}
                  </span>
                </div>
              </div>

              {/* Lease Duration */}
              <div className="flex flex-row justify-center items-center p-[0] gap-[209px] w-full min-h-[48px] border-b border-[#ECF0F5]">
                <div className="flex flex-row items-center p-[0] gap-[24px] w-[318px] mx-4 py-2">
                  <span className="font-normal text-[14px] leading-[19px] text-[#0B1420] min-w-[95px]">
                    Lease Duration
                  </span>
                  <span className="font-bold text-[14px] leading-[19px] text-[#1C2C40] text-right flex-grow">
                    {propertyDetails.lease_duration && propertyDetails.lease_duration !== 'null'
                      ? `${propertyDetails.lease_duration} ${propertyDetails.lease_duration_type || 'months'}`
                      : 'Not specified'}
                  </span>
                </div>
              </div>

              {/* Move Out Date */}
              <div className="flex flex-row justify-center items-center p-[0] gap-[209px] w-full min-h-[48px] border-b border-[#ECF0F5]">
                <div className="flex flex-row items-center p-[0] gap-[24px] w-[318px] mx-4 py-2">
                  <span className="font-normal text-[14px] leading-[19px] text-[#0B1420] min-w-[95px]">
                    Move out Date
                  </span>
                  <span className="font-bold text-[14px] leading-[19px] text-[#1C2C40] text-right flex-grow">
                    {formatDate(propertyDetails.contract_end_date)}
                  </span>
                </div>
              </div>

              {/* Deposit Amount */}
              <div className="flex flex-row justify-center items-center p-[0] gap-[209px] w-full min-h-[48px] border-b border-[#ECF0F5]">
                <div className="flex flex-row items-center p-[0] gap-[24px] w-[318px] mx-4 py-2">
                  <span className="font-normal text-[14px] leading-[19px] text-[#0B1420] min-w-[95px]">
                    Deposit Amount
                  </span>
                  <span className="font-bold text-[14px] leading-[19px] text-[#1C2C40] text-right flex-grow">
                    {propertyDetails.deposit_amount && propertyDetails.deposit_amount !== 'null'
                      ? formatCurrency(propertyDetails.deposit_amount)
                      : 'Not specified'}
                  </span>
                </div>
              </div>
              
              {/* Landlord Email */}
              <div className="flex flex-row justify-center items-center p-[0] gap-[209px] w-full h-[48px] border-b border-[#ECF0F5]">
                <div className="flex flex-row items-center p-[0] gap-[24px] w-[318px] h-[19px] mx-4">
                  <span className="font-normal text-[14px] leading-[19px] text-[#0B1420] flex-1">
                    Landlord Mail
                  </span>
                  <span className="font-bold text-[14px] leading-[19px] text-[#1C2C40] text-right flex-1">
                    {propertyDetails.landlord_email || landlordData?.email || 'Not provided'}
                  </span>
                </div>
              </div>
              
              {/* Landlord Phone */}
              <div className="flex flex-row justify-center items-center p-[0] gap-[209px] w-full h-[48px] border-b border-[#ECF0F5]">
                <div className="flex flex-row items-center p-[0] gap-[24px] w-[318px] h-[19px] mx-4">
                  <span className="font-normal text-[14px] leading-[19px] text-[#0B1420] flex-1">
                    Landlord Phone
                  </span>
                  <span className="font-bold text-[14px] leading-[19px] text-[#1C2C40] text-right flex-1">
                    {propertyDetails.landlord_phone || landlordData?.phone || 'Not provided'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Rooms List */}
            {rooms.length > 0 && rooms.map((room, index) => {
              // Get room name and id from different possible formats
              const roomId = room.id || room.roomId || `room_${index}`;
              const roomName = room.name || room.roomName || room.type || room.roomType || `Room ${index + 1}`;

              return (
                <div key={roomId || index} className="flex flex-row justify-between items-start px-4 py-3 border-b border-[#ECF0F5] last:border-b-0">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-row items-center gap-1">
                      <span className="font-bold text-[14px] leading-[19px] text-[#0B1420]">
                        {roomName}
                      </span>
                      {getNoteCount(room) > 0 && (
                        <span className="font-semibold text-[14px] leading-[19px] text-[#515964]">
                          ({getNoteCount(room)} {getNoteCount(room) === 1 ? 'item' : 'items'} noted)
                        </span>
                      )}
                      {getNoteCount(room) === 0 && (
                        <span className="font-semibold text-[14px] leading-[19px] text-[#515964]">
                          (No Notes)
                        </span>
                      )}
                    </div>

                    {getPhotoCount(roomId) > 0 && (
                      <div className="flex flex-row items-center gap-1">
                        <div className="relative w-[60px] h-[24px]">
                          {/* Show photo count indicators */}
                          {[...Array(Math.min(4, getPhotoCount(roomId) || 0))].map((_, i) => {
                            // Try to get the actual photo URL
                            let photoUrl = null;
                            try {
                              if (roomPhotos[roomId]?.photos?.[i]?.url) {
                                photoUrl = roomPhotos[roomId].photos[i].url;
                                // Add API base URL if it's a relative path
                                if (photoUrl && photoUrl.startsWith('/')) {
                                  const isProduction = typeof window !== 'undefined' ? window.location.hostname !== 'localhost' : process.env.NODE_ENV === 'production';
                                  const apiUrl = isProduction ? 'https://api.depositshield.retako.com' : 'http://localhost:5050';
                                  photoUrl = `${apiUrl}${photoUrl}`;
                                  console.log(`Generated full URL for room photo: ${photoUrl}`);
                                }
                              } else if (roomPhotos[roomId]?.photos?.[i]) {
                                photoUrl = roomPhotos[roomId].photos[i];
                                // Add API base URL if it's a relative path
                                if (typeof photoUrl === 'string' && photoUrl.startsWith('/')) {
                                  const isProduction = typeof window !== 'undefined' ? window.location.hostname !== 'localhost' : process.env.NODE_ENV === 'production';
                                  const apiUrl = isProduction ? 'https://api.depositshield.retako.com' : 'http://localhost:5050';
                                  photoUrl = `${apiUrl}${photoUrl}`;
                                  console.log(`Generated full URL for room photo: ${photoUrl}`);
                                }
                              } else {
                                // Try to get from localStorage
                                const roomPhotoKey = `property_${id}_room_${roomId}_photos`;
                                const roomPhotoData = localStorage.getItem(roomPhotoKey);
                                if (roomPhotoData) {
                                  try {
                                    const photos = JSON.parse(roomPhotoData);
                                    if (photos && photos.length > i) {
                                      const photoItem = photos[i];
                                      photoUrl = typeof photoItem === 'string' ? photoItem : photoItem?.url || null;

                                      // Add API base URL if it's a relative path
                                      if (photoUrl && typeof photoUrl === 'string' && photoUrl.startsWith('/')) {
                                        const isProduction = typeof window !== 'undefined' ? window.location.hostname !== 'localhost' : process.env.NODE_ENV === 'production';
                                        const apiUrl = isProduction ? 'https://api.depositshield.retako.com' : 'http://localhost:5050';
                                        photoUrl = `${apiUrl}${photoUrl}`;
                                        console.log(`Generated full URL for room photo from localStorage: ${photoUrl}`);
                                      }
                                    }
                                  } catch (jsonError) {
                                    console.error(`Error parsing photo data for room ${roomId}:`, jsonError);
                                  }
                                }
                              }
                            } catch (e) {
                              console.error(`Error getting photo URL for room ${roomId}:`, e);
                            }

                            console.log(`Photo URL for room ${roomId}, index ${i}: ${photoUrl || 'None'}`);

                            return (
                              <div
                                key={i}
                                className="absolute top-0 w-[24px] h-[24px] bg-gray-200 border border-[#D1E7E2] rounded-full overflow-hidden"
                                style={{
                                  left: `${i * 12}px`,
                                  backgroundImage: photoUrl ? `url(${photoUrl})` : 'none',
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                  zIndex: 10 - i // Higher index items are on top
                                }}
                              >
                                {!photoUrl && (
                                  <div className="flex items-center justify-center w-full h-full bg-gray-200">
                                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M6 8C7.10457 8 8 7.10457 8 6C8 4.89543 7.10457 4 6 4C4.89543 4 4 4.89543 4 6C4 7.10457 4.89543 8 6 8Z" fill="#A3ADB8"/>
                                      <path d="M9.33333 2H6.66667C3.33333 2 2 3.33333 2 6.66667V9.33333C2 12.6667 3.33333 14 6.66667 14H9.33333C12.6667 14 14 12.6667 14 9.33333V6.66667C14 3.33333 12.6667 2 9.33333 2ZM12.3067 9.63333L10.2867 7.22C10.08 6.96667 9.82667 6.96667 9.62 7.22L7.88667 9.3C7.68667 9.55 7.43333 9.55 7.23333 9.3L6.65333 8.58C6.45333 8.33667 6.20667 8.34333 6.01333 8.59333L3.81333 11.4767C3.57333 11.7933 3.69333 12.06 4.10667 12.06H11.8867C12.3 12.06 12.4267 11.7933 12.3067 9.63333Z" fill="#A3ADB8"/>
                                    </svg>
                                  </div>
                                )}
                                {getPhotoCount(roomId) > 4 && i === 3 ? (
                                  <div className="flex items-center justify-center w-full h-full bg-[#1C2C40] text-white text-[10px] font-bold">
                                    +{getPhotoCount(roomId) - 3}
                                  </div>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                        <span className="font-semibold text-[12px] leading-[16px] text-[#515964]">
                          ({getPhotoCount(roomId)} {getPhotoCount(roomId) === 1 ? 'Photo' : 'Photos'})
                        </span>
                      </div>
                    )}
                  </div>

                  <ArrowRightIcon />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Create Report Button - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 w-full px-5 py-4 bg-[#FBF5DA] pb-safe pt-4 shadow-inner">
        <div className="w-[90%] max-w-[350px] mx-auto">
          <button
            onClick={handleCreateReport}
            disabled={isSubmitting}
            className="w-full h-[56px] flex flex-row justify-center items-center px-4 py-[18px] gap-[10px] bg-[#1C2C40] rounded-[16px] touch-manipulation active:bg-[#283c56] transition-colors"
          >
            <span className="font-bold text-[16px] leading-[22px] text-[#D1E7E2]">
              {isSubmitting ? 'Sharing...' : 'Share Walkthrough'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}