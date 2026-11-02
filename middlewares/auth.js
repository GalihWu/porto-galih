const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_neo_brutalist_jwt_key_2026_galih';

function requireAuth(req, res, next) {
  // Ambil token dari cookie atau Authorization header
  let token = req.cookies?.admin_token;

  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Silakan login sebagai admin terlebih dahulu.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Sesi login telah kedaluwarsa atau tidak valid. Silakan login ulang.'
    });
  }
}

module.exports = {
  requireAuth,
  JWT_SECRET
};
