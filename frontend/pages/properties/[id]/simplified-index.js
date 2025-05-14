import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { toast } from 'react-toastify';
import Layout from '../../../components/Layout';
import { apiService } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';

// Basitleştirilmiş sürüm - sadece oda ve fotoğraflara odaklı
export default function PropertyDetailSimplified() {
  const { user, loading: authLoading } = useAuth();
  const [property, setProperty] = useState(null);
  const [roomPhotos, setRoomPhotos] = useState({});
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (id) {
      fetchProperty();
      fetchAndCreateRooms();
    }
  }, [id, user, authLoading, router]);

  // Mülk bilgilerini getir
  const fetchProperty = async () => {
    try {
      console.log('Mülk bilgileri getiriliyor:', id);
      const response = await apiService.properties.getById(id);
      console.log('Mülk bilgileri:', response.data);
      setProperty(response.data);
    } catch (error) {
      console.error('Mülk bilgileri getirilemedi:', error);
      toast.error('Mülk bilgileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Fotoğrafları getir ve odaları oluştur
  const fetchAndCreateRooms = async () => {
    try {
      console.log('Fotoğraflar getiriliyor:', id);
      
      // Fotoğrafları getir
      const photosResponse = await apiService.photos.getByProperty(id);
      console.log('Fotoğraf yanıtı:', photosResponse.data);
      
      // photosByRoom verisini işle
      if (photosResponse.data && photosResponse.data.photosByRoom) {
        const photosByRoom = photosResponse.data.photosByRoom;
        console.log('Oda bazında fotoğraflar:', photosByRoom);
        
        // Fotoğraf verilerini ayarla
        setRoomPhotos(photosByRoom);
        
        // Odaları oluştur
        const roomsList = [];
        
        Object.keys(photosByRoom).forEach(roomId => {
          const roomData = photosByRoom[roomId];
          // photos dizisini al (eğer varsa)
          const photos = roomData && roomData.photos ? roomData.photos : [];
          
          if (photos.length > 0) {
            // Oda adını oluştur
            const roomName = 'Oda ' + roomId.split('_').pop().substring(0, 3);
            
            // Odayı listeye ekle
            roomsList.push({
              id: roomId,
              name: roomName,
              type: 'other',
              photoCount: photos.length,
              roomQuality: null,
              itemsNoted: 0
            });
          }
        });
        
        console.log('Oluşturulan odalar:', roomsList);
        
        if (roomsList.length > 0) {
          setRooms(roomsList);
        } else {
          // Oda oluşturulamadıysa API'den almayı dene
          await fetchRoomsFromApi();
        }
      } else {
        console.log('Fotoğraflar bulunamadı veya yanlış formatta');
        // API'den odaları almayı dene
        await fetchRoomsFromApi();
      }
    } catch (error) {
      console.error('Fotoğraflar getirilemedi:', error);
      // API'den odaları almayı dene
      await fetchRoomsFromApi();
    }
  };
  
  // API'den odaları getir
  const fetchRoomsFromApi = async () => {
    try {
      console.log('API\'den odalar getiriliyor');
      const roomsResponse = await apiService.properties.getRooms(id);
      console.log('API oda yanıtı:', roomsResponse.data);
      
      if (roomsResponse.data && Array.isArray(roomsResponse.data) && roomsResponse.data.length > 0) {
        // Odaları format
        const formattedRooms = roomsResponse.data.map(room => ({
          id: room.roomId || room.id,
          name: room.roomName || room.name || 'İsimsiz Oda',
          type: room.roomType || room.type || 'other',
          photoCount: parseInt(room.photoCount) || 0,
          roomQuality: room.roomQuality ? String(room.roomQuality) : null,
          itemsNoted: 0
        }));
        
        console.log('API\'den gelen odalar:', formattedRooms);
        setRooms(formattedRooms);
      } else {
        console.log('API\'de oda bulunamadı');
        setRooms([]);
      }
    } catch (error) {
      console.error('API\'den odalar getirilemedi:', error);
      setRooms([]);
    }
  };

  // Yükleniyor gösterimi
  if (loading || authLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Mülk Yükleniyor...</h1>
        </div>
      </Layout>
    );
  }

  // Mülk bulunamadı gösterimi
  if (!property) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Mülk Bulunamadı</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{property.address}</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Odalar ({rooms.length})</h2>
          
          {rooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rooms.map(room => (
                <div 
                  key={room.id} 
                  className="border p-4 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/properties/${id}/configure-room?roomId=${room.id}`)}
                >
                  <h3 className="font-bold text-lg">{room.name}</h3>
                  <div className="text-gray-600 mb-2">Fotoğraf sayısı: {room.photoCount}</div>
                  
                  <div className="flex flex-wrap">
                    {roomPhotos[room.id] && roomPhotos[room.id].photos ? 
                      roomPhotos[room.id].photos.slice(0, 3).map((photo, index) => (
                        <div key={index} className="w-16 h-16 mr-2 mb-2 bg-gray-200 relative overflow-hidden">
                          <img 
                            src={photo.url && photo.url.startsWith('/uploads/') 
                              ? `${apiService.getBaseUrl()}${photo.url}` 
                              : photo.url}
                            alt={`Oda fotoğrafı ${index+1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )) : (
                        <div className="text-gray-500">Fotoğraf önizlemesi yok</div>
                      )
                    }
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-gray-100 rounded-lg">
              <p className="text-gray-600">Bu mülkte henüz oda ekli değil</p>
              <button 
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
                onClick={() => router.push(`/properties/${id}/configure-room`)}
              >
                Oda Ekle
              </button>
            </div>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Mülk Detayları</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold">Adres</h3>
              <p>{property.address}</p>
            </div>
            <div>
              <h3 className="font-bold">Açıklama</h3>
              <p>{property.description || 'Açıklama yok'}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}