const { validationResult } = require('express-validator');
const User = require('../models/user.model');

exports.getProfile = async (req, res) => {
  try {
    // Kullanıcı ID'si JWT middleware'den alınır
    const userId = req.user.id;
    
    // Kullanıcı bilgilerini getir
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Şifre hariç kullanıcı bilgilerini gönder
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    // Validasyon hataları kontrolü
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const userId = req.user.id;
    const { name, email } = req.body;
    
    // Email kullanımda mı kontrol et
    if (email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanılıyor' });
      }
    }
    
    // Kullanıcı bilgilerini güncelle
    const updated = await User.update(userId, { name, email });
    
    if (!updated) {
      return res.status(400).json({ message: 'Profil güncellenemedi' });
    }
    
    // Güncellenmiş kullanıcı bilgilerini getir
    const user = await User.findById(userId);
    
    res.json({
      message: 'Profil başarıyla güncellendi',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    // Validasyon hataları kontrolü
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    // Kullanıcı bilgilerini getir
    const user = await User.findByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Mevcut şifreyi doğrula
    const isMatch = await User.verifyPassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mevcut şifre yanlış' });
    }
    
    // Yeni şifre mevcut şifreyle aynı olmamalı
    const isSamePassword = await User.verifyPassword(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: 'Yeni şifre mevcut şifreyle aynı olamaz' });
    }
    
    // Şifreyi güncelle
    const updated = await User.updatePassword(userId, newPassword);
    
    if (!updated) {
      return res.status(400).json({ message: 'Şifre değiştirilemedi' });
    }
    
    res.json({ message: 'Şifre başarıyla değiştirildi' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};
