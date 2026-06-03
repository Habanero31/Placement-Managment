const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

exports.getStats = asyncHandler(async (req, res) => {
  const [[students]] = await pool.query('SELECT COUNT(*) AS total FROM students');
  const [[companies]] = await pool.query('SELECT COUNT(*) AS total FROM companies');
  const [[jobs]] = await pool.query('SELECT COUNT(*) AS total FROM jobs');
  const [[applications]] = await pool.query('SELECT COUNT(*) AS total FROM applications');
  const [[selectedStudents]] = await pool.query("SELECT COUNT(DISTINCT student_id) AS total FROM applications WHERE status = 'selected'");
  const [[rejectedStudents]] = await pool.query("SELECT COUNT(DISTINCT student_id) AS total FROM applications WHERE status = 'rejected'");
  const [[upcomingInterviews]] = await pool.query("SELECT COUNT(*) AS total FROM interviews WHERE interview_date >= NOW() AND result = 'scheduled'");
  const [[packageStats]] = await pool.query(`
    SELECT
      COALESCE(MAX(j.package_lpa), 0) AS highest_package,
      COALESCE(ROUND(AVG(j.package_lpa), 2), 0) AS average_package
    FROM applications a
    JOIN jobs j ON j.id = a.job_id
    WHERE a.status = 'selected'
  `);
  const [statusRows] = await pool.query('SELECT status, COUNT(*) AS total FROM applications GROUP BY status');
  const [recentApplications] = await pool.query(`
    SELECT a.id, a.status, a.applied_at, u.name AS student_name, j.title AS job_title, c.name AS company_name
    FROM applications a
    JOIN students s ON s.id = a.student_id
    JOIN users u ON u.id = s.user_id
    JOIN jobs j ON j.id = a.job_id
    JOIN companies c ON c.id = j.company_id
    ORDER BY a.id DESC
    LIMIT 8
  `);
  const [upcomingInterviewRows] = await pool.query(`
    SELECT i.interview_date, i.mode, i.venue, i.interviewer, u.name AS student_name, j.title AS job_title, c.name AS company_name
    FROM interviews i
    JOIN applications a ON a.id = i.application_id
    JOIN students s ON s.id = a.student_id
    JOIN users u ON u.id = s.user_id
    JOIN jobs j ON j.id = a.job_id
    JOIN companies c ON c.id = j.company_id
    WHERE i.interview_date >= NOW()
    ORDER BY i.interview_date ASC
    LIMIT 8
  `);
  const [topOffers] = await pool.query(`
    SELECT u.name AS student_name, s.department, c.name AS company_name, j.title AS job_title, j.package_lpa
    FROM applications a
    JOIN students s ON s.id = a.student_id
    JOIN users u ON u.id = s.user_id
    JOIN jobs j ON j.id = a.job_id
    JOIN companies c ON c.id = j.company_id
    WHERE a.status = 'selected'
    ORDER BY j.package_lpa DESC
    LIMIT 8
  `);

  res.json({
    totals: {
      students: students.total,
      companies: companies.total,
      jobs: jobs.total,
      applications: applications.total,
      selectedStudents: selectedStudents.total,
      rejectedStudents: rejectedStudents.total,
      upcomingInterviews: upcomingInterviews.total,
      placementPercentage: students.total ? Number(((selectedStudents.total / students.total) * 100).toFixed(1)) : 0,
      highestPackage: Number(packageStats.highest_package),
      averagePackage: Number(packageStats.average_package)
    },
    statusCounts: statusRows,
    recentApplications,
    upcomingInterviews: upcomingInterviewRows,
    topOffers
  });
});

exports.getAnalytics = asyncHandler(async (req, res) => {
  // Each query returns label/value pairs so Chart.js can render charts without frontend data reshaping.
  const [studentsByDepartment] = await pool.query(`
    SELECT department AS label, COUNT(*) AS value
    FROM students
    GROUP BY department
    ORDER BY value DESC, department ASC
  `);
  const [placementStatus] = await pool.query(`
    SELECT status AS label, COUNT(*) AS value
    FROM applications
    GROUP BY status
    ORDER BY FIELD(status, 'applied', 'shortlisted', 'selected', 'rejected')
  `);
  const [companyHiring] = await pool.query(`
    SELECT c.name AS label, COUNT(a.id) AS value
    FROM companies c
    LEFT JOIN jobs j ON j.company_id = c.id
    LEFT JOIN applications a ON a.job_id = j.id AND a.status = 'selected'
    GROUP BY c.id, c.name
    ORDER BY value DESC, c.name ASC
  `);
  const [applicationsOverTime] = await pool.query(`
    SELECT DATE_FORMAT(DATE(applied_at), '%Y-%m-%d') AS label, COUNT(*) AS value
    FROM applications
    GROUP BY DATE(applied_at)
    ORDER BY DATE(applied_at)
  `);
  const [packageDistribution] = await pool.query(`
    SELECT
      CASE
        WHEN package_lpa < 6 THEN '<6 LPA'
        WHEN package_lpa < 9 THEN '6-9 LPA'
        WHEN package_lpa < 12 THEN '9-12 LPA'
        WHEN package_lpa < 16 THEN '12-16 LPA'
        ELSE '16+ LPA'
      END AS label,
      COUNT(*) AS value
    FROM jobs
    GROUP BY label
    ORDER BY MIN(package_lpa)
  `);
  const [interviewTimeline] = await pool.query(`
    SELECT DATE_FORMAT(DATE(interview_date), '%Y-%m-%d') AS label, COUNT(*) AS value
    FROM interviews
    GROUP BY DATE(interview_date)
    ORDER BY DATE(interview_date)
  `);

  res.json({
    studentsByDepartment,
    placementStatus,
    companyHiring,
    applicationsOverTime,
    packageDistribution,
    interviewTimeline
  });
});
