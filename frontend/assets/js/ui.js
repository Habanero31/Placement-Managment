const THEME_KEY = 'placement_theme';

function getStoredTheme() {
  return localStorage.getItem(THEME_KEY) || 'light';
}

function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.body.classList.toggle('dark-mode', isDark);
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  document.querySelectorAll('.theme-toggle').forEach((button) => {
    button.textContent = isDark ? '☀' : '☾';
    button.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    button.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  });
  window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
}

function toggleTheme() {
  const nextTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, nextTheme);
  applyTheme(nextTheme);
}

function createThemeToggle(extraClass = '') {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `btn ghost theme-toggle ${extraClass}`.trim();
  button.addEventListener('click', toggleTheme);
  return button;
}

document.addEventListener('DOMContentLoaded', () => {
  applyTheme(getStoredTheme());
  const navlinks = document.querySelector('.navlinks');
  if (navlinks && !navlinks.querySelector('.theme-toggle')) {
    navlinks.appendChild(createThemeToggle());
    applyTheme(getStoredTheme());
    return;
  }
  if (!navlinks && !document.querySelector('.theme-toggle')) {
    document.body.appendChild(createThemeToggle('floating-theme-toggle'));
    applyTheme(getStoredTheme());
  }
});

function showLoader() {
  document.getElementById('loader')?.classList.remove('hidden');
}

function el(id) {
  return document.getElementById(id);
}

function hideLoader() {
  document.getElementById('loader')?.classList.add('hidden');
}

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.style.background = type === 'error' ? '#b91c1c' : type === 'success' ? '#047857' : '#111827';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

function statusBadge(status) {
  return `<span class="badge ${status}">${status}</span>`;
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}
