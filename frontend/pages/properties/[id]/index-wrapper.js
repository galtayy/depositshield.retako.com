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
      return false;
    }
    
    // Check for landlord details
    if (!property.landlord_email && !property.landlord_phone) {
      return false;
    }
    
    // Check if property has rooms
    if (!rooms || rooms.length === 0) {
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
    
    return hasRoomWithPhoto;
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
        const complete = isPropertyComplete(property, rooms, roomPhotos) && hasReport;
        
        if (complete) {
          // Property is complete, use the new details page
          // Pass the ID via query param
          router.push({
            pathname: '/properties/details',
            query: { propertyId: id }
          });
        } else {
          // Property is not complete, use the standard property page
          router.replace(`/properties/${id}/index`);
        }
      } catch (error) {
        console.error('Error checking property status:', error);
        // On error, go to standard property page
        router.replace(`/properties/${id}/index`);
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