-- ============================================
-- CONTRITRACK SEED DATA
-- Run AFTER creating the schema
--
-- IMPORTANT: Replace the UUIDs below with your
-- actual auth user IDs. To find them:
--   Supabase Dashboard → Authentication → Users
--   Copy each user's UUID
-- ============================================

-- ============================================
-- STEP 1: Create auth users first (via signup)
-- Then paste their UUIDs here
-- ============================================

-- Replace these placeholder UUIDs with real ones from Authentication → Users
-- professor1 = Dr. Maria Santos (sign up as professor)
-- professor2 = Dr. James Reyes (sign up as professor, status: pending)
-- student1   = Juan Mendoza (sign up as student)
-- student2   = Maria Santos (sign up as student)
-- student3   = Pedro Cruz (sign up as student)
-- student4   = Ana Lopez (sign up as student)
-- student5   = Carlos Garcia (sign up as student)
-- student6   = Sofia Rivera (sign up as student, inactive)
-- admin1     = Admin User (sign up as admin)

-- After signup, update profiles to set the correct status:
-- UPDATE profiles SET status = 'pending' WHERE email = 'james.reyes@university.edu';
-- UPDATE profiles SET status = 'inactive' WHERE email = 'sofia.rivera@university.edu';

-- ============================================
-- STEP 2: Run this after you have the UUIDs
-- ============================================

-- Classes
INSERT INTO classes (id, course, section, semester, academic_year, professor_id, professor_name, color) VALUES
(1, 'Web Systems and Technologies', 'BSIT 3-A', '1st Semester', 'AY 2026-2027', 'PASTE_PROF1_UUID', 'Dr. Maria Santos', 'lavender'),
(2, 'Database Management Systems', 'BSIT 3-B', '1st Semester', 'AY 2026-2027', 'PASTE_PROF1_UUID', 'Dr. Maria Santos', 'blue'),
(3, 'Information Assurance and Security', NULL, '1st Semester', 'AY 2026-2027', 'PASTE_PROF1_UUID', 'Dr. Maria Santos', 'peach'),
(4, 'Capstone Project', 'BSIT 4-A', '1st Semester', 'AY 2026-2027', 'PASTE_PROF1_UUID', 'Dr. Maria Santos', 'green'),
(5, 'Systems Integration', 'BSIT 3-A', '1st Semester', 'AY 2026-2027', 'PASTE_PROF2_UUID', 'Dr. James Reyes', 'pink');

-- Class Enrollments
INSERT INTO class_enrollments (class_id, user_id) VALUES
(1, 'PASTE_STUDENT1_UUID'), (1, 'PASTE_STUDENT2_UUID'), (1, 'PASTE_STUDENT3_UUID'), (1, 'PASTE_STUDENT4_UUID'),
(2, 'PASTE_STUDENT1_UUID'), (2, 'PASTE_STUDENT2_UUID'), (2, 'PASTE_STUDENT5_UUID'),
(3, 'PASTE_STUDENT3_UUID'), (3, 'PASTE_STUDENT4_UUID'), (3, 'PASTE_STUDENT6_UUID'),
(4, 'PASTE_STUDENT1_UUID'), (4, 'PASTE_STUDENT5_UUID'),
(5, 'PASTE_STUDENT1_UUID'), (5, 'PASTE_STUDENT2_UUID'), (5, 'PASTE_STUDENT4_UUID');

-- Projects
INSERT INTO projects (id, title, description, requirements, deadline, class_id, professor_id, professor_name, color, icon, overall_progress, status) VALUES
(1, 'Capstone Documentation', 'Complete capstone project documentation including system analysis, design, and implementation reports.', 'Follow university thesis format. Include all chapters.', '2026-10-15', 1, 'PASTE_PROF1_UUID', 'Dr. Maria Santos', 'lavender', '✦', 82, 'active'),
(2, 'Database System', 'Design and implement a complete database system for a chosen business domain.', 'ERD, normalization, SQL queries, stored procedures.', '2026-10-22', 2, 'PASTE_PROF1_UUID', 'Dr. Maria Santos', 'blue', '◇', 68, 'active'),
(3, 'Security Audit Report', 'Conduct a full security audit on a sample enterprise network and produce a report.', 'Vulnerability assessment, risk analysis, recommendations.', '2026-10-24', 3, 'PASTE_PROF1_UUID', 'Dr. Maria Santos', 'peach', '◌', 54, 'active'),
(4, 'Capstone Prototype', 'Build and deploy a working prototype of the capstone system.', 'Full system with authentication, CRUD, and reporting.', '2026-11-30', 4, 'PASTE_PROF1_UUID', 'Dr. Maria Santos', 'green', '◆', 40, 'active');

