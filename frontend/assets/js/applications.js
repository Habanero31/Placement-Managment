const appUser = requireAuth();
document.addEventListener('DOMContentLoaded', initApplications);

async function initApplications() {
  document.getElementById('appNav').innerHTML = navForRole(appUser);
  await loadApplications();
}

async function loadApplications() {
  try {
    showLoader();
    const endpoint = appUser.role === 'admin' ? '/applications' : '/applications/me';
    const rows = await apiRequest(endpoint);
    el('applicationsTable').innerHTML = rows.map((item) => `
      <tr>
        <td>${item.student_name || 'Me'}</td>
        <td>${item.job_title}</td>
        <td>${item.company_name}</td>
        <td>${item.package_lpa ? `${item.package_lpa} LPA` : '-'}</td>
        <td>${statusBadge(item.status)}</td>
        <td>${appUser.role === 'admin' ? statusControls(item) : '-'}</td>
      </tr>
    `).join('');
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    hideLoader();
  }
}

function statusControls(item) {
  return `
    <select onchange="updateStatus(${item.id}, this.value)">
      ${['applied', 'shortlisted', 'selected', 'rejected'].map((status) => `<option value="${status}" ${status === item.status ? 'selected' : ''}>${status}</option>`).join('')}
    </select>
  `;
}

async function updateStatus(id, status) {
  try {
    await apiRequest(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    showToast('Status updated', 'success');
    loadApplications();
  } catch (error) {
    showToast(error.message, 'error');
  }
}
