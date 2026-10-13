# Synora — System Documentation

---

## 1. System Overview

**Synora** is a **Group Contribution Monitoring System** designed for educational institutions. It tracks individual student contributions within group projects, ensuring accountability and fair evaluation.

### Purpose
In group projects, it's often unclear who contributed what. Synora solves this by:
- Tracking task assignments and completions
- Monitoring submission deadlines
- Calculating individual contribution scores
- Providing professors with visibility into group progress

### Target Users
| Role | Description |
|------|-------------|
| **Admin** | System administrator who manages users and promotes students to professors |
| **Professor** | Creates classes, projects, and groups; monitors overall progress |
| **Student** | Joins classes, works on tasks, submits work |
| **Leader** | Student assigned by professor to manage a group, create tasks, and review submissions |

### Tech Stack
| Technology | Purpose |
|------------|---------|
| React + Vite | Frontend UI |
| Express (Node.js) | Backend API: auth, calculations, reports |
| Supabase | Database, authentication, file storage |
| PostgreSQL | Relational database |
| Row Level Security | Data access control |

---

## 2. Core Features

### 2.1 Authentication & User Management
This is how users enter the system and how accounts are controlled. Users
register and log in with email and password. Students fill in their
course, year, and section on first login. Admins have their own login
page that turns away non-admins. Admins can promote students to
professors, make other admins, and turn accounts on or off — but the
system will not let them remove the very last admin.

### 2.2 Class Management
This is how classes are set up. Professors create a class and the system
gives it a short code. Students type that code to join. Everything else —
projects, groups, tasks, scores — lives inside a class.

### 2.3 Project Management
This is what the class works on. Professors create a project with a title,
description, and deadline. The project shows one progress number that
moves as group work gets finished.

### 2.4 Group Management
This is how students are organized into teams. Professors make a group
and pick one member as leader. The leader adds or removes members. Tasks
are given out and checked inside the group.

### 2.5 Task Management
This is the actual work list. Leaders create tasks with a title,
instructions, deadline, and priority, and give each one to a member.
Members press Start when they begin, then Submit when done. The leader
checks the work and either approves it, sends it back, or rejects it.

### 2.6 Submissions & File Handling
This is how finished work reaches the leader. Members attach their files
and a short note. Only the right people can open each file — students see
their own, leaders and professors open them through temporary links.

### 2.7 Contribution Tracking
This is the automatic score. Every time a leader checks work, the system
recounts for each student: how many tasks were given, how many were
approved, how many were on time, and the percentage score. Group and
project progress update at the same time.

### 2.8 Leader Grading
This is the leader's personal grade for each member, from 0 to 100. It
captures what numbers miss — effort, quality, teamwork. Professors see it
beside the automatic score when deciding final grades.

### 2.9 Deadline Reminders & Notifications
This is how the system nags people. Overdue and soon-due tasks show as
colored banners and badges. The bell icon collects personal alerts:
students get deadlines and review results, leaders get work waiting for
review, professors get unreviewed work, admins get pending verifications.

### 2.10 Activity History
This is each student's diary. Every important action is listed by date:
tasks given, started, submitted, approved, members added or removed. If
anyone argues about who did what, the answer is here.

### 2.11 Reports & PDF Export
This is what the professor prints or saves. One button downloads a report
for the whole class: every student ranked by score, with tasks given,
tasks done, on-time count, percentage, and the leader's grade.

### 2.12 Security Protections
This is what keeps bad actors out. Wrong passwords 5 times locks the
account for 15 minutes. Passwords must be strong. A robot check guards
the login and signup pages. Admins type a second code from their phone
after their password. Forgotten passwords reset through email.

---

## 3. System Architecture

### 3.1 Database Schema

```
profiles (users)
    ├── classes (professor creates)
    │   ├── class_enrollments (students join)
    │   └── projects (professor creates)
    │       └── groups (professor creates)
    │           ├── group_members (leader manages)
    │           └── tasks (leader creates)
    │               └── submissions (students submit)
    ├── contributions (auto-calculated)
    └── activities (audit log)
```

### 3.2 Key Relationships

| Relationship | Description |
|--------------|-------------|
| Professor → Classes | One professor can create many classes |
| Class → Projects | One class can have many projects |
| Project → Groups | One project can have many groups |
| Group → Members | One group has many members (students) |
| Group → Tasks | One group has many tasks |
| Task → Submissions | One task can have many submissions |
| Student → Contributions | Each student has contribution records |

### 3.3 Row Level Security (RLS)

All database tables have RLS enabled with 44 policies:

| Table | Policies | Protection |
|-------|----------|------------|
| profiles | 3 | Users update own profile |
| classes | 4 | Professors manage own classes |
| class_enrollments | 3 | Students self-enroll |
| projects | 4 | Professors manage own projects |
| groups | 4 | Professors manage groups |
| group_members | 1 | Leaders manage own members |
| tasks | 4 | Leaders manage tasks |
| contributions | 3 | System calculates contributions |
| submissions | 3 | Users submit own work |
| activities | 2 | System logs activities |

