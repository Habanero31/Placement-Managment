DROP DATABASE IF EXISTS placement_management;
CREATE DATABASE placement_management;
USE placement_management;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'student') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  roll_no VARCHAR(40) NOT NULL UNIQUE,
  department VARCHAR(80) NOT NULL,
  graduation_year YEAR NOT NULL,
  cgpa DECIMAL(3,2) NOT NULL CHECK (cgpa >= 0 AND cgpa <= 10),
  skills TEXT,
  phone VARCHAR(20),
  resume_url VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  industry VARCHAR(100) NOT NULL,
  website VARCHAR(180),
  location VARCHAR(120),
  contact_email VARCHAR(120),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  title VARCHAR(140) NOT NULL,
  description TEXT NOT NULL,
  package_lpa DECIMAL(5,2) NOT NULL,
  min_cgpa DECIMAL(3,2) NOT NULL DEFAULT 0,
  location VARCHAR(120),
  deadline DATE NOT NULL,
  status ENUM('open', 'closed') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  job_id INT NOT NULL,
  status ENUM('applied', 'shortlisted', 'selected', 'rejected') DEFAULT 'applied',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_application (student_id, job_id),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE TABLE interviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  interview_date DATETIME NOT NULL,
  mode ENUM('online', 'offline') NOT NULL,
  venue VARCHAR(180),
  interviewer VARCHAR(120),
  result ENUM('scheduled', 'selected', 'rejected', 'on_hold') DEFAULT 'scheduled',
  notes TEXT,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- Password for all sample users is: password123
-- These bcrypt hashes are intentionally seeded for beginner testing only.
INSERT INTO users (name, email, password, role) VALUES
('Placement Admin', 'admin@college.edu', '$2b$10$lO1DBXlBsmfBVZCVVMbhh.yB8bY53FF955LO.rJ8m7ygLUiEhl/au', 'admin'),
('Aarav Sharma', 'aarav.sharma@student.edu', '$2b$10$lO1DBXlBsmfBVZCVVMbhh.yB8bY53FF955LO.rJ8m7ygLUiEhl/au', 'student'),
('Nisha Rao', 'nisha.rao@student.edu', '$2b$10$lO1DBXlBsmfBVZCVVMbhh.yB8bY53FF955LO.rJ8m7ygLUiEhl/au', 'student'),
('Kiran Menon', 'kiran.menon@student.edu', '$2b$10$lO1DBXlBsmfBVZCVVMbhh.yB8bY53FF955LO.rJ8m7ygLUiEhl/au', 'student'),
('Meera Iyer', 'meera.iyer@student.edu', '$2b$10$lO1DBXlBsmfBVZCVVMbhh.yB8bY53FF955LO.rJ8m7ygLUiEhl/au', 'student'),
('Rhea Kapoor', 'rhea.kapoor@student.edu', '$2b$10$lO1DBXlBsmfBVZCVVMbhh.yB8bY53FF955LO.rJ8m7ygLUiEhl/au', 'student'),
('Arjun Patel', 'arjun.patel@student.edu', '$2b$10$lO1DBXlBsmfBVZCVVMbhh.yB8bY53FF955LO.rJ8m7ygLUiEhl/au', 'student'),
('Sanjana Reddy', 'sanjana.reddy@student.edu', '$2b$10$lO1DBXlBsmfBVZCVVMbhh.yB8bY53FF955LO.rJ8m7ygLUiEhl/au', 'student'),
('Kabir Khan', 'kabir.khan@student.edu', '$2b$10$lO1DBXlBsmfBVZCVVMbhh.yB8bY53FF955LO.rJ8m7ygLUiEhl/au', 'student'),
('Isha Nair', 'isha.nair@student.edu', '$2b$10$lO1DBXlBsmfBVZCVVMbhh.yB8bY53FF955LO.rJ8m7ygLUiEhl/au', 'student'),
('Nikhil Verma', 'nikhil.verma@student.edu', '$2b$10$lO1DBXlBsmfBVZCVVMbhh.yB8bY53FF955LO.rJ8m7ygLUiEhl/au', 'student'),
('Rohan Mehta', 'rohan.mehta@student.edu', '$2b$10$lO1DBXlBsmfBVZCVVMbhh.yB8bY53FF955LO.rJ8m7ygLUiEhl/au', 'student'),
('Sneha Das', 'sneha.das@student.edu', '$2b$10$lO1DBXlBsmfBVZCVVMbhh.yB8bY53FF955LO.rJ8m7ygLUiEhl/au', 'student'),
('Priya Menon', 'priya.menon@student.edu', '$2b$10$lO1DBXlBsmfBVZCVVMbhh.yB8bY53FF955LO.rJ8m7ygLUiEhl/au', 'student'),
('Dev Malhotra', 'dev.malhotra@student.edu', '$2b$10$lO1DBXlBsmfBVZCVVMbhh.yB8bY53FF955LO.rJ8m7ygLUiEhl/au', 'student'),
('Fatima Ali', 'fatima.ali@student.edu', '$2b$10$lO1DBXlBsmfBVZCVVMbhh.yB8bY53FF955LO.rJ8m7ygLUiEhl/au', 'student'),
('Vikram Rao', 'vikram.rao@student.edu', '$2b$10$lO1DBXlBsmfBVZCVVMbhh.yB8bY53FF955LO.rJ8m7ygLUiEhl/au', 'student'),
('Kavya Srinivasan', 'kavya.srinivasan@student.edu', '$2b$10$lO1DBXlBsmfBVZCVVMbhh.yB8bY53FF955LO.rJ8m7ygLUiEhl/au', 'student'),
('Harsh Gupta', 'harsh.gupta@student.edu', '$2b$10$lO1DBXlBsmfBVZCVVMbhh.yB8bY53FF955LO.rJ8m7ygLUiEhl/au', 'student'),
('Aditya Kulkarni', 'aditya.kulkarni@student.edu', '$2b$10$lO1DBXlBsmfBVZCVVMbhh.yB8bY53FF955LO.rJ8m7ygLUiEhl/au', 'student'),
('Ananya Reddy', 'ananya.reddy@student.edu', '$2b$10$lO1DBXlBsmfBVZCVVMbhh.yB8bY53FF955LO.rJ8m7ygLUiEhl/au', 'student');

