/* ===================================================
   main.js - الوظائف الرئيسية للموقع
   =================================================== */

// ---------- DOM Elements ----------
const loadingScreen = document.getElementById('loadingScreen');
const scrollToTopBtn = document.getElementById('scrollToTop');
const darkModeToggle = document.getElementById('darkModeToggle');
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const toastContainer = document.getElementById('toastContainer');

// ---------- Loading Screen ----------
window.addEventListener('load', () => {
    setTimeout(() => {
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }, 600);
});

// ---------- Scroll To Top Button ----------
window.addEventListener('scroll', () => {
    if (scrollToTopBtn) {
        if (window.scrollY > 400) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    }

    // Navbar shadow on scroll
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
});

if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ---------- Dark Mode Toggle ----------
function initDarkMode() {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
        document.body.classList.add('dark-mode');
        if (darkModeToggle) {
            darkModeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
        }
    }
}

if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        darkModeToggle.innerHTML = isDark
            ? '<i class="fa-solid fa-sun"></i>'
            : '<i class="fa-solid fa-moon"></i>';
    });
}

initDarkMode();

// ---------- Hamburger Menu ----------
if (hamburger && navMenu) {
    // Create overlay for mobile menu
    const overlay = document.createElement('div');
    overlay.classList.add('nav-overlay');
    document.body.appendChild(overlay);

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        overlay.classList.toggle('active');
    });

    overlay.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        overlay.classList.remove('active');
    });

    // Close menu on link click
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            overlay.classList.remove('active');
        });
    });
}

// ---------- Toast Notifications ----------
function showToast(message, type = 'info') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.classList.add('toast', type);
    toast.textContent = message;
    toastContainer.appendChild(toast);

    // Remove toast after animation
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 3400);
}

// Make showToast globally available
window.showToast = showToast;

// ---------- Statistics Counter Animation ----------
function animateCounters() {
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length === 0) return;

    const observerOptions = { threshold: 0.5 };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const endValue = parseInt(target.getAttribute('data-target'));
                const duration = 2000;
                const startTime = performance.now();

                function updateCounter(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    // Ease out quad
                    const eased = 1 - (1 - progress) * (1 - progress);
                    const currentValue = Math.floor(eased * endValue);
                    target.textContent = currentValue;

                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    } else {
                        target.textContent = endValue;
                    }
                }

                requestAnimationFrame(updateCounter);
                observer.unobserve(target);
            }
        });
    }, observerOptions);

    statNumbers.forEach(num => observer.observe(num));
}

// ---------- Testimonials Slider ----------
function initTestimonialsSlider() {
    const slider = document.getElementById('testimonialsSlider');
    const dots = document.querySelectorAll('#testimonialDots .dot');
    if (!slider || dots.length === 0) return;

    const cards = slider.querySelectorAll('.testimonial-card');
    let currentIndex = 0;
    let intervalId;

    function showSlide(index) {
        cards.forEach((card, i) => {
            card.classList.toggle('active', i === index);
        });
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        currentIndex = index;
    }

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const index = parseInt(dot.getAttribute('data-index'));
            showSlide(index);
            resetInterval();
        });
    });

    function nextSlide() {
        const next = (currentIndex + 1) % cards.length;
        showSlide(next);
    }

    function resetInterval() {
        clearInterval(intervalId);
        intervalId = setInterval(nextSlide, 5000);
    }

    // Start auto-slide
    intervalId = setInterval(nextSlide, 5000);

    // Pause on hover
    slider.addEventListener('mouseenter', () => clearInterval(intervalId));
    slider.addEventListener('mouseleave', () => {
        intervalId = setInterval(nextSlide, 5000);
    });
}

// ---------- Portfolio Filter ----------
function initPortfolioFilter() {
    const filterBtns = document.querySelectorAll('#portfolioFilter .filter-btn');
    const items = document.querySelectorAll('#portfolioGrid .portfolio-item');
    if (filterBtns.length === 0 || items.length === 0) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            items.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.classList.remove('hidden');
                    // Add fade animation
                    item.style.animation = 'fadeInUp 0.4s ease forwards';
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    });
}

// ---------- Profile Tabs ----------
function initProfileTabs() {
    const tabBtns = document.querySelectorAll('.profile-nav-btn');
    const tabs = document.querySelectorAll('.profile-tab');
    if (tabBtns.length === 0 || tabs.length === 0) return;

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            tabs.forEach(tab => {
                tab.classList.remove('active');
                if (tab.id === `tab-${targetTab}`) {
                    tab.classList.add('active');
                }
            });
        });
    });
}

// ---------- Password Toggle Visibility ----------
function initPasswordToggles() {
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (input) {
                const icon = btn.querySelector('i');
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            }
        });
    });
}

// ---------- Smooth Scroll for Anchor Links ----------
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            e.preventDefault();
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ---------- Initialize All ----------
document.addEventListener('DOMContentLoaded', () => {
    animateCounters();
    initTestimonialsSlider();
    initPortfolioFilter();
    initProfileTabs();
    initPasswordToggles();

    // Add fade-in animation to elements with data-aos attribute
    const animatedElements = document.querySelectorAll('[data-aos]');
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const delay = el.getAttribute('data-aos-delay') || 0;
                setTimeout(() => {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, delay);
                animationObserver.unobserve(el);
            }
        });
    }, { threshold: 0.1 });

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        animationObserver.observe(el);
    });

    // Check auth state and update navbar
    updateNavbarAuthState();
});

// ---------- Update Navbar Based on Auth State ----------
function updateNavbarAuthState() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const loginBtn = document.querySelector('.btn-nav-login');
    const registerBtn = document.querySelector('.btn-nav-register');
    const logoutBtn = document.getElementById('navLogoutBtn');
    const profileLink = document.querySelector('.nav-link[href="profile.html"]');

    if (currentUser) {
        // User is logged in
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'list-item';
        if (profileLink) {
            profileLink.querySelector('i').className = 'fa-solid fa-user-check';
        }
    } else {
        // User is not logged in
        if (loginBtn) loginBtn.style.display = '';
        if (registerBtn) registerBtn.style.display = '';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
}

// Export updateNavbarAuthState globally
window.updateNavbarAuthState = updateNavbarAuthState;