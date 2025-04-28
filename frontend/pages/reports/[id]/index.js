import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-toastify';
import Layout from '../../../components/Layout';
import { apiService } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import { enhancePhotosWithUrls } from '../../../lib/helpers/photoHelper';

// Sabit API URL tanımlamaları
const API_URL = typeof window !== 'undefined' 
  ? window.location.hostname !== 'localhost' 
    ? 'https://api.depositshield.retako.com/api'
    : 'http://localhost:5050/api'
  : 'https://api.depositshield.retako.com/api';

const STATIC_URL = typeof window !== 'undefined' 
  ? window.location.hostname !== 'localhost' 
    ? 'https://api.depositshield.retako.com'
    : 'http://localhost:5050'
  : 'https://api.depositshield.retako.com';

// Doğrudan erişim URL'leri için gerekli sabitler
const DEVELOPMENT_API_URL = 'http://localhost:5050';
const PRODUCTION_API_URL = 'https://api.depositshield.retako.com';

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
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const reportRef = useRef(null);
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
      console.log('Using API URL:', API_URL);
      
      let reportData = null;
      
      try {
        // Önce normal yöntemi dene
        const response = await apiService.reports.getById(id);
        console.log('Report details response:', response.data);
        reportData = { ...response.data };
      } catch (mainError) {
        console.error('Standard API call failed:', mainError);
        
        // Alternatif yöntem: Doğrudan axios kullan
        try {
          const axios = (await import('axios')).default;
          const token = localStorage.getItem('token');
          
          const isProduction = typeof window !== 'undefined' ? window.location.hostname !== 'localhost' : false;
          const apiBaseUrl = isProduction ? 'https://api.depositshield.retako.com' : 'http://localhost:5050';
          
          const altResponse = await axios.get(`${apiBaseUrl}/api/reports/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
          
          console.log('Alternative API call successful:', altResponse.data);
          reportData = { ...altResponse.data };
        } catch (altError) {
          console.error('Alternative API call also failed:', altError);
          throw mainError; // Orijinal hatayı fırlat
        }
      }
      
      // UUID durumunu kontrol et
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
      
      let photoData = [];
      
      try {
        // Önce normal yöntemi dene
        const response = await apiService.photos.getByReport(report.id);
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
          
          const altResponse = await axios.get(`${apiBaseUrl}/api/photos/report/${report.id}`, {
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
        setPhotos(enhancedPhotos);
      } else {
        console.log('No photos to display');
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
      setPhotos([]); // Hata durumunda boş dizi ayarla
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

  const handleArchiveReport = async () => {
    if (confirm('Are you sure you want to archive this report? Archived reports will be hidden from your main reports list.')) {
      try {
        console.log('Archiving report:', id);
        // Veritabanında is_archived kolonu olmama olasılığına karşı önce normal güncelleme yapalım
        try {
          // Önce normal update ile deneyelim
          await apiService.reports.update(id, {
            title: report.title,
            description: report.description,
            type: report.type,
            // Arşiv verilerini ekleyelim
            is_archived: 1,
            archived_at: new Date().toISOString(),
            archive_reason: 'Archived by user after rejection'
          });
          console.log('Report updated as archived');
        } catch (updateError) {
          console.error('Report update failed, trying archive endpoint:', updateError);
          
          // Güncelleme başarısız olursa, archive endpointini deneyelim
          await apiService.reports.archive(id, {
            reason: 'Archived by user after rejection'
          });
          console.log('Report archived using archive endpoint');
        }
        
        toast.success('Report successfully archived.');
        router.push('/reports');
      } catch (error) {
        console.error('Report archive error:', error);
        let errorMessage = 'An error occurred while archiving the report.';
        
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

  // Helper function to get friendly report type name
  const getReportTypeName = (type) => {
    switch (type) {
      case 'move-in':
        return 'Pre-Move-In';
      case 'move-out':
        return 'Post-Move-Out';
      case 'general':
        return 'General Observation';
      default:
        return 'Unknown';
    }
  };

  // Create share link
  const getShareLink = () => {
    if (!report || !report.uuid) {
      console.error('Report missing UUID:', report);
      return '';
    }
    // Canlı ortam için domain ayarı
    const domain = process.env.NODE_ENV === 'production' 
      ? 'https://depositshield.retako.com' 
      : window.location.origin;
    return `${domain}/reports/shared/${report.uuid}`;
  };

  // Copy share link
  const copyShareLink = () => {
    const link = getShareLink();
    if (!link) {
      toast.error('Cannot create share link: Report UUID is missing.');
      return;
    }
    
    // Yaşanılan sorunlar nedeniyle alternatif bir ID tabanlı link de oluştur
    const domain = process.env.NODE_ENV === 'production' 
      ? 'https://depositshield.retako.com' 
      : window.location.origin;
    const fallbackLink = `${domain}/reports/shared/id-${report.id}`;
    const linkToShare = link || fallbackLink;
    
    navigator.clipboard.writeText(linkToShare).then(() => {
      toast.success('Share link copied!');
    }, (err) => {
      console.error('Link copy error:', err);
      toast.error('Could not copy link.');
    });
  };

  // Generate and download PDF
  const generatePDF = async () => {
    try {
      setGeneratingPdf(true);
      toast.info('Preparing PDF report...');

      // Dinamik olarak jsPDF modülünü import et
      const { jsPDF } = await import('jspdf');
      
      // Yeni bir PDF dokümanı oluştur
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      // Font boyutları ve kenar boşlukları
      const pageWidth = 210;
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      const titleFontSize = 18;
      const subtitleFontSize = 14;
      const normalFontSize = 11;
      const smallFontSize = 9;
      const lineHeight = 7;
      let yPosition = margin;
      
      // Logo (varsayılan olarak metnin içine logo yerleştirme)
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(59, 130, 246); // Indigo renginde logo metni
      pdf.text('DepositShield', margin, yPosition + 10);
      yPosition += 15;
      
      // Çizgi ekle
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;
      
      // Rapor başlığı
      pdf.setFontSize(titleFontSize);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      
      const reportTitle = `Property Report: ${report.title}`;
      pdf.text(reportTitle, margin, yPosition);
      yPosition += 12;
      
      // Rapor alt başlığı
      pdf.setFontSize(subtitleFontSize);
      pdf.setFont('helvetica', 'normal');
      let reportTypeLabel = 'General Observation';
      
      switch(report.type) {
        case 'move-in':
          reportTypeLabel = 'Pre-Move-In Report';
          break;
        case 'move-out':
          reportTypeLabel = 'Post-Move-Out Report';
          break;
      }
      
      pdf.text(reportTypeLabel, margin, yPosition);
      yPosition += lineHeight * 2;
      
      // Rapor onay durumu
      if (report.approval_status) {
        pdf.setFontSize(normalFontSize);
        pdf.setFont('helvetica', 'bold');
        
        let statusLabel = '';
        
        if (report.approval_status === 'approved') {
          pdf.setTextColor(0, 128, 0); // Yeşil
          statusLabel = 'APPROVED BY LANDLORD';
        } else if (report.approval_status === 'rejected') {
          pdf.setTextColor(220, 0, 0); // Kırmızı
          statusLabel = 'REJECTED BY LANDLORD';
        }
        
        if (statusLabel) {
          pdf.text(statusLabel, margin, yPosition);
          yPosition += lineHeight;
          
          // Ret nedeni
          if (report.approval_status === 'rejected' && report.rejection_message) {
            pdf.setFontSize(smallFontSize);
            pdf.setFont('helvetica', 'italic');
            pdf.setTextColor(128, 0, 0);
            pdf.text('Rejection Reason:', margin, yPosition);
            yPosition += lineHeight - 2;
            
            // Ret nedeni için uzun metin işlemesi
            const maxWidth = contentWidth;
            const splitText = pdf.splitTextToSize(report.rejection_message, maxWidth);
            pdf.text(splitText, margin, yPosition);
            yPosition += splitText.length * (lineHeight - 2);
          }
        }
        
        yPosition += lineHeight;
      }
      
      // Adres bilgisi
      pdf.setFontSize(normalFontSize);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(80, 80, 80);
      pdf.text('Property Address:', margin, yPosition);
      yPosition += lineHeight;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text(report.address, margin, yPosition);
      yPosition += lineHeight * 2;
      
      // Tarih bilgisi
      pdf.setFontSize(normalFontSize);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(80, 80, 80);
      pdf.text('Report Date:', margin, yPosition);
      yPosition += lineHeight;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      const formattedDate = new Date(report.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      pdf.text(formattedDate, margin, yPosition);
      yPosition += lineHeight * 1.5;
      
      // Oluşturan bilgisi
      if (report.creator_name) {
        pdf.setFontSize(normalFontSize);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(80, 80, 80);
        pdf.text('Created By:', margin, yPosition);
        yPosition += lineHeight;
        
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        pdf.text(report.creator_name, margin, yPosition);
        yPosition += lineHeight * 2;
      }
      
      // Kiracı bilgisi
      if (report.tenant_name || report.tenant_email) {
        pdf.setFontSize(normalFontSize);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(80, 80, 80);
        pdf.text('Tenant Information:', margin, yPosition);
        yPosition += lineHeight;
        
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        
        if (report.tenant_name) {
          pdf.text(`Name: ${report.tenant_name}`, margin, yPosition);
          yPosition += lineHeight;
        }
        
        if (report.tenant_email) {
          pdf.text(`Email: ${report.tenant_email}`, margin, yPosition);
          yPosition += lineHeight;
        }
        
        yPosition += lineHeight;
      }
      
      // Rapor açıklaması
      if (report.description) {
        pdf.setFontSize(normalFontSize);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(80, 80, 80);
        pdf.text('Report Description:', margin, yPosition);
        yPosition += lineHeight;
        
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        
        // Uzun açıklama için metin işleme
        const maxWidth = contentWidth;
        const splitText = pdf.splitTextToSize(report.description, maxWidth);
        pdf.text(splitText, margin, yPosition);
        yPosition += splitText.length * lineHeight;
      }
      
      // Fotoğraf bilgisi ekle
      if (photos.length > 0) {
        // Yeni sayfaya geç eğer yeterli alan kalmadıysa
        if (yPosition > 230) {
          pdf.addPage();
          yPosition = margin;
        } else {
          yPosition += lineHeight * 2;
        }
        
        pdf.setFontSize(subtitleFontSize);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(`Photos (${photos.length})`, margin, yPosition);
        yPosition += lineHeight * 1.5;
        
        pdf.setFontSize(smallFontSize);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(100, 100, 100);
        pdf.text('* Photos can be viewed in the online report at depositshield.retako.com', margin, yPosition);
      }
      
      // Alt bilgi
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Report ID: ${report.id} | Page ${i} of ${pageCount} | Generated on ${new Date().toLocaleDateString()}`, margin, 285);
      }
      
      // PDF'i indir
      pdf.save(`DepositShield_Report_${report.id}_${new Date().toISOString().slice(0,10)}.pdf`);
      toast.success('PDF report generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('There was an error generating the PDF. Please try again.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (loading || authLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-4xl animate-fadeIn">
        <h1 className="text-2xl font-bold text-indigo-700 mb-6">Report Details</h1>
        <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
        </div>
      </Layout>
    );
  }

  if (!report) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-4xl animate-fadeIn">
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
          <h1 className="text-2xl font-bold text-indigo-700">Report Not Found</h1>
        </div>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 p-6 text-center">
          <div className="py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Report Not Found</h3>
            <p className="text-gray-600 mb-6">The requested report was not found or you don't have access to it.</p>
            <Link href="/reports" className="btn btn-primary hover:bg-indigo-500 transition-all duration-300">
              Back to My Reports
            </Link>
          </div>
        </div>
      </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl animate-fadeIn">
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
          <h1 className="text-2xl font-bold text-indigo-700">Report Details</h1>
        </div>
        
        {/* Report Information */}
        <div ref={reportRef} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 mb-8">
          <div className="bg-indigo-50 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-indigo-700">{report.title}</h2>
              <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full
                ${report.type === 'move-in' ? 'bg-green-100 text-green-700' : 
                  report.type === 'move-out' ? 'bg-red-100 text-red-700' : 
                  'bg-blue-100 text-blue-700'}`}>
                {getReportTypeName(report.type)}
              </span>
            </div>
            
            <div className="flex space-x-2 w-full sm:w-auto">
              <button 
                onClick={copyShareLink}
                className="btn btn-secondary flex items-center py-1 flex-1 sm:flex-initial justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
              <button 
                onClick={generatePDF}
                disabled={generatingPdf}
                className="btn btn-primary flex items-center py-1 flex-1 sm:flex-initial justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {generatingPdf ? 'Generating...' : 'Download PDF'}
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Property Address</h3>
                  <p className="text-gray-800 mt-1">{report.address}</p>
                </div>
                
                {report.tenant_name || report.tenant_email ? (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Tenant Information</h3>
                    <div className="text-gray-800 mt-1">
                      {report.tenant_name && <p className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {report.tenant_name}
                      </p>}
                      {report.tenant_email && <p className="flex items-center gap-1 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {report.tenant_email}
                      </p>}
                      {report.approval_status && <p className="flex items-center gap-1 mt-2">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${report.approval_status === 'approved' ? 'bg-green-100 text-green-700' : report.approval_status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                          {report.approval_status === 'approved' ? 'Approved by tenant' : report.approval_status === 'rejected' ? 'Rejected by tenant' : 'Pending approval'}
                        </span>
                      </p>}
                    </div>
                  </div>
                ) : null}
                
                
                {report.description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Report Description</h3>
                    <p className="text-gray-800 mt-1">{report.description}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Report Date & Time</h3>
                  <div className="flex items-center gap-1 text-gray-800 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>
                      {new Date(report.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                      {' at '}
                      {new Date(report.created_at).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  </div>
                </div>
                
                {report.creator_name && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Created By</h3>
                    <p className="text-gray-800 mt-1">{report.creator_name}</p>
                  </div>
                )}
              </div>
            </div>
            
              <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-100 md:flex-row flex-col sm:flex-row">
                {/* Rapor paylaşılıp onaylandığında, Edit ve Delete butonları gösterilmeyecek */}
                {report.approval_status === 'approved' ? (
                  <div className="flex items-center text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    This report has been approved and cannot be modified
                  </div>
                ) : report.approval_status === 'rejected' ? (
                  /* Rapor reddedildiğinde, Edit ve Archive butonları gösterilecek */
                  <>
                    <Link href={`/reports/edit?id=${report.id}`} className="btn btn-secondary hover:bg-gray-100 transition-all duration-300 flex items-center w-full sm:w-auto justify-center sm:justify-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit Report
                    </Link>
                    <button onClick={handleDeleteReport} className="btn bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all duration-300 flex items-center w-full sm:w-auto justify-center sm:justify-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Report
                    </button>
                  </>
                ) : (
                  /* Diğer durumlarda normal Edit ve Delete butonları */
                  <>
                    <Link href={`/reports/edit?id=${report.id}`} className="btn btn-secondary hover:bg-gray-100 transition-all duration-300 flex items-center w-full sm:w-auto justify-center sm:justify-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit Report
                    </Link>
                    <button onClick={handleDeleteReport} className="btn bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all duration-300 flex items-center w-full sm:w-auto justify-center sm:justify-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Report
                    </button>
                  </>
                )}
                
                {report.approval_status && (
                  <div className="flex flex-col md:items-end ml-auto w-full md:w-auto mt-4 md:mt-0">
                    <div className="space-y-2 max-w-full">
                      <div className={`flex items-center px-3 py-1.5 rounded-md text-sm ${report.approval_status === 'approved' ? 'bg-green-50 text-green-700' : report.approval_status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-600'}`}>
                        {report.approval_status === 'approved' ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Approved by landlord</span>
                          </>
                        ) : report.approval_status === 'rejected' ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span>Rejected by landlord</span>
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Pending landlord approval</span>
                          </>
                        )}
                      </div>
                      {report.approval_status === 'rejected' && report.rejection_message && (
                        <div className="px-3 py-2 bg-red-50 text-red-700 text-sm rounded-md border border-red-200 break-words">
                          <p className="font-medium mb-1">Rejection Reason:</p>
                          <p className="text-red-600 whitespace-normal">{report.rejection_message}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
          </div>
        </div>
        
        {/* Photos */}
        <div className="mt-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-indigo-700">Photos</h2>
          </div>
          
          {photoLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : photos.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 p-6 text-center">
              <div className="py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No Photos Yet</h3>
                <p className="text-gray-600 mb-6">Add photos to document the condition of your property</p>
                <Link href={`/reports/${report.id}/photos/add`} className="btn btn-primary hover:bg-indigo-500 transition-all duration-300">
                  Add First Photo
                </Link>
              </div>
            </div>
          ) : (
            <div>
              {/* Fotoğrafları odalarına göre gruplandır */}
              {(() => {
                // Fotoğrafları tag'lerine göre gruplandır
                const photosByRoom = {};
                const untaggedPhotos = [];
                
                // İlk olarak fotoğrafları etiketlerine göre ayır
                photos.forEach(photo => {
                  // Eğer photo.tags varsa ve en az bir tag içeriyorsa
                  if (photo.tags && photo.tags.length > 0) {
                    // Oda etiketini bulalım (Bedroom, Bathroom, Living Room, Kitchen)
                    const roomTag = photo.tags.find(tag => 
                      tag.includes('Bedroom') || 
                      tag.includes('Bathroom') || 
                      tag.includes('Living Room') ||  
                      tag.includes('Kitchen') ||
                      tag.includes('Balcony') ||
                      tag.includes('Garage') ||
                      tag.includes('Garden') ||
                      tag.includes('Patio') ||
                      tag.includes('Basement') ||
                      tag.includes('Attic') ||
                      tag.includes('Terrace') ||
                      tag.includes('Pool')
                    );
                    
                    if (roomTag) {
                      // Bu oda için dizi yoksa oluştur
                      if (!photosByRoom[roomTag]) {
                        photosByRoom[roomTag] = [];
                      }
                      // Fotoğrafı oda grubuna ekle
                      photosByRoom[roomTag].push(photo);
                    } else {
                      // Oda etiketi yoksa etiketlenmemiş olarak ekle
                      untaggedPhotos.push(photo);
                    }
                  } else {
                    // Hiç etiket yoksa etiketlenmemiş olarak ekle
                    untaggedPhotos.push(photo);
                  }
                });
                
                // Gruplandırılmış fotoğrafları göster
                return (
                  <div className="space-y-8">
                    {/* Önce her bir oda grubunu göster */}
                    {Object.entries(photosByRoom).map(([roomName, roomPhotos], index) => (
                      <div key={index} className="space-y-3">
                        <h3 className="text-lg font-medium flex items-center">
                          <span className="w-2 h-6 bg-green-500 rounded-full mr-2"></span>
                          {roomName} ({roomPhotos.length} photo{roomPhotos.length !== 1 ? 's' : ''})
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                          {roomPhotos.map((photo) => {
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
                              <div key={photo.id} className="group bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-200">
                                <div className="relative">
                                  <Link href={`/photos/${photo.id}`}>
                                    <div className="aspect-square overflow-hidden" 
                                         style={{
                                           display: 'flex',
                                           justifyContent: 'center',
                                           alignItems: 'center',
                                           backgroundColor: '#f9f9f9'
                                         }}>
                                      {/* Yükleme durumu için state */}
                                      <div
                                        className="absolute inset-0 flex items-center justify-center bg-gray-50 z-0"
                                      >
                                        <div className="animate-pulse rounded-full h-10 w-10 border-2 border-indigo-500"></div>
                                      </div>
                                      
                                      <img 
                                        src={imgSrc} 
                                        alt={photo.note || 'Report photo'}
                                        crossOrigin="anonymous"
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
                                        onLoad={(e) => {
                                          // Yükleme başarılı olduğunda yükleme animasyonunu gizle
                                          const loadingEl = e.target.previousSibling;
                                          if (loadingEl) loadingEl.style.display = 'none';
                                        }}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 z-10 relative"
                                      />
                                    </div>
                                  </Link>
                                  <button
                                    onClick={() => handleDeletePhoto(photo.id)}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label="Delete photo"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                                
                                {(photo.note || (photo.tags && photo.tags.length > 0)) && (
                                  <div className="p-2 bg-gray-50 text-xs">
                                    {photo.note && (
                                      <p className="text-gray-700 truncate" title={photo.note}>{photo.note}</p>
                                    )}
                                    
                                    {photo.tags && photo.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1 max-w-full overflow-hidden">
                                        {photo.tags.filter(tag => tag !== roomName).slice(0, 2).map((tag, index) => (
                                          <span key={index} className="inline-flex items-center text-xs bg-indigo-50 text-indigo-700 rounded px-1.5 py-0.5 truncate max-w-[80px]" title={tag}>
                                            {tag}
                                          </span>
                                        ))}
                                        {photo.tags.filter(tag => tag !== roomName).length > 2 && (
                                          <span className="text-xs text-gray-500">+{photo.tags.filter(tag => tag !== roomName).length - 2}</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    
                    {/* Sonra etiketlenmemiş fotoğrafları göster (eğer varsa) */}
                    {untaggedPhotos.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-lg font-medium flex items-center">
                          <span className="w-2 h-6 bg-gray-400 rounded-full mr-2"></span>
                          Other Photos ({untaggedPhotos.length} photo{untaggedPhotos.length !== 1 ? 's' : ''})
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                          {untaggedPhotos.map((photo) => {
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
                              <div key={photo.id} className="group bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-200">
                                <div className="relative">
                                  <Link href={`/photos/${photo.id}`}>
                                    <div className="aspect-square overflow-hidden" 
                                         style={{
                                           display: 'flex',
                                           justifyContent: 'center',
                                           alignItems: 'center',
                                           backgroundColor: '#f9f9f9'
                                         }}>
                                      {/* Yükleme durumu için state */}
                                      <div
                                        className="absolute inset-0 flex items-center justify-center bg-gray-50 z-0"
                                      >
                                        <div className="animate-pulse rounded-full h-10 w-10 border-2 border-indigo-500"></div>
                                      </div>
                                      
                                      <img 
                                        src={imgSrc} 
                                        alt={photo.note || 'Report photo'}
                                        crossOrigin="anonymous"
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
                                        onLoad={(e) => {
                                          // Yükleme başarılı olduğunda yükleme animasyonunu gizle
                                          const loadingEl = e.target.previousSibling;
                                          if (loadingEl) loadingEl.style.display = 'none';
                                        }}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 z-10 relative"
                                      />
                                    </div>
                                  </Link>
                                  <button
                                    onClick={() => handleDeletePhoto(photo.id)}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label="Delete photo"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                                
                                {(photo.note || (photo.tags && photo.tags.length > 0)) && (
                                  <div className="p-2 bg-gray-50 text-xs">
                                    {photo.note && (
                                      <p className="text-gray-700 truncate" title={photo.note}>{photo.note}</p>
                                    )}
                                    
                                    {photo.tags && photo.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1 max-w-full overflow-hidden">
                                        {photo.tags.slice(0, 2).map((tag, index) => (
                                          <span key={index} className="inline-flex items-center text-xs bg-indigo-50 text-indigo-700 rounded px-1.5 py-0.5 truncate max-w-[80px]" title={tag}>
                                            {tag}
                                          </span>
                                        ))}
                                        {photo.tags.length > 2 && (
                                          <span className="text-xs text-gray-500">+{photo.tags.length - 2}</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