INSERT INTO students (user_id, roll_no, department, graduation_year, cgpa, skills, phone, resume_url) VALUES
(2, '1RV22CS001', 'CSE', 2026, 8.70, 'JavaScript, React, Node.js, MySQL', '9876543210', 'https://example.com/resumes/aarav-sharma.pdf'),
(3, '1RV22CS014', 'CSE', 2026, 9.12, 'Python, Machine Learning, TensorFlow, SQL', '9876543211', 'https://example.com/resumes/nisha-rao.pdf'),
(4, '1RV22IS006', 'ISE', 2026, 8.28, 'SQL, Power BI, Python, Data Visualization', '9876543212', 'https://example.com/resumes/kiran-menon.pdf'),
(5, '1RV22IS019', 'ISE', 2026, 7.88, 'Java, Spring Boot, REST APIs, Git', '9876543213', 'https://example.com/resumes/meera-iyer.pdf'),
(6, '1RV22AI003', 'AIML', 2026, 9.34, 'Deep Learning, NLP, Python, MLOps', '9876543214', 'https://example.com/resumes/rhea-kapoor.pdf'),
(7, '1RV22AI017', 'AIML', 2026, 8.76, 'Computer Vision, Scikit-learn, Flask, Docker', '9876543215', 'https://example.com/resumes/arjun-patel.pdf'),
(8, '1RV22EC011', 'ECE', 2026, 8.42, 'Embedded C, IoT, MATLAB, PCB Design', '9876543216', 'https://example.com/resumes/sanjana-reddy.pdf'),
(9, '1RV22EC028', 'ECE', 2026, 7.74, 'VLSI Basics, Verilog, Python, Testing', '9876543217', 'https://example.com/resumes/kabir-khan.pdf'),
(10, '1RV22EE004', 'EEE', 2026, 8.55, 'Power Systems, AutoCAD Electrical, PLC, MATLAB', '9876543218', 'https://example.com/resumes/isha-nair.pdf'),
(11, '1RV22EE021', 'EEE', 2026, 7.62, 'Control Systems, Circuit Design, ETAP, Excel', '9876543219', 'https://example.com/resumes/nikhil-verma.pdf'),
(12, '1RV22ME008', 'MECH', 2026, 8.05, 'SolidWorks, CAD, Manufacturing, Lean Basics', '9876543220', 'https://example.com/resumes/rohan-mehta.pdf'),
(13, '1RV22ME023', 'MECH', 2026, 7.46, 'CATIA, Thermal Engineering, Quality Control, Excel', '9876543221', 'https://example.com/resumes/sneha-das.pdf'),
(14, '1RV22CS032', 'CSE', 2026, 8.95, 'Java, DSA, Microservices, AWS', '9876543222', 'https://example.com/resumes/priya-menon.pdf'),
(15, '1RV22IS041', 'ISE', 2026, 8.18, 'Business Analysis, SQL, Tableau, Python', '9876543223', 'https://example.com/resumes/dev-malhotra.pdf'),
(16, '1RV22AI029', 'AIML', 2026, 8.63, 'Data Science, PyTorch, Feature Engineering, SQL', '9876543224', 'https://example.com/resumes/fatima-ali.pdf'),
(17, '1RV22EC044', 'ECE', 2026, 8.11, 'Embedded Linux, C++, Signal Processing, Git', '9876543225', 'https://example.com/resumes/vikram-rao.pdf'),
(18, '1RV22EE037', 'EEE', 2026, 8.31, 'Renewable Energy, Power Electronics, SCADA, Python', '9876543226', 'https://example.com/resumes/kavya-srinivasan.pdf'),
(19, '1RV22ME036', 'MECH', 2026, 7.58, 'CNC Programming, GD&T, Production Planning, CAD', '9876543227', 'https://example.com/resumes/harsh-gupta.pdf'),
(20, '1RV22CS047', 'CSE', 2026, 8.82, 'Node.js, Express, MongoDB, Cloud Deployments', '9876543228', 'https://example.com/resumes/aditya-kulkarni.pdf'),
(21, '1RV22AI050', 'AIML', 2026, 9.05, 'Generative AI, Python, LangChain, Vector Databases', '9876543229', 'https://example.com/resumes/ananya-reddy.pdf');

