import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import Layout from '../../../components/Layout';
import { apiService } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';

export default function EditReport() {
  const { user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reportType, setReportType] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const fetchReport = async () => {
    try {
      console.log('Rapor detayları getiriliyor:', id);
      const response = await apiService.reports.getById(id);
      console.log('Rapor detayları yanıtı:', response.data);
      
      const report = response.data;
      setTitle(report.title || '');
      setDescription(report.description || '');
      setReportType(report.type || '');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !reportType) {
      toast.error('Lütfen gerekli alanları doldurunuz.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const reportData = {
        title,
        description,
        type: reportType
      };
      
      console.log('Rapor güncelleme isteği gönderiliyor:', reportData);
      const response = await apiService.reports.update(id, reportData);
      console.log('Rapor güncelleme yanıtı:', response.data);
      
      toast.success('Rapor başarıyla güncellendi.');
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
          <h1 className="text-2xl font-bold">Rapor Düzenle</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Rapor Başlığı*
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                placeholder="Rapor için kısa bir başlık girin"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Rapor Açıklaması
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="input"
                placeholder="Rapor hakkında genel açıklama (isteğe bağlı)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rapor Türü*
              </label>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    id="type-move-in"
                    name="reportType"
                    type="radio"
                    value="move-in"
                    checked={reportType === 'move-in'}
                    onChange={() => setReportType('move-in')}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                    required
                  />
                  <label htmlFor="type-move-in" className="ml-3 block text-sm text-gray-700">
                    Taşınma Öncesi
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="type-move-out"
                    name="reportType"
                    type="radio"
                    value="move-out"
                    checked={reportType === 'move-out'}
                    onChange={() => setReportType('move-out')}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <label htmlFor="type-move-out" className="ml-3 block text-sm text-gray-700">
                    Taşınma Sonrası
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="type-general"
                    name="reportType"
                    type="radio"
                    value="general"
                    checked={reportType === 'general'}
                    onChange={() => setReportType('general')}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <label htmlFor="type-general" className="ml-3 block text-sm text-gray-700">
                    Genel Gözlem
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
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
                ) : 'Değişiklikleri Kaydet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
