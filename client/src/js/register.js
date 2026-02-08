/**
 * ==========================================
 * REGISTRATION LOGIC
 * ==========================================
 * Handles dynamic multi-step forms for Volunteers, Organizers, and Clients.
 */

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');

    // DOM Elements
    const loadingState = document.getElementById('loading-state');
    const roleSelection = document.getElementById('role-selection');
    const organizerForm = document.getElementById('organizer-form');
    const volunteerForm = document.getElementById('volunteer-form');
    const clientForm = document.getElementById('client-form');

    // Hide loading after a brief moment (simulating check)
    setTimeout(() => {
        loadingState.style.display = 'none';

        if (type === 'organizer') {
            organizerForm.classList.remove('hidden');
            initOrganizerFlow();
        } else if (type === 'volunteer') {
            volunteerForm.classList.remove('hidden');
            initVolunteerFlow();
        } else if (type === 'client') {
            clientForm.classList.remove('hidden');
            initClientFlow();
        } else {
            roleSelection.classList.remove('hidden');
        }
    }, 500);
});

/**
 * ==========================================
 * ORGANIZER FLOW
 * ==========================================
 */
function initOrganizerFlow() {
    let currentStep = 1;
    const totalSteps = 4;

    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    const progressBar = document.getElementById('org-progress-bar');
    const steps = document.querySelectorAll('.progress-step');

    // Initialize Location Handler
    setupLocationHandler('org-loc-btn', 'org-manual-loc-btn', 'org-manual-loc-box', 'org-city', 'org-state', 'org-country', 'org-coords');


    // Initial Render
    updateUI();

    // Event Listeners
    nextBtn.addEventListener('click', () => {
        if (validateStep(currentStep, 'org')) {
            currentStep++;
            updateUI();
        }
    });

    prevBtn.addEventListener('click', () => {
        currentStep--;
        updateUI();
    });

    // Submit Handler
    submitBtn.addEventListener('click', (e) => {
        if (validateStep(currentStep, 'org')) {
            // Simulate API call
            alert('Organizer Registration Successful! (Simulation)');
            window.location.href = 'index.html';
        }
    });

    // Main Update Function
    function updateUI() {
        // 1. Show/Hide Form Steps
        document.querySelectorAll('#org-reg-form .step-content').forEach(el => {
            el.classList.remove('active');
            el.style.display = 'none'; // Ensure hidden
        });
        const currentContent = document.getElementById(`org-step-${currentStep}`);
        if (currentContent) {
            currentContent.style.display = 'block';
            setTimeout(() => currentContent.classList.add('active'), 10);
        }

        // 2. Update Progress Bar
        const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
        progressBar.style.width = `${progressPercentage}%`;

        // 3. Update Step Indicators
        steps.forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.remove('active', 'completed');

            if (stepNum === currentStep) {
                step.classList.add('active');
            } else if (stepNum < currentStep) {
                step.classList.add('completed');
            }
        });

        // 4. Update Buttons
        prevBtn.classList.toggle('hidden', currentStep === 1);

        if (currentStep === totalSteps) {
            nextBtn.classList.add('hidden');
            submitBtn.classList.remove('hidden');
        } else {
            nextBtn.classList.remove('hidden');
            submitBtn.classList.add('hidden');
        }
    }
}

/**
 * ==========================================
 * CLIENT FLOW (Single Step)
 * ==========================================
 */
