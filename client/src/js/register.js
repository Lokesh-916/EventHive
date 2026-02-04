/**
 * ==========================================
 * REGISTRATION LOGIC
 * ==========================================
 * Logic to dynamically display role-based content based on URL parameters.
 * Used in: HTML body (updates #role-display content)
 */

const urlParams = new URLSearchParams(window.location.search);
const type = urlParams.get('type');
const display = document.getElementById('role-display');

if (display) {
    if (type === 'organizer') {
        display.innerHTML = `
            <h2 class="text-2xl font-bold text-eh-teal mb-2">Organizer Registration</h2>
            <p>Create your team and start managing events.</p>
            <!-- Add form here later -->
        `;
    } else if (type === 'volunteer') {
        display.innerHTML = `
            <h2 class="text-2xl font-bold text-eh-teal mb-2">Volunteer Registration</h2>
            <p>Join events and make a difference.</p>
            <!-- Add form here later -->
        `;
    } else {
        display.innerHTML = `
            <h2 class="text-2xl font-bold text-eh-teal mb-2">Registration</h2>
            <p>Please select a role from the home page.</p>
        `;
    }
}
