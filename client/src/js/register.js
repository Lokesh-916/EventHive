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

    // --- Image Cropping Setup ---
    setupImageCropper('org-logo-input', 'org-logo-preview', 'org-logo-overlay', 'org-logo-preview', 1);
    setupImageCropper('org-lead-input', 'org-lead-preview', 'org-lead-overlay', 'org-lead-preview', 1);

    // --- Event Types "Other" Toggle ---
    const orgOtherCheck = document.getElementById('org-type-other-check');
    const orgOtherInput = document.getElementById('org-type-other-input');
    if (orgOtherCheck) {
        orgOtherCheck.addEventListener('change', () => {
            if (orgOtherCheck.checked) {
                orgOtherInput.classList.remove('hidden');
                orgOtherInput.focus();
            } else {
                orgOtherInput.classList.add('hidden');
                orgOtherInput.value = '';
            }
        });
    }

    // --- Portfolio Preview ---
    const portfolioInput = document.getElementById('org-portfolio');
    const portfolioPreview = document.getElementById('org-portfolio-preview');
    if (portfolioInput) {
        portfolioInput.addEventListener('change', function (e) {
            portfolioPreview.innerHTML = ''; // Clear existing
            Array.from(e.target.files).forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function (event) {
                        const img = document.createElement('img');
                        img.src = event.target.result;
                        img.className = 'w-16 h-16 object-cover rounded-lg border border-eh-teal/30 shrink-0';
                        portfolioPreview.appendChild(img);
                    }
                    reader.readAsDataURL(file);
                }
            });
        });
    }

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

    // Enter Key Handler for Organizer
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            const cropModal = document.getElementById('crop-modal');
            // Ensure we are in the organizer flow and modal is closed
            if (!document.getElementById('organizer-form').classList.contains('hidden') &&
                cropModal.classList.contains('hidden')) {

                event.preventDefault();
                if (currentStep < totalSteps) {
                    nextBtn.click();
                } else {
                    submitBtn.click();
                }
            }
        }
    });

    // Submit Handler
    submitBtn.addEventListener('click', (e) => {
        if (validateStep(currentStep, 'org')) {
            // Collect Data (Simulation)
            console.log("Organizer Registration Data Collected");
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

            // Logic for circles
            const marker = step.querySelector('.step-marker');

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

    // --- Image Cropping Setup ---
    setupImageCropper('client-pic-input', 'client-pic-preview', 'client-pic-overlay', 'client-pic-preview', 1);

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

    // Enter Key Handler for Client
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            const cropModal = document.getElementById('crop-modal');
            // Ensure we are in the Client flow and modal is closed
            if (!document.getElementById('client-form').classList.contains('hidden') &&
                cropModal.classList.contains('hidden')) {

                event.preventDefault();
                if (currentStep < totalSteps) {
                    nextBtn.click();
                } else {
                    submitBtn.click();
                }
            }
        }
    });

    // Submit Handler
    submitBtn.addEventListener('click', (e) => {
        if (validateStep(currentStep, 'client')) {
            // Collect Data
            const formData = {
                type: document.querySelector('input[name="client_type"]:checked').value,
                name: document.querySelector('input[name="client_name"]').value,
                role: document.querySelector('input[name="client_role"]').value,
                mobile: document.querySelector('input[name="client_mobile"]').value,
                link: document.querySelector('input[name="client_link"]').value,
                email: document.getElementById('client-email').value
            };
            console.log("Client Registration Data:", formData);

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

        // Add Enter Key Handler
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                const cropModal = document.getElementById('crop-modal');
                // Ensure we are in the volunteer flow and modal is closed
                if (!document.getElementById('volunteer-form').classList.contains('hidden') &&
                    cropModal.classList.contains('hidden')) {

                    event.preventDefault(); // Prevent default form submission or other actions

                    if (currentStep < totalSteps) {
                        nextBtn.click();
                    } else {
                        submitBtn.click();
                    }
                }
            }
        });

        submitBtn.addEventListener('click', (e) => {
            if (validateVolunteerStep(currentStep)) {
                // Collect Availability
                const availability = {};
                document.querySelectorAll('.slot-btn.bg-eh-teal').forEach(btn => {
                    const day = btn.dataset.day;
                    const slot = btn.dataset.slot;
                    if (!availability[day]) availability[day] = [];
                    availability[day].push(slot);
                });

                // Collect Tasks
                const tasks = [];
                document.querySelectorAll('input[name="vol-tasks"]:checked').forEach(cb => {
                    if (cb.value !== 'others') tasks.push(cb.value);
                });
                const otherTaskCheck = document.getElementById('vol-task-other-check');
                const otherTaskInput = document.getElementById('vol-task-other-input');
                if (otherTaskCheck && otherTaskCheck.checked) {
                    tasks.push(`Other: ${otherTaskInput.value}`);
                }

                // Collect Data
                // Note: Username moved to Step 1, ensure it's captured correctly from the DOM
                const formData = {
                    email: document.getElementById('vol-email').value,
                    username: document.getElementById('vol-username').value,
                    skills: addedSkills,
                    availability: availability,
                    tasks: tasks,
                    // ... other fields
                };
                console.log('Volunteer Data:', formData);
                alert('Volunteer Registration Successful! Welcome aboard.');
                window.location.href = 'index.html';
            }
        });

        // Step 2: Location
        setupLocationHandler('vol-loc-btn', 'vol-manual-loc-btn', 'vol-manual-loc-box', 'vol-city', 'vol-state', 'vol-country', 'vol-coords');

        // Step 4: Availability Logic
        const slotBtns = document.querySelectorAll('.slot-btn');
        slotBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                // Toggle styles
                this.classList.toggle('bg-white/50');
                this.classList.toggle('text-eh-teal');
                this.classList.toggle('bg-eh-teal');
                this.classList.toggle('text-white');
                this.classList.toggle('border-transparent');
                this.classList.toggle('border-eh-teal'); // keep border for structure? Or just toggle color
                // Actually, border was transparent on inactive.
                // inactive: border-transparent
                // active: let's toggle a border color if needed, but bg change is strong enough.
            });
        });

        // Step 4: Other Task Logic
        const otherTaskCheck = document.getElementById('vol-task-other-check');
        const otherTaskContainer = document.getElementById('vol-task-other-container');
        const otherTaskInput = document.getElementById('vol-task-other-input');

        if (otherTaskCheck) {
            otherTaskCheck.addEventListener('change', function () {
                if (this.checked) {
                    otherTaskContainer.classList.remove('hidden');
                    otherTaskInput.required = true;
                } else {
                    otherTaskContainer.classList.add('hidden');
                    otherTaskInput.required = false;
                    otherTaskInput.value = '';
                }
            });
        }


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

