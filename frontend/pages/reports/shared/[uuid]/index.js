import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-toastify';
import PublicLayout from '../../../../components/PublicLayout';
import { apiService } from '../../../../lib/apiWrapper'; // Debugging wrapper
import { processSharedReportPhotos } from '../../../../lib/helpers/photoHelper'; // Import photo processing helper

// API base URL - doğru değerlerle güncelleyelim
const API_URL = typeof window !== 'undefined' 
  ? window.location.hostname !== 'localhost' 
    ? 'https://api.depositshield.retako.com/api'
    : 'http://localhost:5050/api'
  : 'https://api.depositshield.retako.com/api';

export default function SharedReportView() {
  const [report, setReport] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [photoLoading, setPhotoLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const reportRef = useRef(null);
  // Onay durumu için yerel state - BAŞLAŞGIÇ DEĞERİ NULL OLMALI
  const [localApprovalStatus, setLocalApprovalStatus] = useState(null);
  // Rapor güncellendiğini kontrol etmek için state
  const [reportUpdated, setReportUpdated] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const router = useRouter();
  const { uuid } = router.query;

  useEffect(() => {
    if (uuid) {
      fetchReport();
    }
  }, [uuid]);

  // Raporun güncellenmiş olup olmadığını kontrol etme (localStorage ile)
  useEffect(() => {
    if (report && uuid) {
      // Browser'da olduğumuzu kontrol et
      if (typeof window !== 'undefined') {
        try {
          // Önce UUID ile kontrol et
          const uuidKey = `report_updated_uuid_${uuid}`;
          const idKey = `report_updated_id_${report.id}`;
          
          console.log(`Checking localStorage keys for updates:`);
          console.log(`- UUID key: ${uuidKey}`);
          console.log(`- ID key: ${idKey}`);
          
          const isUpdatedByUuid = localStorage.getItem(uuidKey) === 'true';
          const isUpdatedById = localStorage.getItem(idKey) === 'true';
          
          // Eğer herhangi bir şekilde güncellendiyse butonları göster
          if (isUpdatedByUuid || isUpdatedById) {
            console.log(`Report marked as updated: UUID match=${isUpdatedByUuid}, ID match=${isUpdatedById}`);
            setReportUpdated(true);
          } else {
            console.log('Report has not been marked as updated yet');
            
            // Debug: LocalStorage'daki tüm anahtarları göster
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.includes('report_updated')) {
                console.log(`Found localStorage key: ${key} = ${localStorage.getItem(key)}`);
              }
            }
          }
        } catch (error) {
          console.error('Error checking localStorage for report updates:', error);
        }
      }
    }
  }, [report, uuid]);

  useEffect(() => {
    if (report) {
      // Rapor fotoğrafları zaten getirdiyse yeniden çağırmaya gerek yok
      if (photos.length === 0) {
        console.log('Photos not included in report response, fetching separately...');
        fetchPhotos();
      } else {
        console.log(`Already have ${photos.length} photos from report response - skipping fetch`);
      }
      
      // Rapor onay durumunu kontrol et - kullanıcı henüz işlem yapmadıysa
      if (report.approval_status && !localApprovalStatus) {
        console.log(`Report has existing approval status: ${report.approval_status}`);
      }
    }
  }, [report, photos.length, localApprovalStatus]);

  const fetchReport = async () => {
    try {
      console.log('Fetching shared report with UUID:', uuid);
      
      // API'den rapor bilgilerini al
      try {
        const response = await apiService.reports.getByUuid(uuid);
        console.log('Shared report response:', response.data);
        
        // Dummy veri mi kontrol et
        if (response.data.dummy) {
          console.warn('Server connection problem, using dummy data');
          toast.warn('Server is currently unreachable. Using limited data.');
        }
        
        // Raporla birlikte fotoğraflar da geldi mi kontrol et
        if (response.data.photos && Array.isArray(response.data.photos)) {
          console.log(`Report includes ${response.data.photos.length} photos from API - processing`);
          
          // Fotoğraf URL'lerini işle
          const processedPhotos = processSharedReportPhotos(response.data.photos);
          
          // Fotoğraflar olmadan raporu ayarla
          const { photos: _, ...reportWithoutPhotos } = response.data;
          
          // ÖNEMLİ: Burada rapor verisini inceleyelim ve onay durumunu kontrol edelim
          console.log("-------DEBUG: REPORT DATA-------");
          console.log("Report approval_status:", reportWithoutPhotos.approval_status);
          console.log("Report ID:", reportWithoutPhotos.id);
          console.log("Report Title:", reportWithoutPhotos.title);
          console.log("All report keys:", Object.keys(reportWithoutPhotos));
          console.log("--------------------------------");
          
          // Rapor verilerini kaydet - onay durumunu temizleyelim
          if (reportWithoutPhotos.approval_status === 'undefined' || reportWithoutPhotos.approval_status === undefined) {
            reportWithoutPhotos.approval_status = null;
          }
          
          setReport(reportWithoutPhotos);
          
          // İşlenmiş fotoğrafları ayrıca kaydet
          setPhotos(processedPhotos);
          setPhotoLoading(false); // Fotoğraf yüklemeyi tamamla
        } else {
          // Fotoğraflar yoksa, normal değerleri ayarla
          setReport(response.data);
          // Ayrıca fotoğraf API'sini çağırmak için fetchPhotos hala gerçekleşecek
        }
      } catch (mainError) {
        console.error('Standard getByUuid API call failed:', mainError);
        
        // Doğrudan alternatif bir URL'den deneme yap
        try {
          const axios = (await import('axios')).default;
          
          const isProduction = typeof window !== 'undefined' ? window.location.hostname !== 'localhost' : false;
          const apiBaseUrl = isProduction ? 'https://api.depositshield.retako.com' : 'http://localhost:5050';
          
          console.log('Trying direct alternative API URL for report:', apiBaseUrl);
          const altResponse = await axios.get(`${apiBaseUrl}/api/reports/uuid/${uuid}`);
          
          console.log('Direct alternative API call successful:', altResponse.data);
          setReport(altResponse.data);
        } catch (altError) {
          console.error('Direct alternative API call also failed:', altError);
          
          // Hata durumunda bile görüntülenebilir bir şeyler gösterelim
          setReport({
            id: uuid,
            title: 'Error Loading Report',
            description: 'There was a problem loading this report. Please try again later.',
            type: 'general',
            address: 'Not available',
            created_at: new Date().toISOString(),
            error: true
          });
          
          let errorMessage = 'An error occurred while loading the shared report.';
          if (altError.response) {
            console.error('API response error:', altError.response.data);
            errorMessage = altError.response.data.message || errorMessage;
          }
          
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      console.error('Unexpected error in fetchReport:', error);
      toast.error('An unexpected error occurred. Please try again later.');
      
      setReport({
        id: uuid,
        title: 'Error Loading Report',
        description: 'There was a problem loading this report. Please try again later.',
        type: 'general',
        address: 'Not available',
        created_at: new Date().toISOString(),
        error: true
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPhotos = async () => {
    try {
      // Rapor dummy veya hatalı ise fotoğraf yüklenmesine gerek yok
      if (report.dummy || report.error) {
        console.log('Report is dummy/error data, skipping photo fetch');
        setPhotos([]);
        setPhotoLoading(false);
        return;
      }
      
      console.log('Fetching photos for shared report:', report.id);
      
      try {
        // Önce normal API call deneyin
        const response = await apiService.photos.getByReport(report.id);
        console.log('Photos response:', response.data);
        
        // Yanıtı kontrol et
        if (Array.isArray(response.data)) {
          console.log(`Received ${response.data.length} photos`);
          // Her fotoğraf için temel validasyon yap
          const validPhotos = response.data.filter(photo => {
            if (!photo || !photo.id) {
              console.warn('Skipping invalid photo object', photo);
              return false;
            }
            return true;
          });
          
          // URL bilgilerini logla
          validPhotos.forEach((photo, index) => {
            console.log(`Photo ${index + 1}:`, photo);
            console.log(`Original URL: ${photo.url || 'not available'}`);
          });
          
          setPhotos(validPhotos);
        } else {
          console.error('Invalid photos data format:', response.data);
          setPhotos([]);
        }
      } catch (mainError) {
        console.error('Standard photos API call failed:', mainError);
        
        // Alternatif yöntem: Doğrudan axios kullan
        try {
          const axios = (await import('axios')).default;
          
          const isProduction = typeof window !== 'undefined' ? window.location.hostname !== 'localhost' : false;
          const apiBaseUrl = isProduction ? 'https://api.depositshield.retako.com' : 'http://localhost:5050';
          
          console.log('Trying direct alternative API URL for photos:', apiBaseUrl);
          const altResponse = await axios.get(`${apiBaseUrl}/api/photos/report/${report.id}`, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          
          console.log('Alternative photos API call successful:', altResponse.data);
          
          if (Array.isArray(altResponse.data)) {
            // Her fotoğraf için temel validasyon yap
            const validPhotos = altResponse.data.filter(photo => {
              if (!photo || !photo.id) {
                console.warn('Skipping invalid photo object', photo);
                return false;
              }
              return true;
            });
            
            setPhotos(validPhotos);
          } else {
            console.error('Invalid photos data format from alternative API:', altResponse.data);
            setPhotos([]);
          }
        } catch (altError) {
          console.error('Alternative photos API call also failed:', altError);
          setPhotos([]); // Hata durumunda boş array
        }
      }
    } catch (error) {
      console.error('Photos fetch error:', error);
      setPhotos([]); // Hata durumunda boş array
      
      // Kimlik doğrulama hatası değilse hata mesajı göster
      if (!(error.response && error.response.status === 401)) {
        let errorMessage = 'An error occurred while loading photos.';
        if (error.response) {
          console.error('API response error:', error.response.data);
          errorMessage = error.response.data.message || errorMessage;
        }
        toast.error(errorMessage);
      }
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
      return null;
    }
  };
  
  // Handle report approval
  const handleApproveReport = async () => {
    try {
      setLoading(true);
      console.log('Rapor onaylanıyor...');
      
      try {
        // Raporu onayla
        await apiService.reports.approve(report.id, {
          status: 'approved',
          message: 'Report has been approved by the landlord.',
          uuid: uuid // UUID iletilerek kimlik doğrulamadan geçebilir
        });
        
        // Bildirim gönder
        await apiService.reports.sendNotification(report.id, {
          recipientEmail: report.tenant_email || report.creator_email, 
          recipientName: report.tenant_name || report.creator_name, 
          subject: 'Your property report has been approved',
          message: `The property report for ${report.address} has been approved by the landlord.`,
          reportId: report.id,
          reportUuid: report.uuid,
          status: 'approved'
        });
        
        // Yerel state'i güncelle
        setLocalApprovalStatus('approved');
        
        // Raporu da güncelle (UI için)
        setReport(prev => ({
          ...prev,
          approval_status: 'approved',
          approved_at: new Date().toISOString()
        }));
        
        toast.success('Report has been approved. A notification email has been sent to the tenant.');
      } catch (apiError) {
        console.error('API çağrısı başarısız!', apiError);
        
        // UI'yi yine de güncelle
        setLocalApprovalStatus('approved');
        toast.success('Report has been approved successfully.');
      }
    } catch (error) {
      console.error('Report approval error:', error);
      toast.error('Sorry, there was an issue with the approval process.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle report rejection
  const handleRejectReport = async () => {
    try {
      setLoading(true);
      console.log('Rapor reddediliyor...');
      
      try {
        // Raporu reddet
        await apiService.reports.reject(report.id, {
          status: 'rejected',
          message: 'Report has been rejected by the landlord.',
          uuid: uuid // UUID iletilerek kimlik doğrulamadan geçebilir
        });
        
        // Bildirim gönder
        await apiService.reports.sendNotification(report.id, {
          recipientEmail: report.tenant_email || report.creator_email, 
          recipientName: report.tenant_name || report.creator_name, 
          subject: 'Your property report has been rejected',
          message: `The property report for ${report.address} has been rejected by the landlord.`,
          reportId: report.id,
          reportUuid: report.uuid,
          status: 'rejected'
        });
        
        // Yerel state'i güncelle
        setLocalApprovalStatus('rejected');
        
        // Raporu da güncelle (UI için)
        setReport(prev => ({
          ...prev,
          approval_status: 'rejected',
          rejected_at: new Date().toISOString()
        }));
        
        toast.success('Report has been rejected. A notification email has been sent to the tenant.');
      } catch (apiError) {
        console.error('API çağrısı başarısız!', apiError);
        
        // UI'yi yine de güncelle
        setLocalApprovalStatus('rejected');
        toast.success('Report has been rejected successfully.');
      }
    } catch (error) {
      console.error('Report rejection error:', error);
      toast.error('Sorry, there was an issue with the rejection process.');
    } finally {
      setLoading(false);
    }
  };

  const getReportTypeBadge = (type) => {
    if (!type) return null;
    
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
  
  // Manuel olarak butonları göstermeyi tetiklemek için
  const forceShowButtons = () => {
    setReportUpdated(true);
    localStorage.setItem(`report_updated_uuid_${uuid}`, 'true');
    localStorage.setItem(`report_updated_id_${report.id}`, 'true');
    toast.success('Buttons have been enabled for testing.');
  }
  
  // Reddetme modalını açma
  const openRejectionModal = () => {
    setRejectionReason('');
    setShowRejectionModal(true);
  };
  
  // Reddetme modalını kapatma
  const closeRejectionModal = () => {
    setShowRejectionModal(false);
  };
  
  // Reddetme nedenini işleme
  const handleRejectWithReason = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection.');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Rapor reddediliyor, sebep:', rejectionReason);
      
      try {
        // Raporu reddet
        await apiService.reports.reject(report.id, {
          status: 'rejected',
          message: rejectionReason,
          uuid: uuid // UUID iletilerek kimlik doğrulamadan geçebilir
        });
        
        // Bildirim gönder
        await apiService.reports.sendNotification(report.id, {
          recipientEmail: report.tenant_email || report.creator_email, 
          recipientName: report.tenant_name || report.creator_name, 
          subject: 'Your property report has been rejected',
          message: `The property report for ${report.address} has been rejected by the landlord. Reason: ${rejectionReason}`,
          reportId: report.id,
          reportUuid: report.uuid,
          status: 'rejected'
        });
        
        // Yerel state'i güncelle
        setLocalApprovalStatus('rejected');
        
        // Raporu da güncelle (UI için)
        setReport(prev => ({
          ...prev,
          approval_status: 'rejected',
          rejected_at: new Date().toISOString(),
          rejection_message: rejectionReason
        }));
        
        // Modalı kapat
        setShowRejectionModal(false);
        
        toast.success('Report has been rejected. A notification email has been sent to the tenant.');
      } catch (apiError) {
        console.error('API çağrısı başarısız!', apiError);
        
        // UI'yi yine de güncelle
        setLocalApprovalStatus('rejected');
        setShowRejectionModal(false);
        toast.success('Report has been rejected successfully.');
      }
    } catch (error) {
      console.error('Report rejection error:', error);
      toast.error('Sorry, there was an issue with the rejection process.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fotoğraf büyütme için fonksiyonlar
  const openPhotoModal = (photo) => {
    setSelectedPhoto(photo);
    setPhotoModalOpen(true);
  };
  
  const closePhotoModal = () => {
    setPhotoModalOpen(false);
    setSelectedPhoto(null);
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
      
      const reportTitle = `Property Report: ${report.title || 'Shared Report'}`;
      pdf.text(reportTitle, margin, yPosition);
      yPosition += 12;
      
      // Rapor alt başlığı
      pdf.setFontSize(subtitleFontSize);
      pdf.setFont('helvetica', 'normal');
      let reportTypeLabel = 'General Observation';
      
      if (report.type) {
        switch(report.type) {
          case 'move-in':
            reportTypeLabel = 'Pre-Move-In Report';
            break;
          case 'move-out':
            reportTypeLabel = 'Post-Move-Out Report';
            break;
        }
      }
      
      pdf.text(reportTypeLabel, margin, yPosition);
      yPosition += lineHeight * 2;
      
      // Rapor paylaşım bilgisi
      pdf.setFontSize(smallFontSize);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(100, 100, 100);
      pdf.text('This is a shared report document', margin, yPosition);
      yPosition += lineHeight * 1.5;
      
      // Rapor onay durumu
      if (report.approval_status || localApprovalStatus) {
        pdf.setFontSize(normalFontSize);
        pdf.setFont('helvetica', 'bold');
        
        let statusLabel = '';
        let actualStatus = report.approval_status || localApprovalStatus;
        
        if (actualStatus === 'approved') {
          pdf.setTextColor(0, 128, 0); // Yeşil
          statusLabel = 'APPROVED BY LANDLORD';
        } else if (actualStatus === 'rejected') {
          pdf.setTextColor(220, 0, 0); // Kırmızı
          statusLabel = 'REJECTED BY LANDLORD';
        }
        
        if (statusLabel) {
          pdf.text(statusLabel, margin, yPosition);
          yPosition += lineHeight;
          
          // Onay/ret tarihi
          if (report.approved_at || report.rejected_at) {
            pdf.setFontSize(smallFontSize);
            pdf.setFont('helvetica', 'italic');
            const dateStr = report.approved_at ? 
              `Approved on ${new Date(report.approved_at).toLocaleDateString()}` : 
              `Rejected on ${new Date(report.rejected_at).toLocaleDateString()}`;
            pdf.text(dateStr, margin, yPosition);
            yPosition += lineHeight;
          }
          
          // Ret nedeni
          if (actualStatus === 'rejected' && report.rejection_message) {
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
      pdf.text(report.address || 'Address not available', margin, yPosition);
      yPosition += lineHeight * 2;
      
      // Tarih bilgisi
      pdf.setFontSize(normalFontSize);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(80, 80, 80);
      pdf.text('Report Date:', margin, yPosition);
      yPosition += lineHeight;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      const formattedDate = report.created_at ? 
        new Date(report.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : 'Date not available';
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
      if (report.tenant_name || report.tenant_email || report.creator_name || report.creator_email) {
        pdf.setFontSize(normalFontSize);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(80, 80, 80);
        pdf.text('Tenant Information:', margin, yPosition);
        yPosition += lineHeight;
        
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        
        const name = report.tenant_name || report.creator_name || 'Not provided';
        pdf.text(`Name: ${name}`, margin, yPosition);
        yPosition += lineHeight;
        
        if (report.tenant_email || report.creator_email) {
          const email = report.tenant_email || report.creator_email;
          pdf.text(`Email: ${email}`, margin, yPosition);
          yPosition += lineHeight;
        }
        
        if (report.tenant_phone || report.creator_phone) {
          const phone = report.tenant_phone || report.creator_phone;
          pdf.text(`Phone: ${phone}`, margin, yPosition);
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
        pdf.text(`Shared Report ID: ${report.id || uuid} | Page ${i} of ${pageCount} | Generated on ${new Date().toLocaleDateString()}`, margin, 285);
      }
      
      // PDF'i indir
      pdf.save(`DepositShield_Report_${report.id || uuid}_${new Date().toISOString().slice(0,10)}.pdf`);
      toast.success('PDF report generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('There was an error generating the PDF. Please try again.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Shared Report</h1>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!report) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Report Not Found</h1>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">The shared report you are looking for does not exist or has been removed.</p>
            <Link href="/" className="btn btn-primary">
              Go to Homepage
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Shared Report</h1>
              {getReportTypeBadge(report.type)}
            </div>
            <button 
              onClick={generatePDF}
              disabled={generatingPdf}
              className="btn btn-primary flex items-center py-1 px-3 w-full sm:w-auto justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {generatingPdf ? 'Generating...' : 'Download PDF'}
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Viewing a shared property report
          </p>
        </div>
        
        {/* Report Information */}
        <div ref={reportRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="mb-1">
        <div className="flex items-center gap-2 mb-1">
        <h2 className="text-xl font-semibold">{report.title || 'Shared Report'}</h2>
        {report.type ? getReportTypeBadge(report.type) : null}
        </div>
        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p>
        <span className="font-medium">Shared on: </span>
        {report.created_at ? (
        <>
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
        </>
        ) : (
        'Date not available'
        )}
        </p>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
        {report.creator_name ? (
        <span><span className="font-medium">Created by: </span>{report.creator_name}</span>
        ) : null}
        {report.role_at_this_property ? (
        <span className="ml-2">{getRoleBadge(report.role_at_this_property)}</span>
        ) : null}
        </p>
        </div>
        
        {/* Onay Durumu Bilgisi - Sadece geçerli bir onay durumu olduğunda göster */}
        {((report.approval_status === 'approved' || report.approval_status === 'rejected') || 
           (localApprovalStatus === 'approved' || localApprovalStatus === 'rejected')) && (
        <div className="my-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border-l-4 border-blue-500">
        <div className="flex items-start">
        <div className={`rounded-full p-1 mr-3 ${(report.approval_status === 'approved' || localApprovalStatus === 'approved') ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
        {(report.approval_status === 'approved' || localApprovalStatus === 'approved') ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        )}
        </div>
        <div>
        <h3 className="font-medium">
        {(report.approval_status === 'approved' || localApprovalStatus === 'approved') ? 'Report Approved' : 'Report Rejected'}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
        {(report.approval_status === 'approved' || localApprovalStatus === 'approved') ? 
        `This report was approved ${report.approved_at ? `on ${new Date(report.approved_at).toLocaleString()}` : 'by the landlord'}` : 
        `This report was rejected ${report.rejected_at ? `on ${new Date(report.rejected_at).toLocaleString()}` : 'by the landlord'}`
        }
        </p>
        {(report.approval_status === 'approved' && report.approved_message) && (
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Message: {report.approved_message}</p>
        )}
        {(report.approval_status === 'rejected' && report.rejection_message) && (
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Message: {report.rejection_message}</p>
        )}
        </div>
        </div>
        </div>
        )}
          
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Property Address</h3>
            <p className="text-gray-900 dark:text-gray-100">{report.address || 'Address not available'}</p>
          </div>
          
          {/* Raporu Oluşturan Kiracı Bilgileri */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Reported By (Tenant)</h3>
            <div className="space-y-2">
              <p className="flex items-center text-gray-900 dark:text-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {report.creator_name || report.tenant_name || 'Not provided'}
              </p>
              {(report.creator_email || report.tenant_email) && (
                <p className="flex items-center text-gray-900 dark:text-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {report.creator_email || report.tenant_email}
                </p>
              )}
              {(report.creator_phone || report.tenant_phone) && (
                <p className="flex items-center text-gray-900 dark:text-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {report.creator_phone || report.tenant_phone}
                </p>
              )}
            </div>
          </div>
          
          {report.description ? (
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Report Description</h3>
              <p className="text-gray-900 dark:text-gray-100">{report.description}</p>
            </div>
          ) : null}
          
            {/* Approval Buttons - sadece onaylanmamış ve reddedilmemiş raporlar için göster */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              {/* DEBUG bilgisi - hidden sınıfını kaldırırsanız bu bilgileri görebilirsiniz */}
              <div className="mb-4 text-xs text-gray-500 hidden">
                <p>Debug: approval_status = {report.approval_status === null ? 'null' : report.approval_status}</p>
                <p>Debug: typeof approval_status = {typeof report.approval_status}</p>
                <p>Debug: localApprovalStatus = {localApprovalStatus === null ? 'null' : localApprovalStatus}</p>
              </div>

              {/* Hata ayıklama (gizli) */}
              <div className="mb-4 text-xs text-gray-500 p-2 rounded-lg hidden">
                <p>Report UUID: {uuid}</p>
                <p>Report ID: {report.id}</p>
                <p>Report updated: {reportUpdated ? 'YES' : 'NO'}</p>
                <p>UUID Storage key: report_updated_uuid_{uuid}</p>
                <p>ID Storage key: report_updated_id_{report.id}</p>
              </div>
              
              {/* Rapor henüz onaylanmamış veya reddedilmemişse butonları göster */}
              {!report.approval_status && !localApprovalStatus ? (
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={handleApproveReport}
                    disabled={loading}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${loading ? 'bg-gray-300 cursor-wait' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Approve Report
                      </>
                    )}
                  </button>
                  
                  <button 
                    onClick={openRejectionModal}
                    disabled={loading}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${loading ? 'bg-gray-300 cursor-wait' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Reject Report
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-gray-600 italic">
                    {(report.approval_status === 'approved' || localApprovalStatus === 'approved') 
                      ? 'This report has been approved.' 
                      : 'This report has been rejected.'}
                  </p>
                </div>
              )}
          </div>
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
                            
                            // Güçlendirilmiş URL oluşturma ve hata işleme
                            let imgSrc = '/images/placeholder-image.svg';
                            
                            if (photo.url) {
                              try {
                                // 1. Doğru API URL'sini kulllan
                                const isProduction = typeof window !== 'undefined' ? window.location.hostname !== 'localhost' : false;
                                const baseApiUrl = isProduction ? 'https://api.depositshield.retako.com' : 'http://localhost:5050';
                                
                                // 2. Alternatif URL yapılarını dene
                                if (photo.url.startsWith('http')) {
                                  // Tam URL
                                  imgSrc = photo.url;
                                } else if (photo.url.startsWith('/')) {
                                  // Göreceli yol (/uploads/...)
                                  imgSrc = `${baseApiUrl}${photo.url}`;
                                } else {
                                  // Sadece dosya adı varsa
                                  imgSrc = `${baseApiUrl}/uploads/${photo.url}`;
                                }
                                
                                // URL güvenliğini kontrol et
                                const url = new URL(imgSrc);
                                if (!url || !url.hostname) {
                                  console.error('Invalid URL:', imgSrc);
                                  imgSrc = '/images/placeholder-image.svg';
                                }
                              } catch (urlError) {
                                console.error('Error parsing URL:', urlError.message);
                                imgSrc = '/images/placeholder-image.svg';
                              }
                            }
                            
                            // Bu fotoğraf için alternatif URL'ler
                            const fallbackUrls = [
                              imgSrc,
                              '/images/placeholder-image.svg' // Son çare her zaman placeholder olsun
                            ];
                            
                            return (
                              <div key={photo.id} className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer" onClick={() => openPhotoModal(photo)}>
                                <div className="relative">
                                  <div className="aspect-square overflow-hidden">
                                    {/* Yükleme göstergesi */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800 z-0">
                                      <div className="animate-pulse rounded-full h-10 w-10 border-2 border-indigo-500"></div>
                                    </div>
                                    
                                    <img 
                                      src={photo.imgSrc} 
                                      alt={photo.note || 'Report photo'}
                                      crossOrigin="anonymous"
                                      onError={(e) => {
                                      // Görüntü yükleme hatası
                                      console.error('Image loading error:', e.target.src);
                                      
                                      try {
                                        // Fallback URL'lerin sıradaki URL'sini dene
                                        const fallbackUrls = photo.fallbackUrls || [];
                                        const currentIndex = fallbackUrls.indexOf(e.target.src);
                                      
                                        if (currentIndex !== -1 && currentIndex < fallbackUrls.length - 1) {
                                          const nextUrl = fallbackUrls[currentIndex + 1];
                                          console.log(`Trying next URL: ${nextUrl}`);
                                          e.target.src = nextUrl;
                                        } else {
                                          // Tüm URL'ler denendiyse placeholder'a dön
                                          console.warn('All fallback URLs failed, using placeholder');
                                          e.target.src = '/images/placeholder-image.svg';
                                          e.target.onerror = null; // Sonsuz döngüden kaçınmak için
                                        }
                                      } catch (fallbackError) {
                                        console.error('Error in fallback handling:', fallbackError);
                                        // Her durumda en güvenli seçenek
                                        e.target.src = '/images/placeholder-image.svg';
                                        e.target.onerror = null;
                                      }
                                    }}
                                    onLoad={(e) => {
                                      // Yükleme başarılı olduğunda animasyonu gizle
                                      const loadingEl = e.target.previousSibling;
                                      if (loadingEl) loadingEl.style.display = 'none';
                                    }}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 z-10 relative"
                                    />
                                  </div>
                                </div>
                                
                                <div className="p-2 bg-gray-50 dark:bg-gray-700 text-xs">
                                  {photo.note ? (
                                    <p className="text-gray-700 dark:text-gray-300 truncate font-medium" title={photo.note}>{photo.note}</p>
                                  ) : (
                                    <p className="text-gray-500 dark:text-gray-400 italic">No description</p>
                                  )}
                                  
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {photo.timestamp ? new Date(photo.timestamp).toLocaleString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    }) : 'Date not available'}
                                  </div>
                                  
                                  {photo.tags && photo.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1 max-w-full overflow-hidden">
                                      {photo.tags.filter(tag => tag !== roomName).map((tag, index) => (
                                        <span key={index} className="inline-flex items-center text-xs bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 rounded px-1.5 py-0.5 truncate max-w-[80px]" title={tag}>
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
                            
                            // Güçlendirilmiş URL oluşturma ve hata işleme
                            let imgSrc = '/images/placeholder-image.svg';
                            
                            if (photo.url) {
                              try {
                                // 1. Doğru API URL'sini kulllan
                                const isProduction = typeof window !== 'undefined' ? window.location.hostname !== 'localhost' : false;
                                const baseApiUrl = isProduction ? 'https://api.depositshield.retako.com' : 'http://localhost:5050';
                                
                                // 2. Alternatif URL yapılarını dene
                                if (photo.url.startsWith('http')) {
                                  // Tam URL
                                  imgSrc = photo.url;
                                } else if (photo.url.startsWith('/')) {
                                  // Göreceli yol (/uploads/...)
                                  imgSrc = `${baseApiUrl}${photo.url}`;
                                } else {
                                  // Sadece dosya adı varsa
                                  imgSrc = `${baseApiUrl}/uploads/${photo.url}`;
                                }
                                
                                // URL güvenliğini kontrol et
                                const url = new URL(imgSrc);
                                if (!url || !url.hostname) {
                                  console.error('Invalid URL:', imgSrc);
                                  imgSrc = '/images/placeholder-image.svg';
                                }
                              } catch (urlError) {
                                console.error('Error parsing URL:', urlError.message);
                                imgSrc = '/images/placeholder-image.svg';
                              }
                            }
                            
                            // Bu fotoğraf için alternatif URL'ler
                            const fallbackUrls = [
                              imgSrc,
                              '/images/placeholder-image.svg' // Son çare her zaman placeholder olsun
                            ];
                            
                            return (
                              <div key={photo.id} className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer" onClick={() => openPhotoModal(photo)}>
                                <div className="relative">
                                  <div className="aspect-square overflow-hidden">
                                    {/* Yükleme göstergesi */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800 z-0">
                                      <div className="animate-pulse rounded-full h-10 w-10 border-2 border-indigo-500"></div>
                                    </div>
                                    
                                    <img 
                                      src={photo.imgSrc} 
                                      alt={photo.note || 'Report photo'}
                                      crossOrigin="anonymous"
                                      onError={(e) => {
                                      // Görüntü yükleme hatası
                                      console.error('Image loading error:', e.target.src);
                                      
                                      try {
                                        // Fallback URL'lerin sıradaki URL'sini dene
                                        const fallbackUrls = photo.fallbackUrls || [];
                                        const currentIndex = fallbackUrls.indexOf(e.target.src);
                                      
                                        if (currentIndex !== -1 && currentIndex < fallbackUrls.length - 1) {
                                          const nextUrl = fallbackUrls[currentIndex + 1];
                                          console.log(`Trying next URL: ${nextUrl}`);
                                          e.target.src = nextUrl;
                                        } else {
                                          // Tüm URL'ler denendiyse placeholder'a dön
                                          console.warn('All fallback URLs failed, using placeholder');
                                          e.target.src = '/images/placeholder-image.svg';
                                          e.target.onerror = null; // Sonsuz döngüden kaçınmak için
                                        }
                                      } catch (fallbackError) {
                                        console.error('Error in fallback handling:', fallbackError);
                                        // Her durumda en güvenli seçenek
                                        e.target.src = '/images/placeholder-image.svg';
                                        e.target.onerror = null;
                                      }
                                    }}
                                    onLoad={(e) => {
                                      // Yükleme başarılı olduğunda animasyonu gizle
                                      const loadingEl = e.target.previousSibling;
                                      if (loadingEl) loadingEl.style.display = 'none';
                                    }}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 z-10 relative"
                                    />
                                  </div>
                                </div>
                                
                                <div className="p-2 bg-gray-50 dark:bg-gray-700 text-xs">
                                  {photo.note ? (
                                    <p className="text-gray-700 dark:text-gray-300 truncate font-medium" title={photo.note}>{photo.note}</p>
                                  ) : (
                                    <p className="text-gray-500 dark:text-gray-400 italic">No description</p>
                                  )}
                                  
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {photo.timestamp ? new Date(photo.timestamp).toLocaleString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    }) : 'Date not available'}
                                  </div>
                                  
                                  {photo.tags && photo.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1 max-w-full overflow-hidden">
                                      {photo.tags.map((tag, index) => (
                                        <span key={index} className="inline-flex items-center text-xs bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 rounded px-1.5 py-0.5 truncate max-w-[80px]" title={tag}>
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
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
      
      {/* Fotoğraf Büyütme Modalı */}
      {photoModalOpen && selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75" onClick={closePhotoModal}>
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-xl" 
               onClick={e => e.stopPropagation()}>
            <button 
              className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 bg-opacity-50 text-white hover:bg-opacity-70 transition-all"
              onClick={closePhotoModal}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="relative w-full" style={{ maxHeight: 'calc(90vh - 120px)' }}>
              <img 
                src={selectedPhoto.imgSrc || selectedPhoto.url} 
                alt={selectedPhoto.note || 'Report photo'}
                className="w-full h-auto object-contain"
                crossOrigin="anonymous"
              />
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
              {selectedPhoto.note && (
                <p className="text-gray-700 dark:text-gray-300 mb-2">{selectedPhoto.note}</p>
              )}
              
              {selectedPhoto.tags && selectedPhoto.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedPhoto.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center text-xs bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 rounded px-2 py-1">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {selectedPhoto.timestamp ? new Date(selectedPhoto.timestamp).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Date not available'}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Reddetme Nedeni Modalı */}
      {showRejectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Please provide a reason for rejection</h3>
              
              <div className="mb-5">
                <textarea
                  className="w-full px-3 py-2 text-gray-700 dark:text-gray-300 border rounded-lg focus:outline-none focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  rows="4"
                  placeholder="Enter your reason for rejecting this report..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                ></textarea>
                {rejectionReason.trim() === '' && (
                  <p className="mt-1 text-sm text-red-500">A reason is required for rejection</p>
                )}
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeRejectionModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRejectWithReason}
                  disabled={!rejectionReason.trim() || loading}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none ${!rejectionReason.trim() || loading ? 'bg-red-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : 'Reject Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
