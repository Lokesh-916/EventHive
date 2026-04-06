/**
 * reputation.js — Volunteer profile page logic
 * Vanilla JS only. No imports, no modules, no frameworks.
 * Exposes loadProfile as a global function called from profile.html.
 */

/* ── Rank tier thresholds ── */
var RANK_TIERS = [
  { rank: 'Newcomer',    min: 0,    max: 99,   next: 100,      nextRank: 'Rising Star' },
  { rank: 'Rising Star', min: 100,  max: 299,  next: 300,      nextRank: 'Reliable'    },
  { rank: 'Reliable',    min: 300,  max: 599,  next: 600,      nextRank: 'Veteran'     },
  { rank: 'Veteran',     min: 600,  max: 999,  next: 1000,     nextRank: 'Elite'       },
  { rank: 'Elite',       min: 1000, max: 1999, next: 2000,     nextRank: 'Legend'      },
  { rank: 'Legend',      min: 2000, max: Infinity, next: null, nextRank: null          },
];

/* ── Rank → CSS class map ── */
var RANK_CLASS = {
  'Newcomer':    'rank-newcomer',
  'Rising Star': 'rank-rising-star',
  'Reliable':    'rank-reliable',
  'Veteran':     'rank-veteran',
  'Elite':       'rank-elite',
  'Legend':      'rank-legend',
};

/* ── Progress panel badge progress text logic ── */
function getBadgeProgressText(badgeId, reputationData) {
  var xp = reputationData.xp || 0;
  var eventsCompleted = reputationData.eventsCompleted || 0;

  switch (badgeId) {
    case 'first_step':  return eventsCompleted + ' / 1 event';
    case 'team_player': return eventsCompleted + ' / 5 events';
    case 'dedicated':   return eventsCompleted + ' / 10 events';
    case 'centurion':   return xp + ' / 100 XP';
    case 'rising_star': return xp + ' / 300 XP';
    case 'veteran':     return xp + ' / 600 XP';
    case 'top_rated':   return 'Requires 3 five-star ratings';
    case 'consistent':  return 'Requires activity across 3 months';
    case 'legend':      return xp + ' / 2000 XP';
    default:            return '';
  }
}

/* ── XP progress within current tier ── */
function getProgressPercent(xp, rank) {
  var tier = null;
  for (var i = 0; i < RANK_TIERS.length; i++) {
    if (RANK_TIERS[i].rank === rank) { tier = RANK_TIERS[i]; break; }
  }
  if (!tier || tier.next === null) return 100; // Legend — maxed
  var range = tier.next - tier.min;
  var progress = xp - tier.min;
  var pct = (progress / range) * 100;
  if (pct < 0) pct = 0;
  if (pct > 100) pct = 100;
  return pct;
}

/* ── Inject SVG symbols into #badge-sprite ── */
function injectSvgSprite(catalog) {
  var sprite = document.getElementById('badge-sprite');
  if (!sprite) return;
  var html = '';
  for (var i = 0; i < catalog.length; i++) {
    var badge = catalog[i];
    html += '<symbol id="badge-' + badge.id + '" viewBox="0 0 32 32">' + badge.svgPath + '</symbol>';
  }
  sprite.innerHTML = html;
}

/* ── Render profile header ── */
function renderProfileHeader(data) {
  var nameEl = document.getElementById('profile-name');
  var initialsEl = document.getElementById('avatar-initials');
  var rankEl = document.getElementById('rank-label');
  var eventsEl = document.getElementById('events-completed');

  var fullName = (data.fullName) || 'Volunteer';
  var rank = data.rank || 'Newcomer';
  var eventsCompleted = data.eventsCompleted || 0;

  if (nameEl) nameEl.textContent = fullName;
  if (initialsEl) initialsEl.textContent = fullName.charAt(0).toUpperCase();

  if (rankEl) {
    rankEl.textContent = rank;
    // Remove all existing rank classes then apply the correct one
    var allRankClasses = Object.values(RANK_CLASS);
    for (var i = 0; i < allRankClasses.length; i++) {
      rankEl.classList.remove(allRankClasses[i]);
    }
    var rankClass = RANK_CLASS[rank] || 'rank-newcomer';
    rankEl.classList.add(rankClass);
  }

  if (eventsEl) eventsEl.textContent = eventsCompleted + ' events completed';
}

