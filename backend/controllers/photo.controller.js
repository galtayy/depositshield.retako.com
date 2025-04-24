const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const multer = require('multer');
const Photo = require('../models/photo.model');
const Report = require('../models/report.model');
const Property = require('../models/property.model');

// Kimlik doğrulama gerektirmeden rapora ait tüm fotoğrafları getirme endpoint'i
exports.getPublicReportPhotos = async (req, res) => {
  try {
    const reportId = req.params.reportId;
    
    if (!reportId) {
      return res.status(400).json({ message: 'Rapor ID belirtilmedi' });
    }
    
    // Log inceleme için
    console.log(`[DEBUG] Public access requested for photos of report ${reportId}`);
    
    // Rapor var mı kontrol et
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Rapor bulunamadı' });
    }
    
    // Güvenli erişim için gerekli başlıkları ekle
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    // Rapora ait fotoğrafları getir
    const photos = await Photo.findByReportId(reportId);
    
    // Debug için bağlantı bilgilerini yazdır
    console.log(`[DEBUG] ${photos.length} photos found for report ${reportId}`);
    console.log(`[DEBUG] Protocol: ${req.protocol}, Host: ${req.get('host')}`);
    console.log(`[DEBUG] X-Forwarded headers:`, req.headers['x-forwarded-proto'], req.headers['x-forwarded-host']);
    
    // URL'den ziyade file_path + url alanı döndür - bu frontend'de daha esnek bir şekilde işlenebilir
    const photosWithPaths = photos.map(photo => {
      // Fotoğraf bilgilerini döndür
      return {
        ...photo,
        file_path: photo.file_path, // file_path'i açıkça döndür
        url: `/uploads/${photo.file_path}` // Göreceli URL döndür
      };
    });
    
    res.json(photosWithPaths);
  } catch (error) {
    console.error('Get public photos by report error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Kimlik doğrulama gerektirmeden fotoğraf dosyasına erişim sağlayan endpoint
exports.getPublicPhoto = async (req, res) => {
  try {
    const filename = req.params.filename;
    
    if (!filename) {
      return res.status(400).json({ message: 'Dosya adı belirtilmedi' });
    }
    
    // Güvenlik için dosya adını kontrol et - path traversal saldırılarını önle
    if (filename.includes('../') || filename.includes('..\\')) {
      return res.status(400).json({ message: 'Geçersiz dosya adı' });
    }
    
    // Dosya yolu oluştur
    const filePath = path.join(__dirname, '../uploads', filename);
    
    // Dosyanın var olup olmadığını kontrol et
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Dosya bulunamadı' });
    }
    
    // MIME türünü dosya uzantısından belirle
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream'; // Varsayılan
    
    if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (ext === '.png') {
      contentType = 'image/png';
    } else if (ext === '.gif') {
      contentType = 'image/gif';
    }
    
    // Dosyayı gönder
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 yıl önbellek
    
    // CORS headerlarını ekle
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    // DEBUG için
    console.log(`[DEBUG] Public photo access: ${filename}, content-type: ${contentType}`);
    
    // Dosyayı akış olarak gönder
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Get public photo error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Multer konfigürasyonu
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../uploads');
    
    // Uploads dizini yoksa oluştur
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Benzersiz dosya adı (timestamp + orijinal isim)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// Dosya filtresi (sadece resim dosyaları)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Sadece JPG, JPEG ve PNG formatındaki dosyalar kabul edilir.'), false);
  }
};

// Multer upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  }
});

