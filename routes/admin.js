const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { requireAuth, JWT_SECRET } = require('../middlewares/auth');
const { saveProfileDataSafely, restoreFromBackup, readProfileData } = require('../utils/storage');
const { validateProfileSchema } = require('../utils/validator');

// Konfigurasi Multer untuk Upload Media Lokal
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Sanitasi nama file dan tambahkan timestamp agar unik
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = path.extname(cleanName);
    const base = path.basename(cleanName, ext);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e4);
    cb(null, `${base}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'application/pdf'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipe file tidak didukung. Harap upload gambar (JPG, PNG, WebP, SVG) atau PDF.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Maksimal 10 MB
  fileFilter: fileFilter
});

/**
 * POST /api/admin/login
 * Autentikasi sesi admin
 */
router.post('/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Password wajib diisi.'
    });
  }

  if (password !== adminPassword) {
    return res.status(401).json({
      success: false,
      message: 'Password admin salah. Silakan coba lagi.'
    });
  }

  // Buat JWT Token
  const token = jwt.sign(
    { role: 'admin', authenticatedAt: Date.now() },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Set HttpOnly Cookie
  res.cookie('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 Hari
  });

  return res.json({
    success: true,
    message: 'Login berhasil.',
    token // disertakan juga jika client ingin menyimpan di memory / local
  });
});

/**
 * POST /api/admin/logout
 * Menghapus sesi admin
 */
router.post('/logout', (req, res) => {
  res.clearCookie('admin_token');
  res.json({
    success: true,
    message: 'Logout berhasil. Sesi admin telah dihapus.'
  });
});

/**
 * GET /api/admin/check-auth
 * Memeriksa status login admin
 */
router.get('/check-auth', requireAuth, (req, res) => {
  res.json({
    success: true,
    authenticated: true,
    admin: req.admin
  });
});

/**
 * PUT /api/admin/profile
 * Menyimpan pembaruan data ke profile.json dengan mekanisme Safe-Save
 */
router.put('/profile', requireAuth, (req, res) => {
  try {
    const newData = req.body;

    // 1. Validasi Schema
    const validation = validateProfileSchema(newData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validasi skema data gagal.',
        errors: validation.errors
      });
    }

    // 2. Safe-Save (Backup otomatis + Atomic Write)
    const result = saveProfileDataSafely(newData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
        isServerless: result.isServerless
      });
    }

    return res.json({
      success: true,
      message: result.message,
      backupCreated: result.backupCreated,
      timestamp: result.timestamp
    });
  } catch (error) {
    console.error('Error saat menyimpan profil:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan sistem saat menyimpan ke disk.',
      error: error.message
    });
  }
});

/**
 * POST /api/admin/upload
 * Upload gambar / file ke public/uploads/
 */
router.post('/upload', requireAuth, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada file yang diunggah.'
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    return res.json({
      success: true,
      message: 'File berhasil diunggah.',
      file_url: fileUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  });
});

/**
 * POST /api/admin/restore-backup
 * Mengembalikan data profile dari profile.backup.json
 */
router.post('/restore-backup', requireAuth, (req, res) => {
  try {
    const result = restoreFromBackup();
    const data = readProfileData();
    return res.json({
      success: true,
      message: result.message,
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
