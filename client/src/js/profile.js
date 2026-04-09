/* ============================================================
   profile.js — EventHive User Profile Page
   Full detail display + inline editing for all roles.
   Skills rating scaled to 5 stars.
   ============================================================ */

'use strict';

// ====== THEME ======
const html        = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const bgImage     = document.getElementById('bgImage');

function applyTheme(dark) {
  html.setAttribute('data-theme', dark ? 'dark' : 'light');
  bgImage.src = dark ? 'public/images/dark.avif' : 'public/images/light.jpeg';
  themeToggle.checked = dark;
  localStorage.setItem('theme', dark ? 'dark' : 'light');
}
const savedTheme = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme === 'dark');
themeToggle.addEventListener('change', () => applyTheme(themeToggle.checked));

// ====== NAVBAR DROPDOWN ======
const avatarBtn = document.getElementById('profileAvatarBtn');
const dropdown  = document.getElementById('profileDropdown');

avatarBtn.addEventListener('click', (e) => { e.stopPropagation(); dropdown.classList.toggle('open'); });
document.addEventListener('click', (e) => {
  if (!dropdown.contains(e.target) && e.target !== avatarBtn) dropdown.classList.remove('open');
});

// ====== LOGOUT ======
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
});

// ====== GLOBAL STATE ======
let CURRENT_USER = null;
let EDIT_STATE   = {};  // holds in-progress edits per section

// ====== HELPERS ======
function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function val(v, fallback = 'Not provided') {
  if (v == null || v === '') return `<span class="field-value empty">${fallback}</span>`;
  return `<span class="field-value">${esc(v)}</span>`;
}

function fieldRow(label, value) {
  const isEmpty = value == null || value === '';
  return `<div class="field-item">
    <span class="field-label">${label}</span>
    ${isEmpty ? '<span class="field-value empty">Not provided</span>' : `<span class="field-value">${esc(value)}</span>`}
  </div>`;
}

function chipsDisplay(items) {
  if (!items || !items.length) return '<span class="field-value empty">None added</span>';
  return `<div class="chip-list">${items.map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div>`;
}

function starsDisplay(rating, max = 5) {
  const r = Math.round(Number(rating) || 0);
  let html = '';
  for (let i = 1; i <= max; i++) {
    html += i <= r
      ? '<span class="star filled">★</span>'
      : '<span class="star empty">☆</span>';
  }
  return html;
}

function sectionWrap({ id, icon, title, subtitle, body }) {
  return `
    <section class="profile-section" id="section-${id}">
      <div class="section-header">
        <div class="section-icon">${icon}</div>
        <div class="section-title-wrap">
          <h2>${title}</h2>
          <p>${subtitle}</p>
        </div>
        <button class="edit-btn" onclick="enterEdit('${id}')" title="Edit section">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Edit
        </button>
      </div>
      <div class="section-body" id="body-${id}">${body}</div>
    </section>`;
}

