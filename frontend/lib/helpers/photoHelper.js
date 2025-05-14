/**
 * Fotoğraf URL işlemleri için yardımcı fonksiyonlar
 */

import { apiService } from '../api';

// Sabit API URL tanımlamaları
const DEVELOPMENT_API_URL = 'http://localhost:5050';
const PRODUCTION_API_URL = 'https://api.depositshield.retako.com';

/**
 * Bir fotoğraf URL'si oluşturur. Eğer URL zaten tam ise onu döndürür,
 * göreceli bir URL ise API baz URL'sini ekler.
 * @param {string} url - Düzenlenecek fotoğraf URL'si
 * @returns {string} Tam fotoğraf URL'si
 */
export function getFullPhotoUrl(url) {
  if (!url) return null;

  if (url.startsWith('http')) {
    // URL zaten tam ise olduğu gibi döndür
    return url;
  } else if (url.startsWith('/uploads/')) {
    // Göreceli URL ise baz URL ekle
    return `${apiService.getBaseUrl()}${url}`;
  } else if (url.includes('/')) {
    // Diğer göreceli URL'ler
    return `${apiService.getBaseUrl()}/${url.startsWith('/') ? url.slice(1) : url}`;
  }

  // Sadece dosya adı ise /uploads/ ekle
  return `${apiService.getBaseUrl()}/uploads/${url}`;
}

/**
 * Bir fotoğraf nesnesinden tutarlı bir URL çıkartır
 * @param {Object} photo - Fotoğraf verisi
 * @returns {string} Fotoğrafın URL'si
 */
export function extractPhotoUrl(photo) {
  if (!photo) return null;

  // Direkt string ise URL olarak kabul et
  if (typeof photo === 'string') {
    return getFullPhotoUrl(photo);
  }

  // Nesne ise, önce URL, sonra src, en son file_path'e bak
  if (photo.url) {
    return getFullPhotoUrl(photo.url);
  } else if (photo.src) {
    return getFullPhotoUrl(photo.src);
  } else if (photo.file_path) {
    return getFullPhotoUrl(`/uploads/${photo.file_path}`);
  }

  return null;
}

/**
 * roomPhotos veri yapısından belirli bir oda için fotoğrafları alır
 * @param {Object} roomPhotos - Tüm oda fotoğrafları
 * @param {Object} room - Oda verisi
 * @param {number} index - Alınmak istenen fotoğrafın indeksi
 * @returns {string} Fotoğraf URL'si veya null
 */
export function getRoomPhotoUrl(roomPhotos, room, index) {
  if (!roomPhotos || !room) return null;

  // Room ID'yi belirle (farklı formatlar olabilir)
  const possibleIds = [
    room.id,
    room.roomId,
    `${room.id}`, // string çevirimi
    `${room.roomId}` // string çevirimi
  ].filter(Boolean); // null/undefined değerleri filtrele

  // Her olası ID için fotoğrafları ara
  for (const id of possibleIds) {
    if (!id || !(id in roomPhotos)) continue;

    const roomPhotoData = roomPhotos[id];

    // Object.photos[index] formatı
    if (roomPhotoData.photos && Array.isArray(roomPhotoData.photos) && index < roomPhotoData.photos.length) {
      return extractPhotoUrl(roomPhotoData.photos[index]);
    }

    // Array[index] formatı
    if (Array.isArray(roomPhotoData) && index < roomPhotoData.length) {
      return extractPhotoUrl(roomPhotoData[index]);
    }
  }

  return null;
}

/**
 * Fotoğraf URL'lerini işleyen ve hata ayıklama bilgisi sağlayan yardımcı fonksiyon
 * @param {Object} photo - Fotoğraf nesnesi (url veya file_path içermelidir)
 * @returns {Object} - İşlenmiş URL bilgileri
 */
