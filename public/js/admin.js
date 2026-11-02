/**
 * admin.js - Interactive Admin CMS Controller
 */

let profileState = null;
let activeTab = 'general';

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  setupGlobalListeners();
});

// ==========================================
// 1. AUTHENTICATION & SESSION MANAGEMENT
// ==========================================
function initAuth() {
  const loginForm = document.getElementById('login-form');
  const logoutBtn = document.getElementById('btn-logout');

  // Cek apakah sudah login
  checkAuthStatus();

  // Login handler
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const password = document.getElementById('login-password').value;
      const errorDiv = document.getElementById('login-error');
      const submitBtn = document.getElementById('login-submit-btn');

      errorDiv.classList.add('hidden');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Memverifikasi...';

      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Login gagal.');
        }

        // Login sukses
        showToast('Login Berhasil', 'Selamat datang di Admin CMS Portofolio.', 'success');
        document.getElementById('login-modal').classList.add('hidden');
        document.getElementById('admin-app').classList.remove('hidden');
        loadAdminProfileData();
      } catch (err) {
        errorDiv.textContent = err.message;
        errorDiv.classList.remove('hidden');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Masuk ke CMS Admin';
      }
    });
  }

  // Logout handler
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (!confirm('Apakah Anda yakin ingin keluar dari Admin CMS?')) return;
      try {
        await fetch('/api/admin/logout', { method: 'POST' });
        window.location.reload();
      } catch (err) {
        console.error('Logout error:', err);
      }
    });
  }
}

async function checkAuthStatus() {
  try {
    const res = await fetch('/api/admin/check-auth');
    if (res.ok) {
      document.getElementById('login-modal').classList.add('hidden');
      document.getElementById('admin-app').classList.remove('hidden');
      loadAdminProfileData();
    } else {
      document.getElementById('login-modal').classList.remove('hidden');
      document.getElementById('admin-app').classList.add('hidden');
    }
  } catch (err) {
    document.getElementById('login-modal').classList.remove('hidden');
    document.getElementById('admin-app').classList.add('hidden');
  }
}

// ==========================================
// 2. DATA LOADING & POPULATION
// ==========================================
async function loadAdminProfileData() {
  try {
    const res = await fetch('/api/profile');
    if (!res.ok) throw new Error('Gagal membaca profile.json');
    const json = await res.json();
    profileState = json.data;

    populateAllSections();
  } catch (err) {
    showToast('Gagal Memuat Data', err.message, 'error');
  }
}

function populateAllSections() {
  if (!profileState) return;

  // 1. General
  const gen = profileState.general || {};
  setValue('gen-name', gen.name);
  setValue('gen-title', gen.title);
  setValue('gen-email', gen.email);
  setValue('gen-phone', gen.phone);
  setValue('gen-location', gen.location);
  setValue('gen-availability', gen.availability);
  setValue('gen-bio', gen.bio);
  setValue('edit-avatar-url', gen.avatar_url || '/uploads/galih_photo.jpg');
  const avatarImg = document.getElementById('edit-avatar-preview');
  if (avatarImg) avatarImg.src = gen.avatar_url || '/uploads/galih_photo.jpg';

  // 2. About & CV
  const about = profileState.about || {};
  setValue('about-long-bio-input', about.long_bio);
  setValue('about-cv-url', about.cv_url || '');

  // 3. Render Arrays
  renderSocialsList();
  renderSkillsList();
  renderExperienceList();
  renderEducationList();
  renderProjectsList();
  renderServicesList();

  updateBadges();
}

function setValue(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || '';
}

function updateBadges() {
  if (!profileState) return;
  setBadge('badge-count-socials', (profileState.socials || []).length);
  setBadge('badge-count-experience', (profileState.experience || []).length);
  setBadge('badge-count-education', (profileState.education || []).length);
  setBadge('badge-count-projects', (profileState.projects || []).length);
  setBadge('badge-count-services', (profileState.services || []).length);
}

function setBadge(id, count) {
  const el = document.getElementById(id);
  if (el) el.textContent = count;
}

// ==========================================
// 3. TAB NAVIGATION
// ==========================================
function switchTab(tabId) {
  activeTab = tabId;
  const tabs = ['general', 'socials', 'about', 'experience', 'education', 'projects', 'services'];
  
  tabs.forEach(t => {
    const sec = document.getElementById(`sec-${t}`);
    const btn = document.getElementById(`tab-btn-${t}`);
    
    if (t === tabId) {
      if (sec) sec.classList.remove('hidden');
      if (btn) {
        btn.className = 'w-full text-left px-3 py-2.5 text-xs font-black uppercase border-2 border-black rounded-xl bg-[#FFD028] shadow-brutal-sm flex items-center justify-between transition-all';
      }
    } else {
      if (sec) sec.classList.add('hidden');
      if (btn) {
        btn.className = 'w-full text-left px-3 py-2.5 text-xs font-black uppercase border-2 border-black rounded-xl bg-white hover:bg-[#F4F0EA] flex items-center justify-between transition-all';
      }
    }
  });
}