exports.uploadPhoto = [
  // Upload middleware
  upload.single('photo'),
  
  // Controller
  async (req, res) => {
    try {
      const reportId = req.params.reportId;
      
      // Rapor var mı kontrol et
      const report = await Report.findById(reportId);
      if (!report) {
        // Yüklenen dosyayı sil
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({ message: 'Rapor bulunamadı' });
      }
      
      // Rapor sahibi mi kontrol et
      const isOwner = report.created_by === req.user.id;
      if (!isOwner) {
        // Yüklenen dosyayı sil
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(403).json({ message: 'Bu rapora fotoğraf ekleme izniniz yok' });
      }
      
      // Dosya yüklendi mi kontrol et
      if (!req.file) {
        return res.status(400).json({ message: 'Fotoğraf yüklenemedi' });
      }
      
      // Etiketleri JSON parse et
      let tags = [];
      if (req.body.tags) {
        try {
          tags = JSON.parse(req.body.tags);
        } catch (err) {
          console.error('Tags parsing error:', err);
        }
      }
      
      // Fotoğraf bilgilerini veritabanına kaydet
      const photoId = await Photo.create({
        report_id: reportId,
        file_path: req.file.filename,
        note: req.body.note || null,
        timestamp: new Date(),
        tags
      });
      
      // Fotoğraf bilgilerini getir
      const photo = await Photo.findById(photoId);
      
      // Fotoğraf URL'ini ekle - daha güvenilir bir yöntem kullanalım
      // Önce istek protokolü ve host bilgisini kontrol edelim
      let protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
      let host = req.headers['x-forwarded-host'] || req.get('host') || 'localhost:5050';
      
      // Canlı ortamda sabit değerleri kullanmayı tercih edebiliriz
      if (process.env.NODE_ENV === 'production') {
        protocol = 'https';
        host = 'api.depositshield.retako.com';
      }
      
      const baseUrl = `${protocol}://${host}`;
      photo.url = `/uploads/${photo.file_path}`; // Sadece path döndürürken frontend tarafında baseUrl ile birleştirilecek
      
      res.status(201).json({
        message: 'Fotoğraf başarıyla yüklendi',
        photo
      });
    } catch (error) {
      console.error('Upload photo error:', error);
      
      // Yüklenen dosyayı sil
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({ message: 'Sunucu hatası' });
    }
  }
];