/* ── Render XP bar ── */
function renderXpBar(data) {
  var xpBarEl = document.getElementById('xp-bar');
  var xpLabelEl = document.getElementById('xp-label');
  var xpNextEl = document.getElementById('xp-next-rank-label');

  var xp = data.xp || 0;
  var rank = data.rank || 'Newcomer';

  var tier = null;
  for (var i = 0; i < RANK_TIERS.length; i++) {
    if (RANK_TIERS[i].rank === rank) { tier = RANK_TIERS[i]; break; }
  }

  var pct = getProgressPercent(xp, rank);

  if (xpBarEl) xpBarEl.style.width = pct + '%';

  if (tier && tier.next === null) {
    // Legend — maxed out
    if (xpLabelEl) xpLabelEl.textContent = 'MAX';
    if (xpNextEl) xpNextEl.textContent = "You've reached the highest rank";
  } else if (tier) {
    if (xpLabelEl) xpLabelEl.textContent = xp + ' / ' + tier.next + ' XP';
    var remaining = tier.next - xp;
    if (remaining < 0) remaining = 0;
    if (xpNextEl) xpNextEl.textContent = remaining + ' XP to ' + tier.nextRank;
  }
}

/* ── Task 9.2: renderBadgeGrid ── */
function renderBadgeGrid(earnedBadges, catalog) {
  // Inject SVG symbols into sprite
  injectSvgSprite(catalog);

  var grid = document.getElementById('badge-grid');
  if (!grid) return;
  grid.innerHTML = '';

  // Build a set of earned badge IDs for quick lookup
  var earnedIds = {};
  for (var i = 0; i < earnedBadges.length; i++) {
    earnedIds[earnedBadges[i].badgeId] = true;
  }

  for (var j = 0; j < catalog.length; j++) {
    var badge = catalog[j];
    var isEarned = !!earnedIds[badge.id];

    var card = document.createElement('div');
    card.className = 'badge-card ' + (isEarned ? 'earned' : 'unearned');

    var svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgEl.setAttribute('class', 'badge-icon');
    svgEl.setAttribute('aria-label', badge.name);
    var useEl = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    useEl.setAttribute('href', '#badge-' + badge.id);
    svgEl.appendChild(useEl);

    var nameEl = document.createElement('span');
    nameEl.className = 'badge-name';
    nameEl.textContent = badge.name;

    card.appendChild(svgEl);
    card.appendChild(nameEl);
    grid.appendChild(card);
  }
}

/* ── Task 9.3: renderProgressPanel ── */
function renderProgressPanel(earnedBadges, catalog, reputationData) {
  var list = document.getElementById('progress-panel-list');
  if (!list) return;
  list.innerHTML = '';

  // Build earned set
  var earnedIds = {};
  for (var i = 0; i < earnedBadges.length; i++) {
    earnedIds[earnedBadges[i].badgeId] = true;
  }

  for (var j = 0; j < catalog.length; j++) {
    var badge = catalog[j];
    var isEarned = !!earnedIds[badge.id];

    var row = document.createElement('div');
    row.className = 'panel-badge-row';

    // SVG icon
    var svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgEl.setAttribute('class', 'panel-badge-icon' + (isEarned ? '' : ' unearned'));
    svgEl.setAttribute('aria-label', badge.name);
    var useEl = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    useEl.setAttribute('href', '#badge-' + badge.id);
    svgEl.appendChild(useEl);

    // Info block
    var info = document.createElement('div');
    info.className = 'panel-badge-info';

    var nameEl = document.createElement('div');
    nameEl.className = 'panel-badge-name';
    nameEl.textContent = badge.name;

    var descEl = document.createElement('div');
    descEl.className = 'panel-badge-desc';
    descEl.textContent = badge.description || badge.criterionLabel || '';

    var progressEl = document.createElement('div');
    progressEl.className = 'panel-badge-progress';
    progressEl.textContent = getBadgeProgressText(badge.id, reputationData);

    info.appendChild(nameEl);
    info.appendChild(descEl);
    info.appendChild(progressEl);

    row.appendChild(svgEl);
    row.appendChild(info);
    list.appendChild(row);
  }
}

