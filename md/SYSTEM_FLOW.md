# Synora — System Flowchart

---

## System Overview

This is the high-level view of the entire Synora system. It shows how the four user roles (Admin, Professor, Student, Leader) interact with the system after logging in.

**Key Points:**
- The system checks the user's role after authentication
- Admins manage users and can promote students to professors
- Professors manage classes, projects, and groups
- Students who are group leaders get additional access to manage their group
- Regular students can only view their group and tasks

```mermaid
flowchart TD
    A([Start]) --> AUTH[Authentication]
    AUTH --> ROLE{Check Role}
    ROLE -->|Admin| ADMIN[Admin Dashboard]
    ROLE -->|Professor| PROF[Professor Dashboard]
    ROLE -->|Student| CHECK_LEADER{Is Leader of a Group?}

    CHECK_LEADER -->|Yes| STUD_LEAD[Student Dashboard with Leader Access]
    CHECK_LEADER -->|No| STUD_DASH[Student Dashboard Only]

    ADMIN --> ADMIN_ACTIONS[Manage Users]
    PROF --> PROF_ACTIONS[Manage Classes and Projects]
    STUD_LEAD --> LEADER_ACTIONS[Manage Group and Tasks]
    STUD_LEAD --> STUDENT_ACTIONS[View Group and Tasks]
    STUD_DASH --> STUDENT_ACTIONS2[View Group and Tasks]

    ADMIN_ACTIONS --> PROMOTE{Promote Student to Professor?}
    PROMOTE -->|Yes| CHANGE_ROLE[Update role to Professor]
    PROMOTE -->|No| ADMIN_ACTIONS
    CHANGE_ROLE --> NOTIFY_PROF[Professor Can Now Create Classes]

    ADMIN_ACTIONS --> Z([End])
    PROF_ACTIONS --> Z
    LEADER_ACTIONS --> Z
    STUDENT_ACTIONS --> Z
    STUDENT_ACTIONS2 --> Z
    NOTIFY_PROF --> Z
```

---

## Authentication Flow

This flow handles user login, sign up, and profile setup. It's the entry point for all users.

**Key Points:**
- New users must sign up with email, ID number, full name, and password
- After sign up, students must complete their profile (course, year, section)
- Returning users are logged in and redirected to their dashboard
- The system checks if the user is a leader to determine dashboard access
- Invalid credentials show an error and allow retry

```mermaid
flowchart TD
    A([Start]) --> OPEN_APP[Open App]
    OPEN_APP --> LOGGED_IN{Already Logged In?}

    LOGGED_IN -->|Yes| GET_PROFILE[Fetch Profile]
    LOGGED_IN -->|No| SHOW_AUTH[Show Login or Sign Up]

    GET_PROFILE --> PROFILE_EXISTS{Profile Exists?}
    PROFILE_EXISTS -->|Yes| REDIRECT[Redirect to Dashboard]
    PROFILE_EXISTS -->|No| SHOW_COMPLETE[Show Profile Completion]

    SHOW_COMPLETE --> FILL_FORM[Fill Course, Year, Section]
    FILL_FORM --> SAVE_PROFILE[Save Profile]
    SAVE_PROFILE --> REDIRECT

    SHOW_AUTH --> CHOOSE{Choose Action}
    CHOOSE -->|Sign Up| SIGNUP["Enter Email, ID Number, Full Name, Password"]
    CHOOSE -->|Login| LOGIN[Enter Email and Password]

    SIGNUP --> CREATE_AUTH[Create Auth User]
    CREATE_AUTH --> SHOW_COMPLETE

    LOGIN --> CHECK_AUTH[Verify Credentials]
    CHECK_AUTH --> AUTH_OK{Valid?}
    AUTH_OK -->|Yes| GET_PROFILE
    AUTH_OK -->|No| SHOW_ERROR[Show Error]
    SHOW_ERROR --> SHOW_AUTH

    REDIRECT --> ROLE_CHECK{Check Role}
    ROLE_CHECK -->|Admin| ADMIN_DASH[Admin Dashboard]
    ROLE_CHECK -->|Professor| PROF_DASH[Professor Dashboard]
    ROLE_CHECK -->|Student| CHECK_LEADER{Is Leader of a Group?}

    CHECK_LEADER -->|Yes| STUD_LEAD[Student Dashboard with Leader Access]
    CHECK_LEADER -->|No| STUD_DASH[Student Dashboard Only]

    ADMIN_DASH --> Z([End])
    PROF_DASH --> Z
    STUD_LEAD --> Z
    STUD_DASH --> Z
```