// ====== HERO SECTION ======
function buildHero(u) {
  const p    = u.profile || {};
  const role = u.role || 'user';
  const displayName =
    role === 'organizer' ? (p.orgName   || u.username) :
    role === 'volunteer' ? (p.fullName  || u.username) :
    role === 'client'    ? (p.clientName|| u.username) :
    u.username;

  const avatarSrc = p.profilePic || p.logo;
  const avatarHtml = avatarSrc
    ? `<img id="heroAvatarImg" src="${esc(avatarSrc)}" alt="" style="width:100%;height:100%;object-fit:cover;">`
    : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="color:var(--text-muted);width:60%;height:60%;opacity:0.5"><path fill-rule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clip-rule="evenodd"/></svg>`;

  const loc = p.location;
  const locationStr = loc ? [loc.city, loc.state, loc.country].filter(Boolean).join(', ') : '';
  const joinDate = u.createdAt ? fmtDate(u.createdAt) : null;

  return `
    <div class="profile-hero" id="section-hero">
      <div class="hero-avatar-wrap">
        <div class="hero-avatar" id="heroAvatarEl">${avatarHtml}</div>
        <!-- Camera overlay for avatar upload -->
        <label class="avatar-upload-overlay" id="avatarUploadLabel" title="Change profile picture">
          <input type="file" id="avatarFileInput" accept="image/*" style="display:none" onchange="handleAvatarUpload(this)">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
        </label>
        <div class="role-badge-wrap">
          <span class="role-pill ${esc(role)}">${esc(role.charAt(0).toUpperCase() + role.slice(1))}</span>
        </div>
      </div>
      <div class="hero-info">
        <h1 class="hero-name" id="heroNameEl">${esc(displayName)}</h1>
        <p class="hero-username" id="heroUsernameEl">@${esc(u.username)}</p>
        ${u.email ? `<p class="hero-email">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          ${esc(u.email)}
        </p>` : ''}
        <div class="hero-meta-chips">
          ${locationStr ? `<span class="meta-chip">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${esc(locationStr)}
          </span>` : ''}
          ${joinDate ? `<span class="join-date-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Member since ${joinDate}
          </span>` : ''}
          ${p.website ? `<a href="${esc(p.website)}" target="_blank" rel="noopener" class="meta-chip" style="text-decoration:none;color:inherit;">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
            ${esc(p.website)}
          </a>` : ''}
        </div>
        <!-- Hero Edit Button -->
        <button class="edit-btn" style="margin-top:1rem;" onclick="enterEdit('hero')" title="Edit account details">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Edit Account
        </button>
      </div>
    </div>`;
}

// ====== ICONS (reused) ======
const ICONS = {
  building: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>`,
  tag:      `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
  doc:      `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  link:     `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>`,
  star:     `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  cal:      `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  user:     `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  map:      `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  info:     `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
};

// ====== ORGANIZER VIEW (read-only) ======
function buildOrganizerSections(p) {
  const loc = p.location || {};

  // --- Account Info (show username) ---
  const acctBody = `<div class="fields-grid">
    ${fieldRow('Username', CURRENT_USER.username)}
    ${fieldRow('Login Email', CURRENT_USER.email)}
  </div>`;

  // --- Organisation Detail ---
  const orgBody = `<div class="fields-grid">
    ${fieldRow('Organisation / Team Name', p.orgName)}
    ${fieldRow('Lead Organizer Name',      p.leadName)}
    ${fieldRow('Organisation Type',        p.organization)}
    ${fieldRow('Official Email',           p.officialEmail)}
    ${fieldRow('Phone / Mobile',           p.mobile)}
    ${fieldRow('Website',                  p.website)}
    ${fieldRow('City',                     loc.city)}
    ${fieldRow('State / Province',         loc.state)}
    ${fieldRow('Country',                  loc.country)}
  </div>`;

  // --- Event Types ---
  const etBody = `<p class="field-label" style="margin-bottom:.75rem;">Types of Events Organised</p>
    ${chipsDisplay(p.eventTypes)}`;

  // --- Bio ---
  const bioBody = p.bio
    ? `<div class="bio-block">${esc(p.bio)}</div>`
    : `<span class="field-value empty">No bio added.</span>`;

  // --- Portfolio ---
  const portBody = (p.portfolio && p.portfolio.length)
    ? `<div class="portfolio-list">
        ${p.portfolio.map(l => `<a href="${esc(l)}" class="portfolio-link" target="_blank" rel="noopener">
          ${ICONS.link} ${esc(l)}</a>`).join('')}
      </div>`
    : `<span class="field-value empty">No portfolio links added.</span>`;

  return [
    sectionWrap({ id:'org-account',    icon: ICONS.user,     title:'Account',              subtitle:'Login credentials',                    body: acctBody }),
    sectionWrap({ id:'org-details',    icon: ICONS.building, title:'Organisation Details',  subtitle:'Registered organisation information',  body: orgBody  }),
    sectionWrap({ id:'org-eventtypes', icon: ICONS.tag,      title:'Event Expertise',       subtitle:'Event categories you specialise in',   body: etBody   }),
    sectionWrap({ id:'org-bio',        icon: ICONS.doc,      title:'Bio / Summary',         subtitle:'About your organisation',              body: bioBody  }),
    sectionWrap({ id:'org-portfolio',  icon: ICONS.link,     title:'Portfolio',             subtitle:'Links to past events and work',        body: portBody }),
  ].join('');
}

// ====== VOLUNTEER VIEW (read-only) ======
function buildVolunteerSections(p) {
  const loc  = p.location    || {};
  const avail= p.availability|| {};
  const days = ['mon','tue','wed','thu','fri','sat','sun'];
  const dayLabels = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  // Account
  const acctBody = `<div class="fields-grid">
    ${fieldRow('Username',    CURRENT_USER.username)}
    ${fieldRow('Login Email', CURRENT_USER.email)}
  </div>`;

  // Personal
  const persBody = `<div class="fields-grid">
    ${fieldRow('Full Name',        p.fullName)}
    ${fieldRow('Date of Birth',    p.dob   ? fmtDate(p.dob) : '')}
    ${fieldRow('Gender',           p.gender)}
    ${fieldRow('Languages Known',  Array.isArray(p.languages) ? p.languages.join(', ') : p.languages)}
    ${fieldRow('Experience Level', p.experience)}
    ${fieldRow('Bio / Summary',    p.bio)}
    ${fieldRow('City',             loc.city)}
    ${fieldRow('State / Province', loc.state)}
    ${fieldRow('Country',          loc.country)}
  </div>`;

  // Skills
  const skillsBody = (p.skills && p.skills.length)
    ? `<div class="skill-list" id="skillList">
        ${p.skills.map((s, i) => {
          const r   = Math.min(5, Math.max(0, Number(s.rating) || 0));
          const pct = (r / 5) * 100;
          return `<div class="skill-item">
            <div class="skill-name-row">
              <span class="skill-name">${esc(s.name)}</span>
              <span class="skill-rating-stars">${starsDisplay(r)}</span>
            </div>
            <div class="skill-bar-track">
              <div class="skill-bar-fill" id="skillBar${i}" style="width:0%" data-pct="${pct}"></div>
            </div>
          </div>`;
        }).join('')}
      </div>`
    : `<span class="field-value empty">No skills added yet.</span>`;

  // Availability
  const availBody = `<div class="avail-grid">
    ${days.map((d, i) => {
      const slots = avail[d] || [];
      return `<div class="avail-day">
        <span class="avail-day-label">${dayLabels[i].slice(0,3)}</span>
        ${slots.length
          ? slots.map(s => `<span class="avail-slot filled">${esc(s)}</span>`).join('')
          : `<span class="avail-slot">—</span>`}
      </div>`;
    }).join('')}
  </div>`;

  return [
    sectionWrap({ id:'vol-account',  icon: ICONS.user, title:'Account',             subtitle:'Login credentials',                  body: acctBody   }),
    sectionWrap({ id:'vol-personal', icon: ICONS.info, title:'Personal Information', subtitle:'Your personal and contact details',  body: persBody   }),
    sectionWrap({ id:'vol-skills',   icon: ICONS.star, title:'Skills',               subtitle:'Your skills and proficiency (out of 5)', body: skillsBody }),
    sectionWrap({ id:'vol-avail',    icon: ICONS.cal,  title:'Weekly Availability',  subtitle:'Days and time slots you are free',  body: availBody  }),
  ].join('');
}

// ====== CLIENT VIEW (read-only) ======
function buildClientSections(p) {
  const loc = p.location || {};

  const acctBody = `<div class="fields-grid">
    ${fieldRow('Username',    CURRENT_USER.username)}
    ${fieldRow('Login Email', CURRENT_USER.email)}
  </div>`;

  const detailsBody = `<div class="fields-grid">
    ${fieldRow('Name / Company Name', p.clientName)}
    ${fieldRow('Representing',        p.clientType === 'individual' ? 'Myself (Individual)' : p.clientType === 'organization' ? 'Company / Organisation' : p.clientType)}
    ${fieldRow('Role / Designation',  p.clientRole)}
    ${fieldRow('Phone / Mobile',      p.mobile)}
    ${fieldRow('Website / LinkedIn',  p.website)}
    ${fieldRow('City',                loc.city)}
    ${fieldRow('State / Province',    loc.state)}
    ${fieldRow('Country',             loc.country)}
  </div>`;

  return [
    sectionWrap({ id:'cli-account', icon: ICONS.user,     title:'Account',        subtitle:'Login credentials',                body: acctBody   }),
    sectionWrap({ id:'cli-details', icon: ICONS.building, title:'Client Details', subtitle:'Information provided at registration', body: detailsBody }),
  ].join('');
}

// ====== MAIN RENDER ======
function renderProfile(u) {
  const main = document.getElementById('profileMain');
  const p    = u.profile || {};
  const role = u.role    || '';

  let roleSections = '';
  if (role === 'organizer') roleSections = buildOrganizerSections(p);
  else if (role === 'volunteer') roleSections = buildVolunteerSections(p);
  else if (role === 'client')    roleSections = buildClientSections(p);

  main.innerHTML = buildHero(u) + roleSections;

  // Attach onerror to avatar image so broken images fall back to the SVG icon
  const heroImg = document.getElementById('heroAvatarImg');
  if (heroImg) {
    heroImg.onerror = function() {
      const wrap = document.getElementById('heroAvatarEl');
      if (wrap) wrap.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="color:var(--text-muted);width:60%;height:60%;opacity:0.5"><path fill-rule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clip-rule="evenodd"/></svg>`;
    };
  }

  // Animate skill bars
  if (role === 'volunteer') {
    requestAnimationFrame(() => {
      document.querySelectorAll('.skill-bar-fill').forEach(bar => {
        setTimeout(() => { bar.style.width = bar.dataset.pct + '%'; }, 100);
      });
    });
  }
}

