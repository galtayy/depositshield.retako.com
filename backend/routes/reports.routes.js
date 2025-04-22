const express = require('express');
const { check } = require('express-validator');
const reportController = require('../controllers/report.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Tüm rapor route'ları için auth middleware (UUID endpoint hariç)
router.use(authMiddleware);

// Rapor oluşturma endpoint'i
router.post(
  '/',
  [
    check('property_id', 'Mülk ID gereklidir').isInt({ min: 1 }),
    check('title', 'Rapor başlığı gereklidir').not().isEmpty(),
    check('type', 'Geçerli bir rapor türü gereklidir').isIn(['move-in', 'move-out', 'general'])
  ],
  reportController.createReport
);

// Kullanıcının tüm raporlarını getirme endpoint'i
router.get('/', reportController.getAllReports);

// Rapor detaylarını getirme endpoint'i
router.get('/:id', reportController.getReportById);

// UUID ile rapor getirme endpoint'i (auth middleware kullanmıyor)
router.get('/uuid/:uuid', reportController.getReportByUuid);

// Mülke ait tüm raporları getirme endpoint'i
router.get('/property/:propertyId', reportController.getReportsByProperty);

// Rapor güncelleme endpoint'i
router.put(
  '/:id',
  [
    check('title', 'Rapor başlığı gereklidir').not().isEmpty(),
    check('type', 'Geçerli bir rapor türü gereklidir').isIn(['move-in', 'move-out', 'general'])
  ],
  reportController.updateReport
);

// Rapor silme endpoint'i
router.delete('/:id', reportController.deleteReport);

module.exports = router;
