const { validationResult } = require('express-validator');
const Report = require('../models/report.model');
const Property = require('../models/property.model');

exports.createReport = async (req, res) => {
  try {
    // Validation errors check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { property_id, title, description, type } = req.body;
    const created_by = req.user.id;

    // Get and check property information
    const property = await Property.findById(property_id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Create new report
    const reportId = await Report.create({
      property_id,
      created_by,
      title,
      description,
      type
    });

    // Get report information
    const report = await Report.findById(reportId);

    res.status(201).json({
      message: 'Report created successfully',
      id: reportId,
      report
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    // Get all reports belonging to the user
    const reports = await Report.findByUserId(req.user.id);

    res.json(reports);
  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const reportId = req.params.id;

    // Get report information
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check if user is the report owner
    const isOwner = report.created_by === req.user.id;
    
    // Different users with reports for the same property can see each other's reports
    // This allows landlords and tenants to see each other's reports
    const property = await Property.findById(report.property_id);
    const hasPropertyAccess = property.user_id === req.user.id;
    
    if (!isOwner && !hasPropertyAccess) {
      return res.status(403).json({ message: 'You do not have permission to access this report' });
    }

    // Log report view
    await Report.logReportView(reportId, req.user.id);

    res.json(report);
  } catch (error) {
    console.error('Get report by id error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getReportByUuid = async (req, res) => {
  try {
    const uuid = req.params.uuid;
    console.log(`[INFO] Accessing report via UUID: ${uuid}`);
    
    if (!uuid) {
      return res.status(400).json({ message: 'UUID parameter is required' });
    }

    // Get report information by UUID
    const report = await Report.findByUuid(uuid);
    if (!report) {
      console.log(`[WARNING] Report not found with UUID: ${uuid}`);
      return res.status(404).json({ message: 'Report not found' });
    }
    
    console.log(`[INFO] Found report: ID=${report.id}, Title="${report.title}", Property=${report.property_id}`);

    // Herhangi bir kimlik doğrulama kontrolü yapma - bu endpoint public
    // Any user can access reports via UUID - this is by design
    // Log report view (viewer_id can be null for anonymous viewers)
    await Report.logReportView(report.id, req.user ? req.user.id : null);
    
    // Rapordaki fotoğrafları da çek
    const Photo = require('../models/photo.model');
    try {
      const photos = await Photo.findByReportId(report.id);
      // Fotoğraflar için URL'leri oluştur
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const photosWithUrls = photos.map(photo => ({
        ...photo,
        file_path: photo.file_path, // file_path bilgisi ekle
        url: `/uploads/${photo.file_path}`
      }));
      
      // Fotoğrafları da ekleyerek raporu döndür
      console.log(`[INFO] Found ${photos.length} photos for report ${report.id}`);
      return res.json({
        ...report,
        photos: photosWithUrls
      });
    } catch (photoError) {
      console.error('Error fetching photos:', photoError);
      // Fotoğraf hatalarında sadece raporu döndür
      return res.json(report);
    }
  } catch (error) {
    console.error('Get report by uuid error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateReport = async (req, res) => {
  try {
    // Validation errors check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const reportId = req.params.id;
    const { title, description, type, generate_new_uuid } = req.body;

    // Get report information
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check if user is the report owner
    const isOwner = report.created_by === req.user.id;
    if (!isOwner) {
      return res.status(403).json({ message: 'You do not have permission to edit this report' });
    }

    // Rapor daha önce reddedilmiş mi kontrol et
    const wasRejected = report.approval_status === 'rejected';
    
    // Update report
    const updateData = {
      title,
      description,
      type,
      // Eğer rapor reddedilmişse ve içerik değişiyorsa yeni bir UUID oluştur
      generate_new_uuid: wasRejected && generate_new_uuid
    };
    
    const updated = await Report.update(reportId, updateData);

    if (!updated) {
      return res.status(400).json({ message: 'Report could not be updated' });
    }

    // Get updated report information
    const updatedReport = await Report.findById(reportId);

    // Eğer rapor reddedilmişse ve başarıyla güncellendiyse bildirim gönder
    if (wasRejected) {
      // Log bilgisi
      console.log('Rejected report was updated: ', reportId);
    }

    res.json({
      message: 'Report updated successfully',
      report: updatedReport,
      was_rejected: wasRejected
    });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const reportId = req.params.id;

    // Get report information
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check if user is the report owner
    const isOwner = report.created_by === req.user.id;
    if (!isOwner) {
      return res.status(403).json({ message: 'You do not have permission to delete this report' });
    }

    // Delete report (cascade delete will also delete photos)
    const deleted = await Report.delete(reportId);

    if (!deleted) {
      return res.status(400).json({ message: 'Report could not be deleted' });
    }

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getReportsByProperty = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;

    // Get property information
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if user has access to this property
    // (User can be the property owner or have created a report for this property)
    const isPropertyOwner = property.user_id === req.user.id;
    
    // Get reports for the property
    const reports = await Report.findByPropertyId(propertyId);

    // If user is not the property owner, they should only see reports they created
    const filteredReports = isPropertyOwner 
      ? reports 
      : reports.filter(report => report.created_by === req.user.id);

    res.json(filteredReports);
  } catch (error) {
    console.error('Get reports by property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// E-posta servisini import et
const mailService = require('../services/mail.service');
const User = require('../models/user.model');

// Rapor arşivleme
exports.archiveReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    const { reason } = req.body;

    // Get report information
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check if user is the report owner or has admin access
    const isOwner = report.created_by === req.user.id;
    const isAdmin = req.user.role === 'admin'; // Eğer rol sistemi varsa kullan
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You do not have permission to archive this report' });
    }
    
    // Onay durumu ve zamanlaması için doğru tarih formatını kullan (MySQL için)
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 19).replace('T', ' '); // YYYY-MM-DD HH:MM:SS formatı
    
    // Raporu arşivle
    const updated = await Report.update(reportId, {
      is_archived: 1,
      archived_at: formattedDate,
      archive_reason: reason || 'Archived by user'
    });

    if (!updated) {
      return res.status(400).json({ message: 'Report could not be archived' });
    }

    res.json({ message: 'Report archived successfully' });
  } catch (error) {
    console.error('Archive report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Rapor onaylama işlemi
exports.approveReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    const { status, message, uuid } = req.body;
    
    // Get report information
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // Kimlik doğrulama kontrolü - UUID varsa veya sahibiyse
    const isOwner = req.user && report.created_by === req.user.id;
    let hasAccess = isOwner;
    
    // UUID ile erişim kontrolü
    if (uuid && report.uuid === uuid) {
      hasAccess = true;
    }
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'You do not have permission to approve this report' });
    }
    
    // Onay durumu ve zamanlaması için doğru tarih formatını kullan (MySQL için)
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 19).replace('T', ' '); // YYYY-MM-DD HH:MM:SS formatı
    
    // Raporu güncelle
    const updated = await Report.update(reportId, {
      approval_status: 'approved',
      approved_at: formattedDate,
      approved_message: message || 'Report has been approved'
    });
    
    if (!updated) {
      return res.status(400).json({ message: 'Report could not be approved' });
    }
    
    res.json({ message: 'Report has been approved successfully' });
  } catch (error) {
    console.error('Approve report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Rapor reddetme işlemi
exports.rejectReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    const { status, message, uuid } = req.body;
    
    // Get report information
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // Kimlik doğrulama kontrolü - UUID varsa veya sahibiyse
    const isOwner = req.user && report.created_by === req.user.id;
    let hasAccess = isOwner;
    
    // UUID ile erişim kontrolü
    if (uuid && report.uuid === uuid) {
      hasAccess = true;
    }
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'You do not have permission to reject this report' });
    }
    
    // Onay durumu ve zamanlaması için doğru tarih formatını kullan (MySQL için)
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 19).replace('T', ' '); // YYYY-MM-DD HH:MM:SS formatı
    
    // Raporu güncelle
    const updated = await Report.update(reportId, {
      approval_status: 'rejected',
      rejected_at: formattedDate,
      rejection_message: message || 'Report has been rejected'
    });
    
    if (!updated) {
      return res.status(400).json({ message: 'Report could not be rejected' });
    }
    
    res.json({ message: 'Report has been rejected successfully' });
  } catch (error) {
    console.error('Reject report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Rapor bildirim işlemi - E-posta gönderme
exports.sendReportNotification = async (req, res) => {
  try {
    const reportId = req.params.id;
    const { 
      recipientEmail, 
      recipientName, 
      subject, 
      message, 
      status,
      reportUuid,
      isPublic
    } = req.body;
    
    // Verifikasyon
    if (!recipientEmail || !subject) {
      return res.status(400).json({ message: 'Recipient email and subject are required' });
    }
    
    // Get report information
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // Kimlik doğrulama kontrolü - sadece sahip veya UUID ile erişim
    const isOwner = req.user && report.created_by === req.user.id;
    let hasAccess = isOwner;
    
    // Public erişim veya UUID ile erişim
    if (isPublic || (reportUuid && report.uuid === reportUuid)) {
      hasAccess = true;
    }
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'You do not have permission to send notifications for this report' });
    }
    
    // Rapor kaynağını getir
    const property = await Property.findById(report.property_id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Rapor oluşturan kullanıcıyı getir
    const creator = await User.findById(report.created_by);
    
    // E-posta alacak kişi bilgileri
    // Öncelik sırası: request body > tenant_email > creator_email > .env default
    const emailToUse = req.body.recipientEmail || report.tenant_email || (creator ? creator.email : null) || process.env.EMAIL_FROM;
    const nameToUse = req.body.recipientName || report.tenant_name || (creator ? creator.name : 'Tenant');

    // Alici bilgilerini detaylı logla
    console.log('Alıcı bilgileri (son):', {
      email: emailToUse, 
      name: nameToUse,
      requestEmail: req.body.recipientEmail,
      reportTenantEmail: report.tenant_email,
      creatorEmail: creator ? creator.email : 'N/A'
    });
    
    const recipient = {
      email: emailToUse,
      name: nameToUse
    };
    
    // Rapor görüntüleme URL'ini oluştur
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://depositshield.retako.com'
      : 'http://localhost:3000';
    
    const viewUrl = `${baseUrl}/reports/shared/${report.uuid}`;
    
    // Rapor detayları
    const reportDetails = {
      id: report.id,
      title: report.title,
      description: report.description,
      type: report.type,
      created_at: report.created_at,
      address: property.address,
      viewUrl: viewUrl
    };
    
    // E-posta gönderimi
    let emailResult;
    
    try {
      console.log('E-posta gönderimi başlatılıyor - status:', status);
      console.log('Alıcı detayları:', recipient, 'E-posta:', recipient.email);
      console.log('Rapor bilgileri:', {
        id: reportDetails.id,
        title: reportDetails.title,
        address: reportDetails.address,
        viewUrl: reportDetails.viewUrl
      });

      if (status === 'approved') {
        // Onay e-postası
        emailResult = await mailService.sendReportApprovalNotification(recipient, reportDetails);
      } else if (status === 'rejected') {
        // Red e-postası
        emailResult = await mailService.sendReportRejectionNotification(recipient, reportDetails);
      } else {
        // Özel e-posta
        emailResult = await mailService.sendCustomNotification(
          recipient,
          subject,
          message || 'You have a new notification about your property report.',
          reportDetails
        );
      }
      
      console.log('E-posta gönderme sonucu:', emailResult);
    } catch (emailError) {
      console.error('===== CONTROLLER: E-POSTA GÖNDERME HATASI =====');
      console.error('Hata detayı:', emailError);
      console.error('============================================');
      
      // E-posta gönderiminde hata olsa bile işlemi devam ettir
      return res.json({ 
        message: 'Report notification attempted, but email sending failed',
        success: true,
        emailStatus: 'failed',
        emailError: emailError.message
      });
    }
    
    if (!emailResult.success) {
      console.error('===== CONTROLLER: E-POSTA GÖNDERME HATASI =====');
      console.error('Hata detayı:', emailResult.error);
      console.error('Hata kodu:', emailResult.code);
      console.error('Hata yanıtı:', emailResult.response);
      console.error('============================================');
      
      // Hatıyı client'a döndermeyelim, ama yine de başarılı yanıt dönelim
      console.log('Client\'a başarılı mesaj döndürülüyor...');
      
      // Eğer e-posta gönderimi başarısız olsa bile işlemi başarılı say
      return res.json({ 
        message: 'Report action was completed, but there were issues with the email notification.',
        success: true,
        emailStatus: 'failed',
        emailError: emailResult.error
      });
      
      /* Önceki hata davranışı - tamamen hata döndürür
      return res.status(500).json({ 
        message: 'Error sending notification email', 
        error: emailResult.error,
        code: emailResult.code,
        response: emailResult.response 
      });
      */
    }
    
    // Bildirim başarılı
    res.json({ 
      message: 'Notification email sent successfully',
      messageId: emailResult.messageId 
    });
    
  } catch (error) {
    console.error('Send report notification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
