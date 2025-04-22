import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import Layout from '../../../../components/Layout';
import { apiService } from '../../../../lib/api';
import { useAuth } from '../../../../lib/auth';

export default function AddPhotos() {
  const { user, loading: authLoading } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fotoğraf yükleme için
  const [photos, setPhotos] = useState([]);
  const [previewPhotos, setPreviewPhotos] = useState([]);
  const [photoNotes, setPhotoNotes] = useState({});
  const [tags, setTags] = useState({});
  const fileInputRef = useRef(null);
  
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

  // Fotoğrafları önizle
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

    // Temizlik fonksiyonu
    return () => {
      newPreviewPhotos.forEach(url => URL.revokeObjectURL(url));
    };
  }, [photos]);

  const fetchReport = async () => {
    try {
      console.log('Rapor detayları getiriliyor:', id);
      const response = await apiService.reports.getById(id);
      console.log('Rapor detayları yanıtı:', response.data);
      
      setReport(response.data);
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
      setPhotos(prevPhotos => [...prevPhotos, ...selectedFiles]);
      
      // Yeni fotoğraflar için boş notlar ve etiketler oluştur
      const newNotes = { ...photoNotes };
      const newTags = { ...tags };
      
      selectedFiles.forEach((_, index) => {
        const photoId = photos.length + index;
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
    
    // Notları ve etiketleri güncelle
    const newNotes = { ...photoNotes };
    const newTags = { ...tags };
    
    delete newNotes[index];
    delete newTags[index];
    
    // Kalan tüm fotoğrafların indekslerini güncelle
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
    
    if (photos.length === 0) {
      toast.error('Lütfen en az bir fotoğraf yükleyin.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Fotoğrafları yükle
      for (let i = 0; i < photos.length; i++) {
        const formData = new FormData();
        formData.append('photo', photos[i]);
        
        if (photoNotes[i]) {
          formData.append('note', photoNotes[i]);
        }
        
        if (tags[i] && tags[i].length > 0) {
          formData.append('tags', JSON.stringify(tags[i]));
        }
        
        console.log(`Fotoğraf ${i+1} yükleniyor...`);
        await apiService.photos.upload(id, formData);
        console.log(`Fotoğraf ${i+1} yüklendi`);
      }
      
      toast.success('Fotoğraflar başarıyla yüklendi.');
      router.push(`/reports/${id}`);
    } catch (error) {
      console.error('Photo upload error:', error);
      let errorMessage = 'Fotoğraflar yüklenirken bir hata oluştu.';
      
      if (error.response) {
        console.error('API yanıt hatası:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Kamera ile fotoğraf çekme
  const takePhoto = async () => {
    try {
      // getUserMedia API'si ile kameraya erişim iste
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Video elementini oluştur
      const video = document.createElement('video');
      document.body.appendChild(video);
      video.srcObject = stream;
      video.play();
      
      // Kullanıcıya bir fotoğraf çekme butonu göster
      const captureButton = document.createElement('button');
      captureButton.textContent = 'Fotoğraf Çek';
      captureButton.className = 'btn btn-primary fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50';
      document.body.appendChild(captureButton);
      
      // Fotoğraf çekme işlevi
      return new Promise((resolve) => {
        captureButton.onclick = () => {
          // Canvas oluştur ve video karesini çiz
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.getContext('2d').drawImage(video, 0, 0);
          
          // Canvas'tan blob oluştur
          canvas.toBlob((blob) => {
            // Stream'i durdur ve DOM'dan elementleri kaldır
            stream.getTracks().forEach(track => track.stop());
            video.remove();
            captureButton.remove();
            
            // Blob'u File'a dönüştür
            const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
            
            resolve(file);
          }, 'image/jpeg');
        };
      });
    } catch (error) {
      console.error('Camera access error:', error);
      toast.error('Kameraya erişim sağlanamadı.');
      return null;
    }
  };

  const handleCameraCapture = async () => {
    const photo = await takePhoto();
    if (photo) {
      setPhotos(prevPhotos => [...prevPhotos, photo]);
      
      // Yeni fotoğraf için not ve etiketler oluştur
      const photoId = photos.length;
      setPhotoNotes({
        ...photoNotes,
        [photoId]: ''
      });
      
      setTags({
        ...tags,
        [photoId]: []
      });
    }
  };

  if (loading || authLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Fotoğraf Ekle</h1>
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
          <h1 className="text-2xl font-bold mb-6">Rapor Bulunamadı</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 mb-4">İstenen rapor bulunamadı veya erişim izniniz yok.</p>
            <button onClick={() => router.back()} className="btn btn-primary">
              Geri Dön
            </button>
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
            aria-label="Geri"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold">Fotoğraf Ekle</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-1">{report.title}</h2>
            <p className="text-gray-600 text-sm">
              {report.address}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Fotoğraf Yükleme Bölümü */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Fotoğraflar</h3>
              
              <div className="flex flex-wrap gap-4 mb-6">
                {previewPhotos.map((preview, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={preview} 
                      alt={`Fotoğraf ${index + 1}`} 
                      className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md"
                      aria-label="Fotoğrafı kaldır"
                    >
                      ×
                    </button>
                    
                    <div className="mt-2 w-32">
                      <input
                        type="text"
                        placeholder="Not ekle"
                        value={photoNotes[index] || ''}
                        onChange={(e) => handleNoteChange(index, e.target.value)}
                        className="w-full text-xs p-1 border border-gray-300 rounded"
                      />
                      
                      <div className="mt-1">
                        <input
                          type="text"
                          placeholder="Etiket ekle ve Enter'a bas"
                          onKeyPress={(e) => handleKeyPress(e, index)}
                          className="w-full text-xs p-1 border border-gray-300 rounded"
                        />
                        
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tags[index]?.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="inline-flex items-center text-xs bg-gray-100 rounded px-1.5 py-0.5"
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
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="btn btn-secondary"
                >
                  Fotoğraf Seç
                </button>
                
                <button
                  type="button"
                  onClick={handleCameraCapture}
                  className="btn btn-secondary"
                >
                  Kamera ile Çek
                </button>
                
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
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                İptal
              </button>
              
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || photos.length === 0}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Yükleniyor...
                  </span>
                ) : 'Fotoğrafları Yükle'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