---

## Admin Flow — User Management

This flow shows how the admin manages users in the system. The admin can view, filter, promote, demote, or deactivate users.

**Key Points:**
- Admin can filter users by role (Students, Professors, or All)
- Selecting a user shows their detail page
- Three actions available: Promote, Demote, or Deactivate
- Promote changes a student's role to professor
- Demote changes a professor's role back to student
- Deactivate disables the user's account
- All changes are saved and the user list refreshes

```mermaid
flowchart TD
    A([Start]) --> ADMIN_DASH[Admin Dashboard]
    ADMIN_DASH --> VIEW_USERS[View All Users]
    VIEW_USERS --> FILTER{Filter by Role}
    FILTER -->|Students| SHOW_STUDENTS[Show Students]
    FILTER -->|Professors| SHOW_PROFESSORS[Show Professors]
    FILTER -->|All| SHOW_ALL[Show All Users]

    SHOW_STUDENTS --> SELECT_USER[Select a User]
    SHOW_PROFESSORS --> SELECT_USER
    SHOW_ALL --> SELECT_USER

    SELECT_USER --> USER_DETAIL[User Detail Page]
    USER_DETAIL --> ACTIONS{Choose Action}
    ACTIONS -->|Promote| PROMOTE[Change Role to Professor]
    ACTIONS -->|Demote| DEMOTE[Change Role to Student]
    ACTIONS -->|Deactivate| DEACTIVATE[Deactivate Account]

    PROMOTE --> SAVE[Save Change]
    DEMOTE --> SAVE
    DEACTIVATE --> SAVE

    SAVE --> VIEW_USERS
    VIEW_USERS --> Z([End])
```

---

## Promotion Flow — Student to Professor

This flow shows the detailed steps when an admin promotes a student to professor. It includes confirmation, data cleanup, and notification.