// ==========================================
// 4. ARRAY CRUD RENDERERS & HANDLERS
// ==========================================

// --- SOCIALS ---
function renderSocialsList() {
  const container = document.getElementById('socials-list-container');
  if (!container || !profileState) return;

  const socials = profileState.socials || [];
  if (socials.length === 0) {
    container.innerHTML = '<p class="text-xs text-black/60 italic p-4 text-center">Belum ada akun sosial. Tambahkan baru di atas.</p>';
    return;
  }

  container.innerHTML = socials.map((soc, idx) => `
    <div class="border-2 border-black rounded-xl p-4 bg-[#F4F0EA] space-y-3">
      <div class="flex items-center justify-between">
        <span class="px-2 py-0.5 bg-[#FFD028] border border-black rounded text-[10px] font-black uppercase">
          #${idx + 1} • ${soc.platform || 'Platform'}
        </span>
        <div class="flex items-center gap-1.5">
          <button type="button" onclick="moveItem('socials', ${idx}, -1)" class="btn-brutal-sm bg-white text-xs flex items-center justify-center p-1.5" title="Naik"><iconify-icon icon="lucide:arrow-up" class="text-xs"></iconify-icon></button>
          <button type="button" onclick="moveItem('socials', ${idx}, 1)" class="btn-brutal-sm bg-white text-xs flex items-center justify-center p-1.5" title="Turun"><iconify-icon icon="lucide:arrow-down" class="text-xs"></iconify-icon></button>
          <button type="button" onclick="deleteItem('socials', ${idx})" class="btn-brutal-sm bg-red-500 text-white text-xs flex items-center gap-1" title="Hapus"><iconify-icon icon="lucide:trash-2" class="text-xs"></iconify-icon><span class="hidden sm:inline">Hapus</span></button>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label class="block text-[11px] font-black uppercase mb-1">Platform</label>
          <input type="text" value="${soc.platform || ''}" onchange="updateArrayField('socials', ${idx}, 'platform', this.value)" 
                 class="w-full px-2.5 py-1.5 text-xs border border-black rounded-lg bg-white font-medium">
        </div>
        <div class="md:col-span-2">
          <label class="block text-[11px] font-black uppercase mb-1">URL Profil</label>
          <input type="text" value="${soc.url || ''}" onchange="updateArrayField('socials', ${idx}, 'url', this.value)" 
                 class="w-full px-2.5 py-1.5 text-xs border border-black rounded-lg bg-white font-medium">
        </div>
      </div>
    </div>
  `).join('');
}

function addSocialItem() {
  if (!profileState.socials) profileState.socials = [];
  profileState.socials.push({
    id: `soc-${Date.now()}`,
    platform: 'Platform Baru',
    url: 'https://',
    icon: 'link'
  });
  renderSocialsList();
  updateBadges();
}

// --- SKILLS ---
function renderSkillsList() {
  const container = document.getElementById('skills-list-container');
  if (!container || !profileState) return;

  const skills = profileState.about?.skills || [];
  container.innerHTML = skills.map((group, idx) => `
    <div class="border-2 border-black rounded-xl p-4 bg-[#F4F0EA] space-y-3">
      <div class="flex items-center justify-between">
        <span class="px-2 py-0.5 bg-[#4ECDC4] border border-black rounded text-[10px] font-black uppercase">
          Kategori #${idx + 1}
        </span>
        <button type="button" onclick="deleteSkillGroup(${idx})" class="btn-brutal-sm bg-red-500 text-white text-xs flex items-center gap-1"><iconify-icon icon="lucide:trash-2" class="text-xs"></iconify-icon><span>Hapus</span></button>
      </div>
      <div>
        <label class="block text-[11px] font-black uppercase mb-1">Nama Kategori</label>
        <input type="text" value="${group.category || ''}" onchange="updateSkillCategory(${idx}, this.value)"
               class="w-full px-2.5 py-1.5 text-xs border border-black rounded-lg bg-white font-bold">
      </div>
      <div>
        <label class="block text-[11px] font-black uppercase mb-1">Daftar Keahlian (Dipisahkan koma)</label>
        <input type="text" value="${(group.items || []).join(', ')}" onchange="updateSkillItems(${idx}, this.value)"
               class="w-full px-2.5 py-1.5 text-xs border border-black rounded-lg bg-white font-medium">
      </div>
    </div>
  `).join('');
}

