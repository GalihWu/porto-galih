const express = require('express');
const router = express.Router();
const { readProfileData } = require('../utils/storage');

/**
 * GET /api/profile
 * Mengambil seluruh data profil publik dari data/profile.json
 */
router.get('/profile', (req, res) => {
  try {
    const data = readProfileData();
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error membaca data profil:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal membaca data profil lokal.',
      error: error.message
    });
  }
});

/**
 * GET /api/profile/projects/:idOrSlug
 * Mengambil detail lengkap proyek berdasarkan ID atau slug untuk Halaman Detail Proyek
 */
router.get('/profile/projects/:idOrSlug', (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const data = readProfileData();
    const projects = data.projects || [];

    const project = projects.find(p => p.id === idOrSlug || p.slug === idOrSlug);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Proyek dengan id/slug '${idOrSlug}' tidak ditemukan.`
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error mengambil detail proyek:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail proyek.',
      error: error.message
    });
  }
});

module.exports = router;
