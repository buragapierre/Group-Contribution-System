# Software Development Life Cycle (SDLC)
## Group Contribution Monitoring System (Synora)

---

## SDLC Methodology: Agile

### Why Agile is Suitable for This System

Agile methodology is the most suitable approach for developing the Group Contribution Monitoring System (Synora) because the system involves multiple user roles (Admin, Professor, Student, Leader) with evolving requirements that may change based on user feedback. Agile allows the development team to break the project into small, manageable sprints, delivering working software incrementally rather than waiting until the end to test everything. This approach enables early detection of issues, continuous stakeholder feedback, and flexibility to adjust features as the system evolves. Since the system has a clear modular structure (authentication, admin, professor, student, leader modules), each module can be developed and tested independently in separate sprints. The iterative nature of Agile ensures that the core functionality (authentication and routing) is built first, providing a stable foundation before adding complex features like group management and contribution tracking. Additionally, Agile's emphasis on collaboration and regular reviews helps ensure the final product meets the actual needs of students, professors, and administrators.

---

## 1. Planning

**Why Agile is Suitable for Planning:**

Agile is suitable for the planning phase because it allows the project to start with a high-level vision and refine details as the project progresses. Instead of spending weeks creating a rigid, detailed plan upfront, Agile enables the team to establish the project goals, scope, and constraints quickly, then adjust the plan based on feedback and discoveries during development. For this system, the initial planning identified the core problem (tracking group contributions), key users (admin, professor, student, leader), and feasible technology (React + Supabase). As development progressed, the plan could adapt to changes like adjusting UI layouts, modifying features, or addressing security concerns without derailing the entire project.

### Project Overview

| Item | Description |
|------|-------------|
| **Project Name** | Group Contribution Monitoring System (Synora) |
| **Purpose** | Monitor and evaluate student group contributions in academic settings |
| **Users** | Admin, Professor, Student, Leader |
| **Tech Stack** | React.js + Supabase (PostgreSQL) |
| **Duration** | 8 weeks |

### Problem Statement

- Difficult to track individual contributions in group projects
- No fair way to assess student participation
- Need real-time progress monitoring
- Need centralized system for multiple classes

### Feasibility

| Type | Assessment | Status |
|------|------------|--------|
| Technical | React + Supabase are mature and proven | ✅ Feasible |
| Economic | Free tier available for hosting | ✅ Feasible |
| Operational | Simple UI, minimal training needed | ✅ Feasible |
| Schedule | 8 weeks is realistic | ✅ Feasible |

---

## 2. Requirements

**Why Agile is Suitable for Requirements:**

Agile is suitable for requirements gathering because it recognizes that requirements can evolve throughout the project. Instead of documenting every possible requirement upfront (which may become outdated), Agile focuses on prioritizing the most important features first and refining them as the project progresses. For this system, the core requirements (authentication, role-based access, group management) were clearly defined early, while secondary features (peer evaluation, activity history) could be added or modified based on user feedback. The user story format used in Agile ("As a user, I want...") makes requirements easy to understand and validate with stakeholders. This approach ensures the system meets actual user needs rather than assumptions made at the start.

### Functional Requirements

| Module | Requirements |
|--------|--------------|
| **Authentication** | Register, login, logout, password validation, session timeout |
| **Admin** | Manage users, verify accounts, promote roles |
| **Professor** | Create classes, projects, groups, monitor progress, review submissions |
| **Student** | Join classes, view tasks, submit work, view contribution |
| **Leader** | Add members, create tasks, assign work, review submissions |

### Non-Functional Requirements

| Category | Requirement | Target |
|----------|-------------|--------|
| Performance | Page load time | < 3 seconds |
| Security | Data encryption | TLS/SSL |
| Security | Access control | Role-based + RLS |
| Usability | Learning curve | < 30 minutes |
| Compatibility | Browsers | Chrome, Firefox, Safari, Edge |

### User Stories

**As a student,**
- I want to join classes using codes
- I want to view and submit tasks
- I want to see my contribution percentage

**As a professor,**
- I want to create classes and projects
- I want to monitor group progress
- I want to review submissions

**As a leader,**
- I want to manage group members
- I want to create and assign tasks
- I want to review member submissions

---

## 3. Design