function initClientFlow() {
    let currentStep = 1;
    const totalSteps = 2;

    const prevBtn = document.getElementById('client-prev-btn');
    const nextBtn = document.getElementById('client-next-btn');
    const submitBtn = document.getElementById('client-submit-btn');
    const progressBar = document.getElementById('client-progress-bar');
    const steps = document.querySelectorAll('.client-progress-step');

    // Initialize Location Handler
    setupLocationHandler('client-loc-btn', 'client-manual-loc-btn', 'client-manual-loc-box', 'client-city', 'client-state', 'client-country', 'client-coords');


    // Initial Render
    updateUI();

    // Event Listeners
    nextBtn.addEventListener('click', () => {
        if (validateStep(currentStep, 'client')) {
            currentStep++;
            updateUI();
        }
    });

    prevBtn.addEventListener('click', () => {
        currentStep--;
        updateUI();
    });

    // Submit Handler
    submitBtn.addEventListener('click', (e) => {
        if (validateStep(currentStep, 'client')) {
            // Simulate API call
            alert('Client Registration Successful! Organizers will contact you soon.');
            window.location.href = 'index.html';
        }
    });

    // Main Update Function
    function updateUI() {
        // 1. Show/Hide Form Steps
        document.querySelectorAll('#client-reg-form .client-step-content').forEach(el => {
            el.classList.remove('active');
            el.style.display = 'none'; // Ensure hidden
        });
        const currentContent = document.getElementById(`client-step-${currentStep}`);
        if (currentContent) {
            currentContent.style.display = 'block';
            setTimeout(() => currentContent.classList.add('active'), 10);
        }

        // 2. Update Progress Bar
        const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
        progressBar.style.width = `${progressPercentage}%`;

        // 3. Update Step Indicators
        steps.forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.remove('active', 'completed');

            if (stepNum === currentStep) {
                step.classList.add('active');
            } else if (stepNum < currentStep) {
                step.classList.add('completed');
            }
        });

        // 4. Update Buttons
        prevBtn.classList.toggle('hidden', currentStep === 1);

        if (currentStep === totalSteps) {
            nextBtn.classList.add('hidden');
            submitBtn.classList.remove('hidden');
        } else {
            nextBtn.classList.remove('hidden');
            submitBtn.classList.add('hidden');
        }
    }
}


/**
 * ==========================================
 * VOLUNTEER FLOW
 * ==========================================
 */
/**
 * ==========================================
 * VOLUNTEER FLOW
 * ==========================================
 */
