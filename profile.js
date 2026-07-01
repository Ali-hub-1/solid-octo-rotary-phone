/* ===================================================
   profile.js - إدارة الملف الشخصي
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        // Already handled by protectProfilePage in auth.js
        return;
    }

    // ---------- Populate Profile Info ----------
    function populateProfileInfo() {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) return;

        // Avatar
        const avatar = document.getElementById('profileAvatar');
        if (avatar) {
            avatar.textContent = user.fullName ? user.fullName.charAt(0).toUpperCase() : 'م';
        }

        // Display name
        const displayName = document.getElementById('profileDisplayName');
        if (displayName) {
            displayName.textContent = user.fullName || 'المستخدم';
        }

        // Username
        const usernameEl = document.getElementById('profileUsername');
        if (usernameEl) {
            usernameEl.textContent = '@' + (user.username || 'user');
        }

        // Info tab
        const infoFullName = document.getElementById('infoFullName');
        const infoUsername = document.getElementById('infoUsername');
        const infoEmail = document.getElementById('infoEmail');
        const infoDate = document.getElementById('infoDate');

        if (infoFullName) infoFullName.textContent = user.fullName || '-';
        if (infoUsername) infoUsername.textContent = user.username || '-';
        if (infoEmail) infoEmail.textContent = user.email || '-';
        if (infoDate && user.createdAt) {
            const date = new Date(user.createdAt);
            infoDate.textContent = date.toLocaleDateString('ar-SA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        }

        // Edit form
        const editFullName = document.getElementById('editFullName');
        const editEmail = document.getElementById('editEmail');
        if (editFullName) editFullName.value = user.fullName || '';
        if (editEmail) editEmail.value = user.email || '';
    }

    populateProfileInfo();

    // ---------- Edit Profile Form ----------
    const editForm = document.getElementById('profileEditForm');
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const fullName = document.getElementById('editFullName').value.trim();
            const email = document.getElementById('editEmail').value.trim();

            // Clear errors
            document.getElementById('editFullNameError').textContent = '';
            document.getElementById('editEmailError').textContent = '';

            let hasError = false;
            if (!fullName || fullName.length < 3) {
                document.getElementById('editFullNameError').textContent = 'الاسم الكامل مطلوب (3 أحرف على الأقل).';
                hasError = true;
            }
            if (!email) {
                document.getElementById('editEmailError').textContent = 'البريد الإلكتروني مطلوب.';
                hasError = true;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                document.getElementById('editEmailError').textContent = 'صيغة البريد الإلكتروني غير صحيحة.';
                hasError = true;
            }

            if (hasError) return;

            const result = window.handleUpdateProfile
                ? window.handleUpdateProfile(fullName, email)
                : handleUpdateProfileLocal(fullName, email);

            if (result.success) {
                window.showToast(result.message, 'success');
                populateProfileInfo();
            } else {
                window.showToast(result.message, 'error');
            }
        });
    }

    // ---------- Change Password Form ----------
    const passwordForm = document.getElementById('passwordChangeForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmNewPassword = document.getElementById('confirmNewPassword').value;

            // Clear errors
            document.getElementById('currentPasswordError').textContent = '';
            document.getElementById('newPasswordError').textContent = '';
            document.getElementById('confirmNewPasswordError').textContent = '';

            let hasError = false;

            if (!currentPassword || currentPassword.length < 6) {
                document.getElementById('currentPasswordError').textContent = 'كلمة المرور الحالية مطلوبة.';
                hasError = true;
            }
            if (!newPassword || newPassword.length < 6) {
                document.getElementById('newPasswordError').textContent = 'كلمة المرور الجديدة مطلوبة (6 أحرف على الأقل).';
                hasError = true;
            }
            if (newPassword !== confirmNewPassword) {
                document.getElementById('confirmNewPasswordError').textContent = 'كلمتا المرور غير متطابقتين.';
                hasError = true;
            }

            if (hasError) return;

            const result = window.handleChangePassword
                ? window.handleChangePassword(currentPassword, newPassword)
                : handleChangePasswordLocal(currentPassword, newPassword);

            if (result.success) {
                window.showToast(result.message, 'success');
                passwordForm.reset();
            } else {
                window.showToast(result.message, 'error');
            }
        });
    }
});

// ---------- Local Helper Functions (in case auth.js functions aren't loaded) ----------
function handleUpdateProfileLocal(fullName, email) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return { success: false, message: 'يجب تسجيل الدخول أولاً.' };

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    if (userIndex === -1) return { success: false, message: 'المستخدم غير موجود.' };

    const emailExists = users.find(u => u.email === email && u.id !== currentUser.id);
    if (emailExists) return { success: false, message: 'البريد الإلكتروني مستخدم من قبل مستخدم آخر.' };

    users[userIndex].fullName = fullName;
    users[userIndex].email = email;
    localStorage.setItem('users', JSON.stringify(users));

    const updatedUser = { ...currentUser, fullName, email };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    return { success: true, message: 'تم تحديث البيانات بنجاح!' };
}

function handleChangePasswordLocal(currentPassword, newPassword) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return { success: false, message: 'يجب تسجيل الدخول أولاً.' };

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    if (userIndex === -1) return { success: false, message: 'المستخدم غير موجود.' };
    if (users[userIndex].password !== currentPassword) {
        return { success: false, message: 'كلمة المرور الحالية غير صحيحة.' };
    }

    users[userIndex].password = newPassword;
    localStorage.setItem('users', JSON.stringify(users));

    return { success: true, message: 'تم تغيير كلمة المرور بنجاح!' };
}

// Expose to window for auth.js to potentially override
window.handleUpdateProfile = handleUpdateProfileLocal;
window.handleChangePassword = handleChangePasswordLocal;