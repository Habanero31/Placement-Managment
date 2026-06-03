const interviewUser = requireAuth();
let interviews = [];
let applications = [];

document.addEventListener('DOMContentLoaded', initInterviews);

async function initInterviews() {
  document.getElementById('interviewNav').innerHTML = navForRole(interviewUser);
  if (interviewUser.role === 'admin') {
    el('adminInterviewPanel').classList.remove('hidden');
    el('interviewForm').addEventListener('submit', saveInterview);
    await loadApplicationOptions();
    await loadInterviews();
  } else {
    el('studentInterviewPanel').classList.remove('hidden');
    await loadMyInterviews();
  }
}

async function loadApplicationOptions() {
  applications = await apiRequest('/applications');
  el('application_id').innerHTML = applications.map((app) => `<option value="${app.id}">${app.student_name} - ${app.job_title}</option>`).join('');
}

async function loadInterviews() {
  try {
    showLoader();
    interviews = await apiRequest('/interviews');
    el('interviewsTable').innerHTML = interviews.map((item) => `
      <tr>
        <td>${item.student_name}</td><td>${item.job_title}</td><td>${formatDate(item.interview_date)}</td><td>${statusBadge(item.result)}</td>
        <td class="action-row"><button class="btn ghost" onclick="editInterview(${item.id})">Edit</button><button class="btn danger" onclick="deleteInterview(${item.id})">Delete</button></td>
      </tr>
    `).join('');
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    hideLoader();
  }
}

async function loadMyInterviews() {
  try {
    showLoader();
    const rows = await apiRequest('/interviews/me');
    el('myInterviewsTable').innerHTML = rows.map((item) => `
      <tr><td>${item.job_title}</td><td>${item.company_name}</td><td>${formatDate(item.interview_date)}</td><td>${item.mode}</td><td>${statusBadge(item.result)}</td></tr>
    `).join('');
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    hideLoader();
  }
}

async function saveInterview(event) {
  event.preventDefault();
  const id = el('interviewId').value;
  const payload = {
    application_id: Number(el('application_id').value),
    interview_date: el('interview_date').value,
    mode: el('mode').value,
    venue: el('venue').value.trim(),
    interviewer: el('interviewer').value.trim(),
    result: el('result').value,
    notes: el('notes').value.trim()
  };
  try {
    await apiRequest(id ? `/interviews/${id}` : '/interviews', { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) });
    event.target.reset();
    el('interviewId').value = '';
    showToast('Interview saved', 'success');
    loadInterviews();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

function editInterview(id) {
  const item = interviews.find((row) => row.id === id);
  if (!item) return;
  el('interviewId').value = item.id;
  el('application_id').value = item.application_id;
  el('interview_date').value = String(item.interview_date).slice(0, 16);
  el('mode').value = item.mode;
  el('venue').value = item.venue || '';
  el('interviewer').value = item.interviewer || '';
  el('result').value = item.result;
  el('notes').value = item.notes || '';
}

async function deleteInterview(id) {
  if (!confirm('Delete this interview?')) return;
  try {
    await apiRequest(`/interviews/${id}`, { method: 'DELETE' });
    showToast('Interview deleted', 'success');
    loadInterviews();
  } catch (error) {
    showToast(error.message, 'error');
  }
}
