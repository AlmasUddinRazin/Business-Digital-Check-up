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
        saveCurrentStepState();
    }
});

prevBtn.addEventListener('click', () => {
    currentStep--;
    updateFormState('backward');
    saveCurrentStepState();
});

function updateFormState(direction = 'forward') {
    steps.forEach(step => step.classList.remove('active', 'active-back'));

    const activeStepElement = document.querySelector(`[data-step="${currentStep}"]`);
    
    if (direction === 'backward') {
        activeStepElement.classList.add('active-back');
    } else {
        activeStepElement.classList.add('active');
    }

    const progressPercentage = (currentStep / totalSteps) * 100;
    progressBar.style.width = `${progressPercentage}%`;
    stepCounter.textContent = `Step ${currentStep} of ${totalSteps} (${progressPercentage}%)`;

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

// --- ROBUST AUTO-SAVE & RESTORE DATA LOGIC ---

// 1. Real-time Save Listener
formElement.addEventListener('change', saveAllFormData);
formElement.addEventListener('input', saveAllFormData);

function saveAllFormData() {
    const formData = {};
    const allInputs = formElement.querySelectorAll('input, select');
    
    allInputs.forEach((input, index) => {
        // Use an internal unique identifier fallback if ID or Name is completely missing
        const storageKey = input.id || input.name || `input_field_${index}`;
        
        if (input.type === 'checkbox') {
            if (!formData[storageKey]) formData[storageKey] = [];
            if (input.checked) formData[storageKey].push(input.value);
        } else if (input.type === 'radio') {
            if (input.checked) formData[storageKey] = input.value;
        } else {
            formData[storageKey] = input.value;
        }
    });
    
    localStorage.setItem('survey_autosave_data', JSON.stringify(formData));
}

function saveCurrentStepState() {
    localStorage.setItem('survey_current_step', currentStep);
}

// 2. Data Restoration Loop
function restoreSavedData() {
    const savedData = localStorage.getItem('survey_autosave_data');
    const savedStep = localStorage.getItem('survey_current_step');
    
    if (savedData) {
        const data = JSON.parse(savedData);
        const allInputs = formElement.querySelectorAll('input, select');
        
        allInputs.forEach((input, index) => {
            const storageKey = input.id || input.name || `input_field_${index}`;
            const savedValue = data[storageKey];
            
            if (savedValue !== undefined && savedValue !== null) {
                if (input.type === 'checkbox') {
                    input.checked = Array.isArray(savedValue) && savedValue.includes(input.value);
                } else if (input.type === 'radio') {
                    input.checked = (input.value === savedValue);
                } else {
                    input.value = savedValue;
                }
            }
        });
        
        // Ensure conditional field groups show up if they were filled out previously
        toggleCustomRole();
    }
    
    if (savedStep) {
        currentStep = parseInt(savedStep, 10);
        updateFormState('forward');
    }
}

// Fire data extraction check immediately on initialization
restoreSavedData();

// --- SUBMISSION CLEANUP ---
formElement.addEventListener('submit', (e) => {
    if (!validateStep(currentStep)) {
        e.preventDefault();
    } else {
        alert('Thank you! Your submission is being processed securely...');
        localStorage.removeItem('survey_autosave_data');
        localStorage.removeItem('survey_current_step');
    }
});
