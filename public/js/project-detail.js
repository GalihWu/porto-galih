/**
 * project-detail.js - Case Study Project Detail Renderer
 */

document.addEventListener('DOMContentLoaded', () => {
  loadProjectDetail();
});

async function loadProjectDetail() {
  const loadingEl = document.getElementById('project-loading');
  const errorEl = document.getElementById('project-error');
  const contentEl = document.getElementById('project-content');

  // Extract ID or Slug from Path or Query Param
  // e.g. /project/oceanpulse-web-performance-engine or /project.html?slug=oceanpulse-web-performance-engine
  const pathname = window.location.pathname;
  let identifier = '';

  const pathParts = pathname.split('/').filter(Boolean);
  if (pathParts[0] === 'project' && pathParts[1]) {
    identifier = pathParts[1];
  } else {
    const urlParams = new URLSearchParams(window.location.search);
    identifier = urlParams.get('slug') || urlParams.get('id');
  }

  // Fallback to first project if accessed directly as /project or /project.html without params
  if (!identifier) {
    identifier = 'beramalbersama';
  }

  try {
    let proj = null;
    let allProjects = [];

    // 1. Coba ambil dari REST API terlebih dahulu
    try {
      const res = await fetch(`/api/profile/projects/${identifier}`);
      if (res.ok) {
        const json = await res.json();
        proj = json.data;
      }
    } catch (e) {
      console.warn('API endpoint tidak tersedia, mencoba static fallback...');
    }

    // 2. Fetch all projects (atau fallback jika di-host secara static seperti Netlify)
    try {
      const allRes = await fetch('/api/profile');
      if (allRes.ok) {
        const allJson = await allRes.json();
        allProjects = allJson.data?.projects || [];
      } else {
        throw new Error('Fallback static list');
      }
    } catch (e) {
      // Static fallback ke /data/profile.json
      try {
        const staticRes = await fetch('/data/profile.json');
        if (staticRes.ok) {
          const staticJson = await staticRes.json();
          allProjects = staticJson.projects || [];
        }
      } catch (err) {
        console.error('Gagal memuat static profile.json:', err);
      }
    }

    // Jika proj belum didapatkan dari API, cari dari allProjects
    if (!proj && allProjects.length > 0) {
      proj = allProjects.find(p => p.id === identifier || p.slug === identifier);
    }

    if (!proj) {
      throw new Error('Proyek tidak ditemukan.');
    }

    // Hydrate Data
    hydrateProjectView(proj, allProjects);

    loadingEl.classList.add('hidden');
    contentEl.classList.remove('hidden');
  } catch (error) {
    console.error('Error memuat proyek:', error);
    loadingEl.classList.add('hidden');
    errorEl.classList.remove('hidden');
  }
}

