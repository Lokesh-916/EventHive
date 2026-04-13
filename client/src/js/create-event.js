document.addEventListener('DOMContentLoaded', () => {
    let currentStep = 1;
    const totalSteps = 5;

    const panes = document.querySelectorAll('.step-pane');
    const nodes = document.querySelectorAll('.step-node');
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');
    const btnSubmit = document.getElementById('btn-submit');
    const progressFill = document.getElementById('progress-line-fill');

    const venueSection = document.getElementById('venue-section');
    const virtualSection = document.getElementById('virtual-section');

    // Step Navigation Logic
    function updateUI() {
        // Update Panes
        panes.forEach(pane => pane.classList.remove('active'));
        document.getElementById(`pane-${currentStep}`).classList.add('active');

        // Update Nodes
        nodes.forEach((node, idx) => {
            const stepIdx = idx + 1;
            node.classList.remove('active', 'completed');
            if (stepIdx === currentStep) node.classList.add('active');
            if (stepIdx < currentStep) node.classList.add('completed');
        });

        // Update Progress Line
        const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
        progressFill.style.width = `${progress}%`;

        // Update Buttons
        btnPrev.classList.toggle('hidden', currentStep === 1);
        if (currentStep === totalSteps) {
            btnNext.classList.add('hidden');
            btnSubmit.classList.remove('hidden');
        } else {
            btnNext.classList.remove('hidden');
            btnSubmit.classList.add('hidden');
        }
    }

    // Navigation Buttons Logic
    btnNext.addEventListener('click', () => {
        if (currentStep < totalSteps) {
            currentStep++;
            updateUI();
            scrollToTop();
        }
    });

    btnPrev.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateUI();
            scrollToTop();
        }
    });

    function scrollToTop() {
        const container = document.querySelector('.glass-container');
        if (container) {
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Banner Preview Logic
    const bannerInput = document.getElementById('event-banner');
    const bannerPreview = document.getElementById('banner-preview');
    const bannerPlaceholder = document.getElementById('banner-placeholder');
    const bannerDropZone = document.getElementById('banner-drop-zone');

    if (bannerDropZone && bannerInput) {
        bannerDropZone.addEventListener('click', () => bannerInput.click());

        bannerInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    bannerPreview.src = event.target.result;
                    bannerPreview.classList.remove('hidden');
                    bannerPlaceholder.classList.add('hidden');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Event Type Toggle Logic
    document.querySelectorAll('input[name="event-type"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val === 'physical') {
                venueSection.classList.remove('hidden');
                virtualSection.classList.add('hidden');
            } else if (val === 'virtual') {
                venueSection.classList.add('hidden');
                virtualSection.classList.remove('hidden');
            } else {
                venueSection.classList.remove('hidden');
                virtualSection.classList.remove('hidden');
            }
        });
    });

    // --- Schedule / Timetable Logic ---
    const scheduleDaysContainer = document.getElementById('schedule-days-container');
    const eventStartInput = document.getElementById('event-start');
    const eventEndInput = document.getElementById('event-end');

    function updateScheduleDays() {
        if (!scheduleDaysContainer) return;
        
        const start = new Date(eventStartInput.value);
        const end = new Date(eventEndInput.value);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            scheduleDaysContainer.innerHTML = `
                <div class="text-center py-10 border border-dashed border-white/10 rounded-2xl bg-white/5">
                    <p class="text-sm opacity-50">Please set the Start and End dates in the "Location" step first.</p>
                </div>
            `;
            return;
        }

        // Calculate number of days
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        
        // Ensure at least 1 day if start and end are on the same day but end > start
        const totalDays = end.getDate() === start.getDate() && end.getMonth() === start.getMonth() && end.getFullYear() === start.getFullYear() ? 1 : diffDays + 1;

        // I'll use a simpler 'totalDays' logic for now: difference in dates + 1
        const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        const daysCount = Math.round((endDay - startDay) / (1000 * 60 * 60 * 24)) + 1;

        if (daysCount <= 0) {
             scheduleDaysContainer.innerHTML = `
                <div class="text-center py-10 border border-dashed border-white/10 rounded-2xl bg-white/5">
                    <p class="text-sm opacity-50 text-red-400">End date must be after Start date.</p>
                </div>
            `;
            return;
        }

        // Keep existing data if possible (simplified for now: just re-render)
        scheduleDaysContainer.innerHTML = '';
        
        for (let i = 1; i <= daysCount; i++) {
            const daySection = document.createElement('div');
            daySection.className = 'day-section';
            daySection.dataset.day = i;
            daySection.innerHTML = `
                <div class="day-header">
                    <span class="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-sm font-bold">${i}</span>
                    <span>Day ${i} Schedule</span>
                </div>
                <div class="schedule-items-list space-y-4" id="day-${i}-items">
                    <!-- Schedule items for this day -->
                </div>
                <button type="button" class="btn-add-role mt-4 w-full justify-center" onclick="addScheduleItem(${i})">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Activity
                </button>
            `;
            scheduleDaysContainer.appendChild(daySection);
            // Add initial item
            addScheduleItem(i);
        }
    }

    window.addScheduleItem = (day) => {
        const container = document.getElementById(`day-${day}-items`);
        if (!container) return;

        const itemCard = document.createElement('div');
        itemCard.className = 'schedule-item-card';
        itemCard.innerHTML = `
            <div class="flex items-start justify-between gap-4 mb-3">
                <div class="grid grid-cols-2 gap-4 flex-1">
                    <div>
                        <label class="eh-label">Start Time</label>
                        <input type="time" class="eh-input-dark item-start" placeholder="10:00 AM">
                    </div>
                    <div>
                        <label class="eh-label">End Time</label>
                        <input type="time" class="eh-input-dark item-end" placeholder="11:00 AM">
                    </div>
                </div>
                <button type="button" class="btn-remove-role pt-6" onclick="this.closest('.schedule-item-card').remove()">&times;</button>
            </div>
            <div class="mb-3">
                <input type="text" class="eh-input-dark item-title" placeholder="Activity Title (e.g. Keynote Speech)">
            </div>
            <div>
                <textarea rows="2" class="eh-input-dark item-desc" placeholder="Brief description of the activity..."></textarea>
            </div>
        `;
        container.appendChild(itemCard);
    };

    // Listen for date changes to update schedule days
    eventStartInput?.addEventListener('change', updateScheduleDays);
    eventEndInput?.addEventListener('change', updateScheduleDays);

    // Volunteer Role Add/Remove Logic
    let roleCount = 1;
    const rolesContainer = document.getElementById('volunteer-roles-container');
    const btnAddRole = document.getElementById('btn-add-role');

    if (btnAddRole && rolesContainer) {
        btnAddRole.addEventListener('click', () => {
            roleCount++;
            const roleCard = document.createElement('div');
            roleCard.className = 'volunteer-role-card';
            roleCard.dataset.roleId = roleCount;
            roleCard.style.animation = 'fadeIn 0.4s ease-out';
            roleCard.innerHTML = `
                <div class="flex items-start justify-between gap-4 mb-3">
                    <span class="text-xs font-bold text-white/50 uppercase tracking-widest pt-2">Role ${roleCount}</span>
                    <button type="button" class="btn-remove-role" onclick="removeRole(this)" title="Remove role">&times;</button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div class="md:col-span-2">
                        <input type="text" class="eh-input-dark role-title" placeholder="Role title (e.g. Stage Manager, Crowd Control)">
                    </div>
                    <div>
                        <input type="number" class="eh-input-dark role-count" placeholder="Count" min="1">
                    </div>
                </div>
                <div>
                    <textarea rows="2" class="eh-input-dark role-note" placeholder="Special note for applicants (e.g. Must be available all 3 days, heavy lifting required)"></textarea>
                </div>
            `;
            rolesContainer.appendChild(roleCard);
        });
    }

    // Submit Handler
    btnSubmit.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('event-title')?.value;
        const type = document.querySelector('input[name="event-type"]:checked')?.value || 'physical';
        
        if (!title) {
            alert('Please provide at least an event title');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        
        if(document.getElementById('event-tagline')) formData.append('tagline', document.getElementById('event-tagline').value);
        if(document.getElementById('event-description')) formData.append('description', document.getElementById('event-description').value);
        if(document.getElementById('event-category')) formData.append('category', document.getElementById('event-category').value);
        formData.append('type', type);
        
        const tags = document.getElementById('event-tags')?.value.split(',').map(t => t.trim()) || [];
        formData.append('tags', JSON.stringify(tags));
        
        const bannerFile = document.getElementById('event-banner')?.files[0];
        if (bannerFile) formData.append('banner', bannerFile);
        
        const schedule = {
            start: document.getElementById('event-start')?.value,
            end: document.getElementById('event-end')?.value,
            timezone: document.getElementById('event-timezone')?.value,
            applicationDeadline: document.getElementById('volunteer-deadline')?.value
        };
        formData.append('schedule', JSON.stringify(schedule));
        
        const location = {
            venueName: document.getElementById('venue-name')?.value || '',
            city: document.getElementById('venue-city')?.value || '',
            stateCountry: document.getElementById('venue-state-country')?.value || document.getElementById('venue-state')?.value || '',
            virtualLink: document.getElementById('virtual-link')?.value || ''
        };
        formData.append('location', JSON.stringify(location));
        
        const requirements = {
            totalVolunteers: document.getElementById('total-volunteers')?.value,
            minAge: document.getElementById('min-age')?.value,
            perks: document.getElementById('volunteer-perks')?.value,
            preferredSkills: (document.getElementById('skills-preferred')?.value || '').split(',').map(s => s.trim()).filter(Boolean),
            generalNote: document.getElementById('volunteer-general-note')?.value
        };
        formData.append('volunteerRequirements', JSON.stringify(requirements));
        
        const roles = [];
        document.querySelectorAll('.volunteer-role-card').forEach(card => {
            roles.push({
                roleId: card.dataset.roleId,
                title: card.querySelector('.role-title')?.value,
                count: card.querySelector('.role-count')?.value,
                notes: card.querySelector('.role-note')?.value
            });
        });
        formData.append('volunteerRoles', JSON.stringify(roles));
        const mediaInputs = document.querySelectorAll('input[data-social]');
        const socials = {};
        mediaInputs.forEach(inp => { if(inp.value) socials[inp.dataset.social] = inp.value; });
        const media = {
            promoVideo: document.getElementById('promo-video')?.value || '',
            supportContact: document.getElementById('support-contact')?.value || '',
            socials
        };
        formData.append('media', JSON.stringify(media));
        
        // Timetable collection
        const timetable = [];
        document.querySelectorAll('.day-section').forEach(daySec => {
            const day = daySec.dataset.day;
            daySec.querySelectorAll('.schedule-item-card').forEach(itemCard => {
                const title = itemCard.querySelector('.item-title')?.value;
                if (title) {
                    timetable.push({
                        day: parseInt(day),
                        startTime: itemCard.querySelector('.item-start')?.value,
                        endTime: itemCard.querySelector('.item-end')?.value,
                        title: title,
                        description: itemCard.querySelector('.item-desc')?.value
                    });
                }
            });
        });
        formData.append('timetable', JSON.stringify(timetable));

        formData.append('status', 'published');

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login as organizer first');
            return;
        }

        try {
            const response = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await response.json();
            if (data.success) {
                alert('Event created successfully!');
                window.location.href = '/event-info?id=' + data.data._id;
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Failed to submit event', error);
            alert('Server connection error while creating event.');
        }
    });

    // Initial UI update
    updateUI();
});

// Global function for removing roles (called from onclick in HTML)
function removeRole(btn) {
    const card = btn.closest('.volunteer-role-card');
    const container = document.getElementById('volunteer-roles-container');
    // Don't remove if it's the last one
    if (container && container.children.length > 1) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(-10px)';
        card.style.transition = 'all 0.3s ease';
        setTimeout(() => card.remove(), 300);
    }
}
