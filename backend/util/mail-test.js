/**
 * SMTP Bağlantı Test Aracı
 * 
 * Bu dosya, SMTP sunucunuzla bağlantıyı test etmek için kullanılabilir.
 * Node.js ile direkt çalıştırılabilir: node mail-test.js
 */

const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const constants = require('constants');

// SSL/TLS ayarlarını eski sunucular için uyumlu hale getir
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Geliştirme modunda sertifika doğrulamasını devre dışı bırak

// .env dosyasını yükle
dotenv.config();

// Komut satırı argümanlarını al
const args = process.argv.slice(2);
const toEmail = args[0] || process.env.EMAIL_USER; // İlk argüman e-posta adresi, yoksa .env'den al

// SMTP bağlantısını test et
async function testSMTPConnection() {
  console.log('SMTP Bağlantı Testi Başlıyor...');
  console.log('--------------------------------');
  
  // E-posta ayarlarını yazdır
  console.log('📧 E-posta Ayarları:');
  console.log(`Host: ${process.env.EMAIL_HOST}`);
  console.log(`Port: ${process.env.EMAIL_PORT}`);
  console.log(`Kullanıcı: ${process.env.EMAIL_USER}`);
  console.log(`Gönderen: ${process.env.EMAIL_FROM}`);
  console.log(`Alıcı: ${toEmail}`);
  console.log('--------------------------------');
  
  try {
    // Transporter oluştur
    console.log('🔄 SMTP Taşıyıcı oluşturuluyor...');
    
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT, 10),
      secure: parseInt(process.env.EMAIL_PORT, 10) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      debug: true,
      logger: true,
      tls: {
        // Eski SSL/TLS yapılandırmalarını kabul et
        rejectUnauthorized: false,
        minVersion: 'TLSv1', // TLSv1.2 yerine TLSv1 kullan
        ciphers: 'HIGH:MEDIUM:!aNULL:!MD5:!RC4', // Daha geniş şifreleme seti
        secureOptions: constants.SSL_OP_LEGACY_SERVER_CONNECT // Legacy server bağlantısına izin ver
      }
    });
    
    // Bağlantıyı doğrula
    console.log('🔍 SMTP Bağlantısı doğrulanıyor...');
    const verifyResult = await transporter.verify();
    console.log('✅ SMTP Bağlantısı başarılı!', verifyResult);
    
    // Test e-postası gönder
    console.log('📨 Test e-postası gönderiliyor...');
    
    const info = await transporter.sendMail({
      from: `"DepositShield Test" <${process.env.EMAIL_FROM}>`,
      to: toEmail,
      subject: "SMTP Test E-postası",
      text: "Bu bir test e-postasıdır. SMTP bağlantınız çalışıyorsa, bu e-postayı alacaksınız.",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #4F46E5;">SMTP Test E-postası</h2>
          <p>Bu bir test e-postasıdır. SMTP bağlantınız çalışıyorsa, bu e-postayı alacaksınız.</p>
          <p>📅 Tarih/Saat: ${new Date().toLocaleString()}</p>
          <p>🔧 Sunucu: ${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT}</p>
          <p>👤 Kullanıcı: ${process.env.EMAIL_USER}</p>
          <hr style="border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">Bu bir otomatik test mesajıdır.</p>
        </div>
      `
    });
    
    console.log('✅ E-posta başarıyla gönderildi!');
    console.log('📋 Mesaj detayları:');
    console.log(`Message ID: ${info.messageId}`);
    console.log(`Response: ${info.response}`);
    console.log('--------------------------------');
    console.log('Test tamamlandı! E-posta gönderimi başarılı.');
    
  } catch (error) {
    console.error('❌ HATA:', error);
    console.error('--------------------------------');
    
    // Yaygın SMTP hatalarını açıkla
    if (error.code === 'ECONNREFUSED') {
      console.error('📌 HATA AÇIKLAMASI: SMTP sunucusuna bağlanılamadı. Host veya port yanlış olabilir.');
    } else if (error.code === 'EAUTH') {
      console.error('📌 HATA AÇIKLAMASI: Kimlik doğrulama başarısız. Kullanıcı adı veya şifre yanlış olabilir.');
    } else if (error.code === 'ESOCKET') {
      console.error('📌 HATA AÇIKLAMASI: Socket hatası. SSL/TLS yapılandırması yanlış olabilir.');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('📌 HATA AÇIKLAMASI: Bağlantı zaman aşımına uğradı. Firewall veya ağ sorunu olabilir.');
    }
    
    // Çözüm önerileri
    console.log('\n📚 ÇÖZÜM ÖNERİLERİ:');
    console.log('1. Host ve port ayarlarınızı kontrol edin');
    console.log('2. Kullanıcı adı ve şifre bilgilerinizi doğrulayın');
    console.log('3. SSL/TLS ayarlarınızı kontrol edin');
    console.log('4. E-posta sağlayıcınızın SMTP ayarlarını gözden geçirin');
    console.log('5. Firewall veya ağ ayarlarınızı kontrol edin');
    
    process.exit(1);
  }
}

// Testi çalıştır
testSMTPConnection();