// ====== EDIT FORMS ======
const EVENT_TYPE_OPTIONS = ['Corporate','Social','Entertainment','Charity','Academic','Sports','Cultural','Tech','Other'];
const AVAIL_SLOTS = ['00-04','04-08','08-12','12-16','16-20','20-24'];

function inputEl(label, id, value, type = 'text', placeholder = '') {
  return `<div class="edit-field">
    <label class="field-label" for="${id}">${label}</label>
    <input class="edit-input" type="${type}" id="${id}" value="${esc(value || '')}" placeholder="${esc(placeholder || label)}">
  </div>`;
}

function textareaEl(label, id, value, rows = 4) {
  return `<div class="edit-field edit-field--full">
    <label class="field-label" for="${id}">${label}</label>
    <textarea class="edit-input edit-textarea" id="${id}" rows="${rows}">${esc(value || '')}</textarea>
  </div>`;
}

// ===== HERO EDIT =====
function heroEditHtml(u) {
  return `<div class="edit-grid">
    ${inputEl('Username', 'edit-username', u.username)}
  </div>
  <div class="edit-actions">
    <button class="btn-save" onclick="saveHero()">Save Changes</button>
    <button class="btn-cancel" onclick="cancelEdit('hero')">Cancel</button>
    <span class="save-status" id="status-hero"></span>
  </div>`;
}

