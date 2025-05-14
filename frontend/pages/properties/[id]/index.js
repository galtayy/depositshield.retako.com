import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../lib/auth';
import { apiService } from '../../../lib/api';

/**
 * This is a wrapper component that checks if the property has all required information
 * and redirects to either the new property details page or the standard property page
 */
export default function PropertyRedirect() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  // Function to check if property is complete with all required info
  const isPropertyComplete = (property, rooms, roomPhotos) => {
    // Check for basic property details
    if (!property.address || !property.deposit_amount || 
        !property.lease_duration) {
      console.log("Property details missing:", {
        address: property.address, 
        deposit: property.deposit_amount, 
        lease: property.lease_duration
      });
      return false;
    }
    
    // Check for landlord details
    if (!property.landlord_email && !property.landlord_phone) {
      console.log("Landlord contact info missing");
      return { needsLandlordInfo: true };
    }
    
    // Check if property has rooms
    if (!rooms || rooms.length === 0) {
      console.log("No rooms found");
      return false;
    }
    
    // Check if at least one room has a photo
    let hasRoomWithPhoto = false;
    for (const room of rooms) {
      const roomId = room.id || room.roomId;
      const photoCount = room.photoCount || 
                        (roomPhotos[roomId] && roomPhotos[roomId].photos ? 
                         roomPhotos[roomId].photos.length : 0);
      
      if (photoCount > 0) {
        hasRoomWithPhoto = true;
        break;
      }
    }
    
    if (!hasRoomWithPhoto) {
      console.log("No rooms with photos found");
      return false;
    }
    
    return true;
  };

  useEffect(() => {
    const checkPropertyStatus = async () => {
      if (!id || authLoading) return;
      
      // Make sure user is authenticated
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        // Load property data
        const propertyResponse = await apiService.properties.getById(id);
        const property = propertyResponse.data;
        
        // Load rooms data
        const roomsResponse = await apiService.properties.getRooms(id);
        const rooms = roomsResponse.data || [];
        
        // Load room photos
        const photosResponse = await apiService.photos.getByProperty(id);
        const roomPhotos = {};
        
        // Process photos by room
        if (photosResponse.data) {
          photosResponse.data.forEach(photo => {
            if (photo.room_id) {
              if (!roomPhotos[photo.room_id]) {
                roomPhotos[photo.room_id] = { photos: [] };
              }
              roomPhotos[photo.room_id].photos.push(photo);
            }
          });
        }
        
        // Check if all report information is complete
        const reportsResponse = await apiService.reports.getByProperty(id);
        const hasReport = reportsResponse.data && reportsResponse.data.length > 0;
        
        // Check if property is complete
        const completionStatus = isPropertyComplete(property, rooms, roomPhotos);
        
        // İlk olarak, landlord bilgileri var mı kontrol edelim
        if (completionStatus && completionStatus.needsLandlordInfo) {
          // Landlord bilgileri eksik, kullanıcıyı bunları doldurmaya yönlendir
          console.log("Redirecting to landlord update page - landlord info missing");
          router.replace(`/properties/${id}/landlord-update`);
        }
        // Tüm bilgiler dolu ve rapor varsa 
        else if (completionStatus === true && hasReport) {
          // Her şey tamam - yeni detaylı sayfa açılsın
          console.log("Redirecting to new details page - all property info is complete");
          router.replace(`/properties/details?propertyId=${id}`);
        }
        else {
          // Eksik bilgiler var, normal mülk düzenleme sayfasına git
          console.log("Redirecting to regular property page - some property info is missing");
          router.replace(`/properties/${id}/index-new`);
        }
      } catch (error) {
        console.error('Error checking property status:', error);
        // On error, go to standard property page
        router.replace(`/properties/${id}/index-new`);
      } finally {
        setLoading(false);
      }
    };

    checkPropertyStatus();
  }, [id, user, authLoading, router]);

  // Show loading indicator
  return (
    <div className="flex justify-center items-center h-screen bg-[#FBF5DA]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C2C40]"></div>
    </div>
  );
}