let currentStep = 1;
const totalSteps = 5;

// Declare DOM element mappings safely
const steps = document.querySelectorAll('.form-step');
const progressBar = document.getElementById('progress-bar');
const stepCounter = document.getElementById('step-counter');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const themeToggle = document.getElementById('theme-toggle');
const formElement = document.getElementById('survey-form');

// --- THEME TRACKING ---
try {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    if(themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
} catch (e) { console.error("Theme setup error:", e); }

// --- NAVIGATION SYSTEM ---
if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            currentStep++;
            updateFormState('forward');
            saveCurrentStepState();
        }
    });
}

if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        currentStep--;
        updateFormState('backward');
        saveCurrentStepState();
    });
}

function updateFormState(direction = 'forward') {
    if (!steps.length) return;
    
    steps.forEach(step => step.classList.remove('active', 'active-back'));

    const activeStepElement = document.querySelector(`[data-step="${currentStep}"]`);
    if (activeStepElement) {
        if (direction === 'backward') {
            activeStepElement.classList.add('active-back');
        } else {
            activeStepElement.classList.add('active');
        }
    }

    if (progressBar) {
        const progressPercentage = (currentStep / totalSteps) * 100;
        progressBar.style.width = `${progressPercentage}%`;
    }
    
    if (stepCounter) {
        const progressPercentage = (currentStep / totalSteps) * 100;
        stepCounter.textContent = `Step ${currentStep} of ${totalSteps} (${progressPercentage}%)`;
    }

    if (prevBtn) prevBtn.classList.toggle('hidden', currentStep === 1);
    if (nextBtn) nextBtn.classList.toggle('hidden', currentStep === totalSteps);
    if (submitBtn) submitBtn.classList.toggle('hidden', currentStep !== totalSteps);
    
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
        if (customRoleGroup) customRoleGroup.classList.remove('hidden');
        if (customInput) customInput.setAttribute('required', 'true');
    } else if (customRoleGroup) {
        customRoleGroup.classList.add('hidden');
        if (customInput) customInput.removeAttribute('required');
    }
}
window.toggleCustomRole = toggleCustomRole;

// --- AUTO-SAVE LOGIC ---
if (formElement) {
    formElement.addEventListener('change', saveAllFormData);
    formElement.addEventListener('input', saveAllFormData);
}

function saveAllFormData() {
    try {
        const formData = {};
        const allInputs = formElement.querySelectorAll('input, select');
        
        allInputs.forEach((input, index) => {
            const storageKey = input.id || input.name || `field_${index}`;
            
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
    } catch(e) { console.error("Error saving form data:", e); }
}

function saveCurrentStepState() {
    try {
        localStorage.setItem('survey_current_step', currentStep);
    } catch(e) { console.error("Error saving step state:", e); }
}

// --- RESTORATION LOGIC ---
function restoreSavedData() {
    try {
        const savedData = localStorage.getItem('survey_autosave_data');
        const savedStep = localStorage.getItem('survey_current_step');
        
        if (savedData) {
            const data = JSON.parse(savedData);
            const allInputs = formElement.querySelectorAll('input, select');
            
            allInputs.forEach((input, index) => {
                const storageKey = input.id || input.name || `field_${index}`;
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
            
            toggleCustomRole();
        }
        
        if (savedStep) {
            currentStep = parseInt(savedStep, 10);
        }
    } catch (e) {
        console.error("Error restoring data:", e);
    }
    
    // Always call this at least once to render step state correctly!
    updateFormState('forward');
}

// EXECUTE INLINE IMMEDIATELY, THEN DOUBLE CHECK ON FULL WINDOW LOAD
restoreSavedData();
window.addEventListener('load', restoreSavedData);

// --- SUBMISSION CLEANUP ---
if (formElement) {
    formElement.addEventListener('submit', (e) => {
        if (!validateStep(currentStep)) {
            e.preventDefault();
        } else {
            alert('Thank you! Your submission is being processed securely...');
            localStorage.removeItem('survey_autosave_data');
            localStorage.removeItem('survey_current_step');
        }
    });
}