INSERT INTO companies (name, industry, website, location, contact_email) VALUES
('TechNova Solutions', 'Software', 'https://technova.example.com', 'Bengaluru', 'hr@technova.example.com'),
('DataPulse Analytics', 'Analytics', 'https://datapulse.example.com', 'Hyderabad', 'careers@datapulse.example.com'),
('CloudNest Systems', 'Cloud Computing', 'https://cloudnest.example.com', 'Pune', 'talent@cloudnest.example.com'),
('FinEdge Labs', 'FinTech', 'https://finedge.example.com', 'Mumbai', 'campus@finedge.example.com'),
('GreenGrid Energy', 'Renewable Energy', 'https://greengrid.example.com', 'Chennai', 'hiring@greengrid.example.com'),
('ElectraWorks Mobility', 'Electronics and EV', 'https://electraworks.example.com', 'Bengaluru', 'placements@electraworks.example.com'),
('MechForge Manufacturing', 'Manufacturing', 'https://mechforge.example.com', 'Coimbatore', 'campus@mechforge.example.com'),
('MediCore Digital', 'HealthTech', 'https://medicore.example.com', 'Bengaluru', 'jobs@medicore.example.com');

INSERT INTO jobs (company_id, title, description, package_lpa, min_cgpa, location, deadline, status) VALUES
(1, 'Frontend Developer', 'Build responsive web interfaces using HTML, CSS, JavaScript, and modern UI practices.', 7.50, 7.00, 'Bengaluru', '2026-08-20', 'open'),
(1, 'Backend Developer', 'Develop REST APIs, authentication, and database-backed services.', 8.20, 7.50, 'Bengaluru', '2026-08-30', 'open'),
(1, 'AI Engineer Intern', 'Prototype AI-assisted workflow features and evaluate model outputs.', 18.00, 8.80, 'Bengaluru', '2026-10-02', 'open'),
(2, 'Data Analyst Trainee', 'Analyze datasets, prepare dashboards, and report business insights.', 6.30, 7.00, 'Hyderabad', '2026-09-12', 'open'),
(2, 'Machine Learning Engineer', 'Train, evaluate, and deploy machine learning models for analytics products.', 10.50, 8.20, 'Hyderabad', '2026-09-22', 'open'),
(3, 'Cloud Support Engineer', 'Support cloud infrastructure, monitoring, and deployment workflows.', 6.40, 6.80, 'Pune', '2026-07-28', 'open'),
(3, 'DevOps Trainee', 'Maintain CI/CD pipelines, cloud deployments, and observability dashboards.', 10.20, 8.00, 'Pune', '2026-08-25', 'open'),
(4, 'Software Engineer - Payments', 'Work on payment workflows, transaction monitoring, and secure backend services.', 12.50, 8.20, 'Mumbai', '2026-09-05', 'open'),
(4, 'QA Automation Engineer', 'Create automated test suites for web and API products.', 7.80, 7.40, 'Mumbai', '2026-08-10', 'open'),
(5, 'Power Systems GET', 'Support renewable energy systems, site audits, and project execution.', 5.80, 7.00, 'Chennai', '2026-07-18', 'open'),
(6, 'Embedded Systems Engineer', 'Develop firmware, board bring-up utilities, and validation tools for EV modules.', 7.10, 7.20, 'Bengaluru', '2026-08-18', 'open'),
(6, 'Electrical Design Engineer', 'Create wiring diagrams, electrical layouts, and validation reports for mobility systems.', 6.00, 7.00, 'Bengaluru', '2026-08-28', 'open'),
(7, 'Production Engineer', 'Coordinate production planning, quality checks, and process improvement initiatives.', 5.50, 6.80, 'Coimbatore', '2026-07-30', 'open'),
(7, 'CAD Design Associate', 'Prepare 3D models, manufacturing drawings, and design change documentation.', 4.80, 6.80, 'Coimbatore', '2026-08-06', 'open'),
(8, 'Product Analyst', 'Track product usage, write SQL reports, and coordinate with engineering teams.', 9.40, 8.00, 'Bengaluru', '2026-09-18', 'open');

