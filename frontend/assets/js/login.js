document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const payload = {
    email: document.getElementById('email').value.trim(),
    password: document.getElementById('password').value,
    role: document.getElementById('role').value
  };

  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = data.user.role === 'admin' ? 'admin-dashboard.html' : 'student-dashboard.html';
  } catch (error) {
    showToast(error.message, 'error');
  }
});
