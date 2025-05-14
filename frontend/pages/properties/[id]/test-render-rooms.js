// Doğrudan fotoğraflardan odaları oluşturan basit bir komponent
// Bu dosyayı oda verileriyle ilgili sorunları gidermek için kullanacağız

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { apiService } from '../../../lib/api';

// Sayfayı yükle ve oda verilerini göster
export default function TestRenderRooms() {
  const router = useRouter();
  const { id } = router.query;
  const [roomPhotos, setRoomPhotos] = useState({});
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  // Fotoğrafları ve odaları yükle
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Yükleniyor: Mülk ID=', id);
      
      // Fotoğrafları getir
      const photosResponse = await apiService.photos.getByProperty(id);
      console.log('Fotoğraf yanıtı:', photosResponse.data);

      // Fotoğraf verilerinden odaları oluştur
      if (photosResponse.data && photosResponse.data.photosByRoom) {
        setRoomPhotos(photosResponse.data.photosByRoom);
        
        // Odaları oluştur
        const roomsList = [];
        Object.keys(photosResponse.data.photosByRoom).forEach(roomId => {
          const roomData = photosResponse.data.photosByRoom[roomId];
          const photos = roomData.photos || [];
          
          if (photos.length > 0) {
            roomsList.push({
              id: roomId,
              name: 'Oda ' + roomId.split('_').pop().substring(0, 3),
              photoCount: photos.length,
              photos: photos
            });
          }
        });
        
        console.log('Oluşturulan odalar:', roomsList);
        setRooms(roomsList);
      } else {
        console.error('Fotoğraflar bulunamadı veya yanlış formatta');
        setError('Fotoğraflar bulunamadı veya yanlış formatta');
      }
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      setError('Veri yükleme hatası: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Yükleniyor...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">Hata: {error}</div>
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={loadData}
        >
          Yeniden Dene
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Oda Test Sayfası - Mülk ID: {id}</h1>
      
      <h2 className="text-xl font-semibold mb-4">Odalar ({rooms.length})</h2>
      
      {rooms.length > 0 ? (
        <div className="space-y-4">
          {rooms.map(room => (
            <div key={room.id} className="border p-4 rounded">
              <h3 className="font-bold">{room.name}</h3>
              <div className="text-sm">ID: {room.id}</div>
              <div className="text-sm mb-2">Fotoğraf sayısı: {room.photoCount}</div>
              
              <div className="flex flex-wrap gap-2">
                {room.photos.slice(0, 4).map((photo, index) => (
                  <div key={index} className="w-24 h-24 bg-gray-200 relative">
                    <img 
                      src={photo.url && photo.url.startsWith('/uploads/') 
                        ? `${apiService.getBaseUrl()}${photo.url}` 
                        : photo.url || ''}
                      alt={`Oda fotoğrafı ${index+1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-yellow-100 p-4 rounded">
          Hiç oda bulunmadı. Fotoğraf verileri mevcut ancak odalar oluşturulamadı.
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Ham Veriler</h2>
        <div className="bg-gray-100 p-4 rounded overflow-auto max-h-[500px]">
          <h3 className="font-bold mb-2">Oda Fotoğrafları</h3>
          <pre className="text-xs">{JSON.stringify(roomPhotos, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}