function hydrateProjectView(proj, allProjects = []) {
  // Title & Head Meta
  document.title = `${proj.title} | Case Study Galih Wahyu Utomo`;
  const crumbTitle = document.getElementById('crumb-title');
  if (crumbTitle) crumbTitle.textContent = proj.title;

  const titleEl = document.getElementById('proj-title');
  if (titleEl) titleEl.textContent = proj.title;

  const descEl = document.getElementById('proj-desc');
  if (descEl) descEl.textContent = proj.description;

  const catEl = document.getElementById('proj-category');
  if (catEl) catEl.textContent = proj.category;

  const imgEl = document.getElementById('proj-image');
  if (imgEl) {
    imgEl.src = proj.image_url;
    imgEl.alt = proj.title;
  }

  // Tech Stack Badges
  const techContainer = document.getElementById('proj-tech-stack');
  if (techContainer) {
    techContainer.innerHTML = (proj.tech_stack || []).map(tech => `
      <span class="px-2.5 py-1 bg-white border border-black rounded-lg text-xs font-bold shadow-sm">
        ${tech}
      </span>
    `).join('');
  }

  // Links
  const liveLink = document.getElementById('proj-live-link');
  if (liveLink) {
    if (proj.live_link) {
      liveLink.href = proj.live_link;
      liveLink.classList.remove('hidden');
    } else {
      liveLink.classList.add('hidden');
    }
  }

  const ghLink = document.getElementById('proj-github-link');
  if (ghLink) {
    if (proj.github_link) {
      ghLink.href = proj.github_link;
      ghLink.classList.remove('hidden');
    } else {
      ghLink.classList.add('hidden');
    }
  }

  // Case Study Details
  const cs = proj.case_study || {};

  const clientEl = document.getElementById('meta-client');
  if (clientEl) clientEl.textContent = cs.client || 'Proyek Mandiri / Portofolio';

  const roleEl = document.getElementById('meta-role');
  if (roleEl) roleEl.textContent = cs.role || 'Frontend Engineer';

  const durationEl = document.getElementById('meta-duration');
  if (durationEl) durationEl.textContent = cs.duration || '2024';

  const statusEl = document.getElementById('meta-status');
  if (statusEl) {
    const st = (proj.status || 'Production').toLowerCase();
    if (st === 'production') {
      statusEl.className = 'font-heading font-black text-sm md:text-base text-emerald-600';
      statusEl.innerHTML = '✓ Production (Publik)';
    } else if (st === 'private') {
      statusEl.className = 'font-heading font-black text-sm md:text-base text-neutral-800';
      statusEl.innerHTML = '🔒 Private (Internal)';
    } else {
      statusEl.className = 'font-heading font-black text-sm md:text-base text-amber-600';
      statusEl.innerHTML = '⚡ In Development';
    }
  }

  const challengeEl = document.getElementById('proj-challenge');
  if (challengeEl) {
    challengeEl.textContent = cs.challenges || 'Mengoptimalkan performa rendering aset dan menjaga stabilitas interaksi pengguna.';
  }

  const solutionEl = document.getElementById('proj-solution');
  if (solutionEl) {
    solutionEl.textContent = cs.solutions || 'Menerapkan arsitektur komponen modular, lazy loading, dan teknik optimasi rendering.';
  }

  // Metrics Pills
  const metricsContainer = document.getElementById('proj-metrics-list');
  if (metricsContainer) {
    const metrics = cs.metrics || [
      'Lighthouse Score: 99 / 100',
      'Responsivitas UI: 60 FPS Konstan',
      'Optimasi Bundle: Code Splitting Aktif'
    ];
    metricsContainer.innerHTML = metrics.map(m => `
      <div class="px-3.5 py-2 bg-white border-2 border-black rounded-xl font-heading font-black text-xs md:text-sm text-black flex items-center gap-2 shadow-brutal-sm">
        <iconify-icon icon="lucide:check-circle-2" class="text-emerald-600 text-base shrink-0"></iconify-icon>
        <span>${m}</span>
      </div>
    `).join('');
  }

  // Features List
  const featuresContainer = document.getElementById('proj-features-list');
  if (featuresContainer) {
    const features = cs.features || [
      'Antarmuka pengguna interaktif dengan responsive layout',
      'Integrasi REST API dan optimasi Core Web Vitals',
      'Aksesibilitas dan semantic markup lengkap'
    ];
    featuresContainer.innerHTML = features.map(f => `
      <li class="flex items-start gap-3 text-sm md:text-base font-medium text-black/90">
        <span class="w-5 h-5 rounded-md bg-[#FFD028] border-2 border-black flex items-center justify-center text-xs shrink-0 mt-0.5">
          <iconify-icon icon="lucide:check" class="text-black text-xs font-bold"></iconify-icon>
        </span>
        <span>${f}</span>
      </li>
    `).join('');
  }

  // Next / Previous Navigation
  const nextPrevContainer = document.getElementById('next-prev-container');
  if (nextPrevContainer && allProjects.length > 1) {
    const currentIndex = allProjects.findIndex(p => p.id === proj.id || p.slug === proj.slug);
    const prevProj = currentIndex > 0 ? allProjects[currentIndex - 1] : null;
    const nextProj = currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null;

    let navHtml = '';
    if (prevProj) {
      navHtml += `
        <a href="/project/${prevProj.slug || prevProj.id}" class="btn-brutal btn-brutal-sm bg-white text-black text-xs">
          ← ${prevProj.title.substring(0, 18)}...
        </a>
      `;
    }
    if (nextProj) {
      navHtml += `
        <a href="/project/${nextProj.slug || nextProj.id}" class="btn-brutal btn-brutal-sm bg-[#FFD028] text-black text-xs">
          ${nextProj.title.substring(0, 18)}... →
        </a>
      `;
    }
    nextPrevContainer.innerHTML = navHtml;
  }
}
