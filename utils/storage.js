const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const PROFILE_FILE = path.join(DATA_DIR, 'profile.json');
const BACKUP_FILE = path.join(DATA_DIR, 'profile.backup.json');
const TMP_FILE = path.join(DATA_DIR, 'profile.tmp.json');

/**
 * Membaca data profile.json
 */
function readProfileData() {
  if (!fs.existsSync(PROFILE_FILE)) {
    throw new Error('File data profile.json tidak ditemukan.');
  }
  const raw = fs.readFileSync(PROFILE_FILE, 'utf-8');
  return JSON.parse(raw);
}

/**
 * Menyimpan data profile secara atomik dengan backup otomatis
 * @param {object} newData - Data baru yang sudah lolos validasi
 * @returns {object} status & metadata penyimpanan
 */
function saveProfileDataSafely(newData) {
  // Pastikan folder data tersedia
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // 1. Buat Backup Otomatis dari file profile.json saat ini
  let backupCreated = false;
  if (fs.existsSync(PROFILE_FILE)) {
    try {
      fs.copyFileSync(PROFILE_FILE, BACKUP_FILE);
      backupCreated = true;
    } catch (err) {
      console.error('Gagal membuat backup otomatis:', err);
    }
  }

  // 2. Tulis data ke file temporer terlebih dahulu
  const serialized = JSON.stringify(newData, null, 2);
  fs.writeFileSync(TMP_FILE, serialized, 'utf-8');

  // 3. Lakukan rename atomik dari TMP ke PROFILE_FILE
  fs.renameSync(TMP_FILE, PROFILE_FILE);

  return {
    success: true,
    message: 'Data berhasil disimpan secara aman dengan atomic write.',
    backupCreated,
    timestamp: new Date().toISOString()
  };
}

/**
 * Mengembalikan data dari profile.backup.json jika tersedia
 */
function restoreFromBackup() {
  if (!fs.existsSync(BACKUP_FILE)) {
    throw new Error('Tidak ada file backup (profile.backup.json) yang tersedia untuk di-restore.');
  }
  const backupData = fs.readFileSync(BACKUP_FILE, 'utf-8');
  // Validasi JSON
  JSON.parse(backupData);

  // Restore
  fs.copyFileSync(BACKUP_FILE, PROFILE_FILE);
  return {
    success: true,
    message: 'Data profil berhasil di-restore dari profile.backup.json',
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  readProfileData,
  saveProfileDataSafely,
  restoreFromBackup,
  DATA_DIR,
  PROFILE_FILE,
  BACKUP_FILE
};
