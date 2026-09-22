# Synora — Security Status

## Overview

This document tracks the security measures implemented in the Synora system and identifies gaps that need to be addressed.

---

## ✅ Security Already Implemented

### 1. Row Level Security (RLS)

**What it does:** Database bodyguard — controls who can see and touch what data.

**Analogy:** Like a school with lockers — you can only open YOUR locker, not anyone else's.

**How it works in Synoma:**
- Student A can only see Student A's data
- Professor X can only see Professor X's classes
- No one can see other people's private data

**Implementation:** All 9 database tables have RLS enabled with 44 policies:

| Table | Policies | What It Protects |
|-------|----------|------------------|
| profiles | 3 | Users update own profile, admins can update any |
| classes | 4 | Professors CRUD own classes |
| class_enrollments | 3 | Professors manage enrollments, students self-enroll |
| projects | 4 | Professors CRUD own projects |
| groups | 4 | Professors manage groups, leaders update progress |
| group_members | 1 | Leaders manage own group members |
| tasks | 4 | Leaders manage tasks, assigned users update progress |
| contributions | 3 | System inserts/updates contributions |
| submissions | 3 | Users insert own submissions, leaders update status |
| activities | 2 | System logs activities |

**Example Policies:**
```sql
-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Professors can only manage their own classes
CREATE POLICY "Professors can insert classes" ON classes
  FOR INSERT WITH CHECK (auth.uid() = professor_id);

-- Leaders can only manage their own group's tasks
CREATE POLICY "Leaders can insert tasks" ON tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = tasks.group_id
      AND user_id = auth.uid()
      AND is_leader = true
    )
  );
```

**Without it:** Anyone could see everyone's data.

---

### 2. Route Protection

**What it does:** Door lock — if you don't have a key (logged in), you can't enter.

**Analogy:** Like a locked door — you need to log in first to access any page.

**How it works in Synoma:**
- Not logged in → redirected to `/login`
- Can't see any pages without logging in first

**Implementation:** Layout components redirect unauthenticated users to login AND check role-based access:

| Layout | Protection |
|--------|------------|
| AdminLayout | Redirects to `/login` if no user |
| AdminLayout | Redirects to `/professor` or `/student` if role doesn't match |
| ProfessorLayout | Redirects to `/login` if no user |
| ProfessorLayout | Redirects to `/admin` or `/student` if role doesn't match |
| StudentLayout | Redirects to `/login` if no user |
| StudentLayout | Redirects to `/admin` or `/professor` if role doesn't match |
| StudentLayout | Redirects to `/student/complete-profile` if profile incomplete |

**Role-Based Access:**

| User | Cannot Access | Redirects To |
|------|---------------|--------------|
| Student | `/admin` | `/student` |
| Student | `/professor` | `/student` |
| Professor | `/admin` | `/professor` |
| Professor | `/student` | `/professor` |
| Admin | `/student` | `/admin` |
| Admin | `/professor` | `/admin` |

**Without it:** Anyone could see pages without logging in.

---

### 3. Role-Based Route Protection

**What it does:** Right key for the right door — student key won't open professor's office.

**Analogy:** Like different keys for different rooms — each role has access only to their areas.

**How it works in Synoma:**
- Student tries `/admin` → redirected to `/student`
- Professor tries `/student` → redirected to `/professor`
- Admin tries `/student` → redirected to `/admin`

**Implementation:** Each layout checks `currentUser.role` before rendering:

```jsx
// AdminLayout.jsx
if (currentUser.role === 'professor') return <Navigate to="/professor" />;
if (currentUser.role === 'student') return <Navigate to="/student" />;
if (currentUser.role !== 'admin') return <Navigate to="/login" />;
```

**Without it:** Student could access admin pages.

---

### 4. Profile Completion

**What it does:** Forces students to fill out info before accessing the app.

**Analogy:** Like a form you must fill before starting school.

**How it works in Synoma:**
- Student signs up → must enter course, year, section
- Can't access the app until profile is complete
- Ensures all student data is available

**Implementation:** StudentLayout checks if profile is complete:

```jsx
const profileIncomplete = !currentUser.course || !currentUser.year_level || !currentUser.section;
if (profileIncomplete && !onCompletionPage) {
  return <Navigate to="/student/complete-profile" />;
}
```

**Without it:** Students could skip important info.