---

## 4. User Workflows

### 4.1 Admin Workflow
1. Login to admin dashboard
2. View all users (filter by role)
3. Select a user to view details
4. Promote student to professor (or demote)
5. Deactivate accounts if needed

### 4.2 Professor Workflow
1. Login to professor dashboard
2. Create a class (auto-generates code)
3. Share code with students
4. Create projects within the class
5. Create groups and assign leaders
6. Monitor group progress

### 4.3 Student Workflow
1. Login to student dashboard
2. Join a class using 6-character code
3. View class projects
4. View assigned group
5. View tasks assigned to you
6. Submit work with comments
7. View contribution stats

### 4.4 Leader Workflow
1. Login to leader dashboard (if assigned as leader)
2. Select your group
3. Manage members (add/remove)
4. Create tasks and assign to members
5. Review submitted work
6. Verify, request revision, or reject submissions
7. Add feedback for revisions/rejections

---

## 5. Data Flow

### 5.1 How Data Moves

```
Professor creates class → Code generated
    ↓
Student joins class → Enrollment saved
    ↓
Professor creates project → Project saved
    ↓
Professor creates group → Group + members saved
    ↓
Leader creates task → Task assigned to member
    ↓
Member submits work → Submission saved
    ↓
Leader reviews → Status updated (verified/revision/rejected)
    ↓
System calculates → Contribution recorded
```

### 5.2 Task Status Flow

```
Assigned → In Progress → Submitted → Under Review
                                        ↓
                              ┌─────────┴─────────┐
                              ↓                   ↓
                         Verified          Needs Revision
                                              ↓
                                          Resubmitted
                                              ↓
                                          Under Review
```

### 5.3 Contribution Calculation

Each student's contribution is based on:
- **Tasks Completed** / **Tasks Assigned** × 100
- **On-Time Submissions** / **Total Submissions** × 100
- **Group Progress** weighted by individual input

---

## 6. Security Measures

### 6.1 Implemented
| Measure | Status |
|---------|--------|
| Row Level Security | ✅ All tables protected |
| Route Protection | ✅ Unauthenticated users redirected |
| Profile Completion | ✅ Students must complete profile |
| Input Validation | ✅ Required fields on all forms |
| .env Protection | ✅ API keys not in code |

### 6.2 Missing (Planned)
| Measure | Priority |
|---------|----------|
| Role-based route protection | High |
| Password validation | High |
| Input sanitization (XSS) | High |
| Session timeout | Medium |
| Audit logging | Medium |

See `SECURITY_STATUS.md` for details.

---

## 7. Set-Aside Features

### 7.1 Grading Criteria (Option C — Hybrid)
- Professor defines weighted criteria per class
- Some criteria auto-calculate (task completion, punctuality)
- Some criteria manually evaluated by leaders (participation, quality)
- Status: Planned

### 7.2 Weighted Progress Formula
- Current: Only verified tasks count
- Proposed: Weighted by status (verified=100%, submitted=80%, in progress=50%)
- Status: Planned

### 7.3 Auto-Enrollment
- Students auto-enrolled based on course/year/section
- Status: Set aside (using class code instead)

See `GRADING_PLAN.md` for details.

---

## 8. File Structure

```
src/
├── components/        # Reusable UI components
│   ├── Navbar.jsx
│   └── Sidebar.jsx
├── data/              # Context and state
│   └── UserContext.jsx
├── layouts/           # Route layouts
│   ├── AdminLayout.jsx
│   ├── ProfessorLayout.jsx
│   └── StudentLayout.jsx
├── pages/             # Page components
│   ├── admin/         # Admin pages
│   ├── auth/          # Login, Sign Up
│   ├── leader/        # Leader pages
│   ├── professor/     # Professor pages
│   └── student/       # Student pages
├── routes/            # Route definitions
│   └── AppRoutes.jsx
└── services/          # API calls
    ├── classes.js
    ├── contributions.js
    ├── groups.js
    ├── projects.js
    └── tasks.js
```

---

## 9. Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous API key |

Stored in `.env` file (protected via `.gitignore`).

---

## 10. Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation
```bash
# Clone the repository
git clone <repo-url>

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Run development server
npm run dev
```

### Database Setup
1. Create a Supabase project
2. Run the SQL in `supabase/schema.sql`
3. Enable RLS on all tables
4. Update `.env` with your Supabase URL and anon key

---

## 11. Documentation Files

| File | Description |
|------|-------------|
| `SYSTEM_FLOW.md` | System flowcharts with Mermaid diagrams |
| `SECURITY_STATUS.md` | Security measures and gaps |
| `GRADING_PLAN.md` | Grading criteria plan (set aside) |

---

*Last updated: October 12, 2026*