function addSkillGroup() {
  if (!profileState.about) profileState.about = {};
  if (!profileState.about.skills) profileState.about.skills = [];
  profileState.about.skills.push({
    category: 'Kategori Baru',
    items: ['Skill A', 'Skill B']
  });
  renderSkillsList();
}

function deleteSkillGroup(idx) {
  profileState.about.skills.splice(idx, 1);
  renderSkillsList();
}

function updateSkillCategory(idx, val) {
  profileState.about.skills[idx].category = val;
}

function updateSkillItems(idx, val) {
  profileState.about.skills[idx].items = val.split(',').map(s => s.trim()).filter(Boolean);
}

// --- EXPERIENCE ---
function renderExperienceList() {
  const container = document.getElementById('experience-list-container');
  if (!container || !profileState) return;

  const experiences = profileState.experience || [];
  container.innerHTML = experiences.map((exp, idx) => `
    <div class="border-2 border-black rounded-xl p-5 bg-[#F4F0EA] space-y-3">
      <div class="flex items-center justify-between">
        <span class="px-2 py-0.5 bg-[#FF6B6B] text-white border border-black rounded text-[10px] font-black uppercase">
          #${idx + 1} • ${exp.role || 'Pengalaman'}
        </span>
        <div class="flex items-center gap-1.5">
          <button type="button" onclick="moveItem('experience', ${idx}, -1)" class="btn-brutal-sm bg-white text-xs flex items-center justify-center p-1.5" title="Naik"><iconify-icon icon="lucide:arrow-up" class="text-xs"></iconify-icon></button>
          <button type="button" onclick="moveItem('experience', ${idx}, 1)" class="btn-brutal-sm bg-white text-xs flex items-center justify-center p-1.5" title="Turun"><iconify-icon icon="lucide:arrow-down" class="text-xs"></iconify-icon></button>
          <button type="button" onclick="deleteItem('experience', ${idx})" class="btn-brutal-sm bg-red-500 text-white text-xs flex items-center gap-1" title="Hapus"><iconify-icon icon="lucide:trash-2" class="text-xs"></iconify-icon><span class="hidden sm:inline">Hapus</span></button>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label class="block text-[11px] font-black uppercase mb-1">Posisi / Jabatan</label>
          <input type="text" value="${exp.role || ''}" onchange="updateArrayField('experience', ${idx}, 'role', this.value)"
                 class="w-full px-2.5 py-1.5 text-xs border border-black rounded-lg bg-white font-bold">
        </div>
        <div>
          <label class="block text-[11px] font-black uppercase mb-1">Perusahaan / Instansi</label>
          <input type="text" value="${exp.company || ''}" onchange="updateArrayField('experience', ${idx}, 'company', this.value)"
                 class="w-full px-2.5 py-1.5 text-xs border border-black rounded-lg bg-white font-bold">
        </div>
        <div>
          <label class="block text-[11px] font-black uppercase mb-1">Periode Waktu</label>
          <input type="text" value="${exp.period || ''}" onchange="updateArrayField('experience', ${idx}, 'period', this.value)"
                 class="w-full px-2.5 py-1.5 text-xs border border-black rounded-lg bg-white font-medium" placeholder="Okt 2024 - Sekarang">
        </div>
      </div>
      <div>
        <label class="block text-[11px] font-black uppercase mb-1">Deskripsi &amp; Pencapaian Utama</label>
        <textarea rows="3" onchange="updateArrayField('experience', ${idx}, 'description', this.value)"
                  class="w-full px-2.5 py-1.5 text-xs border border-black rounded-lg bg-white font-medium leading-relaxed">${exp.description || ''}</textarea>
      </div>
    </div>
  `).join('');
}

function addExperienceItem() {
  if (!profileState.experience) profileState.experience = [];
  profileState.experience.push({
    id: `exp-${Date.now()}`,
    role: 'Frontend Engineer',
    company: 'Perusahaan Baru',
    period: '2025 - Sekarang',
    description: 'Deskripsi tanggung jawab dan pencapaian kerja...'
  });
  renderExperienceList();
  updateBadges();
}