INSERT INTO applications (student_id, job_id, status, applied_at) VALUES
(1, 1, 'shortlisted', '2026-05-02 09:15:00'),
(1, 2, 'applied', '2026-05-04 11:20:00'),
(2, 3, 'selected', '2026-05-05 14:00:00'),
(2, 8, 'rejected', '2026-05-06 10:45:00'),
(3, 4, 'selected', '2026-05-07 13:30:00'),
(3, 9, 'shortlisted', '2026-05-08 15:10:00'),
(4, 2, 'rejected', '2026-05-09 16:20:00'),
(4, 15, 'applied', '2026-05-10 09:40:00'),
(5, 3, 'selected', '2026-05-10 12:25:00'),
(5, 5, 'shortlisted', '2026-05-11 10:15:00'),
(6, 5, 'selected', '2026-05-11 17:05:00'),
(6, 7, 'applied', '2026-05-12 11:50:00'),
(7, 11, 'selected', '2026-05-12 14:35:00'),
(7, 6, 'rejected', '2026-05-13 09:55:00'),
(8, 11, 'shortlisted', '2026-05-13 15:15:00'),
(8, 9, 'applied', '2026-05-14 10:05:00'),
(9, 10, 'selected', '2026-05-14 13:45:00'),
(9, 12, 'shortlisted', '2026-05-15 09:25:00'),
(10, 12, 'rejected', '2026-05-15 12:10:00'),
(10, 10, 'applied', '2026-05-16 10:30:00'),
(11, 13, 'selected', '2026-05-16 15:20:00'),
(11, 14, 'shortlisted', '2026-05-17 11:15:00'),
(12, 14, 'rejected', '2026-05-18 09:35:00'),
(12, 13, 'applied', '2026-05-18 16:00:00'),
(13, 8, 'selected', '2026-05-19 10:00:00'),
(13, 1, 'shortlisted', '2026-05-19 10:30:00'),
(14, 4, 'applied', '2026-05-19 11:00:00'),
(14, 15, 'selected', '2026-05-19 11:30:00'),
(15, 3, 'rejected', '2026-05-19 12:00:00'),
(15, 5, 'applied', '2026-05-19 12:30:00'),
(16, 11, 'selected', '2026-05-19 13:00:00'),
(16, 6, 'applied', '2026-05-19 13:30:00'),
(17, 10, 'shortlisted', '2026-05-19 14:00:00'),
(17, 12, 'selected', '2026-05-19 14:30:00'),
(18, 13, 'rejected', '2026-05-19 15:00:00'),
(18, 14, 'applied', '2026-05-19 15:30:00'),
(19, 2, 'selected', '2026-05-19 16:00:00'),
(19, 7, 'shortlisted', '2026-05-19 16:30:00'),
(20, 5, 'selected', '2026-05-19 17:00:00'),
(20, 3, 'applied', '2026-05-19 17:30:00');

