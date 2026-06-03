const user = currentUser();
let dashboardCharts = [];
let latestAnalytics = null;

if (location.pathname.endsWith('admin-dashboard.html')) {
  requireAuth('admin');
  loadAdminDashboard();
}

if (location.pathname.endsWith('student-dashboard.html')) {
  requireAuth('student');
  loadStudentDashboard();
}

async function loadAdminDashboard() {
  try {
    showLoader();
    const [data, analytics] = await Promise.all([
      apiRequest('/dashboard/stats'),
      apiRequest('/dashboard/analytics')
    ]);
    latestAnalytics = analytics;
    const totals = data.totals;
    document.getElementById('statsGrid').innerHTML = [
      ['Students', totals.students],
      ['Companies', totals.companies],
      ['Jobs', totals.jobs],
      ['Applications', totals.applications],
      ['Selected Students', totals.selectedStudents],
      ['Rejected Students', totals.rejectedStudents],
      ['Upcoming Interviews', totals.upcomingInterviews],
      ['Placement %', `${totals.placementPercentage}%`],
      ['Highest Package', `${totals.highestPackage} LPA`],
      ['Average Package', `${totals.averagePackage} LPA`]
    ].map(([label, value]) => `<article class="stat-card"><span>${label}</span><strong>${value}</strong></article>`).join('');

    document.getElementById('recentApplications').innerHTML = data.recentApplications.map((item) => `
      <tr><td>${item.student_name}</td><td>${item.job_title}</td><td>${item.company_name}</td><td>${statusBadge(item.status)}</td><td>${formatDate(item.applied_at)}</td></tr>
    `).join('');
    document.getElementById('upcomingInterviews').innerHTML = data.upcomingInterviews.map((item) => `
      <tr><td>${item.student_name}</td><td>${item.company_name}</td><td>${formatDate(item.interview_date)}</td><td>${item.mode}</td></tr>
    `).join('');
    document.getElementById('topOffers').innerHTML = data.topOffers.map((item) => `
      <tr><td>${item.student_name}</td><td>${item.department}</td><td>${item.company_name}</td><td>${item.job_title}</td><td>${item.package_lpa} LPA</td></tr>
    `).join('');

    renderAnalyticsCharts(analytics);
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    hideLoader();
  }
}

function chartPalette() {
  const styles = getComputedStyle(document.body);
  return {
    text: styles.getPropertyValue('--chart-text').trim() || '#687388',
    grid: styles.getPropertyValue('--chart-grid').trim() || '#dbe2ef',
    colors: ['#2563eb', '#0f9f8f', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2', '#16a34a', '#ea580c', '#be123c', '#4f46e5']
  };
}

function chartDataset(rows) {
  return {
    labels: rows.map((row) => row.label),
    values: rows.map((row) => Number(row.value))
  };
}

function chartOptions(type, rows = []) {
  const palette = chartPalette();
  const hasManyLabels = rows.length > 8;
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 120,
    layout: {
      padding: 4
    },
    plugins: {
      legend: {
        display: type === 'pie' || type === 'doughnut',
        position: 'bottom',
        labels: {
          color: palette.text,
          boxWidth: 12,
          boxHeight: 12,
          padding: 10,
          font: { size: 11 }
        }
      }
    },
    elements: {
      point: {
        radius: 3,
        hoverRadius: 4
      }
    },
    scales: {}
  };

  if (type !== 'pie' && type !== 'doughnut') {
    options.scales = {
      x: {
        ticks: {
          color: palette.text,
          autoSkip: hasManyLabels,
          maxRotation: hasManyLabels ? 45 : 25,
          minRotation: 0,
          font: { size: 11 },
          callback(value) {
            const label = this.getLabelForValue(value);
            return label.length > 16 ? `${label.slice(0, 15)}...` : label;
          }
        },
        grid: { color: palette.grid }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: palette.text,
          precision: 0,
          maxTicksLimit: 5,
          font: { size: 11 }
        },
        grid: { color: palette.grid }
      }
    };
  }
  return options;
}

function buildChart(canvasId, type, rows, label) {
  const palette = chartPalette();
  const data = chartDataset(rows);
  const colors = data.labels.map((_, index) => palette.colors[index % palette.colors.length]);
  return new Chart(document.getElementById(canvasId), {
    type,
    data: {
      labels: data.labels,
      datasets: [{
        label,
        data: data.values,
        backgroundColor: type === 'line' ? 'rgba(37, 99, 235, 0.18)' : colors,
        borderColor: type === 'line' ? '#2563eb' : colors,
        borderWidth: 2,
        tension: 0.35,
        fill: type === 'line'
      }]
    },
    options: chartOptions(type, rows)
  });
}

function renderAnalyticsCharts(analytics) {
  if (!window.Chart) {
    showToast('Chart.js could not be loaded. Check your internet connection.', 'error');
    return;
  }

  // Recreate charts on data load and theme changes so Chart.js picks up the active CSS colors.
  dashboardCharts.forEach((chart) => chart.destroy());
  dashboardCharts = [
    buildChart('departmentChart', 'bar', analytics.studentsByDepartment, 'Students'),
    buildChart('statusChart', 'doughnut', analytics.placementStatus, 'Applications'),
    buildChart('companyHiringChart', 'bar', analytics.companyHiring, 'Selected Students'),
    buildChart('applicationsTimelineChart', 'line', analytics.applicationsOverTime, 'Applications'),
    buildChart('packageDistributionChart', 'bar', analytics.packageDistribution, 'Jobs'),
    buildChart('interviewTimelineChart', 'line', analytics.interviewTimeline, 'Interviews')
  ];
}

window.addEventListener('themechange', () => {
  if (latestAnalytics) renderAnalyticsCharts(latestAnalytics);
});

async function loadStudentDashboard() {
  try {
    showLoader();
    const [profile, jobs] = await Promise.all([
      apiRequest('/students/me'),
      apiRequest('/jobs')
    ]);
    document.getElementById('studentName').textContent = `Welcome, ${profile.name}`;
    document.getElementById('profileCard').innerHTML = `
      <div><span>Roll No</span><strong>${profile.roll_no}</strong></div>
      <div><span>Department</span><strong>${profile.department}</strong></div>
      <div><span>Graduation</span><strong>${profile.graduation_year}</strong></div>
      <div><span>CGPA</span><strong>${profile.cgpa}</strong></div>
      <div><span>Skills</span><strong>${profile.skills || '-'}</strong></div>
    `;
    document.getElementById('studentJobs').innerHTML = jobs.map(jobCard).join('');
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    hideLoader();
  }
}

function jobCard(job) {
  return `
    <article class="job-card">
      <h2>${job.title}</h2>
      <p class="muted">${job.company_name} &bull; ${job.location || 'Flexible'}</p>
      <p>${job.description}</p>
      <p><strong>${job.package_lpa} LPA</strong> &bull; Min CGPA ${job.min_cgpa}</p>
      <button class="btn primary" onclick="applyForJob(${job.id})">Apply</button>
    </article>
  `;
}

async function applyForJob(jobId) {
  try {
    await apiRequest('/applications', { method: 'POST', body: JSON.stringify({ job_id: jobId }) });
    showToast('Application submitted', 'success');
  } catch (error) {
    showToast(error.message, 'error');
  }
}