// --- EDUCATION ---
function renderEducationList() {
  const container = document.getElementById('education-list-container');
  if (!container || !profileState) return;

  const educations = profileState.education || [];
  container.innerHTML = educations.map((edu, idx) => `
    <div class="border-2 border-black rounded-xl p-5 bg-[#F4F0EA] space-y-3">
      <div class="flex items-center justify-between">
        <span class="px-2 py-0.5 bg-[#A78BFA] text-black border border-black rounded text-[10px] font-black uppercase">
          #${idx + 1} • ${edu.institution || 'Institusi'}
        </span>
        <div class="flex items-center gap-1.5">
          <button type="button" onclick="moveItem('education', ${idx}, -1)" class="btn-brutal-sm bg-white text-xs flex items-center justify-center p-1.5" title="Naik"><iconify-icon icon="lucide:arrow-up" class="text-xs"></iconify-icon></button>
          <button type="button" onclick="moveItem('education', ${idx}, 1)" class="btn-brutal-sm bg-white text-xs flex items-center justify-center p-1.5" title="Turun"><iconify-icon icon="lucide:arrow-down" class="text-xs"></iconify-icon></button>
          <button type="button" onclick="deleteItem('education', ${idx})" class="btn-brutal-sm bg-red-500 text-white text-xs flex items-center gap-1" title="Hapus"><iconify-icon icon="lucide:trash-2" class="text-xs"></iconify-icon><span class="hidden sm:inline">Hapus</span></button>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label class="block text-[11px] font-black uppercase mb-1">Institusi / Lembaga</label>
          <input type="text" value="${edu.institution || ''}" onchange="updateArrayField('education', ${idx}, 'institution', this.value)"
                 class="w-full px-2.5 py-1.5 text-xs border border-black rounded-lg bg-white font-bold">
        </div>
        <div>
          <label class="block text-[11px] font-black uppercase mb-1">Gelar / Program</label>
          <input type="text" value="${edu.degree || ''}" onchange="updateArrayField('education', ${idx}, 'degree', this.value)"
                 class="w-full px-2.5 py-1.5 text-xs border border-black rounded-lg bg-white font-bold">
        </div>
        <div>
          <label class="block text-[11px] font-black uppercase mb-1">Periode</label>
          <input type="text" value="${edu.period || ''}" onchange="updateArrayField('education', ${idx}, 'period', this.value)"
                 class="w-full px-2.5 py-1.5 text-xs border border-black rounded-lg bg-white font-medium">
        </div>
        <div>
          <label class="block text-[11px] font-black uppercase mb-1">Nilai / Predikat</label>
          <input type="text" value="${edu.grade || ''}" onchange="updateArrayField('education', ${idx}, 'grade', this.value)"
                 class="w-full px-2.5 py-1.5 text-xs border border-black rounded-lg bg-white font-medium" placeholder="IPK 3.80">
        </div>
      </div>
      <div>
        <label class="block text-[11px] font-black uppercase mb-1">Deskripsi Tambahan</label>
        <textarea rows="2" onchange="updateArrayField('education', ${idx}, 'description', this.value)"
                  class="w-full px-2.5 py-1.5 text-xs border border-black rounded-lg bg-white font-medium">${edu.description || ''}</textarea>
      </div>
    </div>
  `).join('');
}

function addEducationItem() {
  if (!profileState.education) profileState.education = [];
  profileState.education.push({
    id: `edu-${Date.now()}`,
    institution: 'Nama Universitas / Platform',
    degree: 'Sarjana / Sertifikat',
    period: '2020 - 2024',
    grade: 'IPK 3.80',
    description: 'Deskripsi program studi atau sertifikasi...'
  });
  renderEducationList();
  updateBadges();
}

