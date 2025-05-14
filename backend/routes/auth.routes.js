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
    check('password', 'Şifre 8-16 karakter arasında olmalı ve en az bir büyük harf, bir küçük harf ve bir rakam içermelidir')
      .isLength({ min: 8, max: 16 })
      .matches(/[A-Z]/).withMessage('Şifre en az bir büyük harf içermelidir')
      .matches(/[a-z]/).withMessage('Şifre en az bir küçük harf içermelidir')
      .matches(/[0-9]/).withMessage('Şifre en az bir rakam içermelidir')
  ],
  authController.register
);

// Email doğrulama endpoint'i
router.post(
  '/verify-email',
  [
    check('userId', 'User ID gereklidir').not().isEmpty(),
    check('code', 'Doğrulama kodu gereklidir').isLength({ min: 4, max: 4 })
  ],
  authController.verifyEmail
);

// Doğrulama kodu yeniden gönderme endpoint'i
router.post(
  '/resend-verification-code',
  [
    check('userId', 'User ID gereklidir').not().isEmpty()
  ],
  authController.resendVerificationCode
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

// Şifre sıfırlama endpoints'leri
// Email kontrolü
router.post(
  '/check-email',
  [
    check('email', 'Geçerli bir e-posta giriniz').isEmail()
  ],
  authController.checkEmail
);

// Şifre sıfırlama isteği
router.post(
  '/request-password-reset',
  [
    check('email', 'Geçerli bir e-posta giriniz').isEmail()
  ],
  authController.requestPasswordReset
);

// Şifre sıfırlama kodu doğrulama
router.post(
  '/verify-reset-code',
  [
    check('email', 'Geçerli bir e-posta giriniz').isEmail(),
    check('verificationCode', 'Doğrulama kodu gereklidir').isLength({ min: 4, max: 4 })
  ],
  authController.verifyResetCode
);

// Şifre sıfırlama
router.post(
  '/reset-password',
  [
    check('email', 'Geçerli bir e-posta giriniz').isEmail(),
    check('token', 'Token gereklidir').not().isEmpty(),
    check('newPassword', 'Şifre 8-16 karakter arasında olmalı ve en az bir büyük harf, bir küçük harf ve bir rakam içermelidir')
      .isLength({ min: 8, max: 16 })
      .matches(/[A-Z]/).withMessage('Şifre en az bir büyük harf içermelidir')
      .matches(/[a-z]/).withMessage('Şifre en az bir küçük harf içermelidir')
      .matches(/[0-9]/).withMessage('Şifre en az bir rakam içermelidir')
  ],
  authController.resetPassword
);

module.exports = router;