// ===== ORGANIZER EDITS =====
function orgAccountEditHtml(u) {
  return `<div class="edit-grid">
    ${inputEl('Username', 'edit-username', u.username)}
  </div>
  <div class="edit-actions">
    <button class="btn-save" onclick="saveSection('org-account',{username:g('edit-username')})">Save</button>
    <button class="btn-cancel" onclick="cancelEdit('org-account')">Cancel</button>
    <span class="save-status" id="status-org-account"></span>
  </div>`;
}

function orgDetailsEditHtml(p) {
  const loc = p.location || {};
  return `<div class="edit-grid">
    ${inputEl('Organisation / Team Name', 'edit-orgName',      p.orgName)}
    ${inputEl('Lead Organizer Name',       'edit-leadName',     p.leadName)}
    ${inputEl('Organisation Type',         'edit-organization', p.organization)}
    ${inputEl('Official Email',            'edit-officialEmail',p.officialEmail, 'email')}
    ${inputEl('Phone / Mobile',            'edit-mobile',       p.mobile, 'tel')}
    ${inputEl('Website',                   'edit-website',      p.website, 'url', 'https://')}
    ${inputEl('City',                      'edit-city',         loc.city)}
    ${inputEl('State / Province',          'edit-state',        loc.state)}
    ${inputEl('Country',                   'edit-country',      loc.country)}
  </div>
  <div class="edit-actions">
    <button class="btn-save" onclick="saveOrgDetails()">Save</button>
    <button class="btn-cancel" onclick="cancelEdit('org-details')">Cancel</button>
    <span class="save-status" id="status-org-details"></span>
  </div>`;
}

function orgEventTypesEditHtml(p) {
  const current = p.eventTypes || [];
  const checks  = EVENT_TYPE_OPTIONS.map(t => `
    <label class="check-label">
      <input type="checkbox" class="et-check" value="${esc(t)}" ${current.includes(t) ? 'checked' : ''}>
      <span>${esc(t)}</span>
    </label>`).join('');
  return `<div class="check-grid">${checks}</div>
  <div class="edit-actions">
    <button class="btn-save" onclick="saveEventTypes()">Save</button>
    <button class="btn-cancel" onclick="cancelEdit('org-eventtypes')">Cancel</button>
    <span class="save-status" id="status-org-eventtypes"></span>
  </div>`;
}

function orgBioEditHtml(p) {
  return `${textareaEl('Bio / Summary', 'edit-bio', p.bio, 5)}
  <div class="edit-actions">
    <button class="btn-save" onclick="saveSection('org-bio',{profile:{bio:g('edit-bio')}})">Save</button>
    <button class="btn-cancel" onclick="cancelEdit('org-bio')">Cancel</button>
    <span class="save-status" id="status-org-bio"></span>
  </div>`;
}

function orgPortfolioEditHtml(p) {
  const items = (p.portfolio || []);
  const rows  = items.length ? items.map((l, i) => `
    <div class="portfolio-edit-row" id="port-row-${i}">
      <input class="edit-input" type="url" id="port-${i}" value="${esc(l)}" placeholder="https://">
      <button class="btn-remove-small" onclick="removePortfolioRow(${i})">✕</button>
    </div>`).join('') : '';
  return `<div id="portfolio-edit-list">${rows}</div>
  <button class="btn-add-row" onclick="addPortfolioRow()">+ Add Link</button>
  <div class="edit-actions" style="margin-top:1.25rem;">
    <button class="btn-save" onclick="savePortfolio()">Save</button>
    <button class="btn-cancel" onclick="cancelEdit('org-portfolio')">Cancel</button>
    <span class="save-status" id="status-org-portfolio"></span>
  </div>`;
}

// ===== VOLUNTEER EDITS =====
function volAccountEditHtml(u) {
  return `<div class="edit-grid">
    ${inputEl('Username', 'edit-username', u.username)}
  </div>
  <div class="edit-actions">
    <button class="btn-save" onclick="saveSection('vol-account',{username:g('edit-username')})">Save</button>
    <button class="btn-cancel" onclick="cancelEdit('vol-account')">Cancel</button>
    <span class="save-status" id="status-vol-account"></span>
  </div>`;
}

