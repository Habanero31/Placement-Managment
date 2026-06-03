requireAuth('admin');
let companies = [];

document.addEventListener('DOMContentLoaded', loadCompanies);
document.getElementById('companyForm').addEventListener('submit', saveCompany);

async function loadCompanies() {
  try {
    showLoader();
    companies = await apiRequest('/companies');
    document.getElementById('companiesTable').innerHTML = companies.map((company) => `
      <tr>
        <td>${company.name}</td>
        <td>${company.industry}</td>
        <td>${company.location || '-'}</td>
        <td>${company.contact_email || '-'}</td>
        <td class="action-row">
          <button class="btn ghost" onclick="editCompany(${company.id})">Edit</button>
          <button class="btn danger" onclick="deleteCompany(${company.id})">Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    hideLoader();
  }
}

async function saveCompany(event) {
  event.preventDefault();
  const id = el('companyId').value;
  const payload = {
    name: el('name').value.trim(),
    industry: el('industry').value.trim(),
    website: el('website').value.trim(),
    location: el('location').value.trim(),
    contact_email: el('contact_email').value.trim()
  };
  try {
    await apiRequest(id ? `/companies/${id}` : '/companies', {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(payload)
    });
    event.target.reset();
    el('companyId').value = '';
    showToast('Company saved', 'success');
    loadCompanies();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

function editCompany(id) {
  const company = companies.find((item) => item.id === id);
  if (!company) return;
  el('companyId').value = company.id;
  el('name').value = company.name;
  el('industry').value = company.industry;
  el('website').value = company.website || '';
  el('location').value = company.location || '';
  el('contact_email').value = company.contact_email || '';
}

async function deleteCompany(id) {
  if (!confirm('Delete this company and related jobs?')) return;
  try {
    await apiRequest(`/companies/${id}`, { method: 'DELETE' });
    showToast('Company deleted', 'success');
    loadCompanies();
  } catch (error) {
    showToast(error.message, 'error');
  }
}