exports.getPhotosByReport = async (req, res) => {
  try {
    const reportId = req.params.reportId;
    
    // Rapor var mı kontrol et
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Rapor bulunamadı' });
    }
    
    // Rapora erişim izni var mı kontrol et
    const isOwner = report.created_by === req.user.id;
    const property = await Property.findById(report.property_id);
    const hasPropertyAccess = property && property.user_id === req.user.id;
    
    if (!isOwner && !hasPropertyAccess) {
      return res.status(403).json({ message: 'Bu raporun fotoğraflarına erişim izniniz yok' });
    }
    
    // Rapora ait fotoğrafları getir
    const photos = await Photo.findByReportId(reportId);
    
      // Debug için bağlantı bilgilerini yazdır
      console.log(`[Debug] Report ${reportId} için fotoğraf listesi döndürülüyor`);
      console.log(`[Debug] Protocol: ${req.protocol}, Host: ${req.get('host')}`);
      console.log(`[Debug] X-Forwarded headers:`, req.headers['x-forwarded-proto'], req.headers['x-forwarded-host']);
      
      // URL'den ziyade file_path + url alanı döndür - bu frontend'de daha esnek bir şekilde işlenebilir
      const photosWithPaths = photos.map(photo => {
        // Fotoğraf bilgilerini döndür
        return {
          ...photo,
          file_path: photo.file_path, // file_path'i açıkça döndür
          url: `/uploads/${photo.file_path}` // Göreceli URL döndür
        };
      });
      
      res.json(photosWithPaths);
  } catch (error) {
    console.error('Get photos by report error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.getPhotoById = async (req, res) => {
  try {
    const photoId = req.params.id;
    
    // Fotoğraf bilgilerini getir
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({ message: 'Fotoğraf bulunamadı' });
    }
    
    // Fotoğrafın ait olduğu raporu ve erişim izni kontrol et
    const report = await Report.findById(photo.report_id);
    const isReportOwner = report.created_by === req.user.id;
    const property = await Property.findById(report.property_id);
    const hasPropertyAccess = property && property.user_id === req.user.id;
    
    if (!isReportOwner && !hasPropertyAccess) {
      return res.status(403).json({ message: 'Bu fotoğrafa erişim izniniz yok' });
    }
    
    // Fotoğraf URL'i oluştur - daha güvenilir bir yöntem kullanalım
    // Önce istek protokolü ve host bilgisini kontrol edelim
    let protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    let host = req.headers['x-forwarded-host'] || req.get('host') || 'localhost:5050';
    
    // Canlı ortamda sabit değerleri kullanmayı tercih edebiliriz
    if (process.env.NODE_ENV === 'production') {
      protocol = 'https';
      host = 'api.depositshield.retako.com';
    }
    
    photo.url = `/uploads/${photo.file_path}`;  // Sadece path döndürürken frontend tarafında baseUrl ile birleştirilecek
    
    res.json(photo);
  } catch (error) {
    console.error('Get photo by id error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.updatePhotoNote = async (req, res) => {
  try {
    // Validasyon hataları kontrolü
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const photoId = req.params.id;
    const { note } = req.body;
    
    // Fotoğraf bilgilerini getir
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({ message: 'Fotoğraf bulunamadı' });
    }
    
    // Fotoğrafın ait olduğu raporu ve yetki kontrolü
    const report = await Report.findById(photo.report_id);
    const isReportOwner = report.created_by === req.user.id;
    
    if (!isReportOwner) {
      return res.status(403).json({ message: 'Bu fotoğrafı düzenleme izniniz yok' });
    }
    
    // Fotoğraf notunu güncelle
    const updated = await Photo.updateNote(photoId, note);
    
    if (!updated) {
      return res.status(400).json({ message: 'Fotoğraf notu güncellenemedi' });
    }
    
    // Güncellenmiş fotoğraf bilgilerini getir
    const updatedPhoto = await Photo.findById(photoId);
    
    // Fotoğraf URL'i oluştur - daha güvenilir bir yöntem kullanalım
    // Önce istek protokolü ve host bilgisini kontrol edelim
    let protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    let host = req.headers['x-forwarded-host'] || req.get('host') || 'localhost:5050';
    
    // Canlı ortamda sabit değerleri kullanmayı tercih edebiliriz
    if (process.env.NODE_ENV === 'production') {
      protocol = 'https';
      host = 'api.depositshield.retako.com';
    }
    
    updatedPhoto.url = `/uploads/${updatedPhoto.file_path}`;  // Sadece path döndürürken frontend tarafında baseUrl ile birleştirilecek
    
    res.json({
      message: 'Fotoğraf notu başarıyla güncellendi',
      photo: updatedPhoto
    });
  } catch (error) {
    console.error('Update photo note error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.addPhotoTag = async (req, res) => {
  try {
    // Validasyon hataları kontrolü
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const photoId = req.params.id;
    const { tag } = req.body;
    
    // Fotoğraf bilgilerini getir
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({ message: 'Fotoğraf bulunamadı' });
    }
    
    // Fotoğrafın ait olduğu raporu ve yetki kontrolü
    const report = await Report.findById(photo.report_id);
    const isReportOwner = report.created_by === req.user.id;
    
    if (!isReportOwner) {
      return res.status(403).json({ message: 'Bu fotoğrafa etiket ekleme izniniz yok' });
    }
    
    // Fotoğrafa etiket ekle
    await Photo.addTag(photoId, tag);
    
    // Güncellenmiş fotoğraf bilgilerini getir
    const updatedPhoto = await Photo.findById(photoId);
    
    // Fotoğraf URL'i oluştur
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    updatedPhoto.url = `${baseUrl}/uploads/${updatedPhoto.file_path}`;
    
    res.json({
      message: 'Etiket başarıyla eklendi',
      photo: updatedPhoto
    });
  } catch (error) {
    console.error('Add photo tag error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.removePhotoTag = async (req, res) => {
  try {
    const photoId = req.params.id;
    const tag = req.params.tag;
    
    // Fotoğraf bilgilerini getir
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({ message: 'Fotoğraf bulunamadı' });
    }
    
    // Fotoğrafın ait olduğu raporu ve yetki kontrolü
    const report = await Report.findById(photo.report_id);
    const isReportOwner = report.created_by === req.user.id;
    
    if (!isReportOwner) {
      return res.status(403).json({ message: 'Bu fotoğraftan etiket silme izniniz yok' });
    }
    
    // Fotoğraftan etiket sil
    const removed = await Photo.removeTag(photoId, tag);
    
    if (!removed) {
      return res.status(400).json({ message: 'Etiket silinemedi veya bulunamadı' });
    }
    
    // Güncellenmiş fotoğraf bilgilerini getir
    const updatedPhoto = await Photo.findById(photoId);
    
    // Fotoğraf URL'i oluştur
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    updatedPhoto.url = `${baseUrl}/uploads/${updatedPhoto.file_path}`;
    
    res.json({
      message: 'Etiket başarıyla silindi',
      photo: updatedPhoto
    });
  } catch (error) {
    console.error('Remove photo tag error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.deletePhoto = async (req, res) => {
  try {
    const photoId = req.params.id;
    
    // Fotoğraf bilgilerini getir
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({ message: 'Fotoğraf bulunamadı' });
    }
    
    // Fotoğrafın ait olduğu raporu ve yetki kontrolü
    const report = await Report.findById(photo.report_id);
    const isReportOwner = report.created_by === req.user.id;
    
    if (!isReportOwner) {
      return res.status(403).json({ message: 'Bu fotoğrafı silme izniniz yok' });
    }
    
    // Dosyayı diskten sil
    const filePath = path.join(__dirname, '../uploads', photo.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Fotoğrafı veritabanından sil
    const deleted = await Photo.delete(photoId);
    
    if (!deleted) {
      return res.status(400).json({ message: 'Fotoğraf silinemedi' });
    }
    
    res.json({ message: 'Fotoğraf başarıyla silindi' });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};