// --- PROJECTS (CRUD & DEEP CASE STUDY) ---
function renderProjectsList() {
  const container = document.getElementById('projects-list-container');
  if (!container || !profileState) return;

  const projects = profileState.projects || [];
  container.innerHTML = projects.map((proj, idx) => {
    const cs = proj.case_study || {};
    const techStackStr = Array.isArray(proj.tech_stack) ? proj.tech_stack.join(', ') : (proj.tech_stack || '');
    const metricsStr = Array.isArray(cs.metrics) ? cs.metrics.join('\n') : (cs.metrics || '');
    const featuresStr = Array.isArray(cs.features) ? cs.features.join('\n') : (cs.features || '');

    return `
      <div class="border-[3px] border-black rounded-2xl p-5 md:p-6 bg-[#F4F0EA] space-y-4 shadow-brutal-sm">
        
        <!-- Header -->
        <div class="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-3">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 bg-[#FFD028] border-2 border-black rounded-lg text-xs font-black">
              #${idx + 1}
            </span>
            <span class="font-heading font-black text-lg text-black">
              ${proj.title || 'Proyek Tanpa Judul'}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <a href="/project/${proj.slug || proj.id}" target="_blank" class="btn-brutal-sm bg-white text-xs flex items-center gap-1">
              <span>Preview</span>
              <iconify-icon icon="lucide:external-link" class="text-xs"></iconify-icon>
            </a>
            <button type="button" onclick="moveItem('projects', ${idx}, -1)" class="btn-brutal-sm bg-white text-xs flex items-center justify-center p-1.5" title="Naik"><iconify-icon icon="lucide:arrow-up" class="text-xs"></iconify-icon></button>
            <button type="button" onclick="moveItem('projects', ${idx}, 1)" class="btn-brutal-sm bg-white text-xs flex items-center justify-center p-1.5" title="Turun"><iconify-icon icon="lucide:arrow-down" class="text-xs"></iconify-icon></button>
            <button type="button" onclick="deleteItem('projects', ${idx})" class="btn-brutal-sm bg-red-500 text-white text-xs flex items-center gap-1" title="Hapus"><iconify-icon icon="lucide:trash-2" class="text-xs"></iconify-icon><span class="hidden sm:inline">Hapus</span></button>
          </div>
        </div>

        <!-- Basic Project Info -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label class="block text-[11px] font-black uppercase mb-1">Judul Proyek</label>
            <input type="text" value="${proj.title || ''}" onchange="updateArrayField('projects', ${idx}, 'title', this.value)"
                   class="w-full px-2.5 py-1.5 text-xs border border-black rounded-lg bg-white font-bold">
          </div>
          <div>
            <label class="block text-[11px] font-black uppercase mb-1">URL Slug (Unik)</label>
            <input type="text" value="${proj.slug || ''}" onchange="updateArrayField('projects', ${idx}, 'slug', this.value)"
                   class="w-full px-2.5 py-1.5 text-xs border border-black rounded-lg bg-white font-mono" placeholder="my-awesome-project">
          </div>
          <div>
            <label class="block text-[11px] font-black uppercase mb-1">Kategori</label>
            <input type="text" value="${proj.category || ''}" onchange="updateArrayField('projects', ${idx}, 'category', this.value)"
                   class="w-full px-2.5 py-1.5 text-xs border border-black rounded-lg bg-white font-medium" placeholder="Web App / Performance">
          </div>
        </div>

        <div>
          <label class="block text-[11px] font-black uppercase mb-1">Deskripsi Singkat (Card)</label>
          <textarea rows="2" onchange="updateArrayField('projects', ${idx}, 'description', this.value)"
                    class="w-full px-2.5 py-1.5 text-xs border border-black rounded-lg bg-white font-medium">${proj.description || ''}</textarea>
        </div>

        <!-- Image Upload for Project -->
        <div class="border-2 border-dashed border-black rounded-xl p-3 bg-white flex flex-col sm:flex-row items-center gap-3">
          <img id="proj-img-preview-${idx}" src="${proj.image_url || '/uploads/proj_oceanpulse.svg'}" class="w-24 h-14 object-cover border border-black rounded">
          <div class="flex-1 w-full space-y-1">
            <label class="block text-[10px] font-black uppercase">Path Gambar Banner / SVG</label>
            <input type="text" id="proj-img-input-${idx}" value="${proj.image_url || ''}" onchange="updateArrayField('projects', ${idx}, 'image_url', this.value)"
                   class="w-full px-2 py-1 text-xs border border-black rounded bg-[#F4F0EA]">
          </div>
          <label class="btn-brutal btn-brutal-sm bg-[#FFD028] text-black cursor-pointer shrink-0 flex items-center gap-1.5">
            <iconify-icon icon="lucide:image-plus" class="text-xs"></iconify-icon>
            <span>Upload Banner</span>
            <input type="file" onchange="uploadProjectImage(${idx}, this)" class="hidden" accept="image/*">
          </label>
        </div>

        <!-- Links & Tech Stack -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label class="block text-[11px] font-black uppercase mb-1">Tech Stack (Koma)</label>
            <input type="text" value="${techStackStr}" onchange="updateProjectTechStack(${idx}, this.value)"
                   class="w-full px-2.5 py-1.5 text-xs border border-black rounded-lg bg-white font-medium" placeholder="React, TypeScript, Tailwind">
          </div>
          <div>
            <label class="block text-[11px] font-black uppercase mb-1">Live Demo URL</label>
            <input type="text" value="${proj.live_link || ''}" onchange="updateArrayField('projects', ${idx}, 'live_link', this.value)"
                   class="w-full px-2.5 py-1.5 text-xs border border-black rounded-lg bg-white font-medium">
          </div>
          <div>
            <label class="block text-[11px] font-black uppercase mb-1">GitHub Repo URL</label>
            <input type="text" value="${proj.github_link || ''}" onchange="updateArrayField('projects', ${idx}, 'github_link', this.value)"
                   class="w-full px-2.5 py-1.5 text-xs border border-black rounded-lg bg-white font-medium">
          </div>
        </div>

        <!-- Case Study Details Accordion/Section -->
        <div class="border-2 border-black rounded-xl p-4 bg-white space-y-3">
          <p class="font-heading font-black text-xs uppercase tracking-wider text-[#FF6B6B]">
            📋 Detail Case Study (Halaman Detail / Case Study)
          </p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label class="block text-[10px] font-black uppercase mb-1">Klien / Lembaga</label>
              <input type="text" value="${cs.client || ''}" onchange="updateProjectCaseStudy(${idx}, 'client', this.value)"
                     class="w-full px-2 py-1 text-xs border border-black rounded bg-[#F4F0EA]">
            </div>
            <div>
              <label class="block text-[10px] font-black uppercase mb-1">Peran Saya</label>
              <input type="text" value="${cs.role || ''}" onchange="updateProjectCaseStudy(${idx}, 'role', this.value)"
                     class="w-full px-2 py-1 text-xs border border-black rounded bg-[#F4F0EA]">
            </div>
            <div>
              <label class="block text-[10px] font-black uppercase mb-1">Durasi Pengerjaan</label>
              <input type="text" value="${cs.duration || ''}" onchange="updateProjectCaseStudy(${idx}, 'duration', this.value)"
                     class="w-full px-2 py-1 text-xs border border-black rounded bg-[#F4F0EA]">
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-black uppercase mb-1">Tantangan (Challenges)</label>
              <textarea rows="3" onchange="updateProjectCaseStudy(${idx}, 'challenges', this.value)"
                        class="w-full px-2 py-1 text-xs border border-black rounded bg-[#F4F0EA]">${cs.challenges || ''}</textarea>
            </div>
            <div>
              <label class="block text-[10px] font-black uppercase mb-1">Solusi Rekayasa (Solutions)</label>
              <textarea rows="3" onchange="updateProjectCaseStudy(${idx}, 'solutions', this.value)"
                        class="w-full px-2 py-1 text-xs border border-black rounded bg-[#F4F0EA]">${cs.solutions || ''}</textarea>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-black uppercase mb-1">Hasil &amp; Metrik (1 per baris)</label>
              <textarea rows="3" onchange="updateProjectCaseStudyList(${idx}, 'metrics', this.value)"
                        class="w-full px-2 py-1 text-xs border border-black rounded bg-[#F4F0EA]" placeholder="Skor Lighthouse 99&#10;Load time 40% lebih cepat">${metricsStr}</textarea>
            </div>
            <div>
              <label class="block text-[10px] font-black uppercase mb-1">Fitur Utama (1 per baris)</label>
              <textarea rows="3" onchange="updateProjectCaseStudyList(${idx}, 'features', this.value)"
                        class="w-full px-2 py-1 text-xs border border-black rounded bg-[#F4F0EA]" placeholder="Dashboard performa real-time&#10;Pemisahan chunk kode">${featuresStr}</textarea>
            </div>
          </div>
        </div>

      </div>
    `;
  }).join('');
}

