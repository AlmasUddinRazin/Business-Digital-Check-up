let currentStep = 1;
const totalSteps = 5;

const steps = document.querySelectorAll('.form-step');
const progressBar = document.getElementById('progress-bar');
const stepCounter = document.getElementById('step-counter');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const themeToggle = document.getElementById('theme-toggle');

// Theme Toggle Logic
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Form Navigation Logic
nextBtn.addEventListener('click', () => {
    if (validateStep(currentStep)) {
        currentStep++;
        updateFormState('forward');
    }
});

prevBtn.addEventListener('click', () => {
    currentStep--;
    updateFormState('backward');
});

function updateFormState(direction = 'forward') {
    // Clear out old active animation states cleanly
    steps.forEach(step => {
        step.classList.remove('active', 'active-back');
    });

    const activeStepElement = document.querySelector(`[data-step="${currentStep}"]`);
    
    // Apply proper directional slide styling class blocks
    if (direction === 'backward') {
        activeStepElement.classList.add('active-back');
    } else {
        activeStepElement.classList.add('active');
    }

    // Progress Calculations
    const progressPercentage = (currentStep / totalSteps) * 100;
    progressBar.style.width = `${progressPercentage}%`;
    stepCounter.textContent = `Step ${currentStep} of ${totalSteps} (${progressPercentage}%)`;

    // Controls visibility mapping
    prevBtn.classList.toggle('hidden', currentStep === 1);
    nextBtn.classList.toggle('hidden', currentStep === totalSteps);
    submitBtn.classList.toggle('hidden', currentStep !== totalSteps);
    
    // Scroll page view up smoothly to focus on the next question group
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

document.getElementById('survey-form').addEventListener('submit', (e) => {
    if (!validateStep(currentStep)) {
        e.preventDefault();
    } else {
        alert('Thank you! Your submission is being processed securely...');
    }
});
