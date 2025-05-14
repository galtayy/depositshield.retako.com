const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Çevre değişkenlerini yükle
dotenv.config();

// Express uygulamasını oluştur
const app = express();
const PORT = process.env.PORT || 5050;

// Security middleware - kısıtlayıcı CSP kurallarını kaldır
app.use((req, res, next) => {
  // Güvenlik başlıklarını ayarla
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Eski CSP başlığını kaldır (varsa)
  res.removeHeader('Content-Security-Policy');
  
  // Daha geniş izin veren CSP kuralı
  res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data: blob: *; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval';");
  
  next();
});

// CORS ayarlarını gelişmiş olarak yapılandıralım
const corsOptions = {
  origin: function (origin, callback) {
    // İzin verilen originler listesi
    const allowedOrigins = [
      'http://localhost:3000',  // Geliştirme ortamındaki frontend
      'http://localhost:5050',  // Geliştirme ortamındaki backend
      'https://depositshield.retako.com', // Canlı frontend
      'https://api.depositshield.retako.com' // Canlı backend
    ];
    
    // Geliştirme modunda tüm isteklere izin ver
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: CORS allowed for all origins');
      return callback(null, true);
    }
    
    // Origin olmayan istekler (postman, curl gibi olanlar için)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.match(/localhost/)) {
      callback(null, true);
    } else {
      console.log('CORS rejected:', origin);
      callback(new Error('CORS policy\'a izin verilmiyor'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Public-Access', 'X-Optional-Auth'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  credentials: true,
  maxAge: 86400 // 24 saat
};

// CORS middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware - sadece geliştirme ortamında
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    
    if (req.method === 'POST' || req.method === 'PUT') {
      console.log('Request body:', JSON.stringify(req.body, null, 2));
    }
    
    // Response logger
    const oldSend = res.send;
    res.send = function(data) {
      console.log(`Response: ${res.statusCode}`, 
        typeof data === 'object' ? `(${JSON.stringify(data).substring(0, 100)}...)` : `(${data}...)`);
      return oldSend.apply(res, arguments);
    };
    
    next();
  });
}

// Statik dosyalar için uploads klasörünü tanımla
// Özellikle CORS ve cache için özel ayarlar ekleyelim
app.use('/uploads', (req, res, next) => {
  // CORS ayarlarını ekle
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  // Cache ayarlarını ekle
  res.header('Cache-Control', 'public, max-age=31536000'); // 1 yıl önbellek
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Veritabanı bağlantısı
const db = require('./config/database');

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/properties', require('./routes/properties.routes'));
app.use('/api/reports', require('./routes/reports.routes'));
app.use('/api/photos', require('./routes/photos.routes'));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'DepositShield API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Sunucu hatası',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;