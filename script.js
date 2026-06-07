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
        updateFormState();
    }
});

prevBtn.addEventListener('click', () => {
    currentStep--;
    updateFormState();
});

function updateFormState() {
    steps.forEach(step => step.classList.remove('active'));
    document.querySelector(`[data-step="${currentStep}"]`).classList.add('active');

    // Progress Calculations
    const progressPercentage = (currentStep / totalSteps) * 100;
    progressBar.style.width = `${progressPercentage}%`;
    stepCounter.textContent = `Step ${currentStep} of ${totalSteps} (${progressPercentage}%)`;

    // Controls visibility mapping
    prevBtn.classList.toggle('hidden', currentStep === 1);
    nextBtn.classList.toggle('hidden', currentStep === totalSteps);
    submitBtn.classList.toggle('hidden', currentStep !== totalSteps);
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

    if (roleSelect.value === 'custom') {
        customRoleGroup.classList.remove('hidden');
        customInput.setAttribute('required', 'true');
    } else {
        customRoleGroup.classList.add('hidden');
        customInput.removeAttribute('required');
    }
}

// Direct binding for structural change observation
window.toggleCustomRole = toggleCustomRole;

document.getElementById('survey-form').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Form built successfully! Integrate your backend tracking keys next.');
});