/* ── Task 9.1: loadProfile ── */
function loadProfile(volunteerId) {
  // Show error state if no volunteerId
  if (!volunteerId) {
    var nameEl = document.getElementById('profile-name');
    if (nameEl) nameEl.textContent = 'Profile not found';
    return;
  }

  var token = localStorage.getItem('token');

  var reputationUrl = '/api/reputation/' + volunteerId;
  var catalogUrl = '/api/reputation/catalog';

  var reputationHeaders = { 'Content-Type': 'application/json' };
  if (token) reputationHeaders['Authorization'] = 'Bearer ' + token;

  var reputationFetch = fetch(reputationUrl, { headers: reputationHeaders });
  var catalogFetch = fetch(catalogUrl);

  Promise.all([reputationFetch, catalogFetch])
    .then(function (responses) {
      var repRes = responses[0];
      var catRes = responses[1];

      if (!repRes.ok) {
        throw new Error('Failed to load reputation data (HTTP ' + repRes.status + ')');
      }
      if (!catRes.ok) {
        throw new Error('Failed to load badge catalog (HTTP ' + catRes.status + ')');
      }

      return Promise.all([repRes.json(), catRes.json()]);
    })
    .then(function (data) {
      var reputationData = data[0];
      var catalogData = data[1];

      // The API may wrap data in a `data` or `reputation` field
      var rep = reputationData.reputation || reputationData;
      // Merge fullName from top-level if present
      if (reputationData.fullName && !rep.fullName) {
        rep.fullName = reputationData.fullName;
      }

      var catalog = catalogData.badges || catalogData;
      var earnedBadges = rep.badges || [];

      // Inject SVG sprite and render all sections
      injectSvgSprite(catalog);
      renderProfileHeader(rep);
      renderXpBar(rep);
      renderBadgeGrid(earnedBadges, catalog);
      renderProgressPanel(earnedBadges, catalog, rep);
    })
    .catch(function (err) {
      console.error('loadProfile error:', err);
      var nameEl = document.getElementById('profile-name');
      if (nameEl) nameEl.textContent = 'Could not load profile';

      var grid = document.getElementById('badge-grid');
      if (grid) {
        grid.innerHTML = '<p style="color:#D6843C;font-size:0.8rem;grid-column:1/-1;">Unable to load badges. Please try again later.</p>';
      }
    });
}