**Key Points:**
- Admin selects a student and clicks "Promote to Professor"
- A confirmation dialog appears to prevent accidental promotions
- If confirmed, the system updates the user's role from student to professor
- Any existing class enrollments are cleared (professors don't enroll in classes)
- The action is logged in the activity table
- The promoted user receives a notification
- The user list refreshes to show the updated role

```mermaid
flowchart TD
    A([Start]) --> ADMIN[Admin Views Users]
    ADMIN --> FIND_STUDENT[Find Student to Promote]
    FIND_STUDENT --> SELECT[Select Student]
    SELECT --> CLICK_PROMOTE[Click Promote to Professor]
    CLICK_PROMOTE --> CONFIRM{Confirm Promotion?}

    CONFIRM -->|No| CANCEL[Cancel]
    CONFIRM -->|Yes| UPDATE_ROLE[Update role from student to professor]
    UPDATE_ROLE --> CLEAR_CLASSES[Clear any class enrollments]
    CLEAR_CLASSES --> LOG_ACTION[Log Activity: Promoted]
    LOG_ACTION --> NOTIFY_USER[User Gets Notification]
    NOTIFY_USER --> REFRESH[Refresh User List]

    CANCEL --> ADMIN
    REFRESH --> Z([End])
```

---

## Professor Flow

This flow shows how a professor manages their classes, projects, and groups. It's the main workflow for professors.

**Key Points:**
- Professor starts at the dashboard and views all their classes
- Can create a new class (auto-generates a 6-character code for students)
- Can select an existing class to view details
- From class detail, can add projects, view enrolled students, or select a project
- From project detail, can add groups (with leader and members) or view group progress
- The flow loops back after each action, allowing multiple operations

```mermaid
flowchart TD
    A([Start]) --> PROF_DASH[Professor Dashboard<br/>View all classes]
    PROF_DASH --> VIEW_CLASSES[View Classes]

    VIEW_CLASSES --> CREATE_CLASS[Create Class<br/>Subject, Program, Year, Section, Semester<br/>Auto-generates 6-char code]
    VIEW_CLASSES --> SELECT_CLASS[Select a Class]
    CREATE_CLASS --> VIEW_CLASSES

    SELECT_CLASS --> CLASS_DETAIL[Class Detail<br/>Overall progress, enrolled students]
    CLASS_DETAIL --> ADD_PROJECT[Add Project<br/>Title, Description, Deadline]
    CLASS_DETAIL --> VIEW_STUDENTS[View Students<br/>See who enrolled via code]
    CLASS_DETAIL --> SELECT_PROJECT[Select a Project]

    ADD_PROJECT --> CLASS_DETAIL
    VIEW_STUDENTS --> CLASS_DETAIL

    SELECT_PROJECT --> PROJECT_DETAIL[Project Detail<br/>Progress by group]
    PROJECT_DETAIL --> ADD_GROUP[Add Group<br/>Name, Pick leader, Add members]
    PROJECT_DETAIL --> VIEW_GROUPS[View Groups<br/>See group progress]

    ADD_GROUP --> PROJECT_DETAIL
    VIEW_GROUPS --> PROJECT_DETAIL

    PROJECT_DETAIL --> Z([End])
```

---

## Student Flow

This flow shows how a student interacts with the system — joining classes, viewing projects, and submitting tasks.

**Key Points:**
- Student starts at the dashboard and views enrolled classes
- Can join a new class by entering a 6-character code from the professor
- If the code is valid, enrollment succeeds; if not, an error is shown
- Can select a class to view its projects
- Can select a project to view its groups
- If assigned to a group, can view members, tasks, and contribution stats
- Can select a task and submit work with a comment/description
- If not assigned to a group, waits to be assigned by the leader
- "Done" option exits the flow

```mermaid
flowchart TD
    A([Start]) --> STUD_DASH[Student Dashboard<br/>View enrolled classes]
    STUD_DASH --> VIEW_ENROLLED[View Enrolled Classes]

    VIEW_ENROLLED --> JOIN_CLASS{Join New Class?}
    JOIN_CLASS -->|Yes| ENTER_CODE[Enter 6 Char Class Code]
    ENTER_CODE --> VALIDATE{Code Valid?}
    VALIDATE -->|Yes| ENROLLED[Enrolled Successfully]
    VALIDATE -->|No| SHOW_ERR[Show Error]
    SHOW_ERR --> ENTER_CODE

    ENROLLED --> VIEW_ENROLLED

    JOIN_CLASS -->|No| SELECT_CLASS[Select a Class]
    SELECT_CLASS --> CLASS_VIEW[View Class Projects]

    CLASS_VIEW --> SELECT_PROJECT[Select a Project]
    SELECT_PROJECT --> PROJECT_VIEW[View Project Groups]

    PROJECT_VIEW --> MY_GROUP{In a Group?}
    MY_GROUP -->|Yes| GROUP_VIEW[View My Group]
    MY_GROUP -->|No| NO_GROUP[No Group Assigned]

    GROUP_VIEW --> GROUP_OPTIONS{Choose Action}
    GROUP_OPTIONS -->|View Members| VIEW_MEMBERS[See All Members]
    GROUP_OPTIONS -->|View Tasks| VIEW_TASKS[See My Assigned Tasks]
    GROUP_OPTIONS -->|My Stats| MY_STATS[View Contribution Stats]
    GROUP_OPTIONS -->|Done| Z([End])

    VIEW_MEMBERS --> GROUP_VIEW
    VIEW_TASKS --> TASK_LIST[Task List with Status]
    MY_STATS --> GROUP_VIEW

    TASK_LIST --> SELECT_TASK[Select a Task]
    SELECT_TASK --> TASK_DETAIL[Task Detail]
    TASK_DETAIL --> SUBMIT{Submit Work?}
    SUBMIT -->|Yes| ADD_COMMENT[Add Comment and Description]
    ADD_COMMENT --> SAVE_SUBMISSION[Save Submission]
    SAVE_SUBMISSION --> UPDATE_STATUS[Update Task Status to Submitted]
    UPDATE_STATUS --> GROUP_VIEW
    SUBMIT -->|No| GROUP_VIEW

    NO_GROUP --> WAIT["Wait to be assigned to a group"]
    WAIT --> Z
```

---

## Leader Flow

This flow shows how a group leader manages their group — adding/removing members, creating tasks, and reviewing submissions.

**Key Points:**
- Leader starts at the dashboard and views their groups
- Can select a group to open the Group Workspace
- From the workspace, can access Overview, Members, or Tasks
- **Members tab:** Add students from the class or remove members
- **Tasks tab:** Create new tasks (with title, description, assignee, deadline, priority) or review submitted tasks
- **Review decisions:** Verify (approve), Needs Revision (send back), or Reject
- If revision or rejection, leader adds feedback for the student
- "Done" option exits the flow

```mermaid
flowchart TD
    A([Start]) --> LEAD_DASH["Leader Dashboard<br/>View my groups"]
    LEAD_DASH --> VIEW_GROUPS["View My Groups"]
    VIEW_GROUPS --> SELECT_GROUP["Select a Group"]
    SELECT_GROUP --> WORKSPACE["Group Workspace<br/>Overview, Members, Tasks"]

    WORKSPACE --> WS_OPTIONS{"Choose Action"}
    WS_OPTIONS -->|Overview| OVERVIEW["View Progress and Stats"]
    WS_OPTIONS -->|Members| MEMBERS_TAB["Manage Members"]
    WS_OPTIONS -->|Tasks| TASKS_TAB["Manage Tasks"]
    WS_OPTIONS -->|Done| Z([End])

    OVERVIEW --> WORKSPACE

    MEMBERS_TAB --> MEMBER_ACTIONS{"Add or Remove?"}
    MEMBER_ACTIONS -->|Add| ADD_MEMBER["Select Student from Class"]
    MEMBER_ACTIONS -->|Remove| REMOVE_MEMBER["Remove Member"]
    MEMBER_ACTIONS -->|Back| WORKSPACE

    ADD_MEMBER --> SAVE_MEMBER["Save Member"]
    REMOVE_MEMBER --> WORKSPACE
    SAVE_MEMBER --> MEMBERS_TAB

    TASKS_TAB --> TASK_ACTIONS{"Create or Review?"}
    TASK_ACTIONS -->|Create| CREATE_TASK["Title, Description, Assign, Deadline, Priority"]
    TASK_ACTIONS -->|Review| REVIEW_LIST["View Submitted Tasks"]
    TASK_ACTIONS -->|Back| WORKSPACE

    CREATE_TASK --> SAVE_TASK["Save Task"]
    SAVE_TASK --> TASKS_TAB

    REVIEW_LIST --> SELECT_TASK2["Select a Task"]
    SELECT_TASK2 --> REVIEW_TASK["Review Submission"]
    REVIEW_TASK --> REVIEW_DECISION{"Verify, Revision, or Reject?"}

    REVIEW_DECISION -->|Verify| VERIFIED["Status to Verified"]
    REVIEW_DECISION -->|Needs Revision| REVISION["Status to Needs Revision"]
    REVIEW_DECISION -->|Reject| REJECTED["Status to Rejected"]

    VERIFIED --> TASKS_TAB
    REVISION --> ADD_FEEDBACK["Add Leader Feedback"]
    REJECTED --> ADD_FEEDBACK
    ADD_FEEDBACK --> TASKS_TAB
```

---

## Data Flow

This flow shows how data moves between users and the database. It visualizes the relationships between actions and database tables.

**Key Points:**
- **Professor** creates classes, projects, and groups → saved to respective tables
- **Student** joins classes using a code → saved to class_enrollments
- **Student** submits tasks → saved to submissions table
- **Leader** creates and assigns tasks → saved to tasks table
- **Leader** reviews submissions → updates tasks and submissions
- Task progress automatically updates contributions
- All actions are logged in the activities table

```mermaid
flowchart LR
    subgraph PROF[Professor]
        P1[Creates Class]
        P2[Creates Project]
        P3[Creates Group]
    end

    subgraph STUD[Student]
        S1[Joins Class]
        S2[Views Project]
        S3[Submits Task]
    end

    subgraph LEAD[Leader]
        L1[Creates Task]
        L2[Assigns Task]
        L3[Reviews Submission]
    end

    subgraph DB[(Supabase DB)]
        DB1[profiles]
        DB2[classes]
        DB3[projects]
        DB4[groups]
        DB5[group_members]
        DB6[tasks]
        DB7[submissions]
        DB8[contributions]
        DB9[activities]
    end

    P1 --> DB2
    P2 --> DB3
    P3 --> DB4
    S1 -->|class_code| DB2
    S3 --> DB7
    L1 --> DB6
    L2 --> DB6
    L3 --> DB6
    L3 --> DB7

    DB6 -->|progress| DB8
    DB7 -->|status| DB6
    DB9 -->|track| DB1
```

---

## Progress Calculation (Set Aside)

This flow shows how group progress is calculated using weighted task statuses. This feature is set aside for future implementation.

**Key Points:**
- The system gets all tasks for a group
- Each task's status is checked and assigned a weight:
  - Verified = 100%
  - Submitted = 80%
  - Under Review = 80%
  - In Progress = 50%
  - Needs Revision = 30%
  - Assigned = 0%
- Weights are summed and divided by total tasks
- Result is displayed as a progress percentage
- This formula is more accurate than just counting verified tasks

```mermaid
flowchart TD
    A([Start]) --> GET_TASKS[Get All Tasks for Group]
    GET_TASKS --> LOOP[For Each Task]
    LOOP --> CHECK_STATUS{Check Task Status}

    CHECK_STATUS -->|Verified| W1[Weight = 100%]
    CHECK_STATUS -->|Submitted| W2[Weight = 80%]
    CHECK_STATUS -->|Under Review| W3[Weight = 80%]
    CHECK_STATUS -->|In Progress| W4[Weight = 50%]
    CHECK_STATUS -->|Needs Revision| W5[Weight = 30%]
    CHECK_STATUS -->|Assigned| W6[Weight = 0%]

    W1 --> SUM[Add to Total]
    W2 --> SUM
    W3 --> SUM
    W4 --> SUM
    W5 --> SUM
    W6 --> SUM

    SUM --> NEXT{More Tasks?}
    NEXT -->|Yes| LOOP
    NEXT -->|No| CALC[Calculate Average]

    CALC --> FORMULA[Progress = Sum / Total Tasks x 100]
    FORMULA --> DISPLAY[Display Progress Bar]
    DISPLAY --> Z([End])
```

---

## Grading Flow (Set Aside)

This flow shows how individual student grades are calculated using a hybrid system of auto-calculated and manually-evaluated criteria. This feature is set aside for future implementation.

**Key Points:**
- Professor defines grading criteria with weights (must total 100%)
- Criteria can be Auto (system calculates) or Manual (leader evaluates)
- **Auto criteria:**
  - Task Completion = (completed tasks / assigned tasks) × 100
  - Punctuality = (on-time submissions / total submissions) × 100
- **Manual criteria:**
  - Leader inputs a score (0-100) for each member
- System computes the final grade using weighted average
- Student can view their grade breakdown

```mermaid
flowchart TD
    A([Start]) --> PROF_DEF[Professor Defines Criteria]
    PROF_DEF --> SET_WEIGHTS[Set Weights Must = 100%]

    SET_WEIGHTS --> AUTO_MANUAL{Type?}
    AUTO_MANUAL -->|Auto| AUTO_CRITERIA[System Calculates]
    AUTO_MANUAL -->|Manual| MANUAL_CRITERIA[Leader Evaluates]

    AUTO_CRITERIA --> TASK_COMP[Task Completion = Completed / Assigned x 100]
    AUTO_CRITERIA --> PUNCT[Punctuality = On Time / Total x 100]

    TASK_COMP --> STORE_AUTO[Store in Breakdown]
    PUNCT --> STORE_AUTO

    MANUAL_CRITERIA --> LEADER_INPUT[Leader Inputs Score 0 to 100]
    LEADER_INPUT --> STORE_MANUAL[Store in leader_evaluations]

    STORE_AUTO --> COMPUTE[Compute Final Grade]
    STORE_MANUAL --> COMPUTE

    COMPUTE --> FORMULA2[Final = Sum of Score x Weight]
    FORMULA2 --> SHOW_GRADE[Show to Student]
    SHOW_GRADE --> Z([End])
```

---

## Block Types Reference

| Shape | Mermaid Syntax | Use For |
|-------|---------------|---------|
| Oval | `([Text])` | Start / End |
| Rectangle | `[Text]` | Process / Action |
| Diamond | `{Text}` | Decision (Yes/No) |
| Parallelogram | `[/Text/]` | Input / Output |
| Subgraph | `subgraph Name ... end` | Grouping |
| Arrow | `-->` | Flow direction |

---

## How to Render

1. **GitHub** — Automatically renders Mermaid in `.md` files
2. **VS Code** — Install "Mermaid Preview" extension
3. **Online** — Paste into [mermaid.live](https://mermaid.live)
4. **Export** — Use mermaid.live to export as PNG/SVG

---

*Last updated: September 21, 2026*
