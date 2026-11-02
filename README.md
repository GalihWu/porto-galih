# ⚡ Portofolio & Admin Panel CMS - Galih Wahyu Utomo
> Aplikasi Web Portofolio & Mini-CMS Modern bergaya **Neo-Brutalism** (referensi: [donialvian.vercel.app](https://donialvian.vercel.app/)) dengan penyimpanan lokal berbasis file JSON (*Zero external database*).

---

## 🌟 Fitur Utama

1. **Public Profile View (`/`)**:
   - Menampilkan profil dinamis yang di-hydrate langsung dari file lokal `data/profile.json`.
   - Gaya visual **Neo-Brutalism**: Border tebal hitam, hard offset shadow (`box-shadow: 4px 4px 0px #000`), aksen kuning kenari (`#FFD028`), coral (`#FF6B6B`), dan mint (`#4ECDC4`).
   - Struktur HTML5 Semantik (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`).
   - Dilengkapi foto profil asli Galih Wahyu Utomo dengan frame brutalist dan animasi floating badge.

2. **Dedicated Project Detail Page (`/project/:slug`)**:
   - Halaman khusus untuk setiap proyek portofolio dengan rincian studi kasus (*case study* mendalam):
     - Latar belakang & peran kerja
     - Tantangan rekayasa teknis & solusi implementasi
     - Metrik terukur (Skor Google Lighthouse 99, LCP < 0.9s, 60 FPS konstan, bundle size)
     - Tech stack badges, live demo link, dan repository GitHub
     - Navigasi antar proyek (Sebelumnya / Selanjutnya)

3. **Admin Panel CMS (`/admin`)**:
   - **Autentikasi Terproteksi**: Login dengan kata sandi admin (dikelola via `.env`), sesi disimpan dalam secure `HttpOnly` cookie.
   - **Form Editor Dinamis Berbasis Tab**:
     - *General Info* (Nama, gelar, bio, kontak, status kerja, foto avatar)
     - *Media Sosial* (Array CRUD)
     - *Tentang & Skills* (Long bio, link download CV/Resume, grup kategori skill)
     - *Pengalaman Kerja* (Array CRUD: posisi, instansi, periode, deskripsi)
     - *Pendidikan & Pelatihan* (Array CRUD: institusi, gelar, periode, IPK)
     - *Portofolio & Detail Case Study* (Array CRUD lengkap dengan editor studi kasus)
     - *Layanan* (Array CRUD)
   - **CRUD Dinamis & Reordering**: Tambah item baru, edit secara langsung, hapus item, dan atur urutan posisi (Naik ▲ / Turun ▼).
   - **Media Upload Lokal**: Upload file gambar (avatar, banner proyek) atau PDF (CV) yang disimpan langsung ke folder `public/uploads/`.
   - **Mekanisme Simpan Aman (*Safe-Save*)**:
     - Validasi skema runtime sebelum disimpan ke disk.
     - Pencadangan otomatis (*auto-backup*) ke `data/profile.backup.json` sebelum penulisan baru.
     - Penulisan atomik (*atomic file write*) via temporary swap untuk mencegah data korup.
     - Fitur **Restore Backup** langsung dari dashboard admin.
   - **Flash Toast Notification**: Pemberitahuan interaktif saat data berhasil disimpan atau gagal.

---

## 🚀 Cara Menjalankan Aplikasi

### 1. Prasyarat
- Node.js versi 18+ (Rekomendasi v20 ke atas)
- npm

### 2. Instalasi Dependensi
```bash
cd "/Users/digibiz/Documents/my drive/Project with AI/portfolio-cms"
npm install
```

### 3. Konfigurasi Lingkungan (`.env`)
File `.env` sudah dikonfigurasikan secara default:
```env
PORT=3000
ADMIN_PASSWORD=admin123
JWT_SECRET=supersecret_neo_brutalist_jwt_key_2026_galih
NODE_ENV=development
```
*(Anda dapat mengubah `ADMIN_PASSWORD` sewaktu-waktu sesuai keinginan).*

### 4. Menjalankan Server
```bash
# Mode development dengan auto-reload (watch mode)
npm run dev

# Atau mode produksi biasa
npm start
```

Buka peramban (browser) di:
- **Halaman Web Publik**: [http://localhost:3000/](http://localhost:3000/)
- **Halaman Detail Proyek**: [http://localhost:3000/project/oceanpulse-web-performance-engine](http://localhost:3000/project/oceanpulse-web-performance-engine)
- **Halaman Admin Panel CMS**: [http://localhost:3000/admin](http://localhost:3000/admin) (Password: `admin123`)

---

## 📁 Struktur Direktori

```
portfolio-cms/
├── .env                       # Variabel environment (Port, Password, Secret)
├── .env.example               # Template environment
├── package.json               # Konfigurasi dependensi
├── server.js                  # Entry point Express.js
├── data/
│   ├── profile.json           # Single Source of Truth data profil
│   └── profile.backup.json    # File pencadangan otomatis (Safe-Save)
├── middlewares/
│   └── auth.js                # Proteksi middleware JWT / cookie
├── routes/
│   ├── api.js                 # Endpoint publik (/api/profile, /api/profile/projects/:idOrSlug)
│   └── admin.js               # Endpoint CMS (login, logout, update, upload, restore)
├── utils/
│   ├── storage.js             # Engine atomic write, read, dan auto-backup
│   └── validator.js           # Validasi skema runtime profile
└── public/
    ├── index.html             # Tampilan utama web portofolio publik
    ├── project.html           # Tampilan detail studi kasus proyek
    ├── admin.html             # Tampilan panel admin CMS interaktif
    ├── css/
    │   └── style.css          # Desain sistem & utilitas Neo-Brutalism
    ├── js/
    │   ├── main.js            # Renderer DOM portofolio publik
    │   ├── project-detail.js  # Renderer DOM detail studi kasus
    │   └── admin.js           # Controller state & CRUD panel CMS
    └── uploads/               # Direktori penyimpanan media lokal
        ├── galih_photo.jpg    # Foto profil asli Galih Wahyu Utomo
        ├── proj_oceanpulse.svg
        ├── proj_abyssal.svg
        ├── proj_astronexus.svg
        └── proj_aquaui.svg
```

---

## 📡 Spesifikasi API Endpoints

| Metode | URL | Keterangan | Autentikasi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/profile` | Mengambil seluruh data profil publik | Publik |
| `GET` | `/api/profile/projects/:idOrSlug` | Mengambil rincian spesifik satu proyek | Publik |
| `POST` | `/api/admin/login` | Login admin (menerima `{ password }`) | Publik |
| `POST` | `/api/admin/logout` | Menghapus sesi admin dan membersihkan cookie | Auth |
| `GET` | `/api/admin/check-auth` | Memeriksa status login sesi admin saat ini | Auth |
| `PUT` | `/api/admin/profile` | Menyimpan perubahan ke `profile.json` (Atomic Safe-Save) | Auth |
| `POST` | `/api/admin/upload` | Upload file lokal ke `public/uploads/` | Auth |
| `POST` | `/api/admin/restore-backup` | Memulihkan data dari `profile.backup.json` | Auth |
