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
    check('role_at_this_property', 'Mülkteki rol gereklidir').isIn(['landlord', 'renter', 'other'])
  ],
  propertyController.updateProperty
);

// Mülk silme endpoint'i
router.delete('/:id', propertyController.deleteProperty);

// Mülke ait tüm raporları getirme endpoint'i
router.get('/:id/reports', propertyController.getPropertyReports);

module.exports = router;