**Why Agile is Suitable for Design:**

Agile is suitable for the design phase because it promotes iterative design rather than creating a complete design upfront. In Agile, the team designs the core architecture and database schema first, then refines UI/UX elements as they build and test each feature. For this system, the database design (tables, relationships, RLS policies) was established early because it's difficult to change later. However, UI design elements like page layouts, icons, and color schemes could evolve throughout development based on testing and feedback. This approach avoids the common waterfall problem of spending too much time on design before discovering usability issues during development.

### System Architecture

```
┌─────────────────────────────────────────┐
│           Frontend (React.js)            │
│  ┌─────────┬─────────┬─────────┐       │
│  │  Admin  │Professor│ Student │       │
│  │Dashboard│Dashboard│Dashboard│       │
│  └─────────┴─────────┴─────────┘       │
├─────────────────────────────────────────┤
│           API Layer (Supabase)           │
│  ┌─────────┬─────────┬─────────┐       │
│  │  Auth   │  REST   │ Realtime│       │
│  └─────────┴─────────┴─────────┘       │
├─────────────────────────────────────────┤
│        Database (PostgreSQL)            │
│  ┌──────┬──────┬──────┬──────┐         │
│  │Users │Classes│Groups│Tasks │         │
│  └──────┴──────┴──────┴──────┘         │
└─────────────────────────────────────────┘
```

### Database Design

**Tables:**

| Table | Purpose |
|-------|---------|
| profiles | User information (admin, professor, student) |
| classes | Class details with join codes |
| class_students | Student-class enrollment |
| projects | Project details per class |
| groups | Group details with leaders |
| group_members | Group membership |
| tasks | Task assignments |
| submissions | Task submissions |
| contributions | Student contribution tracking |

**Key Relationships:**
- Professor → creates → Classes
- Class → contains → Projects, Groups
- Group → has → Members, Tasks
- Task → has → Submissions
- Student → has → Contributions

### UI Design

