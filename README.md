# Placement Management System

A complete college major-project style Placement Management System built with HTML, CSS, JavaScript, Node.js, Express.js, JWT authentication, bcrypt password hashing, and MySQL.

## Features

- Admin and Student login
- JWT protected REST APIs
- bcrypt password hashing
- Student Management
- Company Management
- Job Posting
- Application Tracking
- Interview Scheduling
- Selection and Rejection Status
- Complete dark/light mode with a navbar toggle, `localStorage` preference, smooth transitions, and dark-aware tables, forms, cards, dashboard, and charts
- Admin Analytics Dashboard with placement KPIs, Chart.js graphs, recent applications, upcoming interviews, and top offers
- Interactive Chart.js statistics for department strength, placement status, company-wise hiring, applications over time, package distribution, and interview timeline
- Responsive frontend with dashboard cards, tables, forms, alerts, loading animation, and animated analytics panels
- MySQL database with primary keys, foreign keys, and realistic sample data for 19 students, 7 companies, 12 jobs, 25 applications, interviews, selections, rejections, and package statistics

## Folder Structure

```text
placement-management-system/
  backend/
    server.js
    src/
      config/db.js
      controllers/
      middleware/
      routes/
      utils/
  frontend/
    index.html
    admin-dashboard.html
    student-dashboard.html
    students.html
    companies.html
    jobs.html
    applications.html
    interviews.html
    assets/
      css/
      js/
  database.sql
  .env.example
  package.json
  README.md
```

## Step-by-Step Setup

1. Install Node.js from `https://nodejs.org`.
2. Install MySQL Server and MySQL Workbench, or use the MySQL command line.
3. Open this project folder in a terminal.
4. Install backend dependencies:

```bash
npm install
```

5. Create your environment file:

```bash
copy .env.example .env
```

6. Edit `.env` and set your MySQL username, password, database name, and JWT secret.
7. Create and seed the database:

```bash
mysql -u root -p < database.sql
```

8. Start the server:

```bash
npm start
```

9. Open the frontend:

```text
http://localhost:5000
```

## Sample Login

All sample users in `database.sql` use this password:

```text
password123
```

Admin:

```text
admin@college.edu
```

Student:

```text
aarav@student.edu
```

## How the Frontend Works

The frontend is plain HTML, CSS, and JavaScript inside `frontend/`.

- `index.html` shows the login form.
- `admin-dashboard.html` shows admin KPIs, analytics charts, recent applications, upcoming interviews, and top offers.
- `student-dashboard.html` shows student profile and available jobs.
- `students.html`, `companies.html`, `jobs.html`, `applications.html`, and `interviews.html` are module pages.
- `assets/js/api.js` contains the shared `fetch` wrapper.
- `assets/js/auth.js` stores JWT tokens in `localStorage` and protects pages.
- CSS files are separated into layout, forms, tables, and dashboard styles. Shared CSS variables power both light and dark themes.
- `assets/js/ui.js` manages the persistent dark/light theme toggle and stores the selected theme in `localStorage`.
- Admin analytics charts use Chart.js from CDN and rebuild when the theme changes so chart labels, grid lines, and colors stay readable.

## How the Backend Works

The backend is an Express.js API inside `backend/`.

- `backend/server.js` starts Express, enables middleware, serves the frontend, and registers API routes.
- `src/config/db.js` creates the MySQL connection pool.
- `src/routes/` maps API URLs to controller functions.
- `src/controllers/` contains business logic for each module.
- `src/middleware/authMiddleware.js` verifies JWT tokens and role permissions.
- `src/middleware/validate.js` returns validation errors before bad data reaches controllers.
- `src/middleware/errorMiddleware.js` sends consistent JSON error responses.

## How Frontend Connects to Backend

The frontend uses `fetch()` through `frontend/assets/js/api.js`.

Request flow:

1. User submits a form or clicks a button.
2. Page-specific JavaScript builds a JSON payload.
3. `apiRequest()` sends the request to `/api/...`.
4. If the user is logged in, the JWT is sent in the `Authorization: Bearer TOKEN` header.
5. Backend validates the token, performs MySQL queries, and returns JSON.
6. Frontend updates tables, cards, charts, alerts, or forms.

## How Backend Connects to MySQL

`backend/src/config/db.js` reads `.env` values and creates a MySQL pool using `mysql2/promise`.

