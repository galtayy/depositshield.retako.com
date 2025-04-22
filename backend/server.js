const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Çevre değişkenlerini yükle
dotenv.config();

// Express uygulamasını oluştur
const app = express();
const PORT = process.env.PORT || 5050;

// Middleware 
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statik dosyalar için uploads klasörünü tanımla
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
