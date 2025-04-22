const express = require('express');
const { check } = require('express-validator');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Tüm kullanıcı route'ları için auth middleware
router.use(authMiddleware);

// Profil bilgisi endpoint'i
router.get('/profile', userController.getProfile);

// Profil güncelleme endpoint'i
router.put(
  '/profile',
  [
    check('name', 'Ad Soyad gereklidir').not().isEmpty(),
    check('email', 'Geçerli bir e-posta giriniz').isEmail()
  ],
  userController.updateProfile
);

// Şifre değiştirme endpoint'i
router.put(
  '/password',
  [
    check('currentPassword', 'Mevcut şifre gereklidir').not().isEmpty(),
    check('newPassword', 'Yeni şifre en az 6 karakter olmalıdır').isLength({ min: 6 })
  ],
  userController.changePassword
);

module.exports = router;
