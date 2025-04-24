import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import Layout from '../../../components/Layout';
import { apiService } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import { enhancePhotosWithUrls } from '../../../lib/helpers/photoHelper';

export default function EditReport() {
  const { user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reportType, setReportType] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [address, setAddress] = useState('');
  const [report, setReport] = useState(null);
  
  // For photo uploads
  const [photos, setPhotos] = useState([]);
  const [previewPhotos, setPreviewPhotos] = useState([]);
  const [photoNotes, setPhotoNotes] = useState({});
  const [tags, setTags] = useState({});
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [photoLoading, setPhotoLoading] = useState(true);
  const fileInputRef = useRef(null);
  
  const router = useRouter();
  const { id } = router.query;
  
  // API URL tanımlamaları
  const DEVELOPMENT_API_URL = 'http://localhost:5050';
  const PRODUCTION_API_URL = 'https://api.depositshield.retako.com';
  
  // Fotoğraf silme işlemi
  const handleDeletePhoto = async (photoId) => {
    if (confirm('Bu fotoğrafı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      try {
        console.log('Deleting photo:', photoId);
        await apiService.photos.delete(photoId);
        console.log('Photo deleted');
        
        // Fotoğraf listesini güncelle
        setExistingPhotos(existingPhotos.filter(photo => photo.id !== photoId));
        toast.success('Fotoğraf başarıyla silindi.');
      } catch (error) {
        console.error('Photo delete error:', error);
        let errorMessage = 'Fotoğraf silinirken bir hata oluştu.';
        
        if (error.response) {
          console.error('API response error:', error.response.data);
          errorMessage = error.response.data.message || errorMessage;
        }
        
        toast.error(errorMessage);
      }
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (id) {
      fetchReport();
      fetchPhotos();
    }
  }, [id, user, authLoading, router]);
  
  // Preview photos
  useEffect(() => {
    if (!photos.length) {
      setPreviewPhotos([]);
      return;
    }

    const newPreviewPhotos = [];
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const photoURL = URL.createObjectURL(photo);
      newPreviewPhotos.push(photoURL);
    }

    setPreviewPhotos(newPreviewPhotos);

    // Cleanup function
    return () => {
      newPreviewPhotos.forEach(url => URL.revokeObjectURL(url));
    };
  }, [photos]);

  const fetchPhotos = async () => {
    try {
      console.log('Fotoğraflar getiriliyor:', id);
      
      let photoData = [];
      
      try {
        // Önce normal yöntemi dene
        const response = await apiService.photos.getByReport(id);
        console.log('Photos response:', response.data);
        
        if (Array.isArray(response.data)) {
          photoData = response.data;
        } else {
          console.error('Invalid photos data format:', response.data);
        }
      } catch (mainError) {
        console.error('Standard photos API call failed:', mainError);
        
        // Alternatif yöntem: Doğrudan axios kullan
        try {
          const axios = (await import('axios')).default;
          const token = localStorage.getItem('token');
          
          const isProduction = typeof window !== 'undefined' ? window.location.hostname !== 'localhost' : false;
          const apiBaseUrl = isProduction ? 'https://api.depositshield.retako.com' : 'http://localhost:5050';
          
          const altResponse = await axios.get(`${apiBaseUrl}/api/photos/report/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
          
          console.log('Alternative photos API call successful:', altResponse.data);
          
          if (Array.isArray(altResponse.data)) {
            photoData = altResponse.data;
          } else {
            console.error('Invalid photos data format from alternative API:', altResponse.data);
          }
        } catch (altError) {
          console.error('Alternative photos API call also failed:', altError);
          // Hata durumunda boş dizi döndür
          photoData = [];
        }
      }
      
      // Fotoğraf verilerini işle ve log bilgilerini göster
      if (photoData.length > 0) {
        console.log(`Received ${photoData.length} photos`);
        
        // Fotoğraf nesnelerine URL bilgisi ekle
        const enhancedPhotos = enhancePhotosWithUrls(photoData);
        console.log('Enhanced photos with URLs:', enhancedPhotos);
        
        // Geliştirilmiş fotoğrafları state'e kaydet
        setExistingPhotos(enhancedPhotos);
      } else {
        console.log('No photos to display');
        setExistingPhotos([]);
      }
    } catch (error) {
      console.error('Photos fetch error:', error);
      let errorMessage = 'Fotoğraflar yüklenirken bir hata oluştu.';
      
      if (error.response) {
        console.error('API yanıt hatası:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      }
      
      toast.error(errorMessage);
      setExistingPhotos([]); // Hata durumunda boş dizi ayarla
    } finally {
      setPhotoLoading(false);
    }
  };

  const fetchReport = async () => {
    try {
      console.log('Rapor detayları getiriliyor:', id);
      const response = await apiService.reports.getById(id);
      // Önceki console.log'a ek olarak UUID bilgisini de yazdıralım
      console.log('Rapor detayları yanıtı:', response.data);
      console.log('Rapor UUID:', response.data.uuid);
      console.log('Rapor ID:', response.data.id);
      
      const report = response.data;
      setTitle(report.title || '');
      setDescription(report.description || '');
      setReportType(report.type || '');
      setSelectedProperty(report.property_id?.toString() || '');
      setAddress(report.address || '');
      // Gelen rapor objesini state'e kaydedelim ki uuid'yi updateReport'da kullanabilelim
      setReport(report);
    } catch (error) {
      console.error('Report fetch error:', error);
      let errorMessage = 'Rapor bilgileri yüklenirken bir hata oluştu.';
      
      if (error.response) {
        console.error('API yanıt hatası:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
      // CORRECTION: Getting current photo count from photos state
      const currentPhotoCount = photos.length;
      
      setPhotos(prevPhotos => [...prevPhotos, ...selectedFiles]);
      
      // Create empty notes and tags for new photos
      const newNotes = { ...photoNotes };
      const newTags = { ...tags };
      
      selectedFiles.forEach((_, index) => {
        const photoId = currentPhotoCount + index;
        newNotes[photoId] = '';
        newTags[photoId] = [];
      });
      
      setPhotoNotes(newNotes);
      setTags(newTags);
    }
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPreviewPhotos(previewPhotos.filter((_, i) => i !== index));
    
    // Update notes and tags
    const newNotes = { ...photoNotes };
    const newTags = { ...tags };
    
    delete newNotes[index];
    delete newTags[index];
    
    // Update indices for all remaining photos
    const updatedNotes = {};
    const updatedTags = {};
    
    let newIndex = 0;
    for (let i = 0; i < photos.length; i++) {
      if (i !== index) {
        updatedNotes[newIndex] = newNotes[i];
        updatedTags[newIndex] = newTags[i];
        newIndex++;
      }
    }
    
    setPhotoNotes(updatedNotes);
    setTags(updatedTags);
  };

  const handleNoteChange = (index, note) => {
    setPhotoNotes({
      ...photoNotes,
      [index]: note
    });
  };

  const addTag = (index, tag) => {
    if (!tag.trim()) return;
    
    setTags({
      ...tags,
      [index]: [...(tags[index] || []), tag.trim()]
    });
  };

  const removeTag = (photoIndex, tagIndex) => {
    setTags({
      ...tags,
      [photoIndex]: tags[photoIndex].filter((_, i) => i !== tagIndex)
    });
  };

  const handleKeyPress = (e, index) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      addTag(index, e.target.value);
      e.target.value = '';
      e.preventDefault();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !reportType) {
      toast.error('Lütfen gerekli alanları doldurunuz.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Rapor daha önce reddedilmiş mi kontrol et
      const wasRejected = report && report.approval_status === 'rejected';
      
      const reportData = {
        title,
        description,
        type: reportType,
        // UUID değişikliği seçeneği
        generate_new_uuid: wasRejected ? true : undefined
      };
      
      console.log('Rapor güncelleme isteği gönderiliyor:', reportData);
      const response = await apiService.reports.update(id, reportData);
      console.log('Rapor güncelleme yanıtı:', response.data);
      
      // Başarıyla kaydedildiğinde localStorage'a işaret bırak
      try {
        // Hem ID bazlı hem de UUID bazlı işaretler oluştur
        const idKey = `report_updated_id_${id}`;
        localStorage.setItem(idKey, 'true');
        console.log(`Report marked as updated using ID key: ${idKey}`);
        
        // Ayrıca eğer UUID varsa onu da kullan
        if (report && report.uuid) {
          const uuidKey = `report_updated_uuid_${report.uuid}`;
          localStorage.setItem(uuidKey, 'true');
          console.log(`Report also marked as updated using UUID key: ${uuidKey}`);
        } else {
          console.warn('No UUID available for this report');
        }
      } catch (storageError) {
        console.error('Error setting localStorage flags:', storageError);
      }
      
      // Check if there are photos to upload
      if (photos.length > 0) {
        // Upload photos
        for (let i = 0; i < photos.length; i++) {
          const formData = new FormData();
          formData.append('photo', photos[i]);
          
          if (photoNotes[i]) {
            formData.append('note', photoNotes[i]);
          }
          
          if (tags[i] && tags[i].length > 0) {
            formData.append('tags', JSON.stringify(tags[i]));
          }
          
          console.log(`Uploading photo ${i+1}...`);
          await apiService.photos.upload(id, formData);
          console.log(`Photo ${i+1} uploaded.`);
        }
      }
      
      // Eğer rapor daha önce reddedilmişse ek bilgi mesajı göster
      if (wasRejected) {
        toast.success('Reddedilen rapor başarıyla güncellendi ve tekrar onaya sunulabilir.');
      } else {
        toast.success('Rapor başarıyla güncellendi.');
      }
      
      router.push(`/reports/${id}`);
    } catch (error) {
      console.error('Report update error:', error);
      let errorMessage = 'Rapor güncellenirken bir hata oluştu.';
      
      if (error.response) {
        console.error('API yanıt hatası:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Rapor Düzenle</h1>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl animate-fadeIn">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-700 mb-2">Rapor Düzenle</h1>
          <p className="text-gray-600">Mülkünüzün durumunu belgeleyin</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          {/* Progress indicator */}
          <div className="bg-indigo-50 p-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span className="font-medium text-indigo-700">Adım {step} / 3</span>
              <span>{step === 1 ? 'Temel Bilgiler' : step === 2 ? 'Fotoğraflar' : 'Onay'}</span>
            </div>
          </div>
          
          <form onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()}>
            {step === 1 ? (
              <div className="p-6 space-y-6">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="property" className="block text-sm font-medium text-gray-700 mb-2">
                      Mülk Adresi*
                    </label>
                    <input
                      id="property"
                      type="text"
                      value={address}
                      readOnly
                      className="input bg-gray-50 focus:border-indigo-500 transition-all duration-300"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Rapor Başlığı*
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="input focus:border-indigo-500 transition-all duration-300"
                      placeholder="Rapor için kısa bir başlık girin"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Rapor Açıklaması
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="input focus:border-indigo-500 transition-all duration-300"
                      placeholder="Rapor hakkında genel açıklama (isteğe bağlı)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rapor Türü*
                    </label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className={`p-4 rounded-lg border cursor-pointer text-center transition-all duration-300 ${
                        reportType === 'move-in' 
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50'
                      }`}
                      onClick={() => setReportType('move-in')}>
                        <input
                          id="type-move-in"
                          name="reportType"
                          type="radio"
                          value="move-in"
                          checked={reportType === 'move-in'}
                          onChange={() => setReportType('move-in')}
                          className="hidden"
                          required
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        <label htmlFor="type-move-in" className="font-medium block">
                          Taşınma Öncesi
                        </label>
                      </div>
                      
                      <div className={`p-4 rounded-lg border cursor-pointer text-center transition-all duration-300 ${
                        reportType === 'move-out' 
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50'
                      }`}
                      onClick={() => setReportType('move-out')}>
                        <input
                          id="type-move-out"
                          name="reportType"
                          type="radio"
                          value="move-out"
                          checked={reportType === 'move-out'}
                          onChange={() => setReportType('move-out')}
                          className="hidden"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <label htmlFor="type-move-out" className="font-medium block">
                          Taşınma Sonrası
                        </label>
                      </div>
                      
                      <div className={`p-4 rounded-lg border cursor-pointer text-center transition-all duration-300 ${
                        reportType === 'general' 
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50'
                      }`}
                      onClick={() => setReportType('general')}>
                        <input
                          id="type-general"
                          name="reportType"
                          type="radio"
                          value="general"
                          checked={reportType === 'general'}
                          onChange={() => setReportType('general')}
                          className="hidden"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <label htmlFor="type-general" className="font-medium block">
                          Genel Gözlem
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-between items-center border-t border-gray-100 mt-6">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="btn btn-secondary hover:bg-gray-100 transition-all duration-300"
                  >
                    İptal
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      if (title && reportType) {
                        setStep(2);
                      } else {
                        toast.error('Lütfen gerekli alanları doldurunuz.');
                      }
                    }}
                    className="btn btn-primary hover:bg-indigo-500 transition-all duration-300"
                  >
                    Devam
                  </button>
                </div>
              </div>
            ) : step === 2 ? (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Fotoğraf Yükle</h3>
                  <p className="text-gray-600 mb-6">Mülkünüzün durumunu belgelemek için fotoğraf yükleyin</p>
                  
                  <div className="flex flex-wrap gap-6 mb-6">
                    {previewPhotos.map((preview, index) => (
                      <div key={`new-${index}`} className="relative bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <img 
                          src={preview} 
                          alt={`Fotoğraf ${index + 1}`} 
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md"
                          aria-label="Fotoğrafı kaldır"
                        >
                          ×
                        </button>
                        
                        <div className="mt-3 w-32">
                          <input
                            type="text"
                            placeholder="Not ekle"
                            value={photoNotes[index] || ''}
                            onChange={(e) => handleNoteChange(index, e.target.value)}
                            className="w-full text-xs p-2 border border-gray-300 rounded"
                          />
                          
                          <div className="mt-2">
                            <input
                              type="text"
                              placeholder="Etiket ekle ve Enter'a bas"
                              onKeyPress={(e) => handleKeyPress(e, index)}
                              className="w-full text-xs p-2 border border-gray-300 rounded"
                            />
                            
                            <div className="flex flex-wrap gap-1 mt-2">
                              {tags[index]?.map((tag, tagIndex) => (
                                <span
                                  key={tagIndex}
                                  className="inline-flex items-center text-xs bg-indigo-50 text-indigo-700 rounded px-1.5 py-0.5"
                                >
                                  {tag}
                                  <button
                                    type="button"
                                    onClick={() => removeTag(index, tagIndex)}
                                    className="ml-1 text-gray-400 hover:text-gray-600"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Mevcut fotoğraflar */}
                    {photoLoading ? (
                      <div className="flex justify-center items-center py-12 w-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      existingPhotos.map((photo) => {
                        // Geçerli bir ID kontrolü
                        if (!photo || !photo.id) {
                          console.error('Invalid photo object:', photo);
                          return null;
                        }
                        
                        // Fotoğraf resim URL'i
                        const imgSrc = photo.imgSrc || '/images/placeholder-image.svg';
                        
                        // Bu fotoğraf için alternatif URL'ler
                        const fallbackUrls = photo.fallbackUrls || [
                          // Sabit API URL'leri
                          `${PRODUCTION_API_URL}/uploads/${photo.file_path}`,
                          `${DEVELOPMENT_API_URL}/uploads/${photo.file_path}`,
                          `${PRODUCTION_API_URL}/api/photos/public-access/${photo.file_path}`,
                          `${DEVELOPMENT_API_URL}/api/photos/public-access/${photo.file_path}`,
                          '/images/placeholder-image.svg'
                        ];
                        
                        return (
                          <div key={`existing-${photo.id}`} className="relative bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <img 
                              src={imgSrc} 
                              alt={photo.note || 'Report photo'}
                              crossOrigin="anonymous"
                              className="w-32 h-32 object-cover rounded-lg"
                              onError={(e) => {
                                console.error('Image loading error for:', e.target.src);
                                
                                // Fallback URL'lerin sıradaki URL'sini dene
                                if (!fallbackUrls || !Array.isArray(fallbackUrls)) {
                                  console.error('No fallback URLs available');
                                  e.target.src = '/images/placeholder-image.svg';
                                  e.target.onerror = null;
                                  return;
                                }
                                
                                const currentIndex = fallbackUrls.indexOf(e.target.src);
                                if (currentIndex !== -1 && currentIndex < fallbackUrls.length - 1) {
                                  const nextUrl = fallbackUrls[currentIndex + 1];
                                  console.log(`Trying next URL (${currentIndex + 2}/${fallbackUrls.length}): ${nextUrl}`);
                                  e.target.src = nextUrl;
                                } else {
                                  // Tüm URL'ler denendiyse placeholder'a dön
                                  console.log('All URLs failed, using placeholder image');
                                  e.target.src = '/images/placeholder-image.svg';
                                  e.target.onerror = null; // Sonsuz döngüden kaçın
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleDeletePhoto(photo.id)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md"
                              aria-label="Fotoğrafı kaldır"
                            >
                              ×
                            </button>
                            
                            <div className="mt-3 w-32">
                              {photo.note && (
                                <div className="text-xs text-gray-700 p-1 bg-gray-100 rounded mb-1 line-clamp-2" title={photo.note}>
                                    {photo.note}
                                </div>
                              )}
                              
                              {photo.tags && photo.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {photo.tags.map((tag, tagIndex) => (
                                    <span key={tagIndex} className="inline-flex items-center text-xs bg-indigo-50 text-indigo-700 rounded px-1.5 py-0.5 truncate max-w-[80px]" title={tag}>
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                    
                    <div className="w-32 h-32 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition-all duration-300"
                         onClick={() => fileInputRef.current.click()}>
                      <div className="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="text-xs text-gray-500 mt-2 block">Fotoğraf Ekle</span>
                      </div>
                    </div>
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />
                  </div>
                </div>
                
                <div className="pt-4 flex justify-between items-center border-t border-gray-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn btn-secondary hover:bg-gray-100 transition-all duration-300"
                  >
                    Geri
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="btn btn-primary hover:bg-indigo-500 transition-all duration-300"
                  >
                    Devam
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="font-medium text-green-800 text-sm">Kaydetmeye Hazır</h3>
                    <p className="text-green-700 text-xs mt-1">Lütfen kaydetmeden önce rapor detaylarını gözden geçirin</p>
                  </div>
                </div>
              
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-700 mb-3">Rapor Bilgileri</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs text-gray-500 block">Mülk:</span>
                        <p className="text-sm">{address}</p>
                      </div>
                      
                      <div>
                        <span className="text-xs text-gray-500 block">Rapor Başlığı:</span>
                        <p className="text-sm">{title}</p>
                      </div>
                      
                      <div>
                        <span className="text-xs text-gray-500 block">Rapor Türü:</span>
                        <p className="text-sm">
                          {reportType === 'move-in' ? 'Taşınma Öncesi' : 
                           reportType === 'move-out' ? 'Taşınma Sonrası' : 'Genel Gözlem'}
                        </p>
                      </div>
                      
                      {description && (
                        <div>
                          <span className="text-xs text-gray-500 block">Açıklama:</span>
                          <p className="text-sm">{description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-700 mb-3">Fotoğraflar</h3>
                    
                    {photos.length > 0 || existingPhotos.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {previewPhotos.map((preview, index) => (
                          <div key={index} className="relative">
                            <img 
                              src={preview} 
                              alt={`Fotoğraf ${index + 1}`} 
                              className="w-16 h-16 object-cover rounded border border-gray-200"
                            />
                          </div>
                        ))}
                        
                        {existingPhotos.map((photo, index) => (
                          <div key={`thumb-${photo.id}`} className="relative">
                            <img 
                              src={photo.imgSrc || '/images/placeholder-image.svg'} 
                              alt={photo.note || `Mevcut Fotoğraf ${index + 1}`}
                              className="w-16 h-16 object-cover rounded border border-gray-200"
                              crossOrigin="anonymous"
                              onError={(e) => { e.target.src = '/images/placeholder-image.svg'; }}
                            />
                          </div>
                        ))}
                        
                        <div className="text-xs text-gray-500 mt-2 w-full">
                          {photos.length + existingPhotos.length} fotoğraf eklendi
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Henüz fotoğraf eklenmedi</p>
                    )}
                  </div>
                </div>
              
                <div className="pt-4 flex justify-between items-center border-t border-gray-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn btn-secondary hover:bg-gray-100 transition-all duration-300"
                  >
                    Geri
                  </button>
                  
                  <button
                    type="submit"
                    className="btn btn-primary hover:bg-indigo-500 transition-all duration-300"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Kaydediliyor...
                      </span>
                    ) : 'Raporu Güncelle'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </Layout>
  );
}
