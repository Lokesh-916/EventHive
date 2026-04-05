/* EventHive Analytics */
'use strict';

const TOKEN = localStorage.getItem('token');
const COLORS = ['#60a5fa','#34d399','#a78bfa','#fbbf24','#f87171','#38bdf8','#fb923c','#e879f9'];
const CAT_COLORS = { tech:'#60a5fa', social:'#34d399', arts:'#a78bfa', sports:'#fbbf24', music:'#f87171', other:'#94a3b8' };

// ── Auth guard ───────────────────────────────────────────────────────────────
(async function checkAuth() {
  if (!TOKEN) return showUnauth('not-logged-in');
  try {
    const r = await fetch('/api/auth/profile', { headers: { Authorization: 'Bearer ' + TOKEN } });
    if (!r.ok) return showUnauth('not-logged-in');
    const d = await r.json();
    if (d.data?.role !== 'organizer') return showUnauth(d.data?.role || 'unknown');
    document.getElementById('dropdownName').textContent = d.data.profile?.orgName || d.data.username || 'Organizer';
  } catch { showUnauth('not-logged-in'); }
})();

function showUnauth(role) {
  const isIn = role !== 'not-logged-in';
  const labels = { volunteer:'Volunteer', client:'Client' };
  document.body.innerHTML = '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0a0f14;font-family:Inter,sans-serif;padding:2rem;"><div style="max-width:480px;width:100%;text-align:center;"><h1 style="font-family:Satisfy,cursive;font-size:2rem;color:#fff;margin-bottom:.75rem;">Access Restricted</h1><p style="color:rgba(255,255,255,.5);font-size:.9rem;margin-bottom:2rem;">' + (isIn ? 'This page is for Organizers only.' : 'Please log in as an Organizer.') + '</p><div style="display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap;">' + (isIn ? '<button onclick="localStorage.removeItem(\'token\');window.location.href=\'/register\';" style="padding:.75rem 1.5rem;background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.3);color:#f87171;border-radius:.75rem;font-size:.8rem;font-weight:700;cursor:pointer;">Log Out</button>' : '') + '<button onclick="window.location.href=\'/register\';" style="padding:.75rem 1.5rem;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.8);border-radius:.75rem;font-size:.8rem;font-weight:700;cursor:pointer;">' + (isIn ? 'Switch Account' : 'Log In') + '</button><button onclick="history.back();" style="padding:.75rem 1.5rem;background:transparent;border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.4);border-radius:.75rem;font-size:.8rem;font-weight:700;cursor:pointer;">\u2190 Back</button></div></div></div>';
}

// ── Nav ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('profileAvatarBtn');
  const dd  = document.getElementById('profileDropdown');
  if (btn) btn.addEventListener('click', e => { e.stopPropagation(); dd.classList.toggle('open'); });
  document.addEventListener('click', e => { if (dd && !dd.contains(e.target) && e.target !== btn) dd.classList.remove('open'); });
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', () => { localStorage.removeItem('token'); window.location.href = '/'; });

  // Theme
  const bg = document.getElementById('bgImage');
  const saved = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  if (bg) bg.src = saved === 'dark' ? 'public/images/dark.avif' : 'public/images/light.jpeg';

  // Scroll reveal
  const obs = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }), { threshold: 0.06 });
  document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));

  loadAll();
});

// ── Main loader ──────────────────────────────────────────────────────────────
async function loadAll() {
  try {
    const [ovRes, evRes] = await Promise.all([
      fetch('/api/analytics/overview', { headers: { Authorization: 'Bearer ' + TOKEN } }),
      fetch('/api/analytics/events',   { headers: { Authorization: 'Bearer ' + TOKEN } }),
    ]);
    const ov     = (await ovRes.json()).data || {};
    const events = (await evRes.json()).data || [];

    renderKPIs(ov);
    renderEventTabs(events);
    renderTimeline(ov.appTimeline || []);
    renderRolePopularity(ov.rolePopularity || []);
    renderCategoryDonut(ov.categoryDistribution || {});
    renderStatusBars(ov);
    renderCityBars(ov.cityDistribution || {});

    const el = document.getElementById('lastUpdated');
    if (el) el.textContent = 'Updated ' + new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
  } catch(e) { console.error('Analytics load error:', e); }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n)  { return n >= 1000 ? (n/1000).toFixed(1)+'K' : String(n||0); }