Important `.env` values:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=placement_management
JWT_SECRET=replace_this_with_a_long_random_secret
```

## Authentication Flow

1. Admin or student submits email, password, and role on `index.html`.
2. `/api/auth/login` finds the user by email and role.
3. bcrypt compares the entered password with the stored password hash.
4. If valid, the backend returns a JWT token and user object.
5. Frontend stores both in `localStorage`.
6. Protected pages call `requireAuth()`.
7. Protected API routes use `protect` middleware to verify the JWT.
8. Admin-only APIs also use `allowRoles('admin')`.

## Database Relationships

- `users` stores login identity for admins and students.
- `students.user_id` links each student profile to one user.
- `jobs.company_id` links each job posting to one company.
- `applications.student_id` links applications to students.
- `applications.job_id` links applications to jobs.
- `interviews.application_id` links interviews to applications.
- Foreign keys use cascade delete where child records should be removed automatically.

## API Endpoints

### Auth

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login as admin or student |
| POST | `/api/auth/register-student` | Public | Register a new student account |

### Students

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/api/students` | Admin | List students |
| GET | `/api/students/:id` | Admin | Get one student |
| POST | `/api/students` | Admin | Create student |
| PUT | `/api/students/:id` | Admin | Update student |
| DELETE | `/api/students/:id` | Admin | Delete student |
| GET | `/api/students/me` | Student | View own profile |

### Companies

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/api/companies` | Admin/Student | List companies |
| GET | `/api/companies/:id` | Admin/Student | Get company |
| POST | `/api/companies` | Admin | Create company |
| PUT | `/api/companies/:id` | Admin | Update company |
| DELETE | `/api/companies/:id` | Admin | Delete company |

### Jobs

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/api/jobs` | Admin/Student | List jobs |
| GET | `/api/jobs/:id` | Admin/Student | Get job |
| POST | `/api/jobs` | Admin | Create job |
| PUT | `/api/jobs/:id` | Admin | Update job |
| DELETE | `/api/jobs/:id` | Admin | Delete job |

### Applications

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/api/applications` | Admin | List all applications |
| GET | `/api/applications/me` | Student | List own applications |
| POST | `/api/applications` | Admin/Student | Submit application |
| PATCH | `/api/applications/:id/status` | Admin | Change selected/rejected/shortlisted status |
| DELETE | `/api/applications/:id` | Admin | Delete application |

### Interviews

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/api/interviews` | Admin | List interviews |
| GET | `/api/interviews/me` | Student | List own interviews |
| POST | `/api/interviews` | Admin | Schedule interview |
| PUT | `/api/interviews/:id` | Admin | Update interview |
| DELETE | `/api/interviews/:id` | Admin | Delete interview |

### Dashboard

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/api/dashboard/stats` | Admin | Counts, placement KPIs, recent applications, upcoming interviews, top offers |
| GET | `/api/dashboard/analytics` | Admin | Chart.js-ready datasets for departments, statuses, hiring, timelines, and packages |
| GET | `/api/health` | Public | API health check |

## Admin Analytics Dashboard

The admin dashboard now includes these KPI cards:

- Total Students, Companies, Jobs, and Applications
- Selected Students and Rejected Students
- Upcoming Interviews
- Placement Percentage
- Highest Package and Average Package

The dashboard also renders these Chart.js visualizations:

- Students per department
- Placement status pie/doughnut chart
- Company-wise hiring chart
- Applications over time
- Package distribution graph
- Interview scheduling timeline

The chart API returns simple label/value arrays, so the frontend can render and refresh charts consistently in both light and dark mode.

## How to Test

1. Start MySQL.
2. Import `database.sql`.
3. Run `npm install`.
4. Run `npm start`.
5. Open `http://localhost:5000`.
6. Login as admin and test create, edit, delete on students, companies, jobs, applications, and interviews.
7. Logout and login as a student.
8. Apply for jobs and check applications/interviews pages.
9. Toggle dark mode from the navbar and verify the preference remains after refresh.
10. Open the admin dashboard and confirm all charts render in both themes.

## Sample Screenshots

Add your screenshots here after running the project:

```text
screenshots/login.png
screenshots/admin-dashboard.png
screenshots/admin-dashboard-dark.png
screenshots/student-dashboard.png
screenshots/jobs.png
```

## Beginner Notes

- Always start MySQL before starting the Node server.
- If login fails, verify that `database.sql` was imported into the same database name used in `.env`.
- If the server cannot connect to MySQL, check `DB_USER`, `DB_PASSWORD`, and `DB_NAME`.
- If port `5000` is busy, change `PORT` in `.env`.
- Never use the sample `JWT_SECRET` in a real deployment.
