const express = require('express');
const { check } = require('express-validator');
const propertyController = require('../controllers/property.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Tüm mülk route'ları için auth middleware
router.use(authMiddleware);

// Mülk oluşturma endpoint'i
router.post(
  '/',
  [
    check('address', 'Mülk adresi gereklidir').not().isEmpty(),
    check('description', 'Mülk açıklaması gereklidir').not().isEmpty(),
    check('role_at_this_property', 'Mülkteki rol gereklidir').isIn(['landlord', 'renter', 'other'])
  ],
  propertyController.createProperty
);

// Kullanıcının tüm mülklerini getirme endpoint'i
router.get('/', propertyController.getAllProperties);

// Mülk detaylarını getirme endpoint'i
router.get('/:id', propertyController.getPropertyById);

// Mülk güncelleme endpoint'i
router.put(
  '/:id',
  [
    check('address', 'Mülk adresi gereklidir').not().isEmpty(),
    check('description', 'Mülk açıklaması gereklidir').not().isEmpty(),
    // Eğer _basic_property_update flag'i varsa, role_at_this_property kontrolünü atla
    check('role_at_this_property', 'Mülkteki rol gereklidir')
      .if((value, { req }) => !req.body._basic_property_update) // Sadece basic update OLMADIĞINDA kontrol et
      .isIn(['landlord', 'renter', 'other'])
  ],
  propertyController.updateProperty
);

// Mülk silme endpoint'i
router.delete('/:id', propertyController.deleteProperty);

// Mülke ait tüm raporları getirme endpoint'i
router.get('/:id/reports', propertyController.getPropertyReports);

// Mülk sahibi iletişim bilgilerini güncelleme endpoint'i
router.post(
  '/:id/landlord',
  [
    check('email', 'Geçerli bir e-posta adresi gereklidir').optional().isEmail(),
    check('phone', 'Geçerli bir telefon numarası gereklidir').optional()
  ],
  propertyController.saveLandlordDetails
);

// Oda bilgilerini kaydetme endpoint'i
router.post(
  '/:id/rooms',
  [
    check('rooms', 'Oda bilgileri gereklidir').isArray()
  ],
  propertyController.saveRooms
);

// Oda bilgilerini getirme endpoint'i
router.get('/:id/rooms', propertyController.getRooms);

// Oda silme endpoint'i
router.delete('/:id/rooms/:roomId', propertyController.deleteRoom);

module.exports = router;