-- Groups
INSERT INTO groups (id, name, project_id, project_name, class_id, leader_id, leader_name, progress, status) VALUES
(1, 'Group 1', 1, 'Capstone Documentation', 1, 'PASTE_STUDENT1_UUID', 'Juan Mendoza', 82, 'active'),
(2, 'Group 2', 1, 'Capstone Documentation', 1, 'PASTE_STUDENT5_UUID', 'Carlos Garcia', 65, 'active'),
(3, 'Group 3', 2, 'Database System', 2, 'PASTE_STUDENT2_UUID', 'Maria Santos', 71, 'active'),
(4, 'Group 4', 2, 'Database System', 2, 'PASTE_STUDENT1_UUID', 'Juan Mendoza', 55, 'active'),
(5, 'Group 5', 3, 'Security Audit Report', 3, 'PASTE_STUDENT3_UUID', 'Pedro Cruz', 48, 'active'),
(6, 'Group 1', 4, 'Capstone Prototype', 4, 'PASTE_STUDENT1_UUID', 'Juan Mendoza', 40, 'active');

-- Group Members
INSERT INTO group_members (group_id, user_id) VALUES
(1, 'PASTE_STUDENT1_UUID'), (1, 'PASTE_STUDENT2_UUID'), (1, 'PASTE_STUDENT3_UUID'), (1, 'PASTE_STUDENT4_UUID'),
(2, 'PASTE_STUDENT5_UUID'), (2, 'PASTE_STUDENT6_UUID'),
(3, 'PASTE_STUDENT2_UUID'), (3, 'PASTE_STUDENT3_UUID'), (3, 'PASTE_STUDENT4_UUID'),
(4, 'PASTE_STUDENT1_UUID'), (4, 'PASTE_STUDENT5_UUID'),
(5, 'PASTE_STUDENT3_UUID'), (5, 'PASTE_STUDENT4_UUID'), (5, 'PASTE_STUDENT6_UUID'),
(6, 'PASTE_STUDENT1_UUID'), (6, 'PASTE_STUDENT5_UUID');

-- Tasks
INSERT INTO tasks (id, title, description, group_id, project_id, class_id, assigned_to, assigned_by, deadline, priority, status, progress, color) VALUES
(1, 'Chapter 1 Documentation', 'Write the introduction and background of the study.', 1, 1, 1, 'PASTE_STUDENT1_UUID', 'PASTE_STUDENT1_UUID', '2026-09-20', 'high', 'verified', 100, 'lavender'),
(2, 'Chapter 2 Documentation', 'Write the review of related literature.', 1, 1, 1, 'PASTE_STUDENT2_UUID', 'PASTE_STUDENT1_UUID', '2026-09-25', 'high', 'in_progress', 70, 'blue'),
(3, 'Chapter 3 Documentation', 'Write the methodology chapter.', 1, 1, 1, 'PASTE_STUDENT3_UUID', 'PASTE_STUDENT1_UUID', '2026-09-28', 'medium', 'assigned', 0, 'peach'),
(4, 'Database ERD Design', 'Create the entity-relationship diagram.', 3, 2, 2, 'PASTE_STUDENT4_UUID', 'PASTE_STUDENT2_UUID', '2026-09-22', 'high', 'submitted', 100, 'green'),
(5, 'SQL Queries Report', 'Write complex SQL queries for the system.', 3, 2, 2, 'PASTE_STUDENT3_UUID', 'PASTE_STUDENT2_UUID', '2026-09-30', 'medium', 'in_progress', 45, 'yellow'),
(6, 'Vulnerability Assessment', 'Identify and document network vulnerabilities.', 5, 3, 3, 'PASTE_STUDENT3_UUID', 'PASTE_STUDENT3_UUID', '2026-09-24', 'high', 'in_progress', 30, 'pink'),
(7, 'Risk Analysis', 'Analyze and prioritize identified risks.', 5, 3, 3, 'PASTE_STUDENT4_UUID', 'PASTE_STUDENT3_UUID', '2026-10-01', 'medium', 'assigned', 0, 'lavender'),
(8, 'UI Mockups', 'Design the system user interface mockups.', 1, 1, 1, 'PASTE_STUDENT4_UUID', 'PASTE_STUDENT1_UUID', '2026-09-27', 'low', 'needs_revision', 60, 'blue'),
(9, 'Final Presentation', 'Prepare the final capstone presentation slides.', 1, 1, 1, 'PASTE_STUDENT1_UUID', 'PASTE_STUDENT1_UUID', '2026-10-10', 'high', 'assigned', 0, 'peach'),
(10, 'Normalized Database', 'Normalize the database to 3NF.', 4, 2, 2, 'PASTE_STUDENT5_UUID', 'PASTE_STUDENT1_UUID', '2026-09-29', 'medium', 'in_progress', 55, 'green'),
(11, 'Prototype Backend', 'Set up the backend API for the capstone system.', 6, 4, 4, 'PASTE_STUDENT5_UUID', 'PASTE_STUDENT1_UUID', '2026-10-15', 'high', 'in_progress', 35, 'green'),
(12, 'Prototype Frontend', 'Build the frontend UI components.', 6, 4, 4, 'PASTE_STUDENT1_UUID', 'PASTE_STUDENT1_UUID', '2026-10-20', 'medium', 'assigned', 0, 'blue');

