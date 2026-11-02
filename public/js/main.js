/**
 * main.js - Dynamic Public Profile Renderer
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  loadProfileData();
});

// Toggle Mobile Menu
function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (btn && menu) {
    btn.addEventListener('click', () => {
      menu.classList.toggle('hidden');
    });
    // Auto-close when clicking any link
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => menu.classList.add('hidden'));
    });
  }
}

// Fetch and Hydrate Profile Data
async function loadProfileData() {
  try {
    const res = await fetch('/api/profile');
    if (!res.ok) throw new Error('Gagal memuat data dari server.');
    const json = await res.json();
    const data = json.data;

    hydrateGeneral(data.general, data.about?.cv_url);
    hydrateSocials(data.socials);
    hydrateAbout(data.about, data.general);
    hydrateSkills(data.about?.skills || []);
    hydrateExperience(data.experience || []);
    hydrateEducation(data.education || []);
    hydrateProjects(data.projects || []);
    hydrateServices(data.services || []);
  } catch (error) {
    console.error('Error saat memuat profil:', error);
  }
}

// 1. General & Hero
function hydrateGeneral(gen = {}, cvUrl) {
  if (gen.availability) {
    const el = document.getElementById('hero-availability');
    if (el) el.textContent = gen.availability;
  }
  if (gen.name) {
    const el = document.getElementById('hero-name');
    if (el) el.textContent = gen.name;
    const cardEl = document.getElementById('hero-card-name');
    if (cardEl) cardEl.textContent = gen.name;
  }
  if (gen.title) {
    const cardRole = document.getElementById('hero-card-role');
    if (cardRole) cardRole.textContent = gen.title;
  }
  if (gen.bio) {
    const el = document.getElementById('hero-bio');
    if (el) el.innerHTML = `Halo! Saya <strong id="hero-name">${gen.name || 'Galih Wahyu Utomo'}</strong>, ${gen.bio}`;
  }
  if (gen.avatar_url) {
    const avatar = document.getElementById('hero-avatar');
    if (avatar) avatar.src = gen.avatar_url;
  }
  if (cvUrl) {
    const cvBtn = document.getElementById('hero-cv-btn');
    if (cvBtn) cvBtn.href = cvUrl;
  }
}

// 2. Socials
function hydrateSocials(socials = []) {
  const container = document.getElementById('hero-socials');
  if (!container) return;

  container.innerHTML = socials.map(s => {
    let iconName = 'lucide:globe';
    const plat = (s.platform || '').toLowerCase();
    
    if (plat.includes('github')) {
      iconName = 'lucide:github';
    } else if (plat.includes('linkedin')) {
      iconName = 'lucide:linkedin';
    } else if (plat.includes('phone') || plat.includes('whatsapp')) {
      iconName = 'lucide:message-circle';
    } else if (plat.includes('mail') || plat.includes('email')) {
      iconName = 'lucide:mail';
    }

    return `
      <a href="${s.url}" target="_blank" rel="noopener noreferrer" 
         class="btn-brutal-sm bg-white hover:bg-[#FFD028] text-black transition-colors flex items-center gap-1.5"
         title="${s.platform}">
        <iconify-icon icon="${iconName}" class="text-sm"></iconify-icon>
        <span>${s.platform}</span>
      </a>
    `;
  }).join('');
}

// 3. About
function hydrateAbout(about = {}, gen = {}) {
  const bioEl = document.getElementById('about-long-bio');
  if (bioEl && about.long_bio) bioEl.textContent = about.long_bio;

  if (gen.location) {
    const locEl = document.getElementById('about-location');
    if (locEl) locEl.textContent = gen.location;
  }
  if (gen.email) {
    const mailEl = document.getElementById('about-email');
    if (mailEl) mailEl.textContent = gen.email;
    const btnMail = document.getElementById('contact-email-btn');
    if (btnMail) btnMail.href = `mailto:${gen.email}`;
  }
  if (gen.phone) {
    const phoneEl = document.getElementById('about-phone');
    if (phoneEl) phoneEl.textContent = gen.phone;
    const btnWa = document.getElementById('contact-wa-btn');
    if (btnWa) {
      const cleanPhone = gen.phone.replace(/[^0-9]/g, '');
      btnWa.href = `https://wa.me/${cleanPhone}`;
    }
  }
}

// 4. Skills
function hydrateSkills(skills = []) {
  const container = document.getElementById('skills-container');
  if (!container) return;

  const colorBadges = ['bg-[#FFD028]', 'bg-[#FF6B6B]', 'bg-[#4ECDC4]', 'bg-[#A78BFA]', 'bg-white'];

  container.innerHTML = skills.map((group, idx) => {
    const badgeColor = colorBadges[idx % colorBadges.length];
    const textColor = badgeColor === 'bg-[#FF6B6B]' ? 'text-white' : 'text-black';

    const itemsHtml = (group.items || []).map(item => `
      <span class="px-2.5 py-1 bg-[#F4F0EA] border border-black rounded-md text-xs font-bold shadow-sm">
        ${item}
      </span>
    `).join('');

    return `
      <div class="card-brutal p-5 bg-white space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="font-heading font-black text-lg">${group.category}</h3>
          <span class="w-3 h-3 rounded-full border border-black ${badgeColor}"></span>
        </div>
        <div class="flex flex-wrap gap-2 pt-1">
          ${itemsHtml}
        </div>
      </div>
    `;
  }).join('');
}

// 5. Work Experience
function hydrateExperience(experiences = []) {
  const container = document.getElementById('experience-container');
  if (!container) return;

  container.innerHTML = experiences.map((exp, idx) => `
    <article class="card-brutal p-6 md:p-8 bg-white space-y-3">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b-2 border-black pb-3">
        <div>
          <h3 class="font-heading font-black text-xl md:text-2xl text-black">
            ${exp.role}
          </h3>
          <p class="text-sm font-black text-[#FF6B6B] mt-0.5">
            ${exp.company}
          </p>
        </div>
        <span class="self-start md:self-center px-3 py-1 bg-[#FFD028] border-2 border-black rounded-lg text-xs font-black shadow-brutal-sm flex items-center gap-1.5">
          <iconify-icon icon="lucide:calendar" class="text-xs"></iconify-icon>
          <span>${exp.period}</span>
        </span>
      </div>
      <p class="text-sm md:text-base text-black/85 leading-relaxed font-medium pt-1">
        ${exp.description}
      </p>
    </article>
  `).join('');
}

// 6. Education
function hydrateEducation(educations = []) {
  const container = document.getElementById('education-container');
  if (!container) return;

  container.innerHTML = educations.map(edu => `
    <div class="card-brutal p-6 bg-white space-y-2">
      <div class="flex items-center justify-between gap-2">
        <span class="px-2.5 py-0.5 bg-[#4ECDC4] border border-black rounded text-[11px] font-black uppercase">
          ${edu.grade || 'Gelar Akademik'}
        </span>
        <span class="text-xs font-bold text-black/60">${edu.period || ''}</span>
      </div>
      <h3 class="font-heading font-black text-xl text-black pt-1">${edu.institution}</h3>
      <p class="text-sm font-bold text-[#FF6B6B]">${edu.degree}</p>
      <p class="text-xs text-black/80 font-medium leading-relaxed pt-1">${edu.description || ''}</p>
    </div>
  `).join('');
}

// 7. Projects Grid with Link to Dedicated Detail Page
function hydrateProjects(projects = []) {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  grid.innerHTML = projects.map(proj => {
    const slugOrId = proj.slug || proj.id;
    const detailUrl = `/project/${slugOrId}`;

    const tagsHtml = (proj.tech_stack || []).map(t => `
      <span class="px-2 py-0.5 bg-[#F4F0EA] border border-black rounded text-[11px] font-bold">
        ${t}
      </span>
    `).join('');

    return `
      <article class="card-brutal card-brutal-hover overflow-hidden flex flex-col justify-between">
        
        <!-- Image / SVG Banner with Link -->
        <a href="${detailUrl}" class="block relative group overflow-hidden border-b-[3px] border-black aspect-video bg-neutral-100">
          <img src="${proj.image_url}" alt="${proj.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
          <div class="absolute top-3 left-3">
            <span class="px-2.5 py-1 bg-[#FFD028] border-2 border-black rounded-lg text-xs font-black shadow-brutal-sm">
              ${proj.category}
            </span>
          </div>
        </a>

        <!-- Content -->
        <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <a href="${detailUrl}" class="hover:text-[#FF6B6B] transition-colors">
              <h3 class="font-heading font-black text-xl md:text-2xl leading-snug">${proj.title}</h3>
            </a>
            <p class="text-sm text-black/80 mt-2 font-medium leading-relaxed">
              ${proj.description}
            </p>
            <div class="flex flex-wrap gap-1.5 mt-3.5">
              ${tagsHtml}
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="pt-4 border-t-2 border-black flex flex-wrap items-center justify-between gap-3">
            <a href="${detailUrl}" class="btn-brutal btn-brutal-sm bg-[#FFD028] text-black font-black flex items-center gap-1.5">
              <span>Detail Case Study</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </a>

            <div class="flex items-center gap-2">
              ${proj.live_link ? `
                <a href="${proj.live_link}" target="_blank" class="btn-brutal-sm bg-white hover:bg-[#FF6B6B] hover:text-white transition-colors text-black font-bold">
                  Demo
                </a>
              ` : ''}
              ${proj.github_link ? `
                <a href="${proj.github_link}" target="_blank" class="btn-brutal-sm bg-white hover:bg-black hover:text-white transition-colors text-black font-bold">
                  GitHub
                </a>
              ` : ''}
            </div>
          </div>

        </div>

      </article>
    `;
  }).join('');
}

// 8. Services
function hydrateServices(services = []) {
  const container = document.getElementById('services-grid');
  if (!container) return;

  const colors = ['bg-[#FFD028]', 'bg-[#4ECDC4]', 'bg-[#FF6B6B]', 'bg-[#A78BFA]'];

  container.innerHTML = services.map((srv, idx) => {
    let iconName = 'lucide:sparkles';
    const iconId = (srv.icon || '').toLowerCase();
    
    if (iconId.includes('zap') || iconId.includes('perf')) {
      iconName = 'lucide:zap';
    } else if (iconId.includes('code') || iconId.includes('dev')) {
      iconName = 'lucide:code-2';
    } else if (iconId.includes('layout') || iconId.includes('design')) {
      iconName = 'lucide:palette';
    } else if (iconId.includes('game')) {
      iconName = 'lucide:gamepad-2';
    }

    return `
      <div class="card-brutal p-5 bg-white space-y-3">
        <div class="w-10 h-10 rounded-xl ${colors[idx % colors.length]} border-2 border-black flex items-center justify-center shadow-brutal-sm">
          <iconify-icon icon="${iconName}" class="text-xl text-black"></iconify-icon>
        </div>
        <h3 class="font-heading font-black text-lg text-black leading-snug">${srv.name}</h3>
        <p class="text-xs text-black/80 font-medium leading-relaxed">${srv.description}</p>
      </div>
    `;
  }).join('');
}