function addProjectItem() {
  if (!profileState.projects) profileState.projects = [];
  const uniqueId = `proj-${Date.now()}`;
  profileState.projects.push({
    id: uniqueId,
    slug: `proyek-baru-${Date.now()}`,
    title: 'Judul Proyek Baru',
    category: 'Web Application',
    description: 'Deskripsi singkat mengenai proyek yang telah dikerjakan...',
    image_url: '/uploads/proj_oceanpulse.svg',
    live_link: 'https://',
    github_link: 'https://github.com/galihwu2',
    tech_stack: ['React.js', 'TailwindCSS'],
    case_study: {
      client: 'Klien Baru',
      role: 'Frontend Engineer',
      duration: '2025',
      challenges: 'Tantangan teknis awal...',
      solutions: 'Solusi implementasi...',
      metrics: ['Skor Lighthouse 99', 'Responsivitas 60 FPS'],
      features: ['Fitur interaktif', 'Integrasi REST API']
    }
  });
  renderProjectsList();
  updateBadges();
}

function updateProjectTechStack(idx, val) {
  profileState.projects[idx].tech_stack = val.split(',').map(s => s.trim()).filter(Boolean);
}

function updateProjectCaseStudy(idx, field, val) {
  if (!profileState.projects[idx].case_study) profileState.projects[idx].case_study = {};
  profileState.projects[idx].case_study[field] = val;
}

function updateProjectCaseStudyList(idx, field, val) {
  if (!profileState.projects[idx].case_study) profileState.projects[idx].case_study = {};
  profileState.projects[idx].case_study[field] = val.split('\n').map(s => s.trim()).filter(Boolean);
}

async function uploadProjectImage(idx, inputEl) {
  if (!inputEl.files || !inputEl.files[0]) return;
  const file = inputEl.files[0];
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Upload gagal.');

    profileState.projects[idx].image_url = data.file_url;
    document.getElementById(`proj-img-preview-${idx}`).src = data.file_url;
    document.getElementById(`proj-img-input-${idx}`).value = data.file_url;

    showToast('Banner Terunggah', `File disimpan di ${data.file_url}`, 'success');
  } catch (err) {
    showToast('Gagal Upload', err.message, 'error');
  }
}

