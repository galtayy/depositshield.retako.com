/**
 * Alternatif SMTP konfigürasyonları
 * 
 * Bu dosya e-posta gönderimi için alternatif sağlayıcılar ve konfigürasyonlar sunar.
 * Proje geliştirme aşamasında veya ana SMTP sunucusu çalışmadığında kullanılabilir.
 */

// Gmail yapılandırması
// NOT: Gmail ile kullanmak için "Daha az güvenli uygulama erişimi"ni etkinleştirmelisiniz
// veya App Password kullanmalısınız. Google hesap ayarlarından yapılandırılabilir.
const gmailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@gmail.com', // Gmail adresinizi girin
    pass: 'your-password-or-app-password' // Şifrenizi veya uygulama şifrenizi girin
  },
  tls: {
    rejectUnauthorized: false
  }
};

// Outlook/Office365 yapılandırması
const outlookConfig = {
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@outlook.com', // Outlook adresinizi girin
    pass: 'your-password' // Şifrenizi girin
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false
  }
};

// Yandex Mail yapılandırması
const yandexConfig = {
  host: 'smtp.yandex.com',
  port: 465,
  secure: true,
  auth: {
    user: 'your-username@yandex.com', // Yandex adresinizi girin
    pass: 'your-password' // Şifrenizi girin
  }
};

// Mailtrap (Test ortamı için)
const mailtrapConfig = {
  host: 'smtp.mailtrap.io',
  port: 2525,
  secure: false,
  auth: {
    user: 'your-mailtrap-user', // Mailtrap kullanıcı adınız
    pass: 'your-mailtrap-password' // Mailtrap şifreniz
  }
};

// SendGrid yapılandırması
const sendgridConfig = {
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  auth: {
    user: 'apikey', // SendGrid kullanıcı adı her zaman 'apikey'
    pass: 'your-sendgrid-api-key' // SendGrid API anahtarınız
  }
};

// Mailgun yapılandırması
const mailgunConfig = {
  host: 'smtp.mailgun.org',
  port: 587,
  secure: false,
  auth: {
    user: 'your-mailgun-smtp-username', // Mailgun SMTP kullanıcı adınız
    pass: 'your-mailgun-smtp-password' // Mailgun SMTP şifreniz
  }
};

module.exports = {
  gmailConfig,
  outlookConfig,
  yandexConfig,
  mailtrapConfig,
  sendgridConfig,
  mailgunConfig
};
