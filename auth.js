/* ===================================================
   auth.js - إدارة المصادقة وتسجيل الدخول والجلسات
   =================================================== */

// ---------- Initialize Users Storage ----------
function initUsersStorage() {
    if (!localStorage.getItem('users')) {
        // Create a default admin user for testing
        const defaultUsers = [
            {
                id: 1,
                fullName: 'المستخدم التجريبي',
                username: 'admin',
                email: 'admin@mawqena.com',
                password: '123456',
                createdAt: new Date().toISOString(),
            },
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
}

initUsersStorage();

// ---------- Get All Users ----------
function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

// ---------- Save Users ----------
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// ---------- Get Current User ----------
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// ---------- Check if User is Logged In ----------
function isLoggedIn() {
    return getCurrentUser() !== null;
}

// ---------- Login Handler ----------
function handleLogin(email, password, rememberMe = false) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        return { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' };
    }

    // Store current user (without password)
    const currentUser = {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
    };

    if (rememberMe) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    // Also save in localStorage for simplicity across tabs
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    return { success: true, message: 'تم تسجيل الدخول بنجاح!', user: currentUser };
}

// ---------- Register Handler ----------
function handleRegister(fullName, username, email, password) {
    const users = getUsers();

    // Check if email already exists
    if (users.find(u => u.email === email)) {
        return { success: false, message: 'البريد الإلكتروني مسجل بالفعل. الرجاء استخدام بريد آخر.' };
    }

    // Check if username already exists
    if (users.find(u => u.username === username)) {
        return { success: false, message: 'اسم المستخدم مستخدم بالفعل. الرجاء اختيار اسم آخر.' };
    }

    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        fullName,
        username,
        email,
        password,
        createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    return { success: true, message: 'تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.' };
}

// ---------- Update Profile Handler ----------
function handleUpdateProfile(fullName, email) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return { success: false, message: 'يجب تسجيل الدخول أولاً.' };
    }

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    if (userIndex === -1) {
        return { success: false, message: 'المستخدم غير موجود.' };
    }

    // Check if new email is already taken by another user
    const emailExists = users.find(u => u.email === email && u.id !== currentUser.id);
    if (emailExists) {
        return { success: false, message: 'البريد الإلكتروني مستخدم من قبل مستخدم آخر.' };
    }

    users[userIndex].fullName = fullName;
    users[userIndex].email = email;
    saveUsers(users);

    // Update current user session
    const updatedCurrentUser = {
        ...currentUser,
        fullName,
        email,
    };
    localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));

    return { success: true, message: 'تم تحديث البيانات بنجاح!' };
}

// ---------- Change Password Handler ----------
function handleChangePassword(currentPassword, newPassword) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return { success: false, message: 'يجب تسجيل الدخول أولاً.' };
    }

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    if (userIndex === -1) {
        return { success: false, message: 'المستخدم غير موجود.' };
    }

    if (users[userIndex].password !== currentPassword) {
        return { success: false, message: 'كلمة المرور الحالية غير صحيحة.' };
    }

    users[userIndex].password = newPassword;
    saveUsers(users);

    return { success: true, message: 'تم تغيير كلمة المرور بنجاح!' };
}

// ---------- Logout Handler ----------
function handleLogout() {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    window.showToast && window.showToast('تم تسجيل الخروج بنجاح.', 'info');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 500);
}

// Expose handleLogout globally
window.handleLogout = handleLogout;

// ---------- Protect Profile Page ----------
function protectProfilePage() {
    // Check if we're on the profile page
    if (window.location.pathname.includes('profile.html')) {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            window.showToast && window.showToast('يجب تسجيل الدخول للوصول إلى الملف الشخصي.', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 800);
            return false;
        }
        return true;
    }
    return true;
}

