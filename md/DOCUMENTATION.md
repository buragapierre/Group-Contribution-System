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
| Supabase | Backend database and authentication |
| PostgreSQL | Relational database |
| Row Level Security | Data access control |

---

## 2. Core Features

### 2.1 Authentication & User Management
- Email/password sign up and login
- Profile completion for students (course, year, section)
- Role-based access (Admin, Professor, Student)
- Admin can promote students to professors

### 2.2 Class Management
- Professors create classes with auto-generated 6-character codes
- Students join classes using the code
- View enrolled students and class progress

### 2.3 Project Management
- Professors create projects with title, description, and deadline
- Projects are organized within classes
- Track overall project progress

### 2.4 Group Management
- Professors create groups and assign leaders
- Leaders can add/remove members from their group
- Each group works on projects within a class

### 2.5 Task Management
- Leaders create tasks with title, description, assignee, deadline, and priority
- Tasks are assigned to individual group members
- Members submit work with comments/descriptions
- Leaders review submissions and provide feedback

### 2.6 Contribution Tracking
- System tracks task completion rates
- Monitors punctuality (on-time vs late submissions)
- Calculates individual contribution percentages
- Stores contribution history

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

*Last updated: September 21, 2026*