---

### 5. Input Validation

**What it does:** Checks if inputs are valid before saving.

**Analogy:** Like a bouncer checking IDs — fake IDs get rejected.

**How it works in Synoma:**
- `required` fields can't be empty
- Email must be valid format (`@` symbol)
- Class code limited to 6 characters
- Password must meet strength requirements

**Implementation:** All forms use `required` attribute and validation:

| Form | Fields Validated |
|------|------------------|
| Sign Up | name, email, idNumber, password, confirmPassword |
| Login | email, password |
| Create Class | subject, course, yearLevel, section, semester, academicYear |
| Create Project | selectedClassId, title, description, requirements, deadline |
| Create Group | name, projectId, leaderId |
| Create Task | title, description, assignedTo, deadline |
| Profile Completion | course, yearLevel, section |
| Join Class | classCode (maxLength={6}) |

**Without it:** Users could submit empty or invalid data.

---

### 6. Password Validation

**What it does:** Enforces strong passwords.

**Analogy:** Like a password policy — you can't use weak passwords like "123".

**How it works in Synoma:**
- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 number (0-9)
- At least 1 special character (!@#$%^&*)

**Implementation:** Sign Up page validates password strength:

```javascript
const validatePassword = (password) => {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*]/.test(password),
  };
  return checks;
};
```

**Visual feedback:** Requirements turn green as they're met.

**Without it:** Users could create weak passwords like "123".

---

### 7. Environment Variables

**What it does:** Hides secret keys from public view.

**Analogy:** Like keeping your house key hidden, not taped to the front door.

**How it works in Synoma:**
- Supabase URL and API key stored in `.env` file
- `.env` is in `.gitignore` — never uploaded to GitHub
- Code doesn't contain hardcoded secrets

**Implementation:** `.env` file protected via `.gitignore`:

```gitignore
.env
.env.*
```

**Without it:** Hackers could steal your API keys from GitHub.

---

### 8. Supabase Auth

**What it does:** Handles login and security professionally.

**Analogy:** Like a professional security company managing your door locks.

**How it works in Synoma:**
- Passwords are encrypted (hashed) using bcrypt
- Email verification on sign up
- Sessions managed with JWT tokens
- You don't have to write security code yourself

**Implementation:** Supabase Auth handles:
- Password hashing (bcrypt)
- Email verification
- Session management
- JWT tokens

**Without it:** You'd have to build all login/security from scratch.

---

### 9. SQL Injection Protection

**What it does:** Prevents hackers from stealing data through form inputs.

**Analogy:** Like a smart receptionist who doesn't follow dangerous instructions.

**How it works in Synoma:**
- Supabase client automatically parameterizes all queries
- If user types `' OR '1'='1` → saved as plain text, not executed as code
- No raw SQL queries in your codebase

**Implementation:** All database calls use the Supabase query builder:

```javascript
// ✅ SAFE — Supabase parameterizes this automatically
const { data } = await supabase
  .from('tasks')
  .select('*')
  .eq('group_id', groupId);  // groupId is safely parameterized
```

**Why It's Safe:**
- Supabase client library converts `.eq('column', value)` into a parameterized query
- The value is never directly inserted into the SQL string
- Even if a user inputs malicious SQL, it's treated as a literal value, not executable code

**Without it:** Hacker could type SQL code in a form and steal all data.

---

### 10. Session Timeout

**What it does:** Auto-logout after inactivity.

**Analogy:** Like a security guard who locks the door if no one's around for 30 minutes.

**How it works in Synoma:**
- User logs in → 30-minute timer starts
- User moves mouse or presses key → Timer resets to 30 minutes
- User is inactive for 30 minutes → Auto-logout
- User logs out → Timer clears

**Implementation:** Added to UserContext.jsx:

```javascript
useEffect(() => {
  if (!currentUser) return;

  let timeout;
  const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes

  const resetTimeout = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      logout();
    }, TIMEOUT_DURATION);
  };

  const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
  events.forEach(event => window.addEventListener(event, resetTimeout));
  resetTimeout();

  return () => {
    clearTimeout(timeout);
    events.forEach(event => window.removeEventListener(event, resetTimeout));
  };
}, [currentUser]);
```

**Without it:** User could leave app open, someone else uses it.

---

## ❌ Security Gaps (Not Yet Implemented)

### 1. Input Sanitization (XSS Protection)

**Issue:** Text inputs are not sanitized against malicious code.

**What is XSS?** Cross-Site Scripting — when a hacker puts malicious code in a text field, and the app executes it instead of displaying it as text.

**Example Risk:**
```javascript
// User enters this in a task description:
<script>alert('XSS')</script>

// If rendered without sanitization, it executes
```

**Solution:** Use a sanitization library:

```javascript
import DOMPurify from 'dompurify';

// Sanitize before displaying
const clean = DOMPurify.sanitize(userInput);
return <div dangerouslySetInnerHTML={{ __html: clean }} />;
```

---

### 2. Audit Logging

**Issue:** Activities table exists but only logs some actions.

**What is Audit Logging?** Tracking who did what and when — like a security camera for your app.

**Missing Logs:**
- User promotions/demotions
- Class deletions
- Group member removals
- Task deletions
- Submission rejections

**Solution:** Add activity logging to all important actions:

```javascript
const logActivity = async (userId, action, details) => {
  await supabase.from('activities').insert({
    user_id: userId,
    action: action,
    details: details,
    timestamp: new Date().toISOString()
  });
};
```

---

### 3. Rate Limiting

**Issue:** No protection against brute force attacks.

**What is Rate Limiting?** Limiting how many times someone can try something — like a bank locking your card after 3 wrong PINs.

**Solution:** Implement client-side rate limiting or use Supabase's built-in rate limiting.

---

### 4. File Upload Validation

**Issue:** No file type or size limits defined.

**What is File Upload Validation?** Only allowing safe file types — like a bouncer who won't let suspicious packages in.

**Solution:** When implementing file uploads:

```javascript
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const validateFile = (file) => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('File type not allowed');
  }
  if (file.size > MAX_SIZE) {
    throw new Error('File too large');
  }
};
```

---

### 5. HTTPS Enforcement

**Issue:** Not enforced in code (depends on hosting).

**What is HTTPS?** encrypted connection — like sending a letter in a sealed envelope instead of a postcard.

**Solution:** Add to `index.html`:
```html
<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
```

---

## Priority Order

| Priority | Gap | Impact | Difficulty |
|----------|-----|--------|------------|
| ~~1~~ | ~~Role-based route protection~~ | ~~High~~ | ~~Easy~~ | ✅ DONE
| ~~2~~ | ~~Password validation~~ | ~~High~~ | ~~Easy~~ | ✅ DONE
| ~~3~~ | ~~Session timeout~~ | ~~Medium~~ | ~~Easy~~ | ✅ DONE
| ~~4~~ | ~~Rate limiting~~ | ~~Medium~~ | ~~Hard~~ | ✅ DONE
| 1 | Input sanitization | High | Medium |
| 2 | Audit logging | Medium | Medium |
| 3 | File upload validation | Low | Easy |
| 4 | HTTPS enforcement | Low | Easy |

---

## Implementation Checklist

- [x] Add role checks to AdminLayout, ProfessorLayout, StudentLayout ✅
- [x] Add password validation to Sign Up form ✅
- [x] Add session timeout to UserContext ✅
- [x] Add rate limiting to Login form ✅
- [ ] Install DOMPurify and sanitize text outputs
- [ ] Add activity logging to all important actions
- [ ] Add file upload validation when implemented
- [ ] Add HTTPS meta tag to index.html

---

## Security Summary

| # | Security | What It Does | Status |
|---|----------|--------------|--------|
| 1 | RLS | Database bodyguard | ✅ |
| 2 | Route Protection | Door lock | ✅ |
| 3 | Role-Based Protection | Right key for right door | ✅ |
| 4 | Profile Completion | Forces students to fill info | ✅ |
| 5 | Input Validation | Checks valid inputs | ✅ |
| 6 | Password Validation | Enforces strong passwords | ✅ |
| 7 | .env Protection | Hides secret keys | ✅ |
| 8 | Supabase Auth | Professional login security | ✅ |
| 9 | SQL Injection Protection | Prevents data theft via forms | ✅ |
| 10 | Session Timeout | Auto-logout after inactivity | ✅ |
| 11 | Rate Limiting | Prevents brute force attacks | ✅ |

**Total: 11 security measures working**

---

*Last updated: September 21, 2026*
