requireAuth('admin');
let students = [];

document.addEventListener('DOMContentLoaded', loadStudents);
document.getElementById('studentForm').addEventListener('submit', saveStudent);

async function loadStudents() {
  try {
    showLoader();
    students = await apiRequest('/students');
    document.getElementById('studentsTable').innerHTML = students.map((student) => `
      <tr>
        <td>${student.name}<br><span class="muted">${student.email}</span></td>
        <td>${student.roll_no}</td>
        <td>${student.department}</td>
        <td>${student.cgpa}</td>
        <td class="muted">${student.skills || '-'}</td>
        <td class="action-row">
          <button class="btn ghost" onclick="editStudent(${student.id})">Edit</button>
          <button class="btn danger" onclick="deleteStudent(${student.id})">Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    hideLoader();
  }
}

async function saveStudent(event) {
  event.preventDefault();
  const id = document.getElementById('studentId').value;
  const payload = collectStudentForm();

  try {
    await apiRequest(id ? `/students/${id}` : '/students', {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(payload)
    });
    event.target.reset();
    el('studentId').value = '';
    showToast('Student saved', 'success');
    loadStudents();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

function collectStudentForm() {
  return {
    name: el('name').value.trim(),
    email: el('email').value.trim(),
    password: el('password').value,
    roll_no: el('roll_no').value.trim(),
    department: el('department').value.trim(),
    graduation_year: Number(el('graduation_year').value),
    cgpa: Number(el('cgpa').value),
    skills: el('skills').value.trim(),
    phone: el('phone').value.trim(),
    resume_url: el('resume_url').value.trim()
  };
}

function editStudent(id) {
  const student = students.find((item) => item.id === id);
  if (!student) return;
  el('studentId').value = student.id;
  el('name').value = student.name;
  el('email').value = student.email;
  el('password').value = '';
  el('roll_no').value = student.roll_no;
  el('department').value = student.department;
  el('graduation_year').value = student.graduation_year;
  el('cgpa').value = student.cgpa;
  el('skills').value = student.skills || '';
  el('phone').value = student.phone || '';
  el('resume_url').value = student.resume_url || '';
}

async function deleteStudent(id) {
  if (!confirm('Delete this student?')) return;
  try {
    await apiRequest(`/students/${id}`, { method: 'DELETE' });
    showToast('Student deleted', 'success');
    loadStudents();
  } catch (error) {
    showToast(error.message, 'error');
  }
}