INSERT INTO interviews (application_id, interview_date, mode, venue, interviewer, result, notes) VALUES
(1, '2026-06-10 10:30:00', 'online', 'Google Meet', 'Ritika Menon', 'scheduled', 'Technical round focused on JavaScript and UI problem solving.'),
(3, '2026-05-28 14:00:00', 'offline', 'Innovation Center', 'Kavya Srinivasan', 'selected', 'Selected for AI engineering cohort after project review.'),
(4, '2026-05-29 10:00:00', 'online', 'Microsoft Teams', 'Aditi Shah', 'rejected', 'Good fundamentals, but payments case study was incomplete.'),
(5, '2026-05-30 11:00:00', 'offline', 'Placement Block Room 204', 'Anil Reddy', 'selected', 'Strong SQL dashboard walkthrough and communication.'),
(6, '2026-06-03 09:30:00', 'online', 'Zoom', 'Helen Mathew', 'scheduled', 'Automation scripting and testing discussion.'),
(7, '2026-05-31 15:00:00', 'online', 'Google Meet', 'Rohit Bansal', 'rejected', 'Needs deeper backend debugging practice.'),
(9, '2026-06-01 10:00:00', 'offline', 'Innovation Center', 'Naveen Shetty', 'selected', 'Excellent NLP project and model evaluation explanation.'),
(10, '2026-06-05 13:30:00', 'online', 'Microsoft Teams', 'Kavya Srinivasan', 'scheduled', 'Machine learning system design round.'),
(11, '2026-06-06 10:30:00', 'online', 'Zoom', 'Vivek Kumar', 'selected', 'Selected after model deployment assignment.'),
(13, '2026-06-07 12:00:00', 'offline', 'ECE Seminar Hall', 'Meghana Rao', 'selected', 'Embedded systems project matched hiring requirements.'),
(14, '2026-05-28 16:00:00', 'online', 'Google Meet', 'Pranav Joshi', 'rejected', 'Cloud troubleshooting round did not meet benchmark.'),
(15, '2026-06-08 14:30:00', 'offline', 'ECE Lab 3', 'Meghana Rao', 'scheduled', 'Firmware debugging and IoT design discussion.'),
(17, '2026-06-09 11:30:00', 'offline', 'Electrical Machines Lab', 'Prakash Nair', 'selected', 'Selected for renewable power systems role.'),
(18, '2026-06-11 09:45:00', 'online', 'Microsoft Teams', 'Deepa Krishnan', 'scheduled', 'Electrical design and drawing review.'),
(19, '2026-05-29 13:30:00', 'online', 'Zoom', 'Deepa Krishnan', 'rejected', 'Circuit design assignment needs improvement.'),
(21, '2026-06-12 16:00:00', 'offline', 'Mechanical Lab 1', 'Suresh Kumar', 'selected', 'Good manufacturing fundamentals and process thinking.'),
(22, '2026-06-15 10:30:00', 'offline', 'CAD Lab', 'Meenal Shah', 'scheduled', 'CAD portfolio review and drawing exercise.'),
(23, '2026-05-30 12:30:00', 'offline', 'CAD Lab', 'Meenal Shah', 'rejected', 'Drawing standards round was below cutoff.'),
(25, '2026-06-16 12:00:00', 'online', 'Google Meet', 'Aditi Shah', 'selected', 'Selected after payment API and DSA round.'),
(26, '2026-06-17 11:00:00', 'online', 'Google Meet', 'Ritika Menon', 'scheduled', 'Frontend architecture and accessibility round.'),
(28, '2026-06-18 15:30:00', 'online', 'Microsoft Teams', 'Vivek Kumar', 'selected', 'Strong product metrics and BI case study.'),
(29, '2026-05-31 10:00:00', 'online', 'Zoom', 'Naveen Shetty', 'rejected', 'AI fundamentals were good, but coding round did not clear.'),
(31, '2026-06-19 10:30:00', 'offline', 'ECE Seminar Hall', 'Meghana Rao', 'selected', 'Selected for embedded systems role.'),
(33, '2026-06-20 12:30:00', 'offline', 'Electrical Machines Lab', 'Prakash Nair', 'scheduled', 'Power systems panel round.'),
(34, '2026-06-21 14:00:00', 'online', 'Google Meet', 'Deepa Krishnan', 'selected', 'Electrical design assignment cleared.'),
(35, '2026-06-01 09:30:00', 'offline', 'Mechanical Lab 2', 'Suresh Kumar', 'rejected', 'Production planning interview did not meet role requirements.'),
(37, '2026-06-22 15:30:00', 'online', 'Microsoft Teams', 'Rohit Bansal', 'selected', 'Selected for backend role after API design round.'),
(38, '2026-06-24 11:00:00', 'online', 'Zoom', 'Vivek Kumar', 'scheduled', 'DevOps assignment review.'),
(39, '2026-06-25 16:00:00', 'online', 'Google Meet', 'Kavya Srinivasan', 'selected', 'Selected after ML modeling and deployment round.');
