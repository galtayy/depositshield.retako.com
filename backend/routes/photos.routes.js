const express = require('express');
const { check } = require('express-validator');
const photoController = require('../controllers/photo.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Kimlik doğrulama gerektirmeyen public routelar
// Hem dosya erişimi hem de rapor fotoğrafları listesi için public erişim
router.get('/public-access/:filename', photoController.getPublicPhoto);
router.get('/public-report/:reportId', photoController.getPublicReportPhotos);

// Tüm diğer fotoğraf route'ları için auth middleware
router.use(authMiddleware);

// Fotoğraf yükleme endpoint'i - rapor için
router.post('/upload/:reportId', photoController.uploadPhoto);

// Fotoğraf yükleme endpoint'i - oda için
router.post('/upload-room/:propertyId/:roomId', photoController.uploadRoomPhoto);

// Rapora ait tüm fotoğrafları getirme endpoint'i
// NOT: Bu endpoint kimlik doğrulama gerektirir
router.get('/report/:reportId', photoController.getPhotosByReport);

// Odaya ait tüm fotoğrafları getirme endpoint'i
router.get('/room/:propertyId/:roomId', photoController.getRoomPhotos);

// Mülke ait tüm fotoğrafları getirme endpoint'i
router.get('/property/:propertyId', photoController.getPropertyPhotos);

// Fotoğraf detaylarını getirme endpoint'i
router.get('/:id', photoController.getPhotoById);

// Fotoğraf notu güncelleme endpoint'i
router.put(
  '/:id/note',
  [
    check('note', 'Not gereklidir').not().isEmpty()
  ],
  photoController.updatePhotoNote
);

// Fotoğrafa etiket ekleme endpoint'i
router.post(
  '/:id/tags',
  [
    check('tag', 'Etiket gereklidir').not().isEmpty()
  ],
  photoController.addPhotoTag
);

// Fotoğraftan etiket silme endpoint'i
router.delete('/:id/tags/:tag', photoController.removePhotoTag);

// Fotoğraf silme endpoint'i
router.delete('/:id', photoController.deletePhoto);

module.exports = router;