/* ── loadReputationSection: injects badge section into profile page ── */
function loadReputationSection(volunteerId) {
  if (!volunteerId) return;
  var token = localStorage.getItem('token');
  var headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;

  Promise.all([
    fetch('/api/reputation/' + volunteerId, { headers: headers }).then(function(r) { return r.ok ? r.json() : null; }),
    fetch('/api/reputation/catalog').then(function(r) { return r.ok ? r.json() : null; })
  ]).then(function(results) {
    var repData = results[0];
    var catData = results[1];
    if (!repData || !catData) return;

    var rep = repData.reputation || repData;
    var catalog = catData.badges || catData;
    var earnedBadges = rep.badges || [];

    // Inject SVG sprite
    injectSvgSprite(catalog);

    // Build section HTML
    var xp = rep.xp || 0;
    var rank = rep.rank || 'Newcomer';
    var eventsCompleted = rep.eventsCompleted || 0;
    var rankClass = RANK_CLASS[rank] || 'rank-newcomer';

    // XP progress
    var tier = null;
    for (var i = 0; i < RANK_TIERS.length; i++) {
      if (RANK_TIERS[i].rank === rank) { tier = RANK_TIERS[i]; break; }
    }
    var pct = getProgressPercent(xp, rank);
    var xpLabelText = tier && tier.next ? xp + ' / ' + tier.next + ' XP' : 'MAX';
    var xpNextText = tier && tier.next ? (tier.next - xp) + ' XP to ' + tier.nextRank : "You've reached the highest rank";

    var section = document.createElement('div');
    section.className = 'profile-section';
    section.id = 'reputation-section';
    section.style.cssText = 'background:var(--section-bg);backdrop-filter:blur(32px);border:1px solid var(--card-border);box-shadow:var(--shadow);border-radius:2.5rem;padding:2.5rem;animation:sectionReveal 0.5s ease-out both;';

    section.innerHTML = [
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;">',
        '<div style="display:flex;align-items:center;gap:0.75rem;">',
          '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="opacity:0.6;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>',
          '<div>',
            '<h2 style="font-size:1rem;font-weight:700;color:var(--text-primary);margin:0;">Reputation</h2>',
            '<p style="font-size:0.75rem;color:var(--text-secondary);margin:0;">' + eventsCompleted + ' events completed</p>',
          '</div>',
        '</div>',
        '<div style="display:flex;align-items:center;gap:0.5rem;">',
          '<span class="rank-chip ' + rankClass + '">' + rank + '</span>',
          '<button class="rep-info-btn" id="open-progress-panel" title="View all badges and progress">i</button>',
        '</div>',
      '</div>',
      // XP bar
      '<div style="margin-bottom:1.5rem;">',
        '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:0.4rem;">',
          '<span style="font-size:0.78rem;font-weight:600;color:var(--text-primary);">XP toward next rank</span>',
          '<span style="font-size:0.72rem;color:var(--text-secondary);">' + xpLabelText + '</span>',
        '</div>',
        '<div class="xp-bar-track"><div class="xp-bar-fill" id="xp-bar" style="width:' + pct + '%;"></div></div>',
        '<p style="font-size:0.68rem;color:var(--text-muted);margin:0.35rem 0 0;">' + xpNextText + '</p>',
      '</div>',
      // Badges
      '<div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-secondary);margin-bottom:0.75rem;">Badges</div>',
      '<div class="badge-scroll" id="badge-grid"></div>',
    ].join('');

    // Insert after the Personal Information section (vol-personal)
    var main = document.getElementById('profileMain');
    if (main) {
      var personalSection = main.querySelector('#vol-personal');
      if (personalSection && personalSection.nextSibling) {
        main.insertBefore(section, personalSection.nextSibling);
      } else if (personalSection) {
        main.appendChild(section);
      } else {
        // fallback: insert after first section
        var firstSection = main.querySelector('.profile-section');
        if (firstSection && firstSection.nextSibling) {
          main.insertBefore(section, firstSection.nextSibling);
        } else {
          main.appendChild(section);
        }
      }
    }

    // Render badges
    renderBadgeGrid(earnedBadges, catalog);
    renderProgressPanel(earnedBadges, catalog, rep);

    // Wire progress panel
    var backdrop = document.getElementById('progress-panel-backdrop');
    var openBtn = document.getElementById('open-progress-panel');
    var closeBtn = document.getElementById('panel-close-btn');
    if (openBtn && backdrop) {
      openBtn.addEventListener('click', function() { backdrop.classList.add('open'); });
    }
    if (closeBtn && backdrop) {
      closeBtn.addEventListener('click', function() { backdrop.classList.remove('open'); });
    }
    if (backdrop) {
      backdrop.addEventListener('click', function(e) { if (e.target === backdrop) backdrop.classList.remove('open'); });
    }
  }).catch(function(err) { console.warn('Reputation section failed to load:', err); });
}