function initVolunteerFlow() {
    let currentStep = 1;
    const totalSteps = 4;
    let addedSkills = [];

    const prevBtn = document.getElementById('vol-prev-btn');
    const nextBtn = document.getElementById('vol-next-btn');
    const submitBtn = document.getElementById('vol-submit-btn');
    const progressBar = document.getElementById('vol-progress-bar');
    const steps = document.querySelectorAll('.vol-progress-step');

    // --- ELEMENTS ---
    // Location
    const manualLocBox = document.getElementById('vol-manual-loc-box');

    // Image
    const picInput = document.getElementById('vol-profile-pic');
    const picPreview = document.getElementById('vol-preview-img');
    const picText = document.getElementById('vol-preview-text');

    // Skills
    const skillInput = document.getElementById('vol-skill-input');
    const addSkillBtn = document.getElementById('vol-add-skill-btn');
    const skillsList = document.getElementById('vol-skills-list');
    const skillRatingInput = document.getElementById('vol-skill-rating');
    const stars = document.querySelectorAll('.star-btn');

    // --- INITIALIZERS ---
    updateUI();
    setupListeners();

    function setupListeners() {
        // Navigation
        nextBtn.addEventListener('click', () => {
            if (validateVolunteerStep(currentStep)) {
                currentStep++;
                updateUI();
            }
        });

        prevBtn.addEventListener('click', () => {
            currentStep--;
            updateUI();
        });

        submitBtn.addEventListener('click', (e) => {
            if (validateVolunteerStep(currentStep)) {
                // Collect Data
                const formData = {
                    email: document.getElementById('vol-email').value,
                    username: document.getElementById('vol-username').value,
                    skills: addedSkills,
                    // ... other fields
                };
                console.log('Volunteer Data:', formData);
                alert('Volunteer Registration Successful! Welcome aboard.');
                window.location.href = 'index.html';
            }
        });

        // Step 2: Location
        setupLocationHandler('vol-loc-btn', 'vol-manual-loc-btn', 'vol-manual-loc-box', 'vol-city', 'vol-state', 'vol-country', 'vol-coords');


        // Step 2: Image Preview & Cropping
        let cropper = null;
        const cropModal = document.getElementById('crop-modal');
        const cropImage = document.getElementById('crop-image');
        const cropSaveBtn = document.getElementById('crop-save-btn');
        const cropCancelBtn = document.getElementById('crop-cancel-btn');

        picInput.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    cropImage.src = e.target.result;
                    cropModal.classList.remove('hidden');

                    // Destroy previous cropper if exists
                    if (cropper) {
                        cropper.destroy();
                    }

                    // Init Cropper
                    cropper = new Cropper(cropImage, {
                        aspectRatio: 1,
                        viewMode: 1,
                        autoCropArea: 1,
                        background: false
                    });
                }
                reader.readAsDataURL(file);
            }
        });

        cropSaveBtn.addEventListener('click', () => {
            if (cropper) {
                const canvas = cropper.getCroppedCanvas({
                    width: 300,
                    height: 300,
                });

                // Display cropped result
                picPreview.src = canvas.toDataURL();
                picPreview.classList.remove('hidden');
                picText.classList.add('hidden');

                // Close Modal
                cropModal.classList.add('hidden');
                cropper.destroy();
                cropper = null;
            }
        });

        cropCancelBtn.addEventListener('click', () => {
            cropModal.classList.add('hidden');
            if (cropper) {
                cropper.destroy();
                cropper = null;
            }
            picInput.value = ''; // Reset input
        });

        // Step 3: Skills - Stars
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const val = parseInt(star.dataset.val);
                skillRatingInput.value = val;
                updateStars(val);
            });
        });

        // Step 3: Skills - Add
        addSkillBtn.addEventListener('click', () => {
            const skillName = skillInput.value.trim();
            const rating = skillRatingInput.value;

            if (!skillName) {
                alert('Please enter a skill name.');
                return;
            }
            if (rating == 0) {
                alert('Please rate this skill.');
                return;
            }

            addedSkills.push({ name: skillName, rating: rating });
            renderSkills();

            // Reset
            skillInput.value = '';
            skillRatingInput.value = 0;
            updateStars(0);
        });
    }

    function updateStars(val) {
        stars.forEach(star => {
            const starVal = parseInt(star.dataset.val);
            if (starVal <= val) {
                star.classList.remove('text-gray-400');
                star.classList.add('text-eh-yellow');
            } else {
                star.classList.add('text-gray-400');
                star.classList.remove('text-eh-yellow');
            }
        });
    }

    function renderSkills() {
        skillsList.innerHTML = '';
        if (addedSkills.length === 0) {
            skillsList.innerHTML = '<span class="text-xs text-gray-500 italic">No skills added yet.</span>';
            return;
        }

        addedSkills.forEach((skill, index) => {
            const tag = document.createElement('div');
            tag.className = 'px-3 py-1 bg-eh-teal text-white rounded-full text-xs flex items-center gap-2';
            tag.innerHTML = `
                <span>${skill.name} (${skill.rating}★)</span>
                <button type="button" class="hover:text-red-300 font-bold" onclick="removeSkill(${index})">×</button>
            `;
            // Note: onclick inline requires global scope or attaching listener.
            // For simplicity, attaching listener here:
            tag.querySelector('button').addEventListener('click', () => {
                addedSkills.splice(index, 1);
                renderSkills();
            });
            skillsList.appendChild(tag);
        });
    }

    function validateVolunteerStep(step) {
        const container = document.getElementById(`vol-step-${step}`);
        let isValid = true;

        // Generic Required Fields
        const inputs = container.querySelectorAll('input[required], select[required], textarea[required]');
        inputs.forEach(input => {
            if (!input.checkValidity()) {
                isValid = false;
                input.reportValidity();
            }
        });
        if (!isValid) return false;

        // Specific Validation
        if (step === 1) {
            const pwd = document.getElementById('vol-password').value;
            const confirmPwd = document.getElementById('vol-confirm-password').value;

            // Password Rules: 1 Uppercase, 1 Special Char
            const pwdRegex = /^(?=.*[A-Z])(?=.*[!@#$&*]).+$/;
            if (!pwdRegex.test(pwd)) {
                alert('Password must contain at least one uppercase letter and one special symbol (!@#$&*).');
                return false;
            }

            if (pwd !== confirmPwd) {
                alert('Passwords do not match.');
                return false;
            }
        }

        if (step === 4) {
            const terms = document.getElementById('vol-terms');
            if (!terms.checked) {
                alert('You must agree to the Terms & Conditions.');
                return false;
            }
        }

        return true;
    }

    function updateUI() {
        document.querySelectorAll('#vol-reg-form .vol-step-content').forEach(el => {
            el.classList.remove('active');
            el.classList.add('hidden');
        });
        const currentContent = document.getElementById(`vol-step-${currentStep}`);
        currentContent.classList.remove('hidden');
        setTimeout(() => currentContent.classList.add('active'), 10);

        const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
        progressBar.style.width = `${progressPercentage}%`;

        steps.forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.remove('active', 'completed');
            if (stepNum === currentStep) step.classList.add('active');
            else if (stepNum < currentStep) step.classList.add('completed');
        });

        prevBtn.classList.toggle('hidden', currentStep === 1);
        if (currentStep === totalSteps) {
            nextBtn.classList.add('hidden');
            submitBtn.classList.remove('hidden');
        } else {
            nextBtn.classList.remove('hidden');
            submitBtn.classList.add('hidden');
        }
    }
}

