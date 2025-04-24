const express = require('express');
const { check } = require('express-validator');
const reportController = require('../controllers/report.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// UUID ile rapor getirme endpoint'i (auth middleware kullanmıyor)
// Bu route'u auth middleware'den öNCE tanımlamak çok önemli
router.get('/uuid/:uuid', reportController.getReportByUuid);

// TEST ENDPOINT - Mail gönderimini test etmek için oluşturuldu (auth gerektirmez)
// NOT: Güvenlik açısından sadece geliştirme ortamında kullanın
router.post('/test-mail', async (req, res) => {
  try {
    console.log('Test mail isteği alındı:', req.body);
    
    // Mail servisi modülünü import et
    const mailService = require('../services/mail.service');
    
    // Test için basit bir HTML içeriği
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #4F46E5;">DepositShield Test E-postası</h2>
        <p>Merhaba ${req.body.name || 'Kullanıcı'},</p>
        <p>Bu bir test e-postasıdır.</p>
        <p>Bu e-posta, mail sunucusu ayarlarının doğru çalışıp çalışmadığını kontrol etmek için gönderilmiştir.</p>
        <p>Tarih/Saat: ${new Date().toLocaleString()}</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">Bu otomatik bir mesajdır. Lütfen bu e-postayı yanıtlamayın.</p>
      </div>
    `;
    
    // E-posta gönder
    const emailResult = await mailService.sendEmail({
      to: req.body.email || process.env.EMAIL_USER, // Gönderilecek adres (request'ten alınmazsa, .env'deki kullanıcıya gönderilir)
      subject: 'DepositShield Test E-postası',
      html: html,
      text: `Merhaba ${req.body.name || 'Kullanıcı'}, bu bir test e-postasıdır. Bu e-posta, mail sunucusu ayarlarının doğru çalışıp çalışmadığını kontrol etmek için gönderilmiştir. Tarih/Saat: ${new Date().toLocaleString()}`
    });
    
    console.log('Test e-posta sonucu:', emailResult);
    
    if (emailResult.success) {
      res.json({
        message: 'Test e-postası başarıyla gönderildi',
        messageId: emailResult.messageId,
        response: emailResult.response
      });
    } else {
      res.status(500).json({
        message: 'Test e-postası gönderilemedi',
        error: emailResult.error,
        code: emailResult.code,
        response: emailResult.response
      });
    }
  } catch (error) {
    console.error('Test e-posta gönderimi hatası:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// PUBLIC NOTIFY ENDPOINT - Auth gerektirmeyen bildirim gönderme 
// Paylasılan raporlardan e-posta gönderme senaryosu için
router.post('/:id/public-notify', reportController.sendReportNotification);

// Rapor onaylama/reddetme - anonim kullanıcılar için (auth gerektirmez)
router.put('/:id/public-approve', reportController.approveReport);
router.put('/:id/public-reject', reportController.rejectReport);

// Tüm diğer rapor route'ları için auth middleware 
// NOT: UUID route'u bu middleware'in üstünde tanımlanmış olmalı
router.use(authMiddleware);

// Rapor oluşturma endpoint'i
router.post(
  '/',
  [
    check('property_id', 'Mülk ID gereklidir').isInt({ min: 1 }),
    check('title', 'Rapor başlığı gereklidir').not().isEmpty(),
    check('type', 'Geçerli bir rapor türü gereklidir').isIn(['move-in', 'move-out', 'general'])
  ],
  reportController.createReport
);

// Kullanıcının tüm raporlarını getirme endpoint'i
router.get('/', reportController.getAllReports);

// Rapor detaylarını getirme endpoint'i
router.get('/:id', reportController.getReportById);

// UUID ile rapor getirme endpoint'i (public endpoint - auth gerektirmez)
// ÖNCE tanımlanmış olmalı - yukarıya da eklendi
// router.get('/uuid/:uuid', reportController.getReportByUuid);

// Mülke ait tüm raporları getirme endpoint'i
router.get('/property/:propertyId', reportController.getReportsByProperty);

// Rapor güncelleme endpoint'i
router.put(
  '/:id',
  [
    check('title', 'Rapor başlığı gereklidir').not().isEmpty(),
    check('type', 'Geçerli bir rapor türü gereklidir').isIn(['move-in', 'move-out', 'general'])
  ],
  reportController.updateReport
);

// Rapor silme endpoint'i
router.delete('/:id', reportController.deleteReport);

// Rapor onaylama endpoint'i
router.put('/:id/approve', reportController.approveReport);

// Rapor reddetme endpoint'i
router.put('/:id/reject', reportController.rejectReport);

// Rapor bildirim e-postaı gönderme endpoint'i
router.post('/:id/notify', reportController.sendReportNotification);

// TEST ENDPOINT - Mail gönderimini test etmek için oluşturuldu
// NOT: Güvenlik açısından sadece geliştirme ortamında kullanın
router.post('/test-mail', async (req, res) => {
  try {
    console.log('Test mail isteği alındı:', req.body);
    
    // Mail servisi modülünü import et
    const mailService = require('../services/mail.service');
    
    // Test için basit bir HTML içeriği
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #4F46E5;">DepositShield Test E-postası</h2>
        <p>Merhaba ${req.body.name || 'Kullanıcı'},</p>
        <p>Bu bir test e-postasıdır.</p>
        <p>Bu e-posta, mail sunucusu ayarlarının doğru çalışıp çalışmadığını kontrol etmek için gönderilmiştir.</p>
        <p>Tarih/Saat: ${new Date().toLocaleString()}</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">Bu otomatik bir mesajdır. Lütfen bu e-postayı yanıtlamayın.</p>
      </div>
    `;
    
    // E-posta gönder
    const emailResult = await mailService.sendEmail({
      to: req.body.email || process.env.EMAIL_USER, // Gönderilecek adres (request'ten alınmazsa, .env'deki kullanıcıya gönderilir)
      subject: 'DepositShield Test E-postası',
      html: html,
      text: `Merhaba ${req.body.name || 'Kullanıcı'}, bu bir test e-postasıdır. Bu e-posta, mail sunucusu ayarlarının doğru çalışıp çalışmadığını kontrol etmek için gönderilmiştir. Tarih/Saat: ${new Date().toLocaleString()}`
    });
    
    console.log('Test e-posta sonucu:', emailResult);
    
    if (emailResult.success) {
      res.json({
        message: 'Test e-postası başarıyla gönderildi',
        messageId: emailResult.messageId,
        response: emailResult.response
      });
    } else {
      res.status(500).json({
        message: 'Test e-postası gönderilemedi',
        error: emailResult.error,
        code: emailResult.code,
        response: emailResult.response
      });
    }
  } catch (error) {
    console.error('Test e-posta gönderimi hatası:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// Rapor arşivleme endpoint'i 
router.put('/:id/archive', reportController.archiveReport);

module.exports = router;