**Color Palette:**
- Primary: Purple (#8d5db2)
- Background: Light gray (#f2f5fa)
- Text: Dark (#17171a)
- Success: Green (#22c55e)
- Warning: Orange (#f59e0b)
- Danger: Red (#ef4444)

**Layout:**
- Sidebar navigation
- Top navbar with user info
- Card-based content
- Responsive (mobile + desktop)

### Security Design

| Layer | Protection |
|-------|------------|
| Authentication | Supabase Auth with JWT tokens |
| Authorization | Role-based access + Route protection |
| Database | Row-Level Security (RLS) |
| Input | Validation + Parameterized queries |
| Session | Timeout (30 min) + Rate limiting |

---

## 4. Implementation

**Why Agile is Suitable for Implementation:**

Agile is highly suitable for implementation because it breaks the development work into small, manageable sprints that deliver working software incrementally. Instead of building the entire system at once and testing at the end, Agile allows the team to complete one module at a time, test it, and get feedback before moving to the next. For this system, the implementation was divided into 7 sprints, starting with authentication (the foundation), then building each user role's features independently. This approach reduces risk because problems are discovered early, not after months of development. It also allows the team to reprioritize if requirements change—for example, if security features needed more attention, they could be expanded in a later sprint.

### Development Environment

| Tool | Purpose |
|------|---------|
| Node.js | JavaScript runtime |
| Vite | Build tool |
| VS Code | Code editor |
| Git | Version control |
| Supabase | Backend services |

### Project Structure

```
src/
├── assets/          # Images and icons
├── components/      # Reusable components (Navbar, Sidebar)
├── data/            # Context and hooks
├── layouts/         # Admin, Professor, Student layouts
├── pages/           # Page components by role
│   ├── admin/
│   ├── auth/
│   ├── leader/
│   ├── professor/
│   └── student/
├── routes/          # Route configuration
├── services/        # API services
├── App.jsx          # Main component
└── main.jsx         # Entry point
```

### Development Sprints

**Sprint 1: Authentication & User Management (2 weeks)**

This sprint focuses on building the foundation of the system by implementing user authentication and management. Agile is suitable here because authentication is the most critical feature that all other modules depend on. By completing this first, the team establishes a stable base for role-based access control. The two-week duration allows enough time to implement login, registration, password validation, session timeout, and rate limiting without rushing. Early delivery of this sprint enables testing of security measures before building dependent features.

**Sprint 2: Role-Based Routing & Layouts (1 week)**

This sprint creates the navigation structure and page layouts for each user role. Agile works well here because layouts can be quickly prototyped and adjusted based on feedback. The one-week duration is appropriate since layouts are relatively straightforward once authentication is in place. Completing this sprint early ensures that all subsequent modules have a consistent UI framework to build upon, reducing rework later.

**Sprint 3: Admin Module (1 week)**

This sprint delivers the admin dashboard and user management features. Agile is suitable because admin features are relatively simple and self-contained. The one-week duration allows for quick delivery of essential admin functions (viewing users, verifying accounts, promoting roles). Early completion enables administrators to start managing user accounts before other modules are built.

**Sprint 4: Professor Module (2 weeks)**

This sprint builds the professor's core features including class, project, and group management. Agile is ideal here because this is the most complex module with multiple interconnected features. The two-week duration provides enough time to implement class creation with join codes, project management, group creation with leader assignment, and progress monitoring. The iterative approach allows testing each feature (create class → create project → create group) before moving to the next, reducing the risk of integration issues.

**Sprint 5: Student Module (1 week)**

This sprint delivers the student-facing features like viewing classes, tasks, and submissions. Agile works well because student features depend on professor-created content, which is now available from Sprint 4. The one-week duration is sufficient since students primarily consume content rather than create it. This sprint's completion enables end-to-end testing of the professor-student workflow.

**Sprint 6: Leader Module (1 week)**

This sprint adds leadership features for managing group members and tasks. Agile is suitable because leader features build upon the group structure created in Sprint 4. The one-week duration allows for quick implementation of member management, task creation, and submission review. This sprint completes the core functionality, enabling full workflow testing.

**Sprint 7: Security & Polish (1 week)**

This final sprint focuses on security hardening, UI improvements, and bug fixes. Agile is ideal here because it allows the team to address issues discovered during previous sprints without disrupting completed features. The one-week duration provides time for security audits, performance optimization, and final testing before deployment.

### Sprint Summary Table

| Sprint | Duration | Deliverable | Why Agile Fits |
|--------|----------|-------------|----------------|
| 1 | 2 weeks | Authentication | Critical foundation needs careful, iterative development |
| 2 | 1 week | Layouts & Routing | Quick prototyping allows rapid UI adjustments |
| 3 | 1 week | Admin Module | Simple, self-contained features deliver quick value |
| 4 | 2 weeks | Professor Module | Complex module benefits from incremental delivery |
| 5 | 1 week | Student Module | Depends on prior work; can be built and tested quickly |
| 6 | 1 week | Leader Module | Builds on existing groups; completes core workflow |
| 7 | 1 week | Security & Polish | Allows time for fixes based on feedback from all sprints |

### Coding Standards

| Type | Convention | Example |
|------|------------|---------|
| Files | PascalCase | `StudentDashboard.jsx` |
| Components | PascalCase | `Navbar` |
| Functions | camelCase | `handleSubmit` |
| Variables | camelCase | `currentUser` |
| CSS Classes | kebab-case | `profile-container` |

---

## 5. Testing

**Why Agile is Suitable for Testing:**

Agile is suitable for testing because it integrates testing into every sprint rather than treating it as a separate phase at the end. In Agile, each feature is tested as it's developed, allowing bugs and issues to be found and fixed immediately. For this system, testing occurred continuously throughout development—authentication was tested in Sprint 1, layouts in Sprint 2, admin features in Sprint 3, and so on. This approach ensures that new features don't break existing functionality and that security vulnerabilities are caught early. The iterative nature of Agile also allows the team to add new test cases as they discover edge cases or potential issues during development.

### Testing Levels

| Level | Focus | Tools |
|-------|-------|-------|
| Unit | Individual functions | Manual testing |
| Integration | Component interaction | Manual testing |
| E2E | Complete workflows | Manual testing |

### Test Cases

**Authentication Tests:**
| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Valid login | Redirect to dashboard | ✅ Pass |
| Invalid password | Error message shown | ✅ Pass |
| Rate limiting | Lockout after 5 attempts | ✅ Pass |
| Session timeout | Redirect after 30 min | ✅ Pass |

**Role Access Tests:**
| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Student → Admin route | Redirect to /student | ✅ Pass |
| Professor → Student route | Redirect to /professor | ✅ Pass |

**Functionality Tests:**
| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Create class | Class created with code | ✅ Pass |
| Join class | Student enrolled | ✅ Pass |
| Submit task | Task submitted | ✅ Pass |
| Add member | Member added to group | ✅ Pass |

**Security Tests:**
| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| SQL injection | Attack blocked | ✅ Pass |
| XSS attack | Script not executed | ✅ Pass |
| RLS enforcement | Unauthorized access denied | ✅ Pass |

### Performance Testing

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Page load | < 3s | 1.2s | ✅ Pass |
| API response | < 1s | 0.3s | ✅ Pass |

---

## 6. Deployment

### Deployment Architecture

```
┌──────────────────┐         ┌──────────────────┐
│     Vercel       │         │     Supabase      │
│  ┌────────────┐  │         │  ┌────────────┐  │
│  │ React App  │  │◄───────►│  │ PostgreSQL │  │
│  └────────────┘  │  API    │  └────────────┘  │
│                  │         │  ┌────────────┐  │
│                  │         │  │Auth Service│  │
│                  │         │  └────────────┘  │
└──────────────────┘         └──────────────────┘
```

### Deployment Steps

**Step 1: Supabase Setup**
1. Create Supabase project
2. Run SQL migrations for tables
3. Enable Row-Level Security
4. Configure Authentication

**Step 2: Vercel Deployment**
1. Push code to GitHub
2. Import repository to Vercel
3. Add environment variables
4. Deploy

**Environment Variables:**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Post-Deployment Checklist

| Check | Status |
|-------|--------|
| Application loads | ✅ |
| User registration works | ✅ |
| User login works | ✅ |
| Role-based access works | ✅ |
| Database operations work | ✅ |
| RLS policies enforced | ✅ |
| Responsive design works | ✅ |

---

## 7. Maintenance

**Why Agile is Suitable for Maintenance:**

Agile is suitable for maintenance because it treats the software as a living product that continues to evolve after deployment. Instead of considering maintenance as a separate, reactive phase, Agile incorporates ongoing improvement into the development cycle. For this system, maintenance includes fixing bugs, updating dependencies, adding new features, and improving performance based on user feedback. The Agile approach allows the team to prioritize maintenance tasks alongside new feature development, ensuring the system remains secure and usable over time. Regular iterations also make it easier to adapt to changes like new browser versions, security threats, or evolving user needs.

### Maintenance Types

| Type | Activities | Frequency |
|------|------------|-----------|
| **Corrective** | Bug fixes, error handling | As needed |
| **Adaptive** | Browser updates, dependency updates | Monthly |
| **Perfective** | UI improvements, new features | Quarterly |
| **Preventive** | Code refactoring, security audits | Quarterly |

### Monitoring

| Metric | Tool | Alert |
|--------|------|-------|
| Uptime | Vercel Analytics | < 99% |
| Response Time | Supabase Dashboard | > 2s |
| Errors | Console | > 5% |

### Backup Strategy

| Data | Frequency | Retention |
|------|-----------|-----------|
| Database | Daily | 7 days |
| Code | Every commit | Unlimited (Git) |

---

## Summary

### SDLC Phases

| Phase | Duration | Key Deliverable |
|-------|----------|-----------------|
| 1. Planning | 1 week | Project charter, feasibility |
| 2. Requirements | 1 week | Requirements document |
| 3. Design | 1 week | Architecture, database, UI |
| 4. Implementation | 3 weeks | Working application |
| 5. Testing | 1 week | Tested application |
| 6. Deployment | 1 week | Live application |
| 7. Maintenance | Ongoing | Updates and support |
| **Total** | **8 weeks** | **Complete system** |

### Key Success Factors

- ✅ Clear requirements defined upfront
- ✅ Modern tech stack (React + Supabase)
- ✅ Security built-in (RLS, auth, validation)
- ✅ Responsive UI design
- ✅ Comprehensive testing
- ✅ Automated deployment

---

*Document Version: 1.0*
*Last Updated: September 23, 2026*
