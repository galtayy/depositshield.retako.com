import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-toastify';
import Layout from '../../../components/Layout';
import { apiService } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';

// UUID oluşturmak için yardımcı fonksiyon
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function ReportDetail() {
  const { user, loading: authLoading } = useAuth();
  const [report, setReport] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [photoLoading, setPhotoLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (id) {
      fetchReport();
    }
  }, [id, user, authLoading, router]);

  useEffect(() => {
    if (report) {
      fetchPhotos();
    }
  }, [report]);

  const fetchReport = async () => {
    try {
      console.log('Fetching report details:', id);
      const response = await apiService.reports.getById(id);
      console.log('Report details response:', response.data);
      
      // UUID durumunu kontrol et
      let reportData = { ...response.data };
      if (!reportData.uuid) {
        console.warn('Report data missing UUID field, generating a temporary one for sharing purposes');
        reportData.uuid = generateUUID();
        console.log('Generated temporary UUID:', reportData.uuid);
      } else {
        console.log('Report UUID:', reportData.uuid);
      }
      
      setReport(reportData);
    } catch (error) {
      console.error('Report fetch error:', error);
      let errorMessage = 'An error occurred while loading report information.';
      
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
      console.log('Fetching photos for report:', report.id);
      const response = await apiService.photos.getByReport(report.id);
      console.log('Photos response:', response.data);
      
      if (Array.isArray(response.data)) {
        console.log(`Received ${response.data.length} photos`);
        response.data.forEach((photo, index) => {
          console.log(`Photo ${index + 1}:`, photo);
          console.log(`Original URL: ${photo.url}`);
          // URL için güvenlik kontrolü
          const baseUrl = API_URL.replace('/api', '');
          const imgSrc = photo.url 
            ? (photo.url.startsWith('http') ? photo.url : `${baseUrl}${photo.url}`)
            : '/images/placeholder-image.svg';
          console.log(`Processed URL: ${imgSrc}`);
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

  const handleDeleteReport = async () => {
    if (confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      try {
        console.log('Deleting report:', id);
        await apiService.reports.delete(id);
        console.log('Report deleted');
        
        toast.success('Report successfully deleted.');
        router.push('/reports');
      } catch (error) {
        console.error('Report delete error:', error);
        let errorMessage = 'An error occurred while deleting the report.';
        
        if (error.response) {
          console.error('API response error:', error.response.data);
          errorMessage = error.response.data.message || errorMessage;
        }
        
        toast.error(errorMessage);
      }
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
      try {
        console.log('Deleting photo:', photoId);
        await apiService.photos.delete(photoId);
        console.log('Photo deleted');
        
        // Update photo list
        setPhotos(photos.filter(photo => photo.id !== photoId));
        toast.success('Photo successfully deleted.');
      } catch (error) {
        console.error('Photo delete error:', error);
        let errorMessage = 'An error occurred while deleting the photo.';
        
        if (error.response) {
          console.error('API response error:', error.response.data);
          errorMessage = error.response.data.message || errorMessage;
        }
        
        toast.error(errorMessage);
      }
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

  // Create share link
  const getShareLink = () => {
    if (!report || !report.uuid) {
      console.error('Report missing UUID:', report);
      return '';
    }
    return `${window.location.origin}/reports/shared/${report.uuid}`;
  };

  // Copy share link
  const copyShareLink = () => {
    const link = getShareLink();
    if (!link) {
      toast.error('Cannot create share link: Report UUID is missing.');
      return;
    }
    
    // Yaşanılan sorunlar nedeniyle alternatif bir ID tabanlı link de oluştur
    const fallbackLink = `${window.location.origin}/reports/shared/id-${report.id}`;
    const linkToShare = link || fallbackLink;
    
    navigator.clipboard.writeText(linkToShare).then(() => {
      toast.success('Share link copied!');
    }, (err) => {
      console.error('Link copy error:', err);
      toast.error('Could not copy link.');
    });
  };

  if (loading || authLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Report Details</h1>
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
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 mb-4">The requested report was not found or you don't have access to it.</p>
            <Link href="/reports" className="btn btn-primary">
              My Reports
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="mr-4 text-gray-600 hover:text-gray-900"
            aria-label="Back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold">Report Details</h1>
        </div>
        
        {/* Report Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-semibold">{report.title}</h2>
                {getReportTypeBadge(report.type)}
              </div>
              <p className="text-gray-600 text-sm">
                {new Date(report.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                {report.creator_name && ` • ${report.creator_name}`}
                {report.role_at_this_property && ` • ${getRoleBadge(report.role_at_this_property)}`}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <button 
                onClick={copyShareLink}
                className="btn btn-secondary flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-1">Property Address</h3>
            <p className="text-gray-900">{report.address}</p>
          </div>
          
          {report.description && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-1">Report Description</h3>
              <p className="text-gray-900">{report.description}</p>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2">
            <Link href={`/reports/edit?id=${report.id}`} className="btn btn-secondary">
              Edit
            </Link>
            <button onClick={handleDeleteReport} className="btn bg-red-600 hover:bg-red-700 text-white">
              Delete
            </button>
          </div>
        </div>
        
        {/* Photos */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Photos</h2>
            <Link href={`/reports/${report.id}/photos/add`} className="btn btn-primary text-sm px-3 py-1">
              + Add Photo
            </Link>
          </div>
          
          {photoLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : photos.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600 mb-4">No photos have been added to this report yet.</p>
              <Link href={`/reports/${report.id}/photos/add`} className="btn btn-primary">
                Add Photo
              </Link>
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
                  photo.url ? `http://localhost:5050${photo.url}` : null,
                  photo.url ? `http://localhost:5050/uploads/${photo.url.split('/').pop()}` : null
                ].filter(Boolean);
                
                return (
                  <div key={photo.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="relative">
                      <Link href={`/photos/${photo.id}`}>
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
                          className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        />
                      </Link>
                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md"
                        aria-label="Delete photo"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
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