// ---------- Initialize Auth Forms ----------
document.addEventListener('DOMContentLoaded', () => {
    // Protect profile page
    protectProfilePage();

    // Update navbar
    if (window.updateNavbarAuthState) {
        window.updateNavbarAuthState();
    }

    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe')?.checked || false;

            // Validate
            let hasError = false;
            document.getElementById('loginEmailError').textContent = '';
            document.getElementById('loginPasswordError').textContent = '';

            if (!email) {
                document.getElementById('loginEmailError').textContent = 'البريد الإلكتروني مطلوب.';
                hasError = true;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                document.getElementById('loginEmailError').textContent = 'صيغة البريد الإلكتروني غير صحيحة.';
                hasError = true;
            }

            if (!password) {
                document.getElementById('loginPasswordError').textContent = 'كلمة المرور مطلوبة.';
                hasError = true;
            } else if (password.length < 6) {
                document.getElementById('loginPasswordError').textContent = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.';
                hasError = true;
            }

            if (hasError) return;

            const result = handleLogin(email, password, rememberMe);

            if (result.success) {
                window.showToast(result.message, 'success');
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 800);
            } else {
                window.showToast(result.message, 'error');
            }
        });
    }

    // Register Form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const fullName = document.getElementById('fullName').value.trim();
            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // Clear errors
            document.querySelectorAll('#registerForm .error-message').forEach(el => el.textContent = '');

            let hasError = false;

            if (!fullName || fullName.length < 3) {
                document.getElementById('fullNameError').textContent = 'الاسم الكامل مطلوب (3 أحرف على الأقل).';
                hasError = true;
            }
            if (!username || username.length < 3) {
                document.getElementById('usernameError').textContent = 'اسم المستخدم مطلوب (3 أحرف على الأقل).';
                hasError = true;
            }
            if (!email) {
                document.getElementById('regEmailError').textContent = 'البريد الإلكتروني مطلوب.';
                hasError = true;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                document.getElementById('regEmailError').textContent = 'صيغة البريد الإلكتروني غير صحيحة.';
                hasError = true;
            }
            if (!password || password.length < 6) {
                document.getElementById('regPasswordError').textContent = 'كلمة المرور مطلوبة (6 أحرف على الأقل).';
                hasError = true;
            }
            if (password !== confirmPassword) {
                document.getElementById('confirmPasswordError').textContent = 'كلمتا المرور غير متطابقتين.';
                hasError = true;
            }

            if (hasError) return;

            const result = handleRegister(fullName, username, email, password);

            if (result.success) {
                window.showToast(result.message, 'success');
                registerForm.reset();
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1200);
            } else {
                window.showToast(result.message, 'error');
            }
        });
    }

    // Contact Form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('contactName').value.trim();
            const email = document.getElementById('contactEmail').value.trim();
            const subject = document.getElementById('contactSubject').value.trim();
            const message = document.getElementById('contactMessage').value.trim();

            // Clear errors
            document.querySelectorAll('#contactForm .error-message').forEach(el => el.textContent = '');

            let hasError = false;

            if (!name || name.length < 3) {
                document.getElementById('contactNameError').textContent = 'الاسم الكامل مطلوب (3 أحرف على الأقل).';
                hasError = true;
            }
            if (!email) {
                document.getElementById('contactEmailError').textContent = 'البريد الإلكتروني مطلوب.';
                hasError = true;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                document.getElementById('contactEmailError').textContent = 'صيغة البريد الإلكتروني غير صحيحة.';
                hasError = true;
            }
            if (!subject || subject.length < 3) {
                document.getElementById('contactSubjectError').textContent = 'الموضوع مطلوب (3 أحرف على الأقل).';
                hasError = true;
            }
            if (!message || message.length < 10) {
                document.getElementById('contactMessageError').textContent = 'الرسالة مطلوبة (10 أحرف على الأقل).';
                hasError = true;
            }

            if (hasError) return;

            // Simulate sending
            window.showToast('تم إرسال رسالتك بنجاح! سنتواصل معك قريبًا.', 'success');
            contactForm.reset();
        });
    }
});

// ---------- Handle logout from any page ----------
window.addEventListener('load', () => {
    // Check if there's a stored pending logout
    const pendingLogout = sessionStorage.getItem('pendingLogout');
    if (pendingLogout === 'true') {
        sessionStorage.removeItem('pendingLogout');
        handleLogout();
    }

    // Restore user from localStorage if sessionStorage is empty
    if (!sessionStorage.getItem('currentUser')) {
        const localUser = localStorage.getItem('currentUser');
        if (localUser) {
            sessionStorage.setItem('currentUser', localUser);
        }
    }
});