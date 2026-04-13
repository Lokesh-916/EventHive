// ===== Event Info Page – Dynamic Loader =====
// Reads ?id= from URL, fetches from /api/events/:id, renders entire page

document.addEventListener('DOMContentLoaded', async () => {

    const root = document.getElementById('event-root');

    // --- Helpers ---
    function formatDate(dateStr) {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    }

    function formatDateTime(dateStr) {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }

    function esc(str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // --- Get event id from query string ---
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('id');

    if (!eventId) {
        root.innerHTML = `<div class="error-state max-w-5xl mx-auto px-6"><h2 style="font-size:1.4rem;margin-bottom:0.5rem;">No event specified.</h2><p>Please go back and select an event.</p><a href="/home" style="display:inline-block;margin-top:1rem;padding:0.6rem 1.4rem;border:1px solid rgba(255,255,255,0.15);border-radius:9999px;color:rgba(255,255,255,0.6);text-decoration:none;font-size:0.8rem;">← Back to Home</a></div>`;
        return;
    }

    // --- Fetch event ---
    let ev;
    try {
        const res = await fetch(`/api/events/${eventId}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Not found');
        ev = data.data;
    } catch (err) {
        root.innerHTML = `<div class="error-state max-w-5xl mx-auto px-6"><h2 style="font-size:1.4rem;margin-bottom:0.5rem;">Event not found.</h2><p>${esc(err.message)}</p><a href="/home" style="display:inline-block;margin-top:1rem;padding:0.6rem 1.4rem;border:1px solid rgba(255,255,255,0.15);border-radius:9999px;color:rgba(255,255,255,0.6);text-decoration:none;font-size:0.8rem;">← Back to Home</a></div>`;
        return;
    }

    // --- Check if user already applied ---
    const token = localStorage.getItem('token');
    let existingApplication = null;
    if (token) {
        try {
            const appRes = await fetch('/api/applications/my-applications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (appRes.ok) {
                const appData = await appRes.json();
                const myApps = appData.data || [];
                existingApplication = myApps.find(a => {
                    const appEventId = a.eventId?._id || a.eventId;
                    return String(appEventId) === String(eventId);
                }) || null;
            }
        } catch (e) { /* ignore */ }
    }

    // --- Set page title ---
    document.title = `${ev.title} – EventHive`;
    document.getElementById('pageTitle').textContent = `${ev.title} – EventHive`;
    const overviewLink = document.getElementById('overview-link');
    if (overviewLink) overviewLink.href = `/event-overview?id=${eventId}`;

    // --- Banner ---
    const bannerHtml = ev.banner
        ? `<img src="${esc(ev.banner)}" alt="${esc(ev.title)}" class="w-full h-64 md:h-80 object-cover">`
        : `<div class="w-full h-64 md:h-80 no-image relative">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
               </svg>
               <div class="absolute top-4 left-4">
                   <span class="info-chip">${esc(ev.category || 'Event')}</span>
               </div>
               <div class="absolute top-4 right-4">
                   <span class="info-chip">${esc(ev.type ? ev.type.charAt(0).toUpperCase() + ev.type.slice(1) + ' Event' : 'Event')}</span>
               </div>
           </div>`;

    const bannerWrapperHtml = ev.banner
        ? `<div class="relative overflow-hidden" style="border-radius:1.5rem 1.5rem 0 0">
               ${bannerHtml}
               <div class="absolute top-4 left-4"><span class="info-chip">${esc(ev.category || 'Event')}</span></div>
               <div class="absolute top-4 right-4"><span class="info-chip">${esc(ev.type ? ev.type.charAt(0).toUpperCase() + ev.type.slice(1) + ' Event' : 'Event')}</span></div>
           </div>`
        : bannerHtml;

    // --- Tags ---
    const tags = (ev.tags || []).map(t => `<span class="event-tag">${esc(t)}</span>`).join('');

    // --- Date / time display ---
    const schedStart = ev.schedule?.start ? formatDateTime(ev.schedule.start) : '—';
    const schedEnd = ev.schedule?.end ? formatDateTime(ev.schedule.end) : '—';
    const schedTimezone = ev.schedule?.timezone || 'IST';
    const appDeadline = ev.schedule?.applicationDeadline ? formatDate(ev.schedule.applicationDeadline) : '—';
    const isPast = ev.schedule?.end ? new Date(ev.schedule.end) < new Date() : false;

    // --- Venue ---
    const venue = ev.location || {};
    const venueLines = [venue.venueName, venue.city, venue.stateCountry].filter(Boolean);
    const venueText = venueLines.join(', ') || 'TBD';
    const virtualLink = venue.virtualLink;

    // --- Volunteer requirements ---
    const vr = ev.volunteerRequirements || {};
    const totalVols = vr.totalVolunteers || '—';
    const minAge = vr.minAge ? `${vr.minAge}+` : '—';
    const perks = vr.perks || '—';
    const skills = Array.isArray(vr.preferredSkills) ? vr.preferredSkills.join(', ') : (vr.preferredSkills || '—');
    const generalNote = vr.generalNote || '';

    // --- Roles listing ---
    const roles = ev.volunteerRoles || [];
    const rolesHtml = roles.length
        ? roles.map(r => `
            <div class="glass-card-light p-5">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="font-bold text-sm">${esc(r.title)}</h3>
                    <span class="info-chip text-[10px]">${isPast ? esc(r.count) + ' helped' : esc(r.count) + ' needed'}</span>
                </div>
                <p class="text-xs text-white/40 leading-relaxed">${esc(r.notes || '')}</p>
            </div>`).join('')
        : `<p class="text-xs text-white/40">No specific roles defined.</p>`;

    // --- Organizer ---
    const organizer = ev.organizerId || {};
    const orgName = organizer['profile.orgName'] || organizer.profile?.orgName || organizer.username || 'Organizer';
    const orgType = organizer['profile.organization'] || organizer.profile?.organization || '';

    // --- Socials ---
    const socials = ev.media?.socials || {};
    function socialLink(href, title, svgPath) {
        if (!href) return '';
        return `<a href="${esc(href)}" target="_blank" rel="noopener" class="social-link" title="${title}">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="${svgPath}"/></svg>
        </a>`;
    }
    const socialsHtml = [
        socialLink(socials.twitter, 'Twitter', 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'),
        socialLink(socials.instagram, 'Instagram', 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z'),
        socialLink(socials.linkedin, 'LinkedIn', 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'),
        socialLink(socials.facebook, 'Facebook', 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z')
    ].filter(Boolean).join('');

    // --- Promo video ---
    let promoHtml = `<div class="w-full aspect-video rounded-xl overflow-hidden no-image flex flex-col items-center justify-center">
        <div class="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="text-xs text-white/30">No promo video</p>
        </div>
    </div>`;

    if (ev.media?.promoVideo) {
        // Try to convert YouTube URL to embed
        const ytMatch = ev.media.promoVideo.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([A-Za-z0-9_-]{11})/);
        if (ytMatch) {
            promoHtml = `<div class="w-full aspect-video rounded-xl overflow-hidden"><iframe class="w-full h-full" src="https://www.youtube.com/embed/${ytMatch[1]}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe></div>`;
        } else {
            promoHtml = `<a href="${esc(ev.media.promoVideo)}" target="_blank" rel="noopener" class="btn-enroll" style="display:inline-block;text-decoration:none;">Watch Promo Video ↗</a>`;
        }
    }

    // --- Render full page ---
    root.innerHTML = `
        <!-- Hero Banner -->
        <div class="max-w-5xl mx-auto px-6 mb-8 animate-in delay-1">
            <div class="glass-card overflow-hidden">
                ${bannerWrapperHtml}
                <div class="p-6 md:p-8">
                    <h1 class="satisfy-regular text-3xl md:text-5xl text-white mb-2">${esc(ev.title)}</h1>
                    ${ev.tagline ? `<p class="text-white/50 text-sm md:text-base font-medium italic">"${esc(ev.tagline)}"</p>` : ''}
                    ${tags ? `<div class="flex flex-wrap gap-2 mt-4">${tags}</div>` : ''}
                </div>
            </div>
        </div>

        <!-- Main Content Grid -->
        <div class="max-w-5xl mx-auto px-6">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <!-- Left Column -->
                <div class="lg:col-span-2 space-y-6">

                    <!-- About -->
                    <div class="glass-card p-6 md:p-8 animate-in delay-2">
                        <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            About This Event
                        </h2>
                        <p class="text-white/60 text-sm leading-relaxed">${esc(ev.description || 'No description provided.')}</p>
                    </div>

                    <!-- Event Schedule -->
                    ${ev.timetable && ev.timetable.length > 0 ? `
                    <div class="glass-card p-6 md:p-8 animate-in delay-2">
                        <h2 class="text-lg font-bold mb-6 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            Event Schedule
                        </h2>
                        <div class="space-y-8">
                            ${[...new Set(ev.timetable.map(t => t.day))].sort((a,b) => a-b).map(dayNum => `
                                <div class="day-group">
                                    <h3 class="text-sm font-bold uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
                                        <span class="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white">D${dayNum}</span>
                                        Day ${dayNum}
                                    </h3>
                                    <div class="space-y-4 border-l-2 border-white/5 ml-3 pl-6">
                                        ${ev.timetable.filter(t => t.day === dayNum).map(item => `
                                            <div class="relative">
                                                <div class="absolute -left-[31px] top-1.5 w-2 h-2 rounded-full bg-white/20"></div>
                                                <div class="flex flex-col md:flex-row md:items-start gap-1 md:gap-4">
                                                    <span class="text-[10px] font-bold text-white/30 whitespace-nowrap mt-0.5">${esc(item.startTime || '')} - ${esc(item.endTime || '')}</span>
                                                    <div>
                                                        <h4 class="text-sm font-bold text-white/80">${esc(item.title)}</h4>
                                                        <p class="text-xs text-white/40 mt-1">${esc(item.description || '')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>` : ''}

                    <!-- Date & Venue -->
                    <div class="glass-card p-6 md:p-8 animate-in delay-3">
                        <h2 class="text-lg font-bold mb-5 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                            When &amp; Where
                        </h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="glass-card-light p-5">
                                <p class="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-3">Date &amp; Time</p>
                                <div class="space-y-2">
                                    <div class="flex items-center gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                        </svg>
                                        <div>
                                            <p class="text-sm font-semibold">${esc(schedStart)}</p>
                                            ${schedEnd !== '—' ? `<p class="text-xs text-white/40">Ends: ${esc(schedEnd)}</p>` : ''}
                                        </div>
                                    </div>
                                    <p class="text-[10px] text-white/30 pl-7">Timezone: ${esc(schedTimezone)}</p>
                                </div>
                            </div>
                            <div class="glass-card-light p-5">
                                <p class="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-3">Venue</p>
                                <div class="flex items-start gap-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white/30 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                    </svg>
                                    <div>
                                        <p class="text-sm font-semibold">${esc(venueText)}</p>
                                    </div>
                                </div>
                                ${virtualLink ? `
                                <div class="flex items-start gap-3 mt-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white/30 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                                    </svg>
                                    <div>
                                        <p class="text-sm font-semibold">Also streaming online</p>
                                        <a href="${esc(virtualLink)}" target="_blank" class="text-xs text-white/40 hover:text-white/70 transition-colors">Join virtual link →</a>
                                    </div>
                                </div>` : ''}
                            </div>
                        </div>
                    </div>

                    <!-- Volunteer Opportunities -->
                    ${roles.length > 0 || vr.totalVolunteers ? `
                    <div class="glass-card p-6 md:p-8 animate-in delay-4">
                        <h2 class="text-lg font-bold mb-2 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                            </svg>
                            Volunteer Opportunities
                        </h2>
                        <p class="text-xs text-white/40 mb-5">
                            ${totalVols !== '—' ? (isPast ? `${totalVols} participated` : `${totalVols} volunteers needed`) : ''}
                            ${appDeadline !== '—' ? (isPast ? ` · Completed on ${formatDate(ev.schedule.end)}` : ` · Applications close ${appDeadline}`) : ''}
                        </p>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            ${rolesHtml}
                        </div>

                        <div class="flex flex-wrap gap-3 mb-5">
                            ${minAge !== '—' ? `<span class="info-chip"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>Min. Age: ${esc(minAge)}</span>` : ''}
                            ${perks !== '—' ? `<span class="info-chip"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/></svg>Perks: ${esc(perks)}</span>` : ''}
                            ${skills !== '—' ? `<span class="info-chip"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>Skills: ${esc(skills)}</span>` : ''}
                        </div>

                        ${generalNote ? `
                        <div class="glass-card-light p-5">
                            <p class="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2">General Instructions</p>
                            <p class="text-xs text-white/50 leading-relaxed">${esc(generalNote)}</p>
                        </div>` : ''}

                        ${!isPast ? `
                        <div class="text-center mt-8">
                            ${existingApplication
                                ? `<div class="inline-flex flex-col items-center gap-2">
                                    <div class="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-green-500/30 bg-green-500/10 text-green-400 text-sm font-semibold">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                        </svg>
                                        Already Enrolled
                                    </div>
                                    <p class="text-xs text-white/40">You applied as <span class="text-white/60 font-semibold">${esc(existingApplication.roleName || existingApplication.roleId || 'Volunteer')}</span> · Status: <span class="font-semibold ${existingApplication.status === 'approved' ? 'text-green-400' : existingApplication.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'}">${existingApplication.status ? existingApplication.status.charAt(0).toUpperCase() + existingApplication.status.slice(1) : 'Pending'}</span></p>
                                   </div>`
                                : `<button id="btn-enroll" class="btn-enroll">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                                </svg>
                                Enroll as Volunteer
                            </button>`}
                        </div>
                        ` : `
                        <div class="text-center mt-8">
                            <div class="inline-block px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-white/50 text-sm font-semibold">
                                Event has ended
                            </div>
                        </div>
                        `}
                    </div>` : ''}

                    <!-- Promo Video -->
                    <div class="glass-card p-6 md:p-8 animate-in delay-5">
                        <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                            </svg>
                            Promo Video
                        </h2>
                        ${promoHtml}
                    </div>
                </div>

                <!-- Right Column: Sidebar -->
                <div class="space-y-6">

                    <!-- Organizer Card -->
                    <div class="glass-card p-6 animate-in delay-2">
                        <p class="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-4">Organized By</p>
                        <div class="flex items-center gap-4 mb-5">
                            <div class="w-14 h-14 rounded-xl no-image flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                            </div>
                            <div>
                                <p class="font-bold text-sm">${esc(orgName)}</p>
                                ${orgType ? `<p class="text-xs text-white/40">${esc(orgType)}</p>` : ''}
                            </div>
                        </div>
                    </div>

                    <!-- Quick Info Card -->
                    <div class="glass-card p-6 animate-in delay-3">
                        <p class="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-4">Quick Info</p>
                        <div class="space-y-4">
                            <div class="flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white/30 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                                </svg>
                                <div>
                                    <p class="text-xs font-semibold">Category</p>
                                    <p class="text-[10px] text-white/40">${esc(ev.category || '—')}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white/30 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                                </svg>
                                <div>
                                    <p class="text-xs font-semibold">Volunteers Needed</p>
                                    <p class="text-[10px] text-white/40">${esc(String(totalVols))}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white/30 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <div>
                                    <p class="text-xs font-semibold">Application Deadline</p>
                                    <p class="text-[10px] text-white/40">${esc(appDeadline)}</p>
                                </div>
                            </div>
                            ${ev.media?.supportContact ? `
                            <div class="flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white/30 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                                </svg>
                                <div>
                                    <p class="text-xs font-semibold">Support</p>
                                    <p class="text-[10px] text-white/40">${esc(ev.media.supportContact)}</p>
                                </div>
                            </div>` : ''}
                        </div>
                    </div>

                    <!-- Socials -->
                    ${socialsHtml ? `
                    <div class="glass-card p-6 animate-in delay-4">
                        <p class="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-4">Connect</p>
                        <div class="flex gap-3">${socialsHtml}</div>
                    </div>` : ''}

                    <!-- Mobile Enroll Button -->
                    ${roles.length > 0 && !existingApplication ? `
                    <div class="lg:hidden text-center">
                        <button id="btn-enroll-mobile" class="btn-enroll w-full">Enroll as Volunteer</button>
                    </div>` : ''}
                </div>
            </div>
        </div>
    `;

    // --- Now wire up the modal ---
    const modal = document.getElementById('enroll-modal');
    const btnEnroll = document.getElementById('btn-enroll');
    const btnEnrollMobile = document.getElementById('btn-enroll-mobile');
    const btnClose = document.getElementById('modal-close');
    const btnConfirm = document.getElementById('btn-confirm-enroll');
    const enrollHint = document.getElementById('enroll-hint');
    const modalRolesContainer = document.getElementById('modal-roles');

    // Populate modal roles from live data
    if (roles.length > 0 && modalRolesContainer) {
        modalRolesContainer.innerHTML = roles.map(r => `
            <div class="role-card" data-role-id="${esc(r.roleId || r._id || r.title)}">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="font-bold text-sm role-title-text">${esc(r.title)}</p>
                        <p class="text-[10px] text-white/40 mt-1">${esc(r.count)} position${r.count !== 1 ? 's' : ''}${r.notes ? ' · ' + r.notes.slice(0, 40) : ''}</p>
                    </div>
                    <div class="w-5 h-5 rounded-full border border-white/10 flex items-center justify-center role-check"></div>
                </div>
            </div>`).join('');
    } else if (modalRolesContainer) {
        modalRolesContainer.innerHTML = `<p class="text-xs text-white/40 text-center py-4">No specific roles defined for this event.</p>`;
    }

    function openModal() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (btnEnroll) btnEnroll.addEventListener('click', openModal);
    if (btnEnrollMobile) btnEnrollMobile.addEventListener('click', openModal);
    if (btnClose) btnClose.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });

    // Role selection in modal
    let selectedRole = null;
    document.querySelectorAll('#modal-roles .role-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('#modal-roles .role-card').forEach(c => {
                c.classList.remove('selected');
                c.querySelector('.role-check').innerHTML = '';
            });
            card.classList.add('selected');
            card.querySelector('.role-check').innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>`;
            selectedRole = card.dataset.roleId;
            btnConfirm.classList.remove('opacity-40', 'pointer-events-none');
            btnConfirm.disabled = false;
            enrollHint.textContent = `You selected: ${card.querySelector('.role-title-text').textContent}`;
        });
    });

    // Confirm enrollment
    if (btnConfirm) {
        btnConfirm.addEventListener('click', async () => {
            if (!selectedRole) return;

            const token = localStorage.getItem('token');
            const roleName = document.querySelector(`[data-role-id="${selectedRole}"] .role-title-text`)?.textContent || selectedRole;

            if (token) {
                try {
                    const res = await fetch('/api/applications', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ eventId: eventId, roleId: selectedRole, roleName })
                    });
                    const data = await res.json();
                    if (!res.ok) {
                        const errMsg = data.error || 'Failed to enroll. Please try again.';
                        enrollHint.textContent = errMsg;
                        enrollHint.style.color = '#f87171';
                        return;
                    }
                } catch (e) {
                    enrollHint.textContent = 'Network error. Please try again.';
                    enrollHint.style.color = '#f87171';
                    return;
                }
            } else {
                enrollHint.textContent = 'Please log in to enroll.';
                enrollHint.style.color = '#f87171';
                return;
            }

            const modalContent = modal.querySelector('.modal-content');
            modalContent.innerHTML = `
                <div class="text-center py-8">
                    <div class="w-16 h-16 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mx-auto mb-5">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                    </div>
                    <h2 class="satisfy-regular text-3xl mb-2">You're In!</h2>
                    <p class="text-sm text-white/50 mb-1">Successfully enrolled as</p>
                    <p class="text-lg font-bold">${roleName}</p>
                    <p class="text-xs text-white/40 mt-4">The organizer will review your application and get back to you soon.</p>
                    <button onclick="location.reload()" class="btn-enroll mt-6" style="padding: 0.75rem 2rem; font-size: 0.75rem;">Okay, Got It</button>
                </div>`;
        });
    }
});
