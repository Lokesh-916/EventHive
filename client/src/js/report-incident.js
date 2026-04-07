document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('incident-form');
    const categorySelect = document.getElementById('category');
    const typeSelect = document.getElementById('type');
    const typeSection = document.getElementById('type-section');
    const typeInputContainer = document.getElementById('type-input-container');
    const typeInput = document.getElementById('type-input');
    const submitBtn = document.getElementById('submit-btn');
    const resetBtn = document.getElementById('reset-btn');
    const timestampInput = document.getElementById('timestamp');
    const fileInput = document.getElementById('evidence');
    const filePreview = document.getElementById('file-preview');
    const filenameSpan = document.getElementById('filename');
    const removeFileBtn = document.getElementById('remove-file');

    // Incident Types Data
    const incidentData = {
        volunteer: [
            "Volunteer didn't show up",
            "Volunteer behavior issue",
            "Conflict between volunteers",
            "Health issue / Fatigue"
        ],
        resource: [
            "Equipment unavailable / broken",
            "Shortage of supplies",
            "Technology / Connectivity failure",
            "Logistics delay"
        ],
        task: [
            "Task guidelines unclear",
            "Wrongly assigned task",
            "Workload too heavy",
            "Task completed / No work left"
        ],
        safety: [
            "Crowd control issue",
            "Medical emergency",
            "Harassment / Misconduct",
            "Hazard / Infrastructure issue"
        ]
    };

    // 1. Timestamp Updates
    const updateTimestamp = () => {
        const now = new Date();
        timestampInput.value = now.toLocaleString('en-US', {
            hour: 'numeric', minute: 'numeric', hour12: true,
            weekday: 'short', month: 'short', day: 'numeric'
        });
    };
    updateTimestamp();
    setInterval(updateTimestamp, 60000);

    // 2. Handle Category Change
    categorySelect.addEventListener('change', (e) => {
        const category = e.target.value;

        // Reset Type UI
        typeSelect.innerHTML = '<option value="" disabled selected>Select specific issue...</option>';
        typeInput.value = '';

        if (category === 'other') {
            // If "Other" category is selected:
            // Hide dropdown, show input
            typeSection.classList.add('hidden');
            typeInputContainer.classList.remove('hidden');
            typeInput.required = true;
            typeInput.focus();
        } else if (category && incidentData[category]) {
            // If recognized category:
            // Show dropdown, hide input
            typeSection.classList.remove('hidden', 'opacity-50', 'pointer-events-none');
            typeSection.classList.remove('hidden');
            typeInputContainer.classList.add('hidden');
            typeInput.required = false;

            // Populate Dropdown
            incidentData[category].forEach(issue => {
                const opt = document.createElement('option');
                opt.value = issue;
                opt.textContent = issue;
                typeSelect.appendChild(opt);
            });

            // Add "Other" to dropdown
            const otherOpt = document.createElement('option');
            otherOpt.value = 'other';
            otherOpt.textContent = 'Other (Specify)';
            typeSelect.appendChild(otherOpt);

            typeSelect.disabled = false;
        } else {
            // Default state
            typeSection.classList.add('opacity-50', 'pointer-events-none');
            typeInputContainer.classList.add('hidden');
        }
        validateForm();
    });

    // 3. Handle Type Dropdown Change
    typeSelect.addEventListener('change', (e) => {
        if (e.target.value === 'other') {
            typeInputContainer.classList.remove('hidden');
            typeInput.required = true;
            typeInput.focus();
        } else {
            typeInputContainer.classList.add('hidden');
            typeInput.required = false;
        }
        validateForm();
    });

    // 4. File Handling
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            filenameSpan.textContent = e.target.files[0].name;
            filePreview.classList.remove('hidden');
            filePreview.classList.add('flex');
        }
    });

    removeFileBtn.addEventListener('click', () => {
        fileInput.value = '';
        filePreview.classList.add('hidden');
        filePreview.classList.remove('flex');
    });

    // 5. Validation Logic
    function validateForm() {
        let isValid = true;
        const requiredInputs = form.querySelectorAll('input[required], select[required], textarea[required]');

        requiredInputs.forEach(input => {
            // Check visibility by offsetParent (null if hidden)
            if (input.offsetParent !== null) {
                if (input.type === 'radio') {
                    const name = input.name;
                    const checked = form.querySelector(`input[name="${name}"]:checked`);
                    if (!checked) isValid = false;
                } else {
                    if (!input.value.trim()) isValid = false;
                }
            }
        });

        submitBtn.disabled = !isValid;
        if (isValid) {
            submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }

    form.addEventListener('input', validateForm);
    form.addEventListener('change', validateForm);

    // 6. Submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Handling dynamic type field logic for cleaner data
        if (data.type === 'other' || !data.type) {
            data.final_type = data.custom_type;
        } else {
            data.final_type = data.type;
        }

        // Checkboxes
        const impact = Array.from(document.querySelectorAll('input[name="impact"]:checked')).map(cb => cb.value);

        const urlParams = new URLSearchParams(window.location.search);
        const eventId = urlParams.get('eventId');

        // Prep FormData for API
        const apiData = new FormData();
        apiData.append('category', data.category);
        apiData.append('type', data.final_type);
        apiData.append('description', data.description);
        apiData.append('severity', data.severity);
        apiData.append('timestamp', data.timestamp);
        if (eventId) apiData.append('eventId', eventId);
        impact.forEach(imp => apiData.append('impact', imp));
        
        const fileInput = document.getElementById('evidence');
        if (fileInput.files.length > 0) {
            for (let i = 0; i < fileInput.files.length; i++) {
                 apiData.append('evidence', fileInput.files[i]);
            }
        }

        // Token
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to report an incident');
            return;
        }

        try {
            const response = await fetch('/api/incidents', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: apiData
            });

            const result = await response.json();
            if (result.success) {
                // Toast
                const toast = document.getElementById('toast');
                toast.classList.remove('translate-y-24', 'opacity-0');
                setTimeout(() => toast.classList.add('translate-y-24', 'opacity-0'), 3000);

                // Reset
                form.reset();
                typeSection.classList.add('opacity-50', 'pointer-events-none');
                typeInputContainer.classList.add('hidden');
                filePreview.classList.add('hidden');
                filePreview.classList.remove('flex');
                validateForm();
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Error reporting incident:', error);
            alert('A server error occurred while reporting the incident.');
        }
    });

    // Reset Button
    resetBtn.addEventListener('click', () => {
        form.reset();
        typeSection.classList.add('opacity-50', 'pointer-events-none');
        typeInputContainer.classList.add('hidden');
        filePreview.classList.add('hidden');
        filePreview.classList.remove('flex');
        validateForm();
    });

    // --- System Issue Modal Logic ---
    const systemModal = document.getElementById('system-issue-modal');
    const systemModalPanel = document.getElementById('system-modal-panel');
    const openSystemModalBtn = document.getElementById('report-system-issue-btn');
    const cancelSystemModalBtn = document.getElementById('cancel-system-issue');
    const submitSystemIssueBtn = document.getElementById('submit-system-issue');
    const systemIssueText = document.getElementById('system-issue-text');

    function toggleSystemModal(show) {
        if (show) {
            systemModal.classList.add('active');
        } else {
            systemModal.classList.remove('active');
        }
    }

    openSystemModalBtn.addEventListener('click', () => toggleSystemModal(true));
    cancelSystemModalBtn.addEventListener('click', () => toggleSystemModal(false));

    submitSystemIssueBtn.addEventListener('click', () => {
        const issueDescription = systemIssueText.value.trim();
        if (!issueDescription) {
            alert('Please describe the issue.');
            return;
        }

        console.log('System Issue Reported:', { description: issueDescription, timestamp: new Date().toISOString() });

        // Clear and Close
        systemIssueText.value = '';
        toggleSystemModal(false);

        // Reuse the main toast
        const toast = document.getElementById('toast');
        const toastTitle = toast.querySelector('h4');
        const toastMsg = toast.querySelector('p');
        const originalTitle = toastTitle.textContent;
        const originalMsg = toastMsg.textContent;

        toastTitle.textContent = 'System Issue Logged';
        toastMsg.textContent = 'Thank you for your report.';

        toast.classList.remove('translate-y-24', 'opacity-0');
        setTimeout(() => {
            toast.classList.add('translate-y-24', 'opacity-0');
            // Restore toast text after hiding
            setTimeout(() => {
                toastTitle.textContent = originalTitle;
                toastMsg.textContent = originalMsg;
            }, 500);
        }, 3000);
    });
});