function volPersonalEditHtml(u, p) {
  const loc = p.location || {};
  const dobVal = p.dob ? new Date(p.dob).toISOString().split('T')[0] : '';
  return `<div class="edit-grid">
    ${inputEl('Full Name',        'edit-fullName',   p.fullName)}
    ${inputEl('Date of Birth',    'edit-dob',        dobVal, 'date')}
    <div class="edit-field">
      <label class="field-label">Gender</label>
      <select class="edit-input" id="edit-gender">
        <option value="" ${!p.gender?'selected':''}>— Select —</option>
        ${['Male','Female','Other'].map(g => `<option value="${g.toLowerCase()}" ${p.gender===g.toLowerCase()||p.gender===g?'selected':''}>${g}</option>`).join('')}
      </select>
    </div>
    ${inputEl('Languages Known',  'edit-languages',  Array.isArray(p.languages) ? p.languages.join(', ') : (p.languages||''), 'text', 'English, Spanish...')}
    <div class="edit-field">
      <label class="field-label">Experience Level</label>
      <select class="edit-input" id="edit-experience">
        <option value="beginner"     ${p.experience==='beginner'    ?'selected':''}>Beginner</option>
        <option value="intermediate" ${p.experience==='intermediate'?'selected':''}>Intermediate</option>
        <option value="expert"       ${p.experience==='expert'      ?'selected':''}>Expert</option>
      </select>
    </div>
    ${inputEl('City',             'edit-city',       loc.city)}
    ${inputEl('State / Province', 'edit-state',      loc.state)}
    ${inputEl('Country',          'edit-country',    loc.country)}
    ${textareaEl('Bio / Summary', 'edit-bio',        p.bio, 3)}
  </div>
  <div class="edit-actions">
    <button class="btn-save" onclick="saveVolPersonal()">Save</button>
    <button class="btn-cancel" onclick="cancelEdit('vol-personal')">Cancel</button>
    <span class="save-status" id="status-vol-personal"></span>
  </div>`;
}

function volSkillsEditHtml(p) {
  const skills = p.skills || [];
  const rows = skills.map((s, i) => `
    <div class="skill-edit-row" id="skill-row-${i}">
      <input class="edit-input skill-name-input" type="text" id="skill-name-${i}" value="${esc(s.name)}" placeholder="Skill name">
      <div class="star-edit-group" id="star-group-${i}" data-rating="${Math.min(5,Number(s.rating)||0)}">${buildStarEditor(i, Math.min(5,Number(s.rating)||0))}</div>
      <button class="btn-remove-small" onclick="removeSkillRow(${i})">✕</button>
    </div>`).join('');
  return `<div id="skill-edit-list">${rows}</div>
  <button class="btn-add-row" onclick="addSkillRow()">+ Add Skill</button>
  <div class="edit-actions" style="margin-top:1.25rem;">
    <button class="btn-save" onclick="saveSkills()">Save</button>
    <button class="btn-cancel" onclick="cancelEdit('vol-skills')">Cancel</button>
    <span class="save-status" id="status-vol-skills"></span>
  </div>`;
}

function buildStarEditor(idx, currentRating) {
  return [1,2,3,4,5].map(n =>
    `<button type="button" class="star-edit-btn ${n <= currentRating ? 'on' : ''}"
       onclick="setStarRating(${idx},${n})" data-val="${n}">★</button>`
  ).join('');
}

window.setStarRating = function(idx, val) {
  const group = document.getElementById(`star-group-${idx}`);
  if (!group) return;
  group.dataset.rating = val;
  group.querySelectorAll('.star-edit-btn').forEach(btn => {
    btn.classList.toggle('on', Number(btn.dataset.val) <= val);
  });
};

window.removeSkillRow = function(idx) {
  const row = document.getElementById(`skill-row-${idx}`);
  if (row) row.remove();
};

let _skillEditCounter = 0;
window.addSkillRow = function() {
  _skillEditCounter++;
  const id = `new-${_skillEditCounter}`;
  const list = document.getElementById('skill-edit-list');
  const div = document.createElement('div');
  div.className = 'skill-edit-row';
  div.id = `skill-row-${id}`;
  div.innerHTML = `
    <input class="edit-input skill-name-input" type="text" id="skill-name-${id}" placeholder="Skill name">
    <div class="star-edit-group" id="star-group-${id}" data-rating="0">${buildStarEditor(id, 0)}</div>
    <button class="btn-remove-small" onclick="removeSkillRow('${id}')">✕</button>`;
  list.appendChild(div);
};

function volAvailEditHtml(p) {
  const avail = p.availability || {};
  const days = ['mon','tue','wed','thu','fri','sat','sun'];
  const dayLabels = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  const grid = days.map((d, i) => `
    <div class="avail-edit-day">
      <span class="avail-day-label">${dayLabels[i]}</span>
      <div class="avail-slots-wrap">
        ${AVAIL_SLOTS.map(slot => {
          const checked = (avail[d] || []).includes(slot);
          return `<button type="button"
            class="avail-slot-edit ${checked ? 'selected' : ''}"
            data-day="${d}" data-slot="${slot}"
            onclick="toggleAvailSlot(this)">${slot}</button>`;
        }).join('')}
      </div>
    </div>`).join('');

  return `<div class="avail-edit-grid">${grid}</div>
  <div class="edit-actions" style="margin-top:1.25rem;">
    <button class="btn-save" onclick="saveAvailability()">Save</button>
    <button class="btn-cancel" onclick="cancelEdit('vol-avail')">Cancel</button>
    <span class="save-status" id="status-vol-avail"></span>
  </div>`;
}

window.toggleAvailSlot = function(btn) {
  btn.classList.toggle('selected');
};