function fmtK(n) { return n >= 1e6 ? (n/1e6).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(0)+'K' : String(n||0); }
function esc(s)  { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ── KPI Cards ────────────────────────────────────────────────────────────────
function renderKPIs(ov) {
  const kpis = [
    { label:'Total Events',       value:ov.totalEvents||0,          color:'#60a5fa', path:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { label:'Total Applications', value:ov.totalApplied||0,         color:'#a78bfa', path:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { label:'Approved Volunteers', value:ov.totalApproved||0,       color:'#34d399', path:'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label:'Avg Fill Rate',      value:(ov.fillRate||0)+'%',       color:'#fbbf24', path:'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
    { label:'Total Attendees',    value:fmt(ov.totalAttendees||0),  color:'#f87171', path:'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { label:'Social Reach',       value:fmtK(ov.totalReach||0),    color:'#38bdf8', path:'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z' },
    { label:'Completed Events',   value:ov.completedEvents||0,     color:'#34d399', path:'M5 13l4 4L19 7' },
    { label:'Ongoing Events',     value:ov.ongoingEvents||0,       color:'#60a5fa', path:'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];
  const grid = document.getElementById('kpiGrid');
  if (!grid) return;
  grid.innerHTML = kpis.map((k,i) => `
    <div class="kpi-card" style="animation-delay:${i*0.06}s">
      <div style="width:36px;height:36px;border-radius:50%;background:${k.color}18;display:flex;align-items:center;justify-content:center;margin-bottom:.75rem;">
        <svg xmlns="http://www.w3.org/2000/svg" style="width:16px;height:16px;color:${k.color}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="${k.path}"/></svg>
      </div>
      <div class="kpi-value" style="color:${k.color}">${k.value}</div>
      <div class="kpi-label">${k.label}</div>
    </div>`).join('');
}

// ── Event Tabs + Deep Dive ───────────────────────────────────────────────────
let _events = [];
function renderEventTabs(events) {
  _events = events;
  const tabs = document.getElementById('eventTabs');
  if (!tabs) return;
  const order = { ongoing:0, completed:1, published:2, draft:3 };
  events.sort((a,b) => (order[a.status]||9)-(order[b.status]||9));
  tabs.innerHTML = events.map((ev,i) => {
    const dc = ev.status==='completed'?'dot-completed':ev.status==='ongoing'?'dot-ongoing':ev.status==='published'?'dot-published':'dot-draft';
    return `<button class="event-tab${i===0?' active':''}" data-idx="${i}" onclick="selectEvent(${i})"><span class="dot ${dc}"></span>${esc(ev.title)}</button>`;
  }).join('');
  if (events.length) selectEvent(0);
}

window.selectEvent = function(idx) {
  document.querySelectorAll('.event-tab').forEach((t,i) => t.classList.toggle('active', i===idx));
  const ev = _events[idx];
  if (!ev) return;
  renderDDEventCard(ev);
  renderDDAttendance(ev);
  renderDDVolunteerDonut(ev);
  renderDDRoleBars(ev);
  renderDDAppStatus(ev);
  renderDDSatisfaction(ev);
  renderDDReach(ev);
};

function setPanel(id, html) { const el = document.getElementById(id); if (el) el.innerHTML = html; }

function renderDDEventCard(ev) {
  const start = ev.start ? new Date(ev.start).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '\u2014';
  const end   = ev.end   ? new Date(ev.end).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '\u2014';
  const bc = ev.status==='completed'?'badge-completed':ev.status==='ongoing'?'badge-ongoing':'badge-published';
  setPanel('ddEventCard', `
    ${ev.banner?`<img src="${esc(ev.banner)}" style="width:100%;height:110px;object-fit:cover;border-radius:.75rem;margin-bottom:1rem;" onerror="this.style.display='none'">`:''}
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:.5rem;margin-bottom:.75rem;">
      <h3 style="font-weight:700;font-size:.95rem;color:var(--text-primary);line-height:1.3;">${esc(ev.title)}</h3>
      <span class="${bc}">${esc(ev.status)}</span>
    </div>
    <p style="font-size:.72rem;color:var(--text-muted);">&#128197; ${start} \u2192 ${end}</p>
    <p style="font-size:.72rem;color:var(--text-muted);margin-top:.3rem;">&#128205; ${esc(ev.city||'\u2014')} &nbsp;&middot;&nbsp; ${esc((ev.category||'').toUpperCase())}</p>`);
}

function renderDDAttendance(ev) {
  const reg = ev.registeredAttendees||0, act = ev.actualAttendees||0;
  const pct = reg>0 ? Math.round((act/reg)*100) : 0;
  setPanel('ddAttendance', `
    <p style="font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;font-weight:700;color:var(--text-muted);margin-bottom:1rem;">Attendance</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;">
      <div style="text-align:center;padding:.75rem;border-radius:.75rem;background:rgba(96,165,250,.08);border:1px solid rgba(96,165,250,.15);">
        <div style="font-size:1.6rem;font-weight:800;color:#60a5fa;">${fmt(reg)}</div>
        <div style="font-size:.65rem;color:var(--text-muted);text-transform:uppercase;margin-top:.2rem;">Registered</div>
      </div>
      <div style="text-align:center;padding:.75rem;border-radius:.75rem;background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.15);">
        <div style="font-size:1.6rem;font-weight:800;color:#34d399;">${fmt(act)}</div>
        <div style="font-size:.65rem;color:var(--text-muted);text-transform:uppercase;margin-top:.2rem;">Attended</div>
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;margin-bottom:.4rem;">
      <span style="font-size:.7rem;color:var(--text-muted);">Show-up rate</span>
      <span style="font-size:.7rem;font-weight:700;color:#34d399;">${pct}%</span>
    </div>
    <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:linear-gradient(90deg,#34d399,#60a5fa);"></div></div>`);
}

function renderDDVolunteerDonut(ev) {
  const needed=ev.needed||0, approved=ev.approved||0;
  const pct = needed>0 ? Math.round((approved/needed)*100) : 0;
  const r=54, circ=2*Math.PI*r, dash=(pct/100)*circ;
  setPanel('ddVolunteerDonut', `
    <p style="font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;font-weight:700;color:var(--text-muted);margin-bottom:1rem;">Volunteer Fill Rate</p>
    <div style="display:flex;align-items:center;gap:1.5rem;">
      <div style="position:relative;flex-shrink:0;">
        <svg width="130" height="130" viewBox="0 0 130 130">
          <circle cx="65" cy="65" r="${r}" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="12"/>
          <circle cx="65" cy="65" r="${r}" fill="none" stroke="url(#dg${ev._id})" stroke-width="12"
            stroke-dasharray="${dash} ${circ}" stroke-dashoffset="${circ/4}" stroke-linecap="round"
            style="transition:stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)"/>
          <defs><linearGradient id="dg${ev._id}" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#60a5fa"/><stop offset="100%" stop-color="#a78bfa"/>
          </linearGradient></defs>
        </svg>
        <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
          <span style="font-size:1.5rem;font-weight:800;color:var(--text-primary);">${pct}%</span>
          <span style="font-size:.6rem;color:var(--text-muted);text-transform:uppercase;">filled</span>
        </div>
      </div>
      <div style="flex:1;display:flex;flex-direction:column;gap:.6rem;">
        <div><div style="font-size:1.2rem;font-weight:800;color:#60a5fa;">${approved}</div><div style="font-size:.65rem;color:var(--text-muted);text-transform:uppercase;">Approved</div></div>
        <div><div style="font-size:1.2rem;font-weight:800;color:var(--text-primary);">${needed}</div><div style="font-size:.65rem;color:var(--text-muted);text-transform:uppercase;">Needed</div></div>
        <div><div style="font-size:1.2rem;font-weight:800;color:#a78bfa;">${ev.pending||0}</div><div style="font-size:.65rem;color:var(--text-muted);text-transform:uppercase;">Pending</div></div>
      </div>
    </div>`);
}

function renderDDRoleBars(ev) {
  const roles = ev.roleBreakdown||[];
  if (!roles.length) { setPanel('ddRoleBars','<p style="font-size:.75rem;color:var(--text-muted);">No role data.</p>'); return; }
  const max = Math.max(...roles.map(r=>r.needed||r.applied||1), 1);
  setPanel('ddRoleBars', `
    <p style="font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;font-weight:700;color:var(--text-muted);margin-bottom:1rem;">Role Breakdown</p>
    <div style="display:flex;flex-direction:column;gap:.85rem;">
      ${roles.map((r,i)=>`<div>
        <div style="display:flex;justify-content:space-between;margin-bottom:.3rem;">
          <span style="font-size:.72rem;font-weight:600;color:var(--text-secondary);">${esc(r.roleName)}</span>
          <span style="font-size:.68rem;color:var(--text-muted);">${r.approved}/${r.applied} approved</span>
        </div>
        <div class="bar-track"><div class="bar-fill" style="width:${Math.round(((r.applied||0)/max)*100)}%;background:${COLORS[i%COLORS.length]};opacity:.85;"></div></div>
      </div>`).join('')}
    </div>`);
}

function renderDDAppStatus(ev) {
  const total = ev.applied||0;
  const items = [{label:'Approved',val:ev.approved||0,color:'#34d399'},{label:'Pending',val:ev.pending||0,color:'#fbbf24'},{label:'Rejected',val:ev.rejected||0,color:'#f87171'}];
  setPanel('ddAppStatus', `
    <p style="font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;font-weight:700;color:var(--text-muted);margin-bottom:1rem;">Application Status</p>
    <div style="display:flex;gap:.5rem;margin-bottom:1rem;">
      ${items.map(it=>`<div style="flex:1;text-align:center;padding:.6rem .4rem;border-radius:.75rem;background:${it.color}12;border:1px solid ${it.color}25;">
        <div style="font-size:1.3rem;font-weight:800;color:${it.color};">${it.val}</div>
        <div style="font-size:.6rem;color:var(--text-muted);text-transform:uppercase;">${it.label}</div>
      </div>`).join('')}
    </div>
    <div style="display:flex;height:8px;border-radius:9999px;overflow:hidden;gap:2px;">
      ${items.map(it=>{ const w=total>0?Math.round((it.val/total)*100):0; return w>0?`<div style="width:${w}%;background:${it.color};border-radius:9999px;transition:width 1s ease;"></div>`:''; }).join('')}
    </div>
    <p style="font-size:.68rem;color:var(--text-muted);margin-top:.5rem;text-align:right;">${total} total</p>`);
}

function renderDDSatisfaction(ev) {
  const score=ev.volunteerSatisfactionScore||0, nps=ev.npsScore||0;
  const stars=[1,2,3,4,5].map(s=>`<span style="font-size:1rem;color:${s<=Math.round(score)?'#fbbf24':'rgba(255,255,255,.15)'};">&#9733;</span>`).join('');
  setPanel('ddSatisfaction', `
    <p style="font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;font-weight:700;color:var(--text-muted);margin-bottom:1rem;">Satisfaction</p>
    <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem;">
      <div style="font-size:2.2rem;font-weight:800;color:#fbbf24;">${score>0?score.toFixed(1):'\u2014'}</div>
      <div><div>${stars}</div><div style="font-size:.65rem;color:var(--text-muted);margin-top:.2rem;">Volunteer satisfaction</div></div>
    </div>
    ${nps>0?`<div style="display:flex;align-items:center;justify-content:space-between;padding:.6rem .85rem;border-radius:.75rem;background:rgba(255,255,255,.04);border:1px solid var(--card-border);">
      <span style="font-size:.72rem;color:var(--text-secondary);">NPS Score</span>
      <span style="font-size:1rem;font-weight:800;color:${nps>=70?'#34d399':nps>=50?'#fbbf24':'#f87171'};">${nps}</span>
    </div>`:'<p style="font-size:.7rem;color:var(--text-muted);font-style:italic;">NPS available after event ends.</p>'}`);
}

function renderDDReach(ev) {
  const items=[{label:'Social Reach',val:fmtK(ev.socialReach||0),color:'#38bdf8'},{label:'Website Clicks',val:fmtK(ev.websiteClicks||0),color:'#a78bfa'},{label:'Check-ins',val:fmt(ev.checkIns||0),color:'#34d399'},{label:'Incidents',val:ev.incidentCount||0,color:ev.incidentCount>0?'#f87171':'#34d399'}];
  setPanel('ddReach', `
    <p style="font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;font-weight:700;color:var(--text-muted);margin-bottom:1rem;">Digital Reach</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;">
      ${items.map(it=>`<div style="padding:.65rem;border-radius:.75rem;background:${it.color}10;border:1px solid ${it.color}20;text-align:center;">
        <div style="font-size:1.2rem;font-weight:800;color:${it.color};">${it.val}</div>
        <div style="font-size:.6rem;color:var(--text-muted);text-transform:uppercase;margin-top:.2rem;">${it.label}</div>
      </div>`).join('')}
    </div>`);
}

// ── Canvas Charts ────────────────────────────────────────────────────────────
function drawLineChart(canvasId, labels, data, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 400;
  const H = parseInt(canvas.getAttribute('height')) || 180;
  canvas.width = W; canvas.height = H;
  const pad = { top:20, right:20, bottom:30, left:40 };
  const w = W - pad.left - pad.right;
  const h = H - pad.top - pad.bottom;
  const max = Math.max(...data, 1);

  ctx.clearRect(0,0,W,H);

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  for (let i=0;i<=4;i++) {
    const y = pad.top + (h/4)*i;
    ctx.beginPath(); ctx.moveTo(pad.left,y); ctx.lineTo(pad.left+w,y); ctx.stroke();
  }

  if (!data.length) return;

  const xStep = w / Math.max(data.length-1, 1);

  // Gradient fill
  const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top+h);
  grad.addColorStop(0, color+'55');
  grad.addColorStop(1, color+'00');
  ctx.beginPath();
  data.forEach((v,i) => {
    const x = pad.left + i*xStep;
    const y = pad.top + h - (v/max)*h;
    i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
  });
  ctx.lineTo(pad.left+(data.length-1)*xStep, pad.top+h);
  ctx.lineTo(pad.left, pad.top+h);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  data.forEach((v,i) => {
    const x = pad.left + i*xStep;
    const y = pad.top + h - (v/max)*h;
    i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
  });
  ctx.stroke();

  // Dots
  data.forEach((v,i) => {
    const x = pad.left + i*xStep;
    const y = pad.top + h - (v/max)*h;
    ctx.beginPath();
    ctx.arc(x,y,4,0,Math.PI*2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#0a0f14';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // X labels
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font = '10px Inter, sans-serif';
  ctx.textAlign = 'center';
  const step = Math.ceil(labels.length/6);
  labels.forEach((l,i) => {
    if (i%step===0) {
      const x = pad.left + i*xStep;
      const d = new Date(l);
      ctx.fillText(d.toLocaleDateString('en-IN',{day:'numeric',month:'short'}), x, H-6);
    }
  });
}

function drawHBarChart(canvasId, labels, data, colors) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 400;
  const H = parseInt(canvas.getAttribute('height')) || 180;
  canvas.width = W; canvas.height = H;
  const max = Math.max(...data, 1);
  const barH = Math.min(22, (H/labels.length)*0.6);
  const gap  = (H - barH*labels.length) / (labels.length+1);
  const labelW = 120;

  ctx.clearRect(0,0,W,H);
  labels.forEach((label,i) => {
    const y = gap + i*(barH+gap);
    const barW = ((data[i]||0)/max) * (W - labelW - 20);
    const color = colors[i%colors.length];

    // Label
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(label.length>14?label.slice(0,13)+'\u2026':label, labelW-6, y+barH*0.72);

    // Bar bg
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    ctx.roundRect(labelW, y, W-labelW-20, barH, 4);
    ctx.fill();

    // Bar fill
    if (barW > 0) {
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.roundRect(labelW, y, barW, barH, 4);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Value
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.textAlign = 'left';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText(data[i], labelW + barW + 6, y+barH*0.72);
  });
}

function drawDonut(canvasId, labels, data, colors) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 300;
  const H = parseInt(canvas.getAttribute('height')) || 200;
  canvas.width = W; canvas.height = H;
  const total = data.reduce((s,v)=>s+v,0)||1;
  const cx = W/2 - 30, cy = H/2, r = Math.min(cx, cy) - 10, inner = r*0.55;
  let angle = -Math.PI/2;

  ctx.clearRect(0,0,W,H);
  data.forEach((v,i) => {
    const slice = (v/total)*Math.PI*2;
    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.arc(cx,cy,r,angle,angle+slice);
    ctx.closePath();
    ctx.fillStyle = colors[i%colors.length];
    ctx.fill();
    angle += slice;
  });

  // Donut hole
  ctx.beginPath();
  ctx.arc(cx,cy,inner,0,Math.PI*2);
  ctx.fillStyle = 'rgba(10,15,20,0.9)';
  ctx.fill();

  // Legend
  const legendX = W - 55;
  labels.forEach((l,i) => {
    const ly = 20 + i*22;
    ctx.fillStyle = colors[i%colors.length];
    ctx.beginPath(); ctx.roundRect(legendX, ly, 10, 10, 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(l.length>8?l.slice(0,7)+'\u2026':l, legendX+14, ly+9);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText(data[i], legendX+14, ly+20);
  });
}

function renderTimeline(timeline) {
  if (!timeline.length) return;
  drawLineChart('timelineCanvas', timeline.map(t=>t.date), timeline.map(t=>t.count), '#60a5fa');
}

function renderRolePopularity(roles) {
  if (!roles.length) return;
  drawHBarChart('roleCanvas', roles.map(r=>r.name), roles.map(r=>r.applied), COLORS);
}

function renderCategoryDonut(catMap) {
  const entries = Object.entries(catMap).sort((a,b)=>b[1]-a[1]);
  if (!entries.length) return;
  drawDonut('categoryCanvas', entries.map(([k])=>k), entries.map(([,v])=>v), entries.map(([k])=>CAT_COLORS[k]||'#94a3b8'));
}

function renderStatusBars(ov) {
  const el = document.getElementById('statusBars');
  if (!el) return;
  const items = [
    { label:'Completed', val:ov.completedEvents||0, color:'#34d399' },
    { label:'Ongoing',   val:ov.ongoingEvents||0,   color:'#60a5fa' },
    { label:'Upcoming',  val:ov.upcomingEvents||0,  color:'#a78bfa' },
  ];
  const max = Math.max(...items.map(i=>i.val), 1);
  el.innerHTML = items.map(it => `
    <div>
      <div style="display:flex;justify-content:space-between;margin-bottom:.3rem;">
        <span style="font-size:.75rem;color:var(--text-secondary);">${it.label}</span>
        <span style="font-size:.75rem;font-weight:700;color:${it.color};">${it.val}</span>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.round((it.val/max)*100)}%;background:${it.color};"></div></div>
    </div>`).join('');
}

function renderCityBars(cityMap) {
  const el = document.getElementById('cityBars');
  if (!el) return;
  const entries = Object.entries(cityMap).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const max = Math.max(...entries.map(([,v])=>v), 1);
  el.innerHTML = entries.map(([city,count],i) => `
    <div>
      <div style="display:flex;justify-content:space-between;margin-bottom:.3rem;">
        <span style="font-size:.75rem;color:var(--text-secondary);">${esc(city)}</span>
        <span style="font-size:.75rem;font-weight:700;color:${COLORS[i%COLORS.length]};">${count}</span>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.round((count/max)*100)}%;background:${COLORS[i%COLORS.length]};"></div></div>
    </div>`).join('');
}
