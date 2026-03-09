// ──────────────────────────────────────────
// SpaceHub — Shared Frontend Utilities
// ──────────────────────────────────────────

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.className = `toast toast--${type} show`;
    toast.innerHTML = `${type === 'success' ? '✓' : '✕'} ${message}`;
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

function requireAuth(allowedRoles) {
    const userData = sessionStorage.getItem('user');
    if (!userData) {
        window.location.href = 'login.html';
        return null;
    }
    const user = JSON.parse(userData);
    if (allowedRoles && !allowedRoles.includes(user.role || 'customer')) {
        window.location.href = 'login.html';
        return null;
    }
    return user;
}

function handleLogout() {
    sessionStorage.removeItem('user');
    window.location.href = 'index.html';
}

function toggleProfileMenu() {
    const dd = document.getElementById('profileDropdown');
    if (dd) dd.classList.toggle('show');
}

document.addEventListener('click', (e) => {
    const menu = document.querySelector('.profile-menu');
    if (menu && !menu.contains(e.target)) {
        const dd = document.getElementById('profileDropdown');
        if (dd) dd.classList.remove('show');
    }
});

function formatCurrency(amount) {
    return '฿' + Number(amount).toLocaleString();
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString();
}
