const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const constants = require('constants');

// SSL/TLS ayarlarını eski sunucular için uyumlu hale getir
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Geliştirme modunda sertifika doğrulamasını devre dışı bırak

dotenv.config();

// Nodemailer transporter oluştur
const createTransporter = () => {
  console.log('Mail ayarları yükleniyor...');
  console.log('Host:', process.env.EMAIL_HOST);
  console.log('Port:', process.env.EMAIL_PORT);
  console.log('User:', process.env.EMAIL_USER);
  console.log('From:', process.env.EMAIL_FROM);
  
  // Ana config'i oluştur
  const config = {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: parseInt(process.env.EMAIL_PORT, 10) === 465, // SSL için port 465 ise true, diğer portlar için false
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    debug: process.env.NODE_ENV !== 'production', // Debug mod
    logger: process.env.NODE_ENV !== 'production', // Logger aktif
    tls: {
      // Eski SSL/TLS yapılandırmalarını kabul et
      rejectUnauthorized: false,
      minVersion: 'TLSv1', // TLSv1.2 yerine TLSv1 kullan
      maxVersion: 'TLSv1.3',
      ciphers: 'HIGH:MEDIUM:!aNULL:!MD5:!RC4', // Daha geniş şifreleme seti
      secureOptions: require('constants').SSL_OP_LEGACY_SERVER_CONNECT // Legacy server bağlantısına izin ver
    }
  };
  
  // NOT: Port 587 için özel yapılandırmayı kaldırdık çünkü zaten genel TLS ayarı tanımladık
  // Artık tls options temel konf. içinde yer alıyor
  /*
  if (parseInt(process.env.EMAIL_PORT, 10) === 587) {
    // STARTTLS için (587 portu)
    config.requireTLS = true;
    config.tls = {
      rejectUnauthorized: process.env.NODE_ENV === 'production', // Geliştirme ortamında sertifika doğrulamasını atla
      minVersion: 'TLSv1.2'
    };
  }
  */
  
  console.log('Mail transporter konfigürasyonu:', JSON.stringify({
    ...config,
    auth: {
      user: config.auth.user,
      pass: '********'
    }
  }, null, 2));
  
  return nodemailer.createTransport(config);
};

const transporter = createTransporter();

// E-posta gönderimi yapan ana metot
const sendEmail = async (options) => {
  try {
    console.log('============ E-POSTA GÖNDERİM BAŞLATILDI ============');
    console.log('Transport ayarları:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: '********' // Güvenlik için şifre gizlendi
      }
    });
    
    console.log('Gönderilecek e-posta bilgileri:', {
      to: options.to,
      from: options.from || process.env.EMAIL_FROM,
      fromName: options.fromName || 'DepositShield',
      subject: options.subject,
      textLength: options.text ? options.text.length : 0,
      htmlLength: options.html ? options.html.length : 0
    });

    const mailOptions = {
      from: `${options.fromName || 'DepositShield'} <${options.from || process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      text: options.text || '',
      html: options.html || ''
    };

    console.log('Transporter ile mail gönderme çağrısı yapılıyor...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('E-posta başarıyla gönderildi!');
    console.log('Mesaj ID:', info.messageId);
    console.log('Özet bilgiler:', info.response);
    console.log('============ E-POSTA GÖNDERİM TAMAMLANDI ============');
    
    return { success: true, messageId: info.messageId, response: info.response };
  } catch (error) {
    console.error('============ E-POSTA GÖNDERİM HATASI ============');
    console.error('Hata detayı:', error);
    console.error('Hata kodu:', error.code);
    console.error('Hata mesajı:', error.message);
    console.error('Hata yanıtı:', error.response);
    console.error('===============================================');
    return { success: false, error: error.message, code: error.code, response: error.response };
  }
};

const sendReportApprovalNotification = async (recipient, reportDetails) => {
  console.log('\n==== ONAY E-POSTASI GÖNDERİLİYOR ====');
  console.log('Alıcı:', recipient);
  console.log('Rapor detayları:', {
    id: reportDetails.id,
    title: reportDetails.title,
    address: reportDetails.address,
    viewUrl: reportDetails.viewUrl
  });
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #4F46E5;">Your Property Report Has Been Approved</h2>
      <p>Hello ${recipient.name || 'there'},</p>
      <p>Good news! Your property report for <strong>${reportDetails.address}</strong> has been approved.</p>
      <p><strong>Report Details:</strong></p>
      <ul>
        <li><strong>Title:</strong> ${reportDetails.title}</li>
        <li><strong>Type:</strong> ${reportDetails.type}</li>
        <li><strong>Created on:</strong> ${new Date(reportDetails.created_at).toLocaleString()}</li>
      </ul>
      <p>You can view the complete report by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${reportDetails.viewUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Report</a>
      </div>
      <p>If you have any questions, please contact us.</p>
      <p>Thank you for using DepositShield!</p>
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
      <p style="font-size: 12px; color: #666;">This is an automated message. Please do not reply to this email.</p>
    </div>
  `;

  const result = await sendEmail({
    to: recipient.email,
    subject: 'Your Property Report Has Been Approved',
    html: html,
    text: `Hello ${recipient.name || 'there'}, Your property report for ${reportDetails.address} has been approved. You can view the complete report at: ${reportDetails.viewUrl}`
  });
  
  console.log('E-posta gönderim sonucu:', result);
  console.log('==== ONAY E-POSTASI İŞLEMİ TAMAMLANDI ====\n');
  
  return result;
};

