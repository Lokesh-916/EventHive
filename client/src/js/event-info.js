// ===== Event Info Page Logic =====
// Handles the enrollment modal and role selection

document.addEventListener('DOMContentLoaded', () => {

    // --- Enrollment Modal ---
    const modal = document.getElementById('enroll-modal');
    const btnEnroll = document.getElementById('btn-enroll');
    const btnEnrollMobile = document.getElementById('btn-enroll-mobile');
    const btnClose = document.getElementById('modal-close');
    const btnConfirm = document.getElementById('btn-confirm-enroll');
    const enrollHint = document.getElementById('enroll-hint');
    const roleCards = document.querySelectorAll('#modal-roles .role-card');

    let selectedRole = null;

    // Open modal
    function openModal() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Close modal
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (btnEnroll) btnEnroll.addEventListener('click', openModal);
    if (btnEnrollMobile) btnEnrollMobile.addEventListener('click', openModal);
    if (btnClose) btnClose.addEventListener('click', closeModal);

    // Close modal on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // --- Role Selection ---
    roleCards.forEach(card => {
        card.addEventListener('click', () => {
            // Deselect all
            roleCards.forEach(c => {
                c.classList.remove('selected');
                c.querySelector('.role-check').innerHTML = '';
            });

            // Select clicked
            card.classList.add('selected');
            card.querySelector('.role-check').innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
            `;

            selectedRole = card.dataset.role;

            // Enable confirm button
            btnConfirm.classList.remove('opacity-40', 'pointer-events-none');
            btnConfirm.disabled = false;
            enrollHint.textContent = `You selected: ${card.querySelector('.font-bold').textContent}`;
        });
    });

    // --- Confirm Enrollment ---
    btnConfirm.addEventListener('click', () => {
        if (!selectedRole) return;

        const roleName = document.querySelector(`[data-role="${selectedRole}"] .font-bold`).textContent;

        // Show success state
        const modalContent = modal.querySelector('.modal-content');
        modalContent.innerHTML = `
            <div class="text-center py-8">
                <div class="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center mx-auto mb-5" style="background: rgba(255,255,255,0.08);">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 class="satisfy-regular text-3xl mb-2">You're In!</h2>
                <p class="text-sm text-white/50 mb-1">Successfully enrolled as</p>
                <p class="text-lg font-bold">${roleName}</p>
                <p class="text-xs text-white/40 mt-4">The organizer will review your application and get back to you soon.</p>
                <button onclick="location.reload()" class="btn-enroll mt-6" style="padding: 0.75rem 2rem; font-size: 0.75rem;">Okay, Got It</button>
            </div>
        `;
    });
});
