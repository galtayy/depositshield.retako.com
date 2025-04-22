const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Kayıt olma endpoint'i
router.post(
  '/register',
  [
    check('name', 'Ad Soyad gereklidir').not().isEmpty(),
    check('email', 'Geçerli bir e-posta giriniz').isEmail(),
    check('password', 'Şifre en az 6 karakter olmalıdır').isLength({ min: 6 })
  ],
  authController.register
);

// Giriş endpoint'i
router.post(
  '/login',
  [
    check('email', 'Geçerli bir e-posta giriniz').isEmail(),
    check('password', 'Şifre gereklidir').exists()
  ],
  authController.login
);

// Kullanıcı bilgileri endpoint'i (token gerekli)
router.get('/user', authMiddleware, authController.getUser);

module.exports = router;