// --- SERVICES ---
function renderServicesList() {
  const container = document.getElementById('services-list-container');
  if (!container || !profileState) return;

  const services = profileState.services || [];
  container.innerHTML = services.map((srv, idx) => `
    <div class="border-2 border-black rounded-xl p-4 bg-[#F4F0EA] space-y-3">
      <div class="flex items-center justify-between">
        <span class="px-2 py-0.5 bg-[#FFD028] border border-black rounded text-[10px] font-black uppercase">
          #${idx + 1} • ${srv.name || 'Layanan'}
        </span>
        <div class="flex items-center gap-1.5">
          <button type="button" onclick="moveItem('services', ${idx}, -1)" class="btn-brutal-sm bg-white text-xs flex items-center justify-center p-1.5" title="Naik"><iconify-icon icon="lucide:arrow-up" class="text-xs"></iconify-icon></button>
          <button type="button" onclick="moveItem('services', ${idx}, 1)" class="btn-brutal-sm bg-white text-xs flex items-center justify-center p-1.5" title="Turun"><iconify-icon icon="lucide:arrow-down" class="text-xs"></iconify-icon></button>
          <button type="button" onclick="deleteItem('services', ${idx})" class="btn-brutal-sm bg-red-500 text-white text-xs flex items-center gap-1" title="Hapus"><iconify-icon icon="lucide:trash-2" class="text-xs"></iconify-icon><span class="hidden sm:inline">Hapus</span></button>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div class="md:col-span-2">
          <label class="block text-[11px] font-black uppercase mb-1">Nama Layanan</label>
          <input type="text" value="${srv.name || ''}" onchange="updateArrayField('services', ${idx}, 'name', this.value)"
                 class="w-full px-2.5 py-1.5 text-xs border border-black rounded-lg bg-white font-bold">
        </div>
        <div>
          <label class="block text-[11px] font-black uppercase mb-1">Icon Identifier</label>
          <input type="text" value="${srv.icon || 'zap'}" onchange="updateArrayField('services', ${idx}, 'icon', this.value)"
                 class="w-full px-2.5 py-1.5 text-xs border border-black rounded-lg bg-white font-medium">
        </div>
      </div>
      <div>
        <label class="block text-[11px] font-black uppercase mb-1">Deskripsi Layanan</label>
        <textarea rows="2" onchange="updateArrayField('services', ${idx}, 'description', this.value)"
                  class="w-full px-2.5 py-1.5 text-xs border border-black rounded-lg bg-white font-medium">${srv.description || ''}</textarea>
      </div>
    </div>
  `).join('');
}

function addServiceItem() {
  if (!profileState.services) profileState.services = [];
  profileState.services.push({
    id: `srv-${Date.now()}`,
    name: 'Nama Layanan Baru',
    description: 'Deskripsi lengkap keahlian atau layanan yang disediakan...',
    icon: 'zap'
  });
  renderServicesList();
  updateBadges();
}

// Helper Generic Array Mutators
function updateArrayField(arrayName, idx, field, val) {
  if (profileState[arrayName] && profileState[arrayName][idx]) {
    profileState[arrayName][idx][field] = val;
  }
}

function deleteItem(arrayName, idx) {
  if (!confirm('Hapus item ini?')) return;
  profileState[arrayName].splice(idx, 1);
  if (arrayName === 'socials') renderSocialsList();
  if (arrayName === 'experience') renderExperienceList();
  if (arrayName === 'education') renderEducationList();
  if (arrayName === 'projects') renderProjectsList();
  if (arrayName === 'services') renderServicesList();
  updateBadges();
}

function moveItem(arrayName, idx, direction) {
  const targetIdx = idx + direction;
  const arr = profileState[arrayName];
  if (targetIdx < 0 || targetIdx >= arr.length) return;
  
  const temp = arr[idx];
  arr[idx] = arr[targetIdx];
  arr[targetIdx] = temp;

  if (arrayName === 'socials') renderSocialsList();
  if (arrayName === 'experience') renderExperienceList();
  if (arrayName === 'education') renderEducationList();
  if (arrayName === 'projects') renderProjectsList();
  if (arrayName === 'services') renderServicesList();
}