/**
 * Image Cropper Helper
 */
function setupImageCropper(inputId, previewImgId, previewTextId, finalPreviewId, aspectRatio = 1) {
    const input = document.getElementById(inputId);
    const previewImg = document.getElementById(previewImgId); // Valid if inline preview needed? 
    // Actually, distinct preview logic might be needed. 
    // Based on usage: setupImageCropper('org-logo-input', 'org-logo-preview', 'org-logo-text', 'org-logo-preview', 1);

    // We'll reuse the single global 'crop-modal' elements
    const cropModal = document.getElementById('crop-modal');
    const cropImage = document.getElementById('crop-image');
    const cropSaveBtn = document.getElementById('crop-save-btn');
    const cropCancelBtn = document.getElementById('crop-cancel-btn');
    let cropper = null;

    if (!input) {
        console.warn(`Input ${inputId} not found for cropper.`);
        return;
    }

    input.addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                cropImage.src = e.target.result;
                cropModal.classList.remove('hidden');

                if (cropper) cropper.destroy();
                cropper = new Cropper(cropImage, {
                    aspectRatio: aspectRatio,
                    viewMode: 1,
                    autoCropArea: 1,
                    background: false
                });
            };
            reader.readAsDataURL(file);
        }
    });

    // We need to manage multiple croppers potentially interfering if we bind clean events efficiently.
    // simpler approach: One active cropper session.
    // We'll bind the SAVE button dynamically or use a shared handler.
    // Given the architecture, let's use a "current wrapper" approach.

    // Quick Fix: specific handlers for this instance are tricky with global modal buttons.
    // Better: Clone the buttons or re-assign onclick.

    // Let's use a simpler pattern:
    // When input changes, set a global 'currentCropperCallback'

    input.dataset.cropping = "true";
}

// Global Cropper State
let currentCropper = null;
let onCropSave = null;

document.addEventListener('DOMContentLoaded', () => {
    const cropModal = document.getElementById('crop-modal');
    const cropImage = document.getElementById('crop-image');
    const cropSaveBtn = document.getElementById('crop-save-btn');
    const cropCancelBtn = document.getElementById('crop-cancel-btn');

    if (cropSaveBtn) {
        cropSaveBtn.addEventListener('click', () => {
            if (currentCropper && onCropSave) {
                const canvas = currentCropper.getCroppedCanvas({ width: 300, height: 300 });
                onCropSave(canvas.toDataURL());
                cleanupCropper();
            }
        });
    }

    if (cropCancelBtn) {
        cropCancelBtn.addEventListener('click', () => {
            cleanupCropper();
        });
    }

    function cleanupCropper() {
        if (currentCropper) {
            currentCropper.destroy();
            currentCropper = null;
        }
        cropModal.classList.add('hidden');
        onCropSave = null;

        // Clear file inputs if needed logic
    }
});

// Re-write setupImageCropper to use the global state
function setupImageCropper(inputId, previewImgId, overlayId, finalResultImgId, aspectRatio) {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.addEventListener('change', function () {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            const reader = new FileReader();
            reader.onload = function (e) {
                const cropModal = document.getElementById('crop-modal');
                const cropImage = document.getElementById('crop-image');

                cropImage.src = e.target.result;
                cropModal.classList.remove('hidden');

                // Destroy any lingering cropper
                if (currentCropper) currentCropper.destroy();

                currentCropper = new Cropper(cropImage, {
                    aspectRatio: aspectRatio,
                    viewMode: 1,
                    autoCropArea: 1,
                    background: false
                });

                // Set callback
                onCropSave = (dataUrl) => {
                    const img = document.getElementById(finalResultImgId);
                    const overlay = document.getElementById(overlayId);

                    if (img) {
                        img.src = dataUrl;
                        img.classList.remove('hidden');
                    }
                    if (overlay) {
                        // Switch from "Always Visible" to "Visible on Hover"
                        overlay.classList.add('opacity-0', 'group-hover:opacity-100');
                        // Optional: Change text to 'Change'
                        const span = overlay.querySelector('span');
                        if (span) span.innerText = 'Change';
                    }
                };
            };
            reader.readAsDataURL(file);
        }
    });

}