-- Contributions
INSERT INTO contributions (user_id, user_name, group_id, class_id, tasks_assigned, tasks_completed, on_time_completions, contribution_percent, avatar, avatar_color) VALUES
('PASTE_STUDENT1_UUID', 'Juan Mendoza', 1, 1, 8, 7, 6, 84, 'JM', 'purple'),
('PASTE_STUDENT2_UUID', 'Maria Santos', 1, 1, 10, 10, 10, 91, 'MS', 'green'),
('PASTE_STUDENT3_UUID', 'Pedro Cruz', 1, 1, 7, 6, 5, 76, 'PC', 'yellow'),
('PASTE_STUDENT4_UUID', 'Ana Lopez', 1, 1, 4, 2, 1, 43, 'AL', 'pink'),
('PASTE_STUDENT5_UUID', 'Carlos Garcia', 2, 2, 6, 5, 5, 88, 'CG', 'blue'),
('PASTE_STUDENT6_UUID', 'Sofia Rivera', 2, 2, 3, 1, 1, 35, 'SR', 'peach'),
('PASTE_STUDENT1_UUID', 'Juan Mendoza', 6, 4, 4, 2, 2, 62, 'JM', 'purple'),
('PASTE_STUDENT5_UUID', 'Carlos Garcia', 6, 4, 3, 1, 1, 45, 'CG', 'blue');

-- Submissions
INSERT INTO submissions (task_id, user_id, submitted_at, files, comment, status) VALUES
(1, 'PASTE_STUDENT1_UUID', '2026-09-18', '["chapter1.docx"]', 'Completed all sections.', 'verified'),
(2, 'PASTE_STUDENT2_UUID', '2026-09-20', '["chapter2_draft.docx"]', 'Draft version for review.', 'needs_revision'),
(4, 'PASTE_STUDENT4_UUID', '2026-09-19', '["erd_diagram.png", "erd_explanation.docx"]', 'ERD with full explanation.', 'under_review'),
(8, 'PASTE_STUDENT4_UUID', '2026-09-22', '["mockups_v1.fig"]', 'First version of mockups.', 'needs_revision'),
(5, 'PASTE_STUDENT3_UUID', '2026-09-25', '["sql_report.pdf"]', 'SQL queries with explanations.', 'submitted'),
(11, 'PASTE_STUDENT5_UUID', '2026-10-01', '["backend_api.zip"]', 'REST API with endpoints.', 'under_review');

-- Activities
INSERT INTO activities (user_id, type, message, class_id, timestamp) VALUES
('PASTE_STUDENT1_UUID', 'task_assigned', 'Task assigned: Chapter 1 Documentation', 1, '2026-09-17T10:00:00'),
('PASTE_STUDENT1_UUID', 'task_started', 'Started working on Chapter 1 Documentation', 1, '2026-09-17T11:30:00'),
('PASTE_STUDENT1_UUID', 'progress_update', 'Progress updated to 50% on Chapter 1 Documentation', 1, '2026-09-17T14:00:00'),
('PASTE_STUDENT1_UUID', 'progress_update', 'Progress updated to 100% on Chapter 1 Documentation', 1, '2026-09-18T09:00:00'),
('PASTE_STUDENT1_UUID', 'task_submitted', 'Submitted Chapter 1 Documentation', 1, '2026-09-18T10:00:00'),
('PASTE_STUDENT1_UUID', 'task_verified', 'Chapter 1 Documentation verified by leader', 1, '2026-09-18T16:00:00'),
('PASTE_STUDENT2_UUID', 'task_assigned', 'Task assigned: Chapter 2 Documentation', 1, '2026-09-19T09:00:00'),
('PASTE_STUDENT2_UUID', 'task_started', 'Started working on Chapter 2 Documentation', 1, '2026-09-19T10:00:00'),
('PASTE_STUDENT2_UUID', 'progress_update', 'Progress updated to 70% on Chapter 2 Documentation', 1, '2026-09-20T14:00:00'),
('PASTE_STUDENT2_UUID', 'revision_requested', 'Leader requested revision on Chapter 2 Documentation', 1, '2026-09-20T17:00:00'),
('PASTE_STUDENT1_UUID', 'task_assigned', 'Task assigned: Prototype Backend', 4, '2026-09-28T10:00:00'),
('PASTE_STUDENT1_UUID', 'task_started', 'Started working on Prototype Backend', 4, '2026-09-28T11:00:00');