// ==========================================
// 5. MEDIA UPLOADS & LISTENERS
// ==========================================
function setupGlobalListeners() {
  // Avatar upload
  const avatarInput = document.getElementById('input-avatar-file');
  if (avatarInput) {
    avatarInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Upload gagal.');

        document.getElementById('edit-avatar-url').value = data.file_url;
        document.getElementById('edit-avatar-preview').src = data.file_url;
        if (!profileState.general) profileState.general = {};
        profileState.general.avatar_url = data.file_url;

        showToast('Foto Profil Diperbarui', `File disimpan di ${data.file_url}`, 'success');
      } catch (err) {
        showToast('Gagal Upload', err.message, 'error');
      }
    });
  }

  // CV Upload
  const cvInput = document.getElementById('input-cv-file');
  if (cvInput) {
    cvInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Upload gagal.');

        document.getElementById('about-cv-url').value = data.file_url;
        if (!profileState.about) profileState.about = {};
        profileState.about.cv_url = data.file_url;

        showToast('CV Berhasil Diunggah', `File disimpan di ${data.file_url}`, 'success');
      } catch (err) {
        showToast('Gagal Upload', err.message, 'error');
      }
    });
  }

  // Quick File Upload (Sidebar)
  const quickInput = document.getElementById('quick-file-upload');
  const quickResult = document.getElementById('quick-upload-result');
  if (quickInput) {
    quickInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);

      try {
        quickResult.textContent = 'Mengunggah...';
        const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Upload gagal.');

        quickResult.innerHTML = `✓ URL: <a href="${data.file_url}" target="_blank" class="underline text-black font-black">${data.file_url}</a>`;
        showToast('File Terunggah', `Disimpan di ${data.file_url}`, 'success');
      } catch (err) {
        quickResult.textContent = `Error: ${err.message}`;
        showToast('Upload Gagal', err.message, 'error');
      }
    });
  }

  // Save Buttons
  const btnSaveTop = document.getElementById('btn-save-all');
  const btnSaveBottom = document.getElementById('btn-save-bottom');
  if (btnSaveTop) btnSaveTop.addEventListener('click', saveAllProfileData);
  if (btnSaveBottom) btnSaveBottom.addEventListener('click', saveAllProfileData);

  // Restore Backup Button
  const btnRestore = document.getElementById('btn-restore-backup');
  if (btnRestore) {
    btnRestore.addEventListener('click', async () => {
      if (!confirm('Apakah Anda yakin ingin me-restore data dari backup otomatis sebelumnya (data/profile.backup.json)? Perubahan yang belum disimpan akan tertimpa.')) return;
      
      try {
        const res = await fetch('/api/admin/restore-backup', { method: 'POST' });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Gagal restore backup.');

        profileState = data.data;
        populateAllSections();
        showToast('Restore Berhasil', 'Data berhasil dikembalikan dari backup terakhir.', 'success');
      } catch (err) {
        showToast('Gagal Restore', err.message, 'error');
      }
    });
  }
}

// ==========================================
// 6. SAFE-SAVE IMPLEMENTATION
// ==========================================
async function saveAllProfileData() {
  if (!profileState) return;

  // Kumpulkan data umum
  profileState.general = {
    name: getValue('gen-name'),
    title: getValue('gen-title'),
    bio: getValue('gen-bio'),
    email: getValue('gen-email'),
    phone: getValue('gen-phone'),
    location: getValue('gen-location'),
    availability: getValue('gen-availability'),
    avatar_url: getValue('edit-avatar-url')
  };

  if (!profileState.about) profileState.about = {};
  profileState.about.long_bio = getValue('about-long-bio-input');
  profileState.about.cv_url = getValue('about-cv-url');

  try {
    const res = await fetch('/api/admin/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileState)
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      const errDetail = data.errors ? data.errors.join(', ') : data.message;
      throw new Error(errDetail || 'Gagal menyimpan perubahan.');
    }

    showToast(
      'Perubahan Berhasil Disimpan',
      'Backup otomatis dibuat di data/profile.backup.json dan data/profile.json telah diperbarui secara aman.',
      'success'
    );
  } catch (err) {
    showToast('Penyimpanan Gagal', err.message, 'error');
  }
}

function getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

// ==========================================
// 7. TOAST NOTIFICATIONS
// ==========================================
let toastTimer = null;

function showToast(title, message, type = 'success') {
  const toast = document.getElementById('toast');
  const titleEl = document.getElementById('toast-title');
  const msgEl = document.getElementById('toast-message');
  const iconEl = document.getElementById('toast-icon');

  if (!toast) return;

  clearTimeout(toastTimer);

  titleEl.textContent = title;
  msgEl.textContent = message;

  if (type === 'success') {
    toast.className = 'fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-xl border-2 border-black shadow-brutal-lg bg-[#FFD028] text-black transition-all';
    if (iconEl) iconEl.setAttribute('icon', 'lucide:save');
  } else {
    toast.className = 'fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-xl border-2 border-black shadow-brutal-lg bg-red-100 text-red-900 border-red-600 transition-all';
    if (iconEl) iconEl.setAttribute('icon', 'lucide:alert-circle');
  }

  toast.classList.remove('hidden');

  toastTimer = setTimeout(() => {
    hideToast();
  }, 4500);
}

function hideToast() {
  const toast = document.getElementById('toast');
  if (toast) toast.classList.add('hidden');
}