// Rapor reddetme bildirimi gönder
const sendReportRejectionNotification = async (recipient, reportDetails) => {
  console.log('\n==== RED E-POSTASI GÖNDERİLİYOR ====');
  console.log('Alıcı:', recipient);
  console.log('Rapor detayları:', {
    id: reportDetails.id,
    title: reportDetails.title,
    address: reportDetails.address,
    viewUrl: reportDetails.viewUrl
  });
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #EF4444;">Your Property Report Has Been Rejected</h2>
      <p>Hello ${recipient.name || 'there'},</p>
      <p>We wanted to inform you that your property report for <strong>${reportDetails.address}</strong> has been rejected.</p>
      <p><strong>Report Details:</strong></p>
      <ul>
        <li><strong>Title:</strong> ${reportDetails.title}</li>
        <li><strong>Type:</strong> ${reportDetails.type}</li>
        <li><strong>Created on:</strong> ${new Date(reportDetails.created_at).toLocaleString()}</li>
      </ul>
      <p>You may want to review your report and make any necessary updates. You can view the complete report by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${reportDetails.viewUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Report</a>
      </div>
      <p>If you have questions about why your report was rejected, please contact the property owner or manager.</p>
      <p>Thank you for using DepositShield!</p>
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
      <p style="font-size: 12px; color: #666;">This is an automated message. Please do not reply to this email.</p>
    </div>
  `;

  const result = await sendEmail({
    to: recipient.email,
    subject: 'Your Property Report Has Been Rejected',
    html: html,
    text: `Hello ${recipient.name || 'there'}, We wanted to inform you that your property report for ${reportDetails.address} has been rejected. You can view the complete report at: ${reportDetails.viewUrl}`
  });
  
  console.log('E-posta gönderim sonucu:', result);
  console.log('==== RED E-POSTASI İŞLEMİ TAMAMLANDI ====\n');
  
  return result;
};

// Özel bildirim e-postası gönder
const sendCustomNotification = async (recipient, subject, message, reportDetails) => {
  console.log('\n==== ÖZEL BİLDİRİM E-POSTASI GÖNDERİLİYOR ====');
  console.log('Alıcı:', recipient);
  console.log('Konu:', subject);
  console.log('Mesaj:', message);
  console.log('Rapor detayları:', reportDetails ? {
    id: reportDetails.id,
    title: reportDetails.title,
    address: reportDetails.address,
    viewUrl: reportDetails.viewUrl
  } : 'Rapor detayları belirtilmemiş');
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #4F46E5;">${subject}</h2>
      <p>Hello ${recipient.name || 'there'},</p>
      <p>${message}</p>
      ${reportDetails ? `
        <p><strong>Report Details:</strong></p>
        <ul>
          <li><strong>Title:</strong> ${reportDetails.title}</li>
          <li><strong>Address:</strong> ${reportDetails.address}</li>
          <li><strong>Type:</strong> ${reportDetails.type}</li>
          <li><strong>Created on:</strong> ${new Date(reportDetails.created_at).toLocaleString()}</li>
        </ul>
        <p>You can view the complete report by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${reportDetails.viewUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Report</a>
        </div>
      ` : ''}
      <p>Thank you for using DepositShield!</p>
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
      <p style="font-size: 12px; color: #666;">This is an automated message. Please do not reply to this email.</p>
    </div>
  `;

  const result = await sendEmail({
    to: recipient.email,
    subject: subject,
    html: html,
    text: `Hello ${recipient.name || 'there'}, ${message} ${reportDetails ? `Report details: ${reportDetails.title}, ${reportDetails.address}. View at: ${reportDetails.viewUrl}` : ''}`
  });
  
  console.log('E-posta gönderim sonucu:', result);
  console.log('==== ÖZEL BİLDİRİM E-POSTASI İŞLEMİ TAMAMLANDI ====\n');
  
  return result;
};

module.exports = {
  sendEmail,
  sendReportApprovalNotification,
  sendReportRejectionNotification,
  sendCustomNotification
};