// ===== CLIENT EDITS =====
function cliAccountEditHtml(u) {
  return `<div class="edit-grid">
    ${inputEl('Username', 'edit-username', u.username)}
  </div>
  <div class="edit-actions">
    <button class="btn-save" onclick="saveSection('cli-account',{username:g('edit-username')})">Save</button>
    <button class="btn-cancel" onclick="cancelEdit('cli-account')">Cancel</button>
    <span class="save-status" id="status-cli-account"></span>
  </div>`;
}

function cliDetailsEditHtml(p) {
  const loc = p.location || {};
  return `<div class="edit-grid">
    ${inputEl('Name / Company Name', 'edit-clientName', p.clientName)}
    <div class="edit-field">
      <label class="field-label">Representing</label>
      <select class="edit-input" id="edit-clientType">
        <option value="individual"   ${p.clientType==='individual'  ?'selected':''}>Myself (Individual)</option>
        <option value="organization" ${p.clientType==='organization'?'selected':''}>Company / Organisation</option>
      </select>
    </div>
    ${inputEl('Role / Designation', 'edit-clientRole', p.clientRole)}
    ${inputEl('Phone / Mobile',     'edit-mobile',     p.mobile, 'tel')}
    ${inputEl('Website / LinkedIn', 'edit-website',    p.website, 'url', 'https://')}
    ${inputEl('City',               'edit-city',       loc.city)}
    ${inputEl('State / Province',   'edit-state',      loc.state)}
    ${inputEl('Country',            'edit-country',    loc.country)}
  </div>
  <div class="edit-actions">
    <button class="btn-save" onclick="saveCliDetails()">Save</button>
    <button class="btn-cancel" onclick="cancelEdit('cli-details')">Cancel</button>
    <span class="save-status" id="status-cli-details"></span>
  </div>`;
}

// ====== EDIT ENTRY POINT ======
window.enterEdit = function(sectionId) {
  const u    = CURRENT_USER;
  const p    = u.profile || {};
  const body = document.getElementById(`body-${sectionId}`);
  if (!body) return;

  // Store original HTML for cancel
  EDIT_STATE[sectionId] = body.innerHTML;
  body.classList.add('editing');

  let editHtml = '';
  switch (sectionId) {
    case 'hero':              editHtml = heroEditHtml(u);               break;
    case 'org-account':      editHtml = orgAccountEditHtml(u);         break;
    case 'org-details':      editHtml = orgDetailsEditHtml(p);         break;
    case 'org-eventtypes':   editHtml = orgEventTypesEditHtml(p);      break;
    case 'org-bio':          editHtml = orgBioEditHtml(p);             break;
    case 'org-portfolio':    editHtml = orgPortfolioEditHtml(p);       break;
    case 'vol-account':      editHtml = volAccountEditHtml(u);         break;
    case 'vol-personal':     editHtml = volPersonalEditHtml(u, p);     break;
    case 'vol-skills':       editHtml = volSkillsEditHtml(p);          break;
    case 'vol-avail':        editHtml = volAvailEditHtml(p);           break;
    case 'cli-account':      editHtml = cliAccountEditHtml(u);         break;
    case 'cli-details':      editHtml = cliDetailsEditHtml(p);         break;
    default: return;
  }
  body.innerHTML = editHtml;
  // init portfolio counter
  if (sectionId === 'org-portfolio') {
    _portCounter = (p.portfolio || []).length;
  }
};

// ====== CANCEL ======
window.cancelEdit = function(sectionId) {
  const body = document.getElementById(`body-${sectionId}`);
  if (!body || EDIT_STATE[sectionId] == null) return;
  body.innerHTML = EDIT_STATE[sectionId];
  body.classList.remove('editing');
  delete EDIT_STATE[sectionId];

  // Re-animate skill bars if coming back
  if (sectionId === 'vol-skills') {
    document.querySelectorAll('.skill-bar-fill').forEach(bar => {
      setTimeout(() => { bar.style.width = bar.dataset.pct + '%'; }, 50);
    });
  }
};

// ====== SHARED SAVE UTIL ======
function g(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}
window.g = g;

function setStatus(sectionId, msg, isError = false) {
  const el = document.getElementById(`status-${sectionId}`);
  if (!el) return;
  el.textContent  = msg;
  el.style.color  = isError ? '#e53e3e' : '#16a34a';
}

async function apiPut(payload) {
  const token = localStorage.getItem('token');
  const res = await fetch('/api/auth/profile', {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

async function saveAndRefresh(sectionId, payload) {
  setStatus(sectionId, 'Saving…');
  try {
    const data = await apiPut(payload);
    if (!data.success) { setStatus(sectionId, data.error || 'Error', true); return; }
    CURRENT_USER = data.data;
    localStorage.setItem('user', JSON.stringify({
      id: data.data._id, username: data.data.username,
      email: data.data.email, role: data.data.role,
      profile: data.data.profile, createdAt: data.data.createdAt
    }));
    setStatus(sectionId, '✓ Saved');
    setTimeout(() => {
      delete EDIT_STATE[sectionId];
      renderProfile(CURRENT_USER);
      updateNavbar(CURRENT_USER);
    }, 700);
  } catch (e) {
    setStatus(sectionId, 'Network error', true);
  }
}

// ====== HERO SAVE ======
window.saveHero = function() {
  const username = g('edit-username');
  saveAndRefresh('hero', { username });
};

// ====== GENERIC SECTION SAVE ======
window.saveSection = function(sectionId, payload) {
  saveAndRefresh(sectionId, payload);
};

// ====== ORGANIZER SAVES ======
window.saveOrgDetails = function() {
  saveAndRefresh('org-details', {
    profile: {
      orgName:       g('edit-orgName'),
      leadName:      g('edit-leadName'),
      organization:  g('edit-organization'),
      officialEmail: g('edit-officialEmail'),
      mobile:        g('edit-mobile'),
      website:       g('edit-website'),
      location: {
        city:    g('edit-city'),
        state:   g('edit-state'),
        country: g('edit-country'),
        coordinates: (CURRENT_USER.profile?.location?.coordinates) || []
      }
    }
  });
};

window.saveEventTypes = function() {
  const types = Array.from(document.querySelectorAll('.et-check:checked')).map(c => c.value);
  saveAndRefresh('org-eventtypes', { profile: { eventTypes: types } });
};

let _portCounter = 0;
window.addPortfolioRow = function() {
  const list = document.getElementById('portfolio-edit-list');
  const id   = _portCounter++;
  const div  = document.createElement('div');
  div.className = 'portfolio-edit-row';
  div.id = `port-row-${id}`;
  div.innerHTML = `
    <input class="edit-input" type="url" id="port-${id}" placeholder="https://">
    <button class="btn-remove-small" onclick="removePortfolioRow(${id})">✕</button>`;
  list.appendChild(div);
};

window.removePortfolioRow = function(idx) {
  const row = document.getElementById(`port-row-${idx}`);
  if (row) row.remove();
};

window.savePortfolio = function() {
  const links = Array.from(document.querySelectorAll('#portfolio-edit-list input[type="url"]'))
    .map(i => i.value.trim()).filter(Boolean);
  saveAndRefresh('org-portfolio', { profile: { portfolio: links } });
};

// ====== VOLUNTEER SAVES ======
window.saveVolPersonal = function() {
  const lang = g('edit-languages');
  saveAndRefresh('vol-personal', {
    profile: {
      fullName:   g('edit-fullName'),
      dob:        g('edit-dob'),
      gender:     document.getElementById('edit-gender')?.value || '',
      languages:  lang ? lang.split(',').map(l => l.trim()).filter(Boolean) : [],
      experience: document.getElementById('edit-experience')?.value || '',
      bio:        g('edit-bio'),
      location: {
        city:    g('edit-city'),
        state:   g('edit-state'),
        country: g('edit-country'),
        coordinates: (CURRENT_USER.profile?.location?.coordinates) || []
      }
    }
  });
};

window.saveSkills = function() {
  const rows   = document.querySelectorAll('#skill-edit-list .skill-edit-row');
  const skills = [];
  rows.forEach(row => {
    const id     = row.id.replace('skill-row-', '');
    const nameEl = document.getElementById(`skill-name-${id}`);
    const grp    = document.getElementById(`star-group-${id}`);
    if (!nameEl) return;
    const name   = nameEl.value.trim();
    const rating = grp ? Number(grp.dataset.rating) : 0;
    if (name) skills.push({ name, rating });
  });
  saveAndRefresh('vol-skills', { profile: { skills } });
};

window.saveAvailability = function() {
  const availability = {};
  document.querySelectorAll('.avail-slot-edit.selected').forEach(btn => {
    const day  = btn.dataset.day;
    const slot = btn.dataset.slot;
    if (!availability[day]) availability[day] = [];
    availability[day].push(slot);
  });
  saveAndRefresh('vol-avail', { profile: { availability } });
};

// ====== CLIENT SAVES ======
window.saveCliDetails = function() {
  saveAndRefresh('cli-details', {
    profile: {
      clientName: g('edit-clientName'),
      clientType: document.getElementById('edit-clientType')?.value || '',
      clientRole: g('edit-clientRole'),
      mobile:     g('edit-mobile'),
      website:    g('edit-website'),
      location: {
        city:    g('edit-city'),
        state:   g('edit-state'),
        country: g('edit-country'),
        coordinates: (CURRENT_USER.profile?.location?.coordinates) || []
      }
    }
  });
};

// ====== UPDATE NAVBAR ======
function updateNavbar(u) {
  const p = u.profile || {};
  const dName = p.orgName || p.fullName || p.clientName || u.username;
  document.getElementById('dropdownName').textContent = dName || u.username;
  document.getElementById('dropdownRole').textContent =
    u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : '—';

  // Set role-specific home links
  const homeMap = { organizer: '/organiser-home', client: '/client-home', volunteer: '/home' };
  const homeUrl = homeMap[u.role] || '/home';
  document.querySelectorAll('a.brand, a[href="/home"]').forEach(el => el.href = homeUrl);

  const pic = p.profilePic || p.logo;
  if (pic) {
    const img = document.createElement('img');
    img.src = pic;
    img.alt = '';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%;';
    img.onerror = () => {
      avatarBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="color:var(--text-muted)"><path fill-rule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clip-rule="evenodd"/></svg>`;
    };
    avatarBtn.innerHTML = '';
    avatarBtn.appendChild(img);
  }
}

// ====== ERROR STATE ======
function renderError(msg) {
  document.getElementById('profileMain').innerHTML = `
    <div class="profile-section error-state">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p>${esc(msg)}</p>
      <a class="btn-back" href="/home">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Back to Home
      </a>
    </div>`;
}

// ====== AVATAR UPLOAD ======
window.handleAvatarUpload = function(input) {
  const file = input.files && input.files[0];
  if (!file) return;

  // Size guard: reject files over 2 MB
  if (file.size > 2 * 1024 * 1024) {
    alert('Image is too large. Please choose a file under 2 MB.');
    input.value = '';
    return;
  }

  const label  = document.getElementById('avatarUploadLabel');
  const avatar = document.getElementById('heroAvatarEl');

  // Show uploading state
  label.classList.add('uploading');

  const reader = new FileReader();
  reader.onload = async function(e) {
    const base64 = e.target.result; // data:image/...;base64,...

    // Optimistically update avatar preview
    avatar.innerHTML = `<img src="${base64}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;

    // Decide the right field name per role
    const role      = CURRENT_USER.role || '';
    const fieldName = role === 'organizer' ? 'logo' : 'profilePic';

    try {
      const token = localStorage.getItem('token');
      const res   = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: { [fieldName]: base64 } })
      });
      const data = await res.json();

      if (data.success) {
        CURRENT_USER = data.data;
        // Update navbar avatar
        const navBtn = document.getElementById('profileAvatarBtn');
        navBtn.innerHTML = `<img src="${base64}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        // Cache update
        localStorage.setItem('user', JSON.stringify({
          id: data.data._id, username: data.data.username,
          email: data.data.email, role: data.data.role,
          profile: data.data.profile, createdAt: data.data.createdAt
        }));
      } else {
        alert('Failed to update profile picture: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Network error while uploading picture.');
    } finally {
      label.classList.remove('uploading');
      input.value = ''; // Reset so same file can be re-selected
    }
  };
  reader.readAsDataURL(file);
};

// ====== INIT ======
(async function init() {
  // Check if viewing another user's profile via ?id= param
  const urlParams = new URLSearchParams(window.location.search);
  const viewId = urlParams.get('id');

  // Quick navbar from cache
  const cached = JSON.parse(localStorage.getItem('user') || '{}');
  if (cached.username) {
    const p = cached.profile || {};
    document.getElementById('dropdownName').textContent = p.orgName || p.fullName || p.clientName || cached.username;
    document.getElementById('dropdownRole').textContent = cached.role ? cached.role.charAt(0).toUpperCase() + cached.role.slice(1) : '—';
  }

  const token = localStorage.getItem('token');
  if (!token) { renderError('You are not logged in. Please sign in to view your profile.'); return; }

  try {
    // If viewing another user, fetch their public profile
    const apiUrl = viewId ? `/api/auth/profile/${viewId}` : '/api/auth/profile';
    const res = await fetch(apiUrl, { headers: { 'Authorization': `Bearer ${token}` } });

    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
      return;
    }

    const data = await res.json();
    if (!data.success) { renderError(data.error || 'Failed to load profile.'); return; }

    CURRENT_USER = data.data;
    // If viewing another user, mark as read-only
    if (viewId && CURRENT_USER._id !== cached.id) {
      window._viewingOther = true;
    }

    localStorage.setItem('user', JSON.stringify({
      id: CURRENT_USER._id, username: CURRENT_USER.username,
      email: CURRENT_USER.email, role: CURRENT_USER.role,
      profile: CURRENT_USER.profile, createdAt: CURRENT_USER.createdAt
    }));

    updateNavbar(CURRENT_USER);
    renderProfile(CURRENT_USER);

    // If viewing another user, hide all edit buttons and show read-only banner
    if (window._viewingOther) {
      setTimeout(() => {
        document.querySelectorAll('.edit-btn, [onclick*="openEdit"], [onclick*="saveHero"]').forEach(el => el.style.display = 'none');
        const main = document.getElementById('profileMain');
        if (main) {
          const banner = document.createElement('div');
          banner.style.cssText = 'background:rgba(96,165,250,0.1);border:1px solid rgba(96,165,250,0.25);border-radius:0.75rem;padding:0.6rem 1rem;font-size:0.75rem;color:#60a5fa;margin-bottom:1rem;text-align:center;';
          banner.textContent = 'Viewing ' + (CURRENT_USER.profile?.fullName || CURRENT_USER.username) + "'s profile (read-only)";
          main.insertBefore(banner, main.firstChild);
        }
      }, 100);
    }

    // Load reputation badge section for volunteers
    if (CURRENT_USER.role === 'volunteer' && typeof loadReputationSection === 'function') {
      loadReputationSection(CURRENT_USER._id);
    }
  } catch (err) {
    renderError('Unable to connect to the server. Please try again later.');
  }
})();