/**
 * ==========================================
 * SHARED UTILS
 * ==========================================
 */
function validateStep(stepNum, typePrefix) {
    let containerId;
    if (typePrefix === 'org') containerId = `org-step-${stepNum}`;
    else if (typePrefix === 'vol') containerId = `vol-step-${stepNum}`;
    else if (typePrefix === 'client') containerId = `client-step-${stepNum}`;

    const container = document.getElementById(containerId);

    // Get all required inputs in current step
    const inputs = container.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.checkValidity()) {
            isValid = false;
            // Trigger browser's native validation UI
            input.reportValidity();
        }
    });

    return isValid;
}

/**
 * Handles Location Logic (Auto-Detect + Manual Toggle)
 */
function setupLocationHandler(btnId, manualBtnId, manualBoxId, cityId, stateId, countryId, coordsId) {
    const locBtn = document.getElementById(btnId);
    const manualLocBtn = document.getElementById(manualBtnId);
    const manualLocBox = document.getElementById(manualBoxId);
    const coordsInput = document.getElementById(coordsId);

    if (!locBtn || !manualLocBtn || !manualLocBox) return;

    // Auto-Detect Listener
    locBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            locBtn.innerText = 'Locating...';
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;

                    // Store coords
                    if (coordsInput) coordsInput.value = `${lat},${lon}`;

                    // Reverse Geocoding
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                        const data = await response.json();

                        const city = data.address.city || data.address.town || data.address.village || 'Unknown City';
                        const state = data.address.state || '';
                        const country = data.address.country || 'Unknown Country';

                        const locationText = `${city}, ${state ? state + ', ' : ''}${country}`;

                        // Auto-fill manual fields
                        const cityInput = document.getElementById(cityId);
                        const stateInput = document.getElementById(stateId);
                        const countryInput = document.getElementById(countryId);

                        if (cityInput) cityInput.value = city;
                        if (stateInput) stateInput.value = state;
                        if (countryInput) countryInput.value = country;

                        // Update Button text
                        locBtn.innerText = `Verified: ${locationText}`;
                        locBtn.classList.remove('bg-eh-teal');
                        locBtn.classList.add('bg-green-600');

                    } catch (error) {
                        console.error("Geocoding failed:", error);
                        locBtn.innerText = 'Location Verified (Addr Failed)';
                        locBtn.classList.remove('bg-eh-teal');
                        locBtn.classList.add('bg-green-600');
                    }
                },
                (error) => {
                    alert('Location access denied or failed. Please enter manually.');
                    locBtn.innerText = 'Auto-Detect Failed';
                    manualLocBox.classList.remove('hidden');
                }
            );
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    });

    // Manual Toggle Listener
    manualLocBtn.addEventListener('click', () => {
        manualLocBox.classList.toggle('hidden');
    });
}
