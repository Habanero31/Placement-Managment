const jobUser = requireAuth();
let jobs = [];
let companies = [];

document.addEventListener('DOMContentLoaded', initJobs);

async function initJobs() {
  document.getElementById('jobNav').innerHTML = navForRole(jobUser);
  if (jobUser.role === 'admin') {
    document.getElementById('adminJobPanel').classList.remove('hidden');
    document.getElementById('studentJobPanel').classList.add('hidden');
    document.getElementById('jobForm').addEventListener('submit', saveJob);
    await loadCompaniesForSelect();
    await loadAdminJobs();
  } else {
    document.getElementById('adminJobPanel').classList.add('hidden');
    await loadStudentJobs();
  }
}

async function loadCompaniesForSelect() {
  companies = await apiRequest('/companies');
  el('company_id').innerHTML = companies.map((company) => `<option value="${company.id}">${company.name}</option>`).join('');
}

async function loadAdminJobs() {
  try {
    showLoader();
    jobs = await apiRequest('/jobs');
    el('jobsTable').innerHTML = jobs.map((job) => `
      <tr>
        <td>${job.title}</td><td>${job.company_name}</td><td>${job.package_lpa} LPA</td><td>${statusBadge(job.status)}</td>
        <td class="action-row"><button class="btn ghost" onclick="editJob(${job.id})">Edit</button><button class="btn danger" onclick="deleteJob(${job.id})">Delete</button></td>
      </tr>
    `).join('');
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    hideLoader();
  }
}

async function loadStudentJobs() {
  try {
    showLoader();
    jobs = await apiRequest('/jobs');
    el('studentJobPanel').innerHTML = jobs.map((job) => `
      <article class="job-card">
        <h2>${job.title}</h2>
        <p class="muted">${job.company_name} &bull; ${job.location || 'Flexible'}</p>
        <p>${job.description}</p>
        <p><strong>${job.package_lpa} LPA</strong> &bull; Min CGPA ${job.min_cgpa}</p>
        <button class="btn primary" onclick="applyForJob(${job.id})">Apply</button>
      </article>
    `).join('');
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    hideLoader();
  }
}

async function saveJob(event) {
  event.preventDefault();
  const id = el('jobId').value;
  const payload = {
    company_id: Number(el('company_id').value),
    title: el('title').value.trim(),
    description: el('description').value.trim(),
    package_lpa: Number(el('package_lpa').value),
    min_cgpa: Number(el('min_cgpa').value),
    location: el('location').value.trim(),
    deadline: el('deadline').value,
    status: el('status').value
  };
  try {
    await apiRequest(id ? `/jobs/${id}` : '/jobs', { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) });
    event.target.reset();
    el('jobId').value = '';
    showToast('Job saved', 'success');
    loadAdminJobs();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

function editJob(id) {
  const job = jobs.find((item) => item.id === id);
  if (!job) return;
  el('jobId').value = job.id;
  el('company_id').value = job.company_id;
  el('title').value = job.title;
  el('description').value = job.description;
  el('package_lpa').value = job.package_lpa;
  el('min_cgpa').value = job.min_cgpa;
  el('location').value = job.location || '';
  el('deadline').value = String(job.deadline).slice(0, 10);
  el('status').value = job.status;
}

async function deleteJob(id) {
  if (!confirm('Delete this job?')) return;
  try {
    await apiRequest(`/jobs/${id}`, { method: 'DELETE' });
    showToast('Job deleted', 'success');
    loadAdminJobs();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function applyForJob(jobId) {
  try {
    await apiRequest('/applications', { method: 'POST', body: JSON.stringify({ job_id: jobId }) });
    showToast('Application submitted', 'success');
  } catch (error) {
    showToast(error.message, 'error');
  }
}