export function processPhotoUrl(photo) {
  try {
    // Çalışma ortamını belirle
    const isProduction = typeof window !== 'undefined' 
      ? window.location.hostname !== 'localhost' 
      : false;
    console.log('Environment:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');
    
    const baseApiUrl = isProduction ? PRODUCTION_API_URL : DEVELOPMENT_API_URL;
    console.log('Base API URL:', baseApiUrl);
    
    if (!photo) {
      console.error('Invalid photo object:', photo);
      return getDefaultPhotoUrls();
    }
    
    console.log('Photo object:', {
      id: photo.id,
      url: photo.url,
      file_path: photo.file_path
    });
    
    // Fotoğrafın dosya adını al
    let filename = '';
    if (photo.file_path) {
      filename = photo.file_path;
    } else if (photo.url) {
      const parts = photo.url.split('/');
      filename = parts[parts.length - 1];
    }
    
    // NOAUTH için public endpoint URL öncelikli olmalı
    const publicAccessUrl = `${baseApiUrl}/api/photos/public-access/${filename}`;
    console.log('Public access URL (NOAUTH):', publicAccessUrl);
    
    // Doğrudan uploads klasörü URL'leri
    const directUrl = `${baseApiUrl}/uploads/${filename}`;
    console.log('Direct access URL:', directUrl);

    // Her senaryoda çalışması için alternatif URL'ler oluştur
    const alternativeUrls = generateAlternativeUrls(photo, publicAccessUrl, directUrl);
    
    console.log('Primary URL to try:', publicAccessUrl); // Önce public endpoint'i dene
    console.log('Alternative URLs to try:', alternativeUrls);
    
    return {
      primaryUrl: publicAccessUrl, // Kimlik doğrulama gerektirmeyen public endpoint öncelikli
      alternativeUrls: alternativeUrls
    };
  } catch (error) {
    console.error('Error in processPhotoUrl:', error);
    return getDefaultPhotoUrls();
  }
}

/**
 * PUBLIC ACCESS MODE: Fotoğraf API'sine güvenilir erişim için yardımcı fonksiyon
 * @param {Array} photos - fotoğraf nesneleri dizisi
 * @returns {Array} - İşlenmiş fotoğraf nesneleri dizisi
 */
export function processSharedReportPhotos(photos) {
  if (!Array.isArray(photos) || photos.length === 0) {
    console.warn('No photos available to process');
    return [];
  }
  
  console.log(`Processing ${photos.length} photos for shared report view`);
  
  return photos.map(photo => {
    try {
      if (!photo || !photo.file_path) {
        console.warn('Invalid photo object or missing file_path:', photo);
        return {
          ...photo,
          imgSrc: '/images/placeholder-image.svg',
          fallbackUrls: ['/images/placeholder-image.svg']
        };
      }
      
      // Çalışma ortamını belirle
      const isProduction = typeof window !== 'undefined' 
        ? window.location.hostname !== 'localhost' 
        : false;
      
      // URL'ler için sabit değerler
      const baseApiUrl = isProduction ? PRODUCTION_API_URL : DEVELOPMENT_API_URL;
      
      // 1. Public Access URL - en güvenilir yöntem
      const publicAccessUrl = `${baseApiUrl}/api/photos/public-access/${photo.file_path}`;
      
      // 2. Doğrudan dosya erişimi URL
      const directFileUrl = `${baseApiUrl}/uploads/${photo.file_path}`;
      
      // 3. URL alanından gelen (eğer varsa)
      const providedUrl = photo.url ? (photo.url.startsWith('http') 
        ? photo.url 
        : `${baseApiUrl}${photo.url.startsWith('/') ? '' : '/'}${photo.url}`
      ) : null;
      
      console.log(`[Photo ${photo.id}] Generated URLs:`, {
        publicAccessUrl,
        directFileUrl,
        providedUrl
      });
      
      // Tüm alternatif URL'leri derliyoruz
      let fallbackUrls = [
        publicAccessUrl,       // Çok güvenilir
        directFileUrl,        // Yüksek güvenilir
        providedUrl,          // Orta güvenilir
      ].filter(Boolean); // null değerleri kaldır
      
      // Her iki ortam için alternatif URL'ler ekle
      fallbackUrls = [
        ...fallbackUrls,
        `${PRODUCTION_API_URL}/api/photos/public-access/${photo.file_path}`,
        `${PRODUCTION_API_URL}/uploads/${photo.file_path}`,
        `${DEVELOPMENT_API_URL}/api/photos/public-access/${photo.file_path}`,
        `${DEVELOPMENT_API_URL}/uploads/${photo.file_path}`,
        '/images/placeholder-image.svg'
      ];
      
      // Final URL'yi belirle ve nesneyi döndür
      return {
        ...photo,
        imgSrc: publicAccessUrl, // En güvenilir seçenek
        fallbackUrls: [...new Set(fallbackUrls)] // Tekrarlanan URL'leri kaldır
      };
    } catch (error) {
      console.error(`Error processing photo ${photo?.id || 'unknown'}:`, error);
      return {
        ...photo,
        imgSrc: '/images/placeholder-image.svg',
        fallbackUrls: ['/images/placeholder-image.svg']
      };
    }
  });
}

