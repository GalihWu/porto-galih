require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static Files (Frontend UI, Assets, Uploads)
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api', apiRoutes);
app.use('/api/admin', adminRoutes);

// Frontend Page Routing
// 1. Project Detail Page clean URL: /project/:idOrSlug
app.get('/project/:idOrSlug', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'project.html'));
});

// 2. Admin Page clean URL: /admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// 3. Public Home: /
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan internal pada server.',
    error: err.message
  });
});

// Start Server (only if run directly, not when imported as a serverless function)
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Portfolio CMS Server berjalan di port: ${PORT}`);
    console.log(`🌐 Public Profile: http://localhost:${PORT}/`);
    console.log(`💼 Project Detail Demo: http://localhost:${PORT}/project/beramalbersama-platform-donasi`);
    console.log(`⚙️  Admin Panel CMS: http://localhost:${PORT}/admin`);
    console.log(`📁 Local Data Storage: ./data/profile.json`);
    console.log(`====================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n⚠️  Port ${PORT} sedang digunakan oleh proses lain.`);
      console.error(`👉 Untuk mematikan proses yang menggunakan port ${PORT}, jalankan:`);
      console.error(`   lsof -ti :${PORT} | xargs kill -9`);
      console.error(`👉 Atau ubah PORT di file .env (misalnya PORT=3001).\n`);
      process.exit(1);
    } else {
      throw err;
    }
  });
}

module.exports = app;
