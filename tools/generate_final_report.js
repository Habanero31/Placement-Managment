const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const mdPath = path.join(root, 'Placement_Management_System_Report.md');
const pdfPath = path.join(root, 'Placement_Management_System_Report_Final.pdf');

const A4 = { w: 595.28, h: 841.89 };
const margin = { l: 56, r: 52, t: 62, b: 62 };
const contentW = A4.w - margin.l - margin.r;
const border = { x: 30, y: 38, w: A4.w - 60, h: A4.h - 76 };

function esc(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function wrap(text, size, width, bold = false) {
  const avg = size * (bold ? 0.55 : 0.5);
  const max = Math.max(12, Math.floor(width / avg));
  const lines = [];
  String(text).split('\n').forEach((para) => {
    let line = '';
    para.split(/\s+/).filter(Boolean).forEach((word) => {
      const test = line ? `${line} ${word}` : word;
      if (test.length > max && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);
  });
  return lines.length ? lines : [''];
}

class Pdf {
  constructor() { this.pages = []; }
  addPage(num = null) {
    this.pages.push({ num, ops: [] });
    this.rect(border.x, border.y, border.w, border.h, false, 0.8);
    if (num !== null) this.text(`Page ${num}`, A4.w / 2, 22, 10, false, 'center');
  }
  op(s) { this.pages[this.pages.length - 1].ops.push(s); }
  text(s, x, y, size = 12, bold = false, align = 'left') {
    const avg = size * (bold ? 0.55 : 0.5);
    let tx = x;
    if (align === 'center') tx = x - String(s).length * avg / 2;
    if (align === 'right') tx = x - String(s).length * avg;
    this.op(`BT /${bold ? 'F2' : 'F1'} ${size} Tf 1 0 0 1 ${tx.toFixed(2)} ${y.toFixed(2)} Tm (${esc(s)}) Tj ET`);
  }
  line(x1, y1, x2, y2, w = 0.6) { this.op(`${w} w ${x1} ${y1} m ${x2} ${y2} l S`); }
  rect(x, y, w, h, fill = false, lw = 0.6) { this.op(`${lw} w ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re ${fill ? 'f' : 'S'}`); }
}

function h(pdf, title) {
  pdf.text(title.toUpperCase(), margin.l, 772, 16, true);
  return 735;
}

function para(pdf, text, y, size = 12, width = contentW) {
  wrap(text, size, width).forEach((line, i) => pdf.text(line, margin.l, y - i * 18, size));
  return y - wrap(text, size, width).length * 18 - 8;
}

function bullets(pdf, items, y) {
  items.forEach((item) => {
    pdf.text('-', margin.l, y, 12);
    wrap(item, 12, contentW - 18).forEach((line, i) => pdf.text(line, margin.l + 18, y - i * 18, 12));
    y -= wrap(item, 12, contentW - 18).length * 18 + 5;
  });
  return y;
}

function table(pdf, rows, widths, x, y, size = 9.5) {
  rows.forEach((row, r) => {
    const counts = row.map((c, i) => wrap(c, size, widths[i] - 8, r === 0).length);
    const rowH = Math.max(24, Math.max(...counts) * (size + 4) + 10);
    pdf.rect(x, y - rowH, widths.reduce((a, b) => a + b, 0), rowH);
    let cx = x;
    row.forEach((cell, i) => {
      if (i) pdf.line(cx, y, cx, y - rowH);
      const lines = wrap(cell, size, widths[i] - 8, r === 0);
      lines.forEach((line, j) => {
        const center = r === 0 || i === 0;
        pdf.text(line, center ? cx + widths[i] / 2 : cx + 5, y - 16 - j * (size + 4), size, r === 0, center ? 'center' : 'left');
      });
      cx += widths[i];
    });
    y -= rowH;
  });
  return y - 12;
}

function captionTable(pdf, caption, y) {
  pdf.text(caption, margin.l, y, 12, true);
  return y - 14;
}

function blankImage(pdf, y, caption, hOverride = 210) {
  const w = contentW - 84;
  const hgt = hOverride;
  const x = margin.l + 42;
  pdf.rect(x, y - hgt, w, hgt, false, 0.9);
  pdf.text(caption, A4.w / 2, y - hgt - 20, 12, true, 'center');
  return y - hgt - 50;
}

function architecture(pdf, y) {
  const boxW = 135, boxH = 65, gap = 30;
  const labels = [
    ['Browser', 'HTML, CSS, JavaScript, forms, dashboards, and charts'],
    ['Backend', 'Node.js, Express routes, controllers, middleware, validation'],
    ['Database', 'MySQL tables, keys, constraints, joins, and seed records'],
  ];
  labels.forEach((b, i) => {
    const x = margin.l + i * (boxW + gap);
    pdf.rect(x, y - boxH, boxW, boxH);
    pdf.text(b[0], x + boxW / 2, y - 20, 12, true, 'center');
    wrap(b[1], 9.5, boxW - 12).forEach((line, j) => pdf.text(line, x + 6, y - 40 - j * 13, 9.5));
    if (i < 2) {
      const ax = x + boxW + 8;
      pdf.line(ax, y - 34, ax + gap - 16, y - 34, 0.9);
      pdf.text('>', ax + gap - 17, y - 38, 11, true);
    }
  });
  pdf.text('Figure 4.1: System Architecture', A4.w / 2, y - boxH - 25, 12, true, 'center');
}

function erDiagram(pdf, y, caption) {
  const bw = 146, bh = 82, gap = 22;
  const boxes = [
    ['USERS', 'PK id\nname, email UNIQUE\npassword, role'],
    ['STUDENTS', 'PK id, FK user_id\nroll_no UNIQUE\ndepartment, cgpa'],
    ['COMPANIES', 'PK id\nname UNIQUE\nindustry, location'],
    ['JOBS', 'PK id, FK company_id\ntitle, package_lpa\nmin_cgpa, status'],
    ['APPLICATIONS', 'PK id\nFK student_id, job_id\nstatus, applied_at'],
    ['INTERVIEWS', 'PK id\nFK application_id\ndate, mode, result'],
  ];
  boxes.forEach((b, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = margin.l + col * (bw + gap);
    const by = y - row * 112;
    pdf.rect(x, by - bh, bw, bh);
    pdf.text(b[0], x + bw / 2, by - 18, 11, true, 'center');
    b[1].split('\n').forEach((line, j) => pdf.text(line, x + 8, by - 38 - j * 13, 9.5));
  });
  ['USERS 1:1 STUDENTS', 'COMPANIES 1:M JOBS', 'STUDENTS M:N JOBS through APPLICATIONS', 'APPLICATIONS 1:M INTERVIEWS'].forEach((r, i) => {
    pdf.rect(margin.l + 35, y - 250 - i * 30, contentW - 70, 22);
    pdf.text(r, A4.w / 2, y - 265 - i * 30, 10.5, false, 'center');
  });
  pdf.text(caption, A4.w / 2, y - 390, 12, true, 'center');
}

const toc = [
  ['1', 'Introduction', '1'],
  ['2', 'Background, Motivation and Scope', '2'],
  ['3', 'Methodology', '3'],
  ['4', 'Requirements', '5'],
  ['5', 'E-R Diagram', '6'],
  ['6', 'Relational Database Design', '8'],
  ['7', 'Database Normalization', '13'],
  ['8', 'Data Dictionary', '15'],
  ['9', 'Graphical User Interface', '18'],
  ['10', 'Source Code', '20'],
  ['11', 'Test and Results', '23'],
  ['12', 'Conclusion', '27'],
  ['13', 'Future Enhancement and Bibliography', '28'],
];

const hardware = [['Component', 'Minimum Requirement', 'Recommended Requirement'], ['Processor', 'Intel Core i3 or equivalent', 'Intel Core i5 or better'], ['RAM', '4 GB', '8 GB or more'], ['Storage', '2 GB free space', '5 GB free space'], ['Display', 'HD display', 'Full HD display'], ['Network', 'Basic internet access', 'Stable internet connection']];
const software = [['Software', 'Purpose'], ['Node.js', 'Runs the backend server'], ['MySQL Server', 'Stores relational project data'], ['Web Browser', 'Runs the frontend interface'], ['Code Editor', 'Development and maintenance'], ['npm', 'Dependency management']];
const reqPackages = [['Package', 'Use'], ['express', 'REST API routing and middleware'], ['mysql2', 'MySQL connection pool and queries'], ['bcrypt', 'Password hashing'], ['jsonwebtoken', 'JWT authentication'], ['cors', 'Cross-origin API support'], ['dotenv', 'Environment configuration'], ['express-validator', 'Request validation']];

const schema = [
  ['7.1: Users Table', [['Column', 'Data Type', 'Key / Constraint', 'Purpose'], ['id', 'INT', 'PK', 'User identifier'], ['name', 'VARCHAR(100)', 'NOT NULL', 'Full name'], ['email', 'VARCHAR(120)', 'UNIQUE', 'Login email'], ['password', 'VARCHAR(255)', 'NOT NULL', 'Hashed password'], ['role', "ENUM('admin','student')", 'NOT NULL', 'Access role'], ['created_at', 'TIMESTAMP', 'DEFAULT CURRENT_TIMESTAMP', 'Creation time']]],
  ['7.2: Students Table', [['Column', 'Data Type', 'Key / Constraint', 'Purpose'], ['id', 'INT', 'PK', 'Student identifier'], ['user_id', 'INT', 'FK, UNIQUE', 'Linked user account'], ['roll_no', 'VARCHAR(40)', 'UNIQUE', 'Roll number'], ['department', 'VARCHAR(80)', 'NOT NULL', 'Department'], ['graduation_year', 'YEAR', 'NOT NULL', 'Graduation year'], ['cgpa', 'DECIMAL(3,2)', 'CHECK', 'Academic score'], ['skills', 'TEXT', '', 'Technical skills'], ['phone', 'VARCHAR(20)', '', 'Contact number']]],
  ['7.3: Companies Table', [['Column', 'Data Type', 'Key / Constraint', 'Purpose'], ['id', 'INT', 'PK', 'Company identifier'], ['name', 'VARCHAR(120)', 'UNIQUE', 'Company name'], ['industry', 'VARCHAR(100)', '', 'Business domain'], ['website', 'VARCHAR(180)', '', 'Website'], ['location', 'VARCHAR(120)', '', 'Location'], ['contact_email', 'VARCHAR(120)', '', 'HR email']]],
  ['7.4: Jobs Table', [['Column', 'Data Type', 'Key / Constraint', 'Purpose'], ['id', 'INT', 'PK', 'Job identifier'], ['company_id', 'INT', 'FK', 'Posting company'], ['title', 'VARCHAR(140)', 'NOT NULL', 'Job role'], ['description', 'TEXT', '', 'Responsibilities'], ['package_lpa', 'DECIMAL(5,2)', '', 'Salary package'], ['min_cgpa', 'DECIMAL(3,2)', '', 'Eligibility CGPA'], ['deadline', 'DATE', '', 'Last date'], ['status', "ENUM('open','closed')", '', 'Availability']]],
  ['7.5: Applications Table', [['Column', 'Data Type', 'Key / Constraint', 'Purpose'], ['id', 'INT', 'PK', 'Application identifier'], ['student_id', 'INT', 'FK', 'Applicant'], ['job_id', 'INT', 'FK', 'Applied job'], ['status', "ENUM('applied','shortlisted','selected','rejected')", '', 'Current status'], ['applied_at', 'TIMESTAMP', 'DEFAULT CURRENT_TIMESTAMP', 'Submission time'], ['updated_at', 'TIMESTAMP', 'ON UPDATE', 'Status update time'], ['unique_application', 'UNIQUE', 'Prevents duplicate applications']]],
  ['7.6: Interviews Table', [['Column', 'Data Type', 'Key / Constraint', 'Purpose'], ['id', 'INT', 'PK', 'Interview identifier'], ['application_id', 'INT', 'FK', 'Related application'], ['interview_date', 'DATETIME', 'NOT NULL', 'Date and time'], ['mode', "ENUM('online','offline')", '', 'Mode'], ['venue', 'VARCHAR(180)', '', 'Venue or meeting link'], ['interviewer', 'VARCHAR(120)', '', 'Interviewer'], ['result', "ENUM('scheduled','selected','rejected','on_hold')", '', 'Result'], ['notes', 'TEXT', '', 'Remarks']]],
];
const dict = schema.map(([name, rows], i) => [`9.${i + 1}: ${name.split(': ')[1].replace(' Table', '')} Data Dictionary`, [['Attribute', 'Data Type', 'Constraint', 'Description'], ...rows.slice(1).map(r => [r[0], r[1], r[2], r[3]])]]);

const pages = [];
function page(num, title, draw) { pages.push({ num, title, draw }); }

page(null, 'Abstract', (pdf) => {
  let y = h(pdf, 'Abstract');
  y = para(pdf, 'The Placement Management System is a database-driven web application designed to manage campus recruitment activities in a structured and efficient manner. The system provides a centralized platform where placement administrators can maintain student records, company records, job openings, applications, interview schedules, and placement analytics.', y);
  y = para(pdf, 'The project is implemented using HTML, CSS, and JavaScript for the frontend, Node.js and Express.js for the backend, and MySQL for relational storage. Authentication is secured using JWT and bcrypt. The schema demonstrates primary keys, foreign keys, unique constraints, normalized tables, and SQL queries for operational and analytical reporting.', y);
  para(pdf, 'The report documents the system background, methodology, requirements, E-R model, relational database design, normalization, data dictionary, graphical interface, source code organization, testing results, conclusion, and future enhancements.', y);
});

page(null, 'Table of Contents', (pdf) => {
  let y = h(pdf, 'Table of Contents');
  table(pdf, [['SL.NO', 'TITLE', 'PAGE NUMBER'], ...toc], [60, 335, 90], margin.l, y, 10.2);
});

page(1, 'Introduction', (pdf) => {
  let y = h(pdf, '1. Introduction');
  y = para(pdf, 'A placement cell manages a large amount of academic, recruitment, and interview data. Manual processing through spreadsheets or paper-based records can create duplicate entries, delayed updates, missing information, and difficulty in preparing analytical reports.', y);
  y = para(pdf, 'The Placement Management System addresses these issues by storing all placement-related information in a normalized MySQL database and presenting it through a browser-based interface. Administrators can manage students, companies, jobs, applications, interviews, and analytics, while students can view opportunities and track their activity.', y);
  y = captionTable(pdf, 'Technologies Used', y);
  table(pdf, [['Technology', 'Purpose'], ['HTML, CSS, JavaScript', 'Frontend structure, styling, interaction, forms, tables, and dashboard rendering'], ['Node.js and Express.js', 'Backend runtime, REST API routing, middleware, static file serving, and controllers'], ['MySQL', 'Relational data storage with keys, constraints, and joins'], ['JWT and bcrypt', 'Authentication, token-based sessions, and password hashing'], ['Chart.js', 'Dashboard analytics and visual reporting']], [155, 330], margin.l, y, 9.8);
});

page(2, 'Background, Motivation and Scope', (pdf) => {
  let y = h(pdf, '2. Background, Motivation and Scope');
  y = para(pdf, 'Campus placement activities involve students, recruiters, job roles, eligibility rules, applications, interview rounds, and placement outcomes. A DBMS-based application is suitable because the data is structured, relational, and frequently queried.', y);
  y = para(pdf, 'The motivation for this project is to reduce manual effort, improve data accuracy, provide secure access, and generate placement statistics quickly. A centralized system allows administrators to monitor recruitment progress and enables students to access relevant placement information.', y);
  bullets(pdf, ['The scope includes student, company, job, application, interview, authentication, and dashboard modules.', 'The system can be used by a college placement department for academic demonstration and practical record management.', 'Future extensions may include company login, resume upload, email notifications, offer letters, and predictive analytics.'], y);
});

page(3, 'Methodology', (pdf) => {
  let y = h(pdf, '3. Methodology');
  y = para(pdf, 'The project follows a modular full-stack development methodology. The placement workflow was divided into database entities and application modules. The schema was created first, followed by backend APIs, authentication middleware, frontend pages, and dashboard analytics.', y);
  architecture(pdf, y - 10);
});

page(4, 'Methodology Continued', (pdf) => {
  let y = h(pdf, '3. Methodology');
  y = para(pdf, 'Development Steps', y, 13);
  bullets(pdf, ['Identified user roles, placement workflows, and core entities.', 'Designed normalized tables for users, students, companies, jobs, applications, and interviews.', 'Created database.sql with primary keys, foreign keys, unique constraints, and seed data.', 'Implemented backend route modules and controller functions using Express.js.', 'Added JWT authentication, bcrypt password verification, validation, and role-based access control.', 'Built frontend pages for login, dashboards, and management modules.', 'Connected frontend forms and tables to REST APIs using JavaScript fetch calls.', 'Tested login, CRUD operations, application submission, interview scheduling, and dashboard analytics.'], y);
});

page(5, 'Requirements', (pdf) => {
  let y = h(pdf, '4. Requirements');
  y = captionTable(pdf, 'Table 5.1: Hardware Requirements', y);
  y = table(pdf, hardware, [130, 175, 180], margin.l, y, 9.4);
  y = captionTable(pdf, 'Table 5.2: Software Requirements', y);
  y = table(pdf, software, [160, 325], margin.l, y, 9.4);
  y = captionTable(pdf, 'Required Packages', y);
  y = table(pdf, reqPackages, [155, 330], margin.l, y, 8.8);
  pdf.text('Environment File Example', margin.l, y, 11, true);
  pdf.rect(margin.l, y - 70, contentW, 58);
  ['PORT=5000', 'DB_HOST=localhost', 'DB_USER=root', 'DB_PASSWORD=your_password', 'DB_NAME=placement_management', 'JWT_SECRET=change_this_secret'].forEach((line, i) => pdf.text(line, margin.l + 12, y - 18 - i * 8, 8.5));
});

page(6, 'E-R Diagram', (pdf) => {
  h(pdf, '5. E-R Diagram');
  erDiagram(pdf, 705, 'Figure 6.1: E-R Diagram');
});

page(7, 'E-R Diagram Explanation', (pdf) => {
  let y = h(pdf, '5. E-R Diagram');
  y = para(pdf, 'The E-R model represents the major entities and relationships in the Placement Management System. The users table stores login credentials and roles. The students table stores academic details and is linked to users. Companies post jobs, students apply for jobs, and interviews are scheduled for applications.', y);
  bullets(pdf, ['users to students is a one-to-one relationship because each student account has one profile.', 'companies to jobs is a one-to-many relationship because one company can post multiple jobs.', 'students to jobs is many-to-many and is resolved through the applications table.', 'applications to interviews is one-to-many because an application may have multiple interview rounds.'], y);
});

page(8, 'Relational Database Design', (pdf) => {
  let y = h(pdf, '6. Relational Database Design');
  erDiagram(pdf, 695, 'Figure 7.1: Relational Schema Diagram');
  para(pdf, 'Relationship Summary: students.user_id references users.id; jobs.company_id references companies.id; applications.student_id references students.id; applications.job_id references jobs.id; interviews.application_id references applications.id.', 280);
});

for (let i = 0; i < schema.length; i += 2) {
  page(9 + Math.floor(i / 2), 'Relational Tables', (pdf) => {
    let y = h(pdf, '6. Relational Database Design');
    [i, i + 1].filter(idx => idx < schema.length).forEach((idx) => {
      const [cap, rows] = schema[idx];
      y = captionTable(pdf, `Table ${cap}`, y);
      y = table(pdf, rows, [92, 128, 130, 135], margin.l, y, 8.6);
    });
  });
}

page(12, 'Relational Design Summary', (pdf) => {
  let y = h(pdf, '6. Relational Database Design');
  y = para(pdf, 'The relational design separates authentication, student profiles, companies, job openings, applications, and interviews into independent but connected tables. This design reduces duplication and supports reliable joins for reports and dashboards.', y);
  bullets(pdf, ['Primary keys identify each record uniquely.', 'Foreign keys preserve relationships between dependent records.', 'Unique constraints prevent duplicate accounts, roll numbers, company names, and repeated applications.', 'Status fields support controlled workflow tracking for jobs, applications, and interviews.'], y);
});

page(13, 'Database Normalization', (pdf) => {
  let y = h(pdf, '7. Database Normalization');
  y = para(pdf, 'First Normal Form (1NF): All fields contain atomic values, and every table has a primary key. For example, student roll number, department, CGPA, and phone number are stored as separate attributes instead of combined text.', y);
  y = para(pdf, 'Second Normal Form (2NF): Non-key attributes depend on the full key of their table. Job details depend on job id, company details depend on company id, and application status depends on the application record.', y);
  para(pdf, 'The applications table also resolves the many-to-many relationship between students and jobs, preventing repeated groups inside the students or jobs tables.', y);
});

page(14, 'Database Normalization Continued', (pdf) => {
  let y = h(pdf, '7. Database Normalization');
  y = para(pdf, 'Third Normal Form (3NF): Transitive dependencies are removed. Company information is stored in companies and referenced from jobs. Student account credentials are stored in users, while academic profile information is stored in students.', y);
  bullets(pdf, ['The design avoids storing company names repeatedly in every job record.', 'The design avoids storing student login credentials repeatedly in placement records.', 'Applications store only application-related data and reference students and jobs.', 'Interviews reference applications, so interview data remains connected to the recruitment process without duplicating student and job details.'], y);
});

for (let i = 0; i < dict.length; i += 2) {
  page(15 + Math.floor(i / 2), 'Data Dictionary', (pdf) => {
    let y = h(pdf, '8. Data Dictionary');
    [i, i + 1].filter(idx => idx < dict.length).forEach((idx) => {
      const [cap, rows] = dict[idx];
      y = captionTable(pdf, `Table ${cap}`, y);
      y = table(pdf, rows, [100, 120, 125, 140], margin.l, y, 8.5);
    });
  });
}

page(18, 'Graphical User Interface', (pdf) => {
  let y = h(pdf, '9. Graphical User Interface');
  y = blankImage(pdf, y, 'Figure 10.1: Login Page', 150);
  y = blankImage(pdf, y, 'Figure 10.2: Admin Dashboard', 150);
  blankImage(pdf, y, 'Figure 10.3: Students Page', 150);
});

page(19, 'Graphical User Interface Continued', (pdf) => {
  let y = h(pdf, '9. Graphical User Interface');
  y = blankImage(pdf, y, 'Figure 10.4: Jobs Page', 150);
  y = blankImage(pdf, y, 'Figure 10.5: Applications Page', 150);
  blankImage(pdf, y, 'Figure 10.6: Interviews Page', 150);
});

page(20, 'Source Code', (pdf) => {
  let y = h(pdf, '10. Source Code');
  y = captionTable(pdf, 'Table 11.1: Frontend File Structure', y);
  table(pdf, [['File', 'Description'], ['frontend/index.html', 'Login page for admin and student access'], ['frontend/admin-dashboard.html', 'Admin dashboard and analytics interface'], ['frontend/student-dashboard.html', 'Student profile, jobs, and applications view'], ['frontend/students.html', 'Student management page'], ['frontend/jobs.html', 'Job management page'], ['frontend/applications.html', 'Application status management page'], ['frontend/interviews.html', 'Interview scheduling and result page'], ['frontend/assets/js', 'API calls, validation, rendering, and charts']], [180, 305], margin.l, y, 9.1);
});

page(21, 'Source Code Continued', (pdf) => {
  let y = h(pdf, '10. Source Code');
  y = captionTable(pdf, 'Table 11.2: Backend File Structure', y);
  table(pdf, [['File / Folder', 'Description'], ['backend/server.js', 'Configures middleware, static files, routes, and server startup'], ['backend/src/config/db.js', 'Creates MySQL connection pool'], ['backend/src/controllers', 'Contains module business logic'], ['backend/src/routes', 'Defines REST API endpoints'], ['backend/src/middleware/authMiddleware.js', 'Verifies JWT and role permissions'], ['backend/src/middleware/validate.js', 'Runs request validation'], ['database.sql', 'Creates database schema and seed records']], [190, 295], margin.l, y, 9.1);
});

page(22, 'Source Code Snippets', (pdf) => {
  let y = h(pdf, '10. Source Code');
  pdf.text('Key Code Snippets', margin.l, y, 12, true);
  y -= 18;
  const snippets = [
    'app.use(express.json());',
    "app.use('/api/auth', authRoutes);",
    "app.use('/api/students', studentRoutes);",
    "const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);",
    "const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND role = ?', [email, role]);",
    "headers.Authorization = `Bearer ${token}`;",
  ];
  pdf.rect(margin.l, y - 190, contentW, 178);
  snippets.forEach((s, i) => pdf.text(s, margin.l + 12, y - 24 - i * 24, 10));
  para(pdf, 'These snippets show server middleware setup, route mounting, JWT token generation, secure parameterized SQL queries, and frontend token-based API access.', y - 220);
});

const results = [
  ['Figure 12.1: Analytics Page', 'The analytics page verifies that dashboard cards and charts load database values such as total students, selected students, placement percentage, highest package, and average package.'],
  ['Figure 12.2: Students Module Output', 'The students module verifies that records can be viewed, added, edited, and deleted by an administrator while maintaining account and profile consistency.'],
  ['Figure 12.3: Interview Module Output', 'The interview module verifies scheduling, interview mode, venue, interviewer, result, and notes for each selected application.'],
  ['Figure 12.4: Jobs Module Output', 'The jobs module verifies job creation, company linkage, eligibility CGPA, package details, deadline, status, and listing for students.'],
];
results.forEach((r, i) => {
  page(23 + i, 'Test and Results', (pdf) => {
    let y = h(pdf, '11. Test and Results');
    y = blankImage(pdf, y, r[0]);
    para(pdf, r[1], y);
  });
});

page(27, 'Conclusion', (pdf) => {
  let y = h(pdf, '12. Conclusion');
  y = para(pdf, 'The Placement Management System successfully demonstrates the application of relational database concepts to a real academic workflow. The system uses normalized tables, primary keys, foreign keys, unique constraints, transactions, joins, aggregate queries, secure authentication, and role-based access control.', y);
  para(pdf, 'The project improves placement management by centralizing records, reducing duplicate data, enabling secure access, and providing useful analytics for placement administrators. It also provides students with a structured way to view jobs, apply for opportunities, and track interviews.', y);
});

page(28, 'Future Enhancement and Bibliography', (pdf) => {
  let y = h(pdf, '13. Future Enhancement and Bibliography');
  y = para(pdf, 'Future enhancements may include company login, resume upload storage, email and SMS notifications, interview round tracking, offer letter generation, PDF or Excel export, advanced eligibility filtering, and predictive analytics for placement trends.', y);
  pdf.text('Bibliography', margin.l, y, 13, true);
  y -= 24;
  bullets(pdf, ['MySQL Documentation, Relational Database Concepts and SQL Syntax.', 'Node.js Documentation, Server-Side JavaScript Runtime.', 'Express.js Documentation, Routing and Middleware.', 'JSON Web Token Documentation, Token-Based Authentication.', 'bcrypt Documentation, Password Hashing.', 'Chart.js Documentation, Browser-Based Data Visualization.', 'Project files: backend/server.js, backend/src, frontend, and database.sql.'], y);
});

function writePdf() {
  const pdf = new Pdf();
  pages.forEach(p => { pdf.addPage(p.num); p.draw(pdf); });
  const objs = [];
  const add = s => { objs.push(s); return objs.length; };
  const f1 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >>');
  const f2 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold >>');
  const content = [], pageObjs = [];
  pdf.pages.forEach((p, i) => {
    const stream = p.ops.join('\n');
    content[i] = add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    pageObjs[i] = add('');
  });
  const pagesObj = objs.length + 1;
  pageObjs.forEach((id, i) => {
    objs[id - 1] = `<< /Type /Page /Parent ${pagesObj} 0 R /MediaBox [0 0 ${A4.w} ${A4.h}] /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> >> /Contents ${content[i]} 0 R >>`;
  });
  add(`<< /Type /Pages /Kids [${pageObjs.map(n => `${n} 0 R`).join(' ')}] /Count ${pageObjs.length} >>`);
  const catalog = add(`<< /Type /Catalog /Pages ${pagesObj} 0 R >>`);
  let out = '%PDF-1.4\n';
  const offsets = [0];
  objs.forEach((o, i) => { offsets.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objs.length; i++) out += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  out += `trailer\n<< /Size ${objs.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF`;
  fs.writeFileSync(pdfPath, out, 'binary');
}

function writeMarkdown() {
  const lines = [];
  lines.push('<style>');
  lines.push('@page { size: A4; margin: 0.85in 0.8in 0.75in 0.8in; }');
  lines.push('body { font-family: "Times New Roman", Times, serif; font-size: 12pt; line-height: 1.5; }');
  lines.push('h1 { font-size: 16pt; font-weight: bold; text-align: left; }');
  lines.push('table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #333; padding: 6px; vertical-align: top; }');
  lines.push('.page-break { page-break-after: always; } .caption { text-align: left; font-weight: bold; margin: 8px 0; }');
  lines.push('.image-space { width: 78%; height: 260px; border: 1px solid #333; margin: 12px auto; }');
  lines.push('</style>\n');
  lines.push('# ABSTRACT\n\nThe Placement Management System is a database-driven web application designed to manage campus recruitment activities in a structured and efficient manner. It uses HTML, CSS, JavaScript, Node.js, Express.js, MySQL, JWT, bcrypt, and Chart.js.\n\n<div class="page-break"></div>');
  lines.push('# TABLE OF CONTENTS\n\n| SL.NO | TITLE | PAGE NUMBER |\n|---:|---|---:|');
  toc.forEach(r => lines.push(`| ${r[0]} | ${r[1]} | ${r[2]} |`));
  lines.push('\n<div class="page-break"></div>');
  toc.forEach((r) => lines.push(`\n# ${r[0]}. ${r[1].toUpperCase()}\n\nThis section is formatted in the final PDF according to the university submission structure.\n\n<div class="page-break"></div>`));
  lines.push('\n<div class="caption">Table 5.1: Hardware Requirements</div>\n<div class="caption">Table 5.2: Software Requirements</div>');
  schema.forEach(([cap]) => lines.push(`<div class="caption">Table ${cap}</div>`));
  dict.forEach(([cap]) => lines.push(`<div class="caption">Table ${cap}</div>`));
  lines.push('<div class="caption">Table 11.1: Frontend File Structure</div>\n<div class="caption">Table 11.2: Backend File Structure</div>');
  ['Figure 10.1: Login Page', 'Figure 10.2: Admin Dashboard', 'Figure 10.3: Students Page', 'Figure 10.4: Jobs Page', 'Figure 10.5: Applications Page', 'Figure 10.6: Interviews Page', 'Figure 12.1: Analytics Page', 'Figure 12.2: Students Module Output', 'Figure 12.3: Interview Module Output', 'Figure 12.4: Jobs Module Output'].forEach(c => lines.push(`<div class="image-space"></div>\n<div class="caption">${c}</div>`));
  fs.writeFileSync(mdPath, lines.join('\n'), 'utf8');
}

writeMarkdown();
writePdf();
console.log(`Updated ${mdPath}`);
console.log(`Generated ${pdfPath}`);
