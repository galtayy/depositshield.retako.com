import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-toastify';
import Layout from '../../../../components/Layout';
import { apiService } from '../../../../lib/api';

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apidepositshield.retako.com/api';

export default function SharedReportView() {
  const [report, setReport] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [photoLoading, setPhotoLoading] = useState(true);
  const router = useRouter();
  const { uuid } = router.query;

  useEffect(() => {
    if (uuid) {
      fetchReport();
    }
  }, [uuid, router]);

  useEffect(() => {
    if (report) {
      fetchPhotos();
    }
  }, [report]);

  const fetchReport = async () => {
    try {
      console.log('Fetching shared report with UUID:', uuid);
      
      // API'de UUID fonksiyonu çalışmadıysa, ID değerini UUID'den çıkarmayı deneyelim
      // UUID formatı: afaccc52-e9e7-48cd-8dde-1ca09a32d429
      // BU GEÇİCİ BİR ÇÖZÜM - ideal durumda API UUID desteği sağlamalı
      
      // Önce UUID ile deneme yap
      try {
        const response = await apiService.reports.getByUuid(uuid);
        console.log('Shared report response from UUID endpoint:', response.data);
        setReport(response.data);
        return; // UUID endpoint'i çalıştıysa devam etme
      } catch (uuidError) {
        console.warn('UUID endpoint failed, trying numeric ID fallback', uuidError);
        // UUID endpoint'i çalışmadı, ID yöntemini deneyelim
      }
      
      // Çeşitli format kontrolleri
      
      // "id-X" formatı için kontrol (fallback)
      if (uuid.startsWith('id-')) {
        const reportId = uuid.replace('id-', '');
        console.log('Using direct ID format:', reportId);
        const response = await apiService.reports.getById(reportId);
        console.log('Shared report response from direct ID endpoint:', response.data);
        setReport(response.data);
        return;
      }
      
      // UUID'nin içinde sayısal ID olabilir
      const idMatch = uuid.match(/\d+/);
      if (idMatch) {
        const numericId = idMatch[0];
        console.log('Extracted numeric ID from UUID:', numericId);
        const response = await apiService.reports.getById(numericId);
        console.log('Shared report response from ID endpoint:', response.data);
        setReport(response.data);
        return;
      }
      
      // UUID'deki ilk bölümü ID olarak kullanmayı deneyelim
      const firstPart = uuid.split('-')[0];
      if (firstPart) {
        // Hexadecimal'i decimal'e dönüştür
        const decimalId = parseInt(firstPart, 16);
        if (!isNaN(decimalId)) {
          console.log('Using first part of UUID as decimal ID:', decimalId);
          const response = await apiService.reports.getById(decimalId);
          console.log('Shared report response from converted ID endpoint:', response.data);
          setReport(response.data);
          return;
        }
      }
      
      // Son çare - tüm raporları çek ve UUID ile eşleştir
      console.log('Trying to match UUID in all reports as last resort');
      const allReportsResponse = await apiService.reports.getAll();
      const matchingReport = allReportsResponse.data.find(r => r.uuid === uuid);
      
      if (matchingReport) {
        console.log('Found matching report by UUID in all reports:', matchingReport);
        setReport(matchingReport);
        return;
      }
      
      // Hiçbir yöntem işe yaramadıysa
      throw new Error('Cannot find report with this UUID');
      
    } catch (error) {
      console.error('Shared report fetch error:', error);
      let errorMessage = 'An error occurred while loading the shared report.';
      
      if (error.response) {
        console.error('API response error:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchPhotos = async () => {
    try {
      console.log('Fetching photos for shared report:', report.id);
      const response = await apiService.photos.getByReport(report.id);
      console.log('Photos response:', response.data);
      
      if (Array.isArray(response.data)) {
        console.log(`Received ${response.data.length} photos`);
        response.data.forEach((photo, index) => {
          console.log(`Photo ${index + 1}:`, photo);
          console.log(`Original URL: ${photo.url}`);
        });
        setPhotos(response.data);
      } else {
        console.error('Invalid photos data format:', response.data);
        setPhotos([]);
      }
    } catch (error) {
      console.error('Photos fetch error:', error);
      let errorMessage = 'An error occurred while loading photos.';
      
      if (error.response) {
        console.error('API response error:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setPhotoLoading(false);
    }
  };

  // Helper function to display role badge
  const getRoleBadge = (role) => {
    if (role === 'landlord') {
      return <span className="badge-landlord">Landlord</span>;
    } else if (role === 'renter') {
      return <span className="badge-tenant">Tenant</span>;
    } else {
      return <span className="badge-other">Other</span>;
    }
  };

  // Report type badge
  const getReportTypeBadge = (type) => {
    switch (type) {
      case 'move-in':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Pre-Move-In</span>;
      case 'move-out':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Post-Move-Out</span>;
      case 'general':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">General</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Shared Report</h1>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!report) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Report Not Found</h1>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">The shared report you are looking for does not exist or has been removed.</p>
            <Link href="/" className="btn btn-primary">
              Go to Homepage
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold">Shared Report</h1>
            {getReportTypeBadge(report.type)}
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Viewing a shared property report
          </p>
        </div>
        
        {/* Report Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-semibold">{report.title}</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {new Date(report.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              {report.creator_name && ` • ${report.creator_name}`}
              {report.role_at_this_property && ` • ${getRoleBadge(report.role_at_this_property)}`}
            </p>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Property Address</h3>
            <p className="text-gray-900 dark:text-gray-100">{report.address}</p>
          </div>
          
          {report.description && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Report Description</h3>
              <p className="text-gray-900 dark:text-gray-100">{report.description}</p>
            </div>
          )}
        </div>
        
        {/* Photos */}
        <div className="mt-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Photos</h2>
          </div>
          
          {photoLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : photos.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">No photos have been added to this report yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map((photo) => {
                // Geçerli bir ID kontrolü
                if (!photo || !photo.id) {
                  console.error('Invalid photo object:', photo);
                  return null;
                }
                
                // URL için güvenlik kontrolü ve alternatif URL yapısı deneme
                let imgSrc = '/images/placeholder-image.svg';
                
                if (photo.url) {
                  // 1. Orijinal URL (muhtemelen /uploads/file.png yapısında)
                  const originalPath = photo.url;
                  
                  // 2. URL ana kalıbı
                  const baseUrl = API_URL.replace('/api', '');
                  
                  // 3. Alternatif URL yapılarını dene
                  if (originalPath.startsWith('http')) {
                    // Tam URL
                    imgSrc = originalPath;
                  } else if (originalPath.startsWith('/')) {
                    // Göreceli yol (/uploads/...)
                    imgSrc = `${baseUrl}${originalPath}`;
                  } else {
                    // /api/ sonrası yol
                    imgSrc = `${baseUrl}/${originalPath}`;
                  }
                }
                
                console.log(`Rendering with URL: ${imgSrc}`);
                
                // Bu fotoğraf için alternatif URL'ler
                const fallbackUrls = [
                  imgSrc,
                  photo.url ? `https://apidepositshield.retako.com${photo.url}` : null,
                  photo.url ? `https://apidepositshield.retako.com/uploads/${photo.url.split('/').pop()}` : null
                ].filter(Boolean);
                
                return (
                  <div key={photo.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="relative">
                      <img 
                        src={imgSrc} 
                        alt={photo.note || 'Report photo'}
                        onError={(e) => {
                          console.error('Image loading error:', e.target.src);
                          
                          // Fallback URL'lerin sıradaki URL'sini dene
                          const currentIndex = fallbackUrls.indexOf(e.target.src);
                          if (currentIndex !== -1 && currentIndex < fallbackUrls.length - 1) {
                            const nextUrl = fallbackUrls[currentIndex + 1];
                            console.log(`Trying next URL: ${nextUrl}`);
                            e.target.src = nextUrl;
                          } else {
                            // Tüm URL'ler denendiyse placeholder'a dön
                            e.target.src = '/images/placeholder-image.svg';
                            e.target.onerror = null;
                          }
                        }}
                        className="w-full h-48 object-cover hover:opacity-90 transition-opacity"
                      />
                    </div>
                    
                    <div className="p-4">
                      {photo.note && (
                        <p className="text-gray-700 dark:text-gray-300 mb-2">{photo.note}</p>
                      )}
                      
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {new Date(photo.timestamp).toLocaleString('en-US')}
                      </div>
                      
                      {photo.tags && photo.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {photo.tags.map((tag, index) => (
                            <span key={index} className="inline-flex items-center text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded px-1.5 py-0.5">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
