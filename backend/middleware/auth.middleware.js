const jwt = require('jsonwebtoken');

// JWT token doğrulama middleware
module.exports = (req, res, next) => {
  try {
    // Token Authorization header'dan al
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Yetkilendirme başarısız: Token bulunamadı' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Yetkilendirme başarısız: Token bulunamadı' });
    }
    
    // Token doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Kullanıcı bilgilerini request nesnesine ekle
    req.user = decoded.user;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Yetkilendirme başarısız: Token süresi doldu' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Yetkilendirme başarısız: Geçersiz token' });
    }
    
    res.status(401).json({ message: 'Yetkilendirme başarısız' });
  }
};
