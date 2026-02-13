document.addEventListener('DOMContentLoaded', () => {
    let currentStep = 1;
    const totalSteps = 4;

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
