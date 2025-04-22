import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import { apiService } from '../../lib/api';
import { useAuth } from '../../lib/auth';

export default function PhotoDetail() {
  const { user, loading: authLoading } = useAuth();
  const [photo, setPhoto] = useState(null);
  const [report, setReport] = useState(null);
  const [note, setNote] = useState('');
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  const imageRef = useRef(null);
  const [selectedArea, setSelectedArea] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (id) {
      fetchPhoto();
    }
  }, [id, user, authLoading, router]);

  const fetchPhoto = async () => {
    try {
      console.log('Fotoğraf detayları getiriliyor:', id);
      const response = await apiService.photos.getById(id);
      console.log('Fotoğraf detayları yanıtı:', response.data);
      
      const photoData = response.data;
      setPhoto(photoData);
      setNote(photoData.note || '');
      setTags(photoData.tags || []);
      
      // Rapor bilgisini al
      if (photoData.report_id) {
        const reportResponse = await apiService.reports.getById(photoData.report_id);
        setReport(reportResponse.data);
      }
    } catch (error) {
      console.error('Photo fetch error:', error);
      let errorMessage = 'Fotoğraf bilgileri yüklenirken bir hata oluştu.';
      
      if (error.response) {
        console.error('API yanıt hatası:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleNoteChange = async () => {
    try {
      setIsSubmitting(true);
      console.log('Not güncelleniyor:', note);
      const response = await apiService.photos.updateNote(id, note);
      console.log('Not güncelleme yanıtı:', response.data);
      
      toast.success('Not başarıyla güncellendi.');
    } catch (error) {
      console.error('Note update error:', error);
      let errorMessage = 'Not güncellenirken bir hata oluştu.';
      
      if (error.response) {
        console.error('API yanıt hatası:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    
    try {
      setIsSubmitting(true);
      console.log('Etiket ekleniyor:', newTag);
      const response = await apiService.photos.addTag(id, newTag);
      console.log('Etiket ekleme yanıtı:', response.data);
      
      // Etiketleri güncelle
      setTags(response.data.photo.tags || []);
      setNewTag('');
      setSelectedArea(null); // Reset selected area after adding tag
      
      toast.success('Etiket başarıyla eklendi.');
    } catch (error) {
      console.error('Tag add error:', error);
      let errorMessage = 'Etiket eklenirken bir hata oluştu.';
      
      if (error.response) {
        console.error('API yanıt hatası:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveTag = async (tag) => {
    try {
      setIsSubmitting(true);
      console.log('Etiket siliniyor:', tag);
      const response = await apiService.photos.removeTag(id, tag);
      console.log('Etiket silme yanıtı:', response.data);
      
      // Etiketleri güncelle
      setTags(response.data.photo.tags || []);
      
      toast.success('Etiket başarıyla silindi.');
    } catch (error) {
      console.error('Tag remove error:', error);
      let errorMessage = 'Etiket silinirken bir hata oluştu.';
      
      if (error.response) {
        console.error('API yanıt hatası:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageClick = (e) => {
    if (!imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element
    const y = e.clientY - rect.top;  // y position within the element
    
    // Calculate percentage for responsive positioning
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    
    setSelectedArea({ x: xPercent, y: yPercent });
    
    // Açılan input'a odaklan
    setTimeout(() => {
      const tagInput = document.getElementById('tag-input');
      if (tagInput) {
        tagInput.focus();
      }
    }, 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddTag();
    }
  };

  const handleDeletePhoto = async () => {
    if (confirm('Bu fotoğrafı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      try {
        console.log('Fotoğraf siliniyor:', id);
        await apiService.photos.delete(id);
        console.log('Fotoğraf silindi');
        
        toast.success('Fotoğraf başarıyla silindi.');
        
        // Eğer rapor sayfasından gelindiyse, rapor detayına geri dön
        if (report) {
          router.push(`/reports/${report.id}`);
        } else {
          router.push('/reports');
        }
      } catch (error) {
        console.error('Photo delete error:', error);
        let errorMessage = 'Fotoğraf silinirken bir hata oluştu.';
        
        if (error.response) {
          console.error('API yanıt hatası:', error.response.data);
          errorMessage = error.response.data.message || errorMessage;
        }
        
        toast.error(errorMessage);
      }
    }
  };

  if (loading || authLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Fotoğraf Detayı</h1>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!photo) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Fotoğraf Bulunamadı</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 mb-4">İstenen fotoğraf bulunamadı veya erişim izniniz yok.</p>
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
          <h1 className="text-2xl font-bold">Fotoğraf Detayı</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          {report && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Rapor: <Link href={`/reports/${report.id}`} className="text-primary hover:underline">{report.title}</Link>
              </p>
            </div>
          )}
          
          <div className="relative mb-6">
            <p className="text-sm text-gray-500 mb-2">
              Fotoğrafa tıklayarak etiket ekleyebilirsiniz
            </p>
            <div className="relative">
              <img 
                ref={imageRef}
                src={photo.url} 
                alt={photo.note || "Rapor fotoğrafı"} 
                className="w-full rounded-lg cursor-crosshair"
                onClick={handleImageClick}
              />
              
              {/* Fotoğraf üzerindeki etiketler */}
              {tags.map((tag, index) => (
                <span 
                  key={index} 
                  className="absolute bg-primary text-white text-xs px-2 py-1 rounded transform -translate-x-1/2 -translate-y-1/2 shadow-md"
                  style={{ 
                    left: `${(index % 5) * 20 + 10}%`, 
                    top: `${Math.floor(index / 5) * 20 + 10}%` 
                  }}
                >
                  {tag}
                  <button 
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-white hover:text-gray-200"
                  >
                    ×
                  </button>
                </span>
              ))}
              
              {/* Seçilen alanda etiket ekleme */}
              {selectedArea && (
                <div 
                  className="absolute bg-white shadow-lg rounded-md p-2 z-10 transform -translate-x-1/2"
                  style={{ 
                    left: `${selectedArea.x}%`, 
                    top: `${selectedArea.y + 7}%` 
                  }}
                >
                  <div className="flex">
                    <input
                      id="tag-input"
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Etiket"
                      className="text-sm border border-gray-300 rounded-l-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      onClick={handleAddTag}
                      disabled={isSubmitting}
                      className="bg-primary text-white text-sm rounded-r-md px-2 py-1 hover:bg-primary/90"
                    >
                      Ekle
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
              Not
            </label>
            <div className="flex">
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="flex-grow input mr-2"
                placeholder="Fotoğraf hakkında not ekleyin"
              />
              <button
                onClick={handleNoteChange}
                disabled={isSubmitting}
                className="btn btn-primary h-10 self-start"
              >
                Kaydet
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Etiketler</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span 
                  key={index} 
                  className="bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded-full inline-flex items-center"
                >
                  {tag}
                  <button 
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </span>
              ))}
              
              {tags.length === 0 && (
                <p className="text-sm text-gray-500">Henüz etiket eklenmemiş</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-6 pt-6 border-t">
            <div className="text-xs text-gray-500">
              {new Date(photo.timestamp).toLocaleString('tr-TR')}
            </div>
            
            <button
              onClick={handleDeletePhoto}
              className="btn bg-red-600 hover:bg-red-700 text-white"
            >
              Fotoğrafı Sil
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