/**
 * Fotoğraf nesnesi için alternatif URL'ler oluşturur
 * @param {Object} photo - Fotoğraf nesnesi
 * @param {String} primaryUrl - Birincil URL
 * @param {String} publicAccessUrl - Public access endpoint URL'i
 * @returns {Array} - Alternatif URL'ler dizisi
 */
function generateAlternativeUrls(photo, publicAccessUrl, directUrl) {
  const urls = [
    publicAccessUrl, // Önce birincil URL'yi dene
    directUrl, // Sonra public endpoint'i dene
  ];
  
  // Dosya adını al
  let filename = '';
  if (photo.url) {
    const parts = photo.url.split('/');
    filename = parts[parts.length - 1];
  } else if (photo.file_path) {
    filename = photo.file_path;
  }
  
  if (filename) {
    // Her ortam için doğrudan /uploads/ klasörü URL'leri ekle
    urls.push(`${PRODUCTION_API_URL}/uploads/${filename}`);
    urls.push(`${DEVELOPMENT_API_URL}/uploads/${filename}`);
    
    // Public access endpoint'i her ortam için ekle
    urls.push(`${PRODUCTION_API_URL}/api/photos/public-access/${filename}`);
    urls.push(`${DEVELOPMENT_API_URL}/api/photos/public-access/${filename}`);
  }
  
  if (photo.url) {
    // URL'in farklı varyasyonlarını ekle
    if (photo.url.startsWith('/')) {
      urls.push(`${PRODUCTION_API_URL}${photo.url}`);
      urls.push(`${DEVELOPMENT_API_URL}${photo.url}`);
    } else {
      urls.push(`${PRODUCTION_API_URL}/uploads/${photo.url}`);
      urls.push(`${DEVELOPMENT_API_URL}/uploads/${photo.url}`);
    }
  }
  
  if (photo.file_path) {
    // file_path kullanarak URL'ler ekle
    urls.push(`${PRODUCTION_API_URL}/uploads/${photo.file_path}`);
    urls.push(`${DEVELOPMENT_API_URL}/uploads/${photo.file_path}`);
  }
  
  // Son çare olarak placeholder ekle
  urls.push('/images/placeholder-image.svg');
  
  // Null değerleri kaldır ve benzersiz URL'leri döndür
  return [...new Set(urls.filter(Boolean))];
}

/**
 * Varsayılan fotoğraf URL'lerini döndürür
 * @returns {Object} - Varsayılan URL bilgileri
 */
function getDefaultPhotoUrls() {
  return {
    primaryUrl: '/images/placeholder-image.svg',
    alternativeUrls: ['/images/placeholder-image.svg']
  };
}

/**
 * Fotoğraf nesnesine URL bilgilerini ekleyen işlev
 * @param {Array} photos - Fotoğraf nesneleri dizisi
 * @returns {Array} - URL bilgileri eklenmiş fotoğraf nesneleri dizisi
 */
export function enhancePhotosWithUrls(photos) {
  if (!Array.isArray(photos)) {
    console.error('Invalid photos array:', photos);
    return [];
  }
  
  return photos.map(photo => {
    if (!photo) return photo;
    
    const urlInfo = processPhotoUrl(photo);
    return {
      ...photo,
      imgSrc: urlInfo.primaryUrl,
      fallbackUrls: urlInfo.alternativeUrls
    };
  });
}