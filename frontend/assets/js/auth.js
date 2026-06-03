function currentUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

function requireAuth(expectedRole) {
  const user = currentUser();
  if (!getToken() || !user) {
    window.location.href = 'index.html';
    return null;
  }
  if (expectedRole && user.role !== expectedRole) {
    window.location.href = user.role === 'admin' ? 'admin-dashboard.html' : 'student-dashboard.html';
    return null;
  }
  return user;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

function navForRole(user, activeArea) {
  const adminLinks = '<a href="admin-dashboard.html">Analytics</a><a href="students.html">Students</a><a href="companies.html">Companies</a><a href="jobs.html">Jobs</a><a href="applications.html">Applications</a><a href="interviews.html">Interviews</a>';
  const studentLinks = '<a href="student-dashboard.html">Dashboard</a><a href="jobs.html">Jobs</a><a href="applications.html">Applications</a><a href="interviews.html">Interviews</a>';
  const isDark = typeof getStoredTheme === 'function' && getStoredTheme() === 'dark';
  const themeIcon = isDark ? '☀' : '☾';
  return `${user.role === 'admin' ? adminLinks : studentLinks}<button class="btn ghost theme-toggle" onclick="toggleTheme()" aria-label="Toggle theme">${themeIcon}</button><button class="btn ghost" onclick="logout()">Logout</button>`;
}
