let currentStep = 1;
const totalSteps = 5;

const steps = document.querySelectorAll('.form-step');
const progressBar = document.getElementById('progress-bar');
const stepCounter = document.getElementById('step-counter');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const themeToggle = document.getElementById('theme-toggle');
const formElement = document.getElementById('survey-form');

// --- THEME TRACKING ---
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// --- NAVIGATION SYSTEM ---
nextBtn.addEventListener('click', () => {
    if (validateStep(currentStep)) {
        currentStep++;
        updateFormState('forward');
        saveCurrentStepState(); // Remember what step they are on
    }
});

prevBtn.addEventListener('click', () => {
    currentStep--;
    updateFormState('backward');
    saveCurrentStepState(); // Remember what step they are on
});

function updateFormState(direction = 'forward') {
    steps.forEach(step => step.classList.remove('active', 'active-back'));

    const activeStepElement = document.querySelector(`[data-step="${currentStep}"]`);
    
    if (direction === 'backward') {
        activeStepElement.classList.add('active-back');
    } else {
        activeStepElement.classList.add('active');
    }

    // Update Progress Bars
    const progressPercentage = (currentStep / totalSteps) * 100;
    progressBar.style.width = `${progressPercentage}%`;
    stepCounter.textContent = `Step ${currentStep} of ${totalSteps} (${progressPercentage}%)`;

    // Toggle navigation visibility
    prevBtn.classList.toggle('hidden', currentStep === 1);
    nextBtn.classList.toggle('hidden', currentStep === totalSteps);
    submitBtn.classList.toggle('hidden', currentStep !== totalSteps);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateStep(step) {
    const activeFields = document.querySelectorAll(`[data-step="${step}"] [required]`);
    let valid = true;
    activeFields.forEach(field => {
        if (!field.checkValidity()) {
            field.reportValidity();
            valid = false;
        }
    });
    return valid;
}

function toggleCustomRole() {
    const roleSelect = document.getElementById('user-role');
    const customRoleGroup = document.getElementById('custom-role-group');
    const customInput = document.getElementById('custom-role');

    if (roleSelect && roleSelect.value === 'custom') {
        customRoleGroup.classList.remove('hidden');
        customInput.setAttribute('required', 'true');
    } else if (customRoleGroup) {
        customRoleGroup.classList.add('hidden');
        customInput.removeAttribute('required');
    }
}

window.toggleCustomRole = toggleCustomRole;

// --- AUTO-SAVE & RESTORE DATA LOGIC ---

// 1. Save input values in real-time as the user changes them
formElement.addEventListener('input', () => {
    const formData = {};
    const inputs = formElement.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        if (input.type === 'checkbox') {
            if (!formData[input.name]) formData[input.name] = [];
            if (input.checked) formData[input.name].push(input.value);
        } else if (input.type === 'radio') {
            if (input.checked) formData[input.name] = input.value;
        } else {
            if (input.value) formData[input.id || input.name] = input.value;
        }
    });
    
    sessionStorage.setItem('survey_autosave_data', JSON.stringify(formData));
});

// 2. Remember the exact step number they were on
function saveCurrentStepState() {
    sessionStorage.setItem('survey_current_step', currentStep);
}

// 3. Restore all fields when the page loads or refreshes
function restoreSavedData() {
    const savedData = sessionStorage.getItem('survey_autosave_data');
    const savedStep = sessionStorage.getItem('survey_current_step');
    
    if (savedData) {
        const data = JSON.parse(savedData);
        
        Object.keys(data).forEach(key => {
            const val = data[key];
            
            // Try matching by ID first, then by name attribute
            const element = document.getElementById(key) || document.getElementsByName(key)[0];
            
            if (element) {
                if (element.tagName === 'SELECT' || element.type === 'text' || element.type === 'email' || element.type === 'url') {
                    element.value = val;
                }
            } else {
                // Handle complex element pools like Checkboxes and Radio buttons
                const checkboxes = document.getElementsByName(key);
                checkboxes.forEach(cb => {
                    if (cb.type === 'checkbox' && Array.isArray(val)) {
                        cb.checked = val.includes(cb.value);
                    } else if (cb.type === 'radio') {
                        cb.checked = (cb.value === val);
                    }
                });
            }
        });
        
        // Trigger custom role drop visibility display check if it was previously filled
        toggleCustomRole();
    }
    
    // Move user back to the step they were viewing before the reset refresh
    if (savedStep) {
        currentStep = parseInt(savedStep, 10);
        updateFormState('forward');
    }
}

// Fire the recovery checks instantly on script load initialization
restoreSavedData();

// --- SUBMISSION RECOVERY MANIPULATION ---
formElement.addEventListener('submit', (e) => {
    if (!validateStep(currentStep)) {
        e.preventDefault();
    } else {
        alert('Thank you! Your submission is being processed securely...');
        // Clear caches cleanly upon success so a new response can be generated next run
        sessionStorage.removeItem('survey_autosave_data');
        sessionStorage.removeItem('survey_current_step');
    }
});
