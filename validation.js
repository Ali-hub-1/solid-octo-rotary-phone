/* ===================================================
   validation.js - وظائف التحقق من صحة النماذج
   =================================================== */

// ---------- Validation Rules ----------
const validationRules = {
    required: (value) => value && value.trim().length > 0,
    minLength: (value, min) => value && value.trim().length >= min,
    maxLength: (value, max) => value && value.trim().length <= max,
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    password: (value) => value && value.length >= 6,
    match: (value, matchValue) => value === matchValue,
    phone: (value) => /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(value),
    url: (value) => /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(value),
};

// ---------- Error Messages (Arabic) ----------
const errorMessages = {
    required: 'هذا الحقل مطلوب.',
    minLength: 'يجب أن يكون على الأقل {min} أحرف.',
    maxLength: 'يجب ألا يتجاوز {max} حرفًا.',
    email: 'صيغة البريد الإلكتروني غير صحيحة.',
    password: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.',
    match: 'القيمتان غير متطابقتين.',
    phone: 'رقم الهاتف غير صحيح.',
    url: 'الرابط غير صحيح.',
};

// ---------- Validate Single Field ----------
function validateField(field, rules = []) {
    const value = field.value;
    let error = null;

    for (const rule of rules) {
        if (typeof rule === 'string') {
            // Simple rule without parameters
            if (!validationRules[rule]) continue;
            if (!validationRules[rule](value)) {
                error = errorMessages[rule] || `فشل التحقق من ${rule}.`;
                break;
            }
        } else if (typeof rule === 'object') {
            // Rule with parameters e.g., { name: 'minLength', param: 3 }
            const ruleName = rule.name;
            const param = rule.param;
            if (!validationRules[ruleName]) continue;
            if (!validationRules[ruleName](value, param)) {
                error = (errorMessages[ruleName] || `فشل التحقق من ${ruleName}.`).replace(`{${ruleName}}`, param);
                break;
            }
        }
    }

    // Update UI
    const errorElement = document.getElementById(`${field.id}Error`);
    if (errorElement) {
        errorElement.textContent = error || '';
    }

    if (error) {
        field.classList.add('input-error');
    } else {
        field.classList.remove('input-error');
    }

    return !error;
}

// ---------- Validate Entire Form ----------
function validateForm(formElement, fieldRulesMap) {
    let isValid = true;

    for (const [fieldId, rules] of Object.entries(fieldRulesMap)) {
        const field = document.getElementById(fieldId);
        if (!field) continue;
        const fieldValid = validateField(field, rules);
        if (!fieldValid) isValid = false;
    }

    return isValid;
}

// ---------- Real-time Validation on Input ----------
function enableRealTimeValidation(formElement, fieldRulesMap) {
    for (const [fieldId, rules] of Object.entries(fieldRulesMap)) {
        const field = document.getElementById(fieldId);
        if (!field) continue;

        field.addEventListener('input', () => {
            validateField(field, rules);
        });

        field.addEventListener('blur', () => {
            validateField(field, rules);
        });
    }
}

// ---------- Clear All Errors in Form ----------
function clearFormErrors(formElement) {
    const errorElements = formElement.querySelectorAll('.error-message');
    errorElements.forEach(el => el.textContent = '');
    const inputErrors = formElement.querySelectorAll('.input-error');
    inputErrors.forEach(el => el.classList.remove('input-error'));
}

// ---------- Initialize Validation on All Forms ----------
document.addEventListener('DOMContentLoaded', () => {
    // Login form validation rules
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        const loginRules = {
            loginEmail: ['required', 'email'],
            loginPassword: ['required', 'password'],
        };
        enableRealTimeValidation(loginForm, loginRules);
    }

    // Register form validation rules
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        const registerRules = {
            fullName: ['required', { name: 'minLength', param: 3 }],
            username: ['required', { name: 'minLength', param: 3 }],
            regEmail: ['required', 'email'],
            regPassword: ['required', 'password'],
            confirmPassword: ['required', 'password'],
        };
        enableRealTimeValidation(registerForm, registerRules);

        // Additional check for password match on confirmPassword input
        const confirmPasswordField = document.getElementById('confirmPassword');
        const regPasswordField = document.getElementById('regPassword');
        if (confirmPasswordField && regPasswordField) {
            confirmPasswordField.addEventListener('input', () => {
                const errorEl = document.getElementById('confirmPasswordError');
                if (confirmPasswordField.value !== regPasswordField.value) {
                    errorEl.textContent = 'كلمتا المرور غير متطابقتين.';
                    confirmPasswordField.classList.add('input-error');
                } else if (confirmPasswordField.value.length > 0) {
                    errorEl.textContent = '';
                    confirmPasswordField.classList.remove('input-error');
                    confirmPasswordField.classList.add('matched');
                }
            });
        }
    }

    // Contact form validation rules
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const contactRules = {
            contactName: ['required', { name: 'minLength', param: 3 }],
            contactEmail: ['required', 'email'],
            contactSubject: ['required', { name: 'minLength', param: 3 }],
            contactMessage: ['required', { name: 'minLength', param: 10 }],
        };
        enableRealTimeValidation(contactForm, contactRules);
    }

    // Profile edit form validation
    const profileEditForm = document.getElementById('profileEditForm');
    if (profileEditForm) {
        const editRules = {
            editFullName: ['required', { name: 'minLength', param: 3 }],
            editEmail: ['required', 'email'],
        };
        enableRealTimeValidation(profileEditForm, editRules);
    }

    // Password change form validation
    const passwordForm = document.getElementById('passwordChangeForm');
    if (passwordForm) {
        const passwordRules = {
            currentPassword: ['required', 'password'],
            newPassword: ['required', 'password'],
            confirmNewPassword: ['required', 'password'],
        };
        enableRealTimeValidation(passwordForm, passwordRules);

        const confirmNewField = document.getElementById('confirmNewPassword');
        const newPassField = document.getElementById('newPassword');
        if (confirmNewField && newPassField) {
            confirmNewField.addEventListener('input', () => {
                const errorEl = document.getElementById('confirmNewPasswordError');
                if (confirmNewField.value !== newPassField.value) {
                    errorEl.textContent = 'كلمتا المرور غير متطابقتين.';
                    confirmNewField.classList.add('input-error');
                } else if (confirmNewField.value.length > 0) {
                    errorEl.textContent = '';
                    confirmNewField.classList.remove('input-error');
                }
            });
        }
    }
});