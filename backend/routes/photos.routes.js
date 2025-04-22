const express = require('express');
const { check } = require('express-validator');
const photoController = require('../controllers/photo.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Tüm fotoğraf route'ları için auth middleware
router.use(authMiddleware);

// Fotoğraf yükleme endpoint'i
router.post('/upload/:reportId', photoController.uploadPhoto);

// Rapora ait tüm fotoğrafları getirme endpoint'i
router.get('/report/:reportId', photoController.getPhotosByReport);

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
