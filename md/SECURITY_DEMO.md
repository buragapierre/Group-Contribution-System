# Synora — Security Demo Script (for panel defense)

Each step maps to the security grading rubric. Run with both servers up
(frontend `npm run dev`, backend `server/npm run dev`).

---

## 1. Authentication & Password Security (15 pts)

1. Open `/signup` — type a weak password (`abc`). The 4 requirements stay
   red and submit is blocked. Use 8+ chars, uppercase, number, special —
   all turn green and signup succeeds.
2. Open `/login` — enter a wrong password 5 times. After the 5th attempt
   the account locks for 15 minutes with a countdown timer.
3. Enter a wrong email vs wrong password — both show the same generic
   "Invalid email or password." No user enumeration.

Say: "Passwords are hashed with bcrypt by Supabase Auth — the database
never stores plaintext. Lockout blocks brute force at the client, and
Supabase rate-limits auth endpoints server-side."

## 2. Authorization & Access Control (15 pts)

1. Log in as **student**, then manually visit `/admin` — you are
   redirected to `/student`.
2. Visit `/professor` as student — redirected again.
3. Log in via `/admin/login` with a student account — signed straight
   back out with "This portal is for administrators only."
4. In Supabase SQL editor (logged in as a student JWT is harder to demo —
   use the RLS check below instead).

Say: "Every route checks role. Every database table has Row Level Security,
so even a direct API call with a student token cannot read or write
another user's data."

## 3. Input Validation & Injection Protection (15 pts)

1. In the login email field, type `' OR '1'='1` — login fails. The app
   never builds SQL strings; all queries go through parameterized
   Supabase clients, so injection has nothing to target.
2. Create a task titled `<script>alert('xss')</script>` — it renders as
   plain text everywhere. React escapes all output by default.
3. Submit the Create Class form empty — required fields block submit;
   past deadlines are rejected with an error message.

## 4. Data Security & Privacy (10 pts)

1. Show the `profiles` table — there is no password column at all.
2. Show `server/.env` stays on the server; the frontend `.env` holds only
   the public anon key.
3. Proof: `Select-String dist/assets/*.js -Pattern "service_role"`
   returns nothing — the privileged key is absent from the shipped bundle.

## 5. Session & Account Security (10 pts)

1. Log in, wait idle 30 minutes (or shorten the constant to demo) — you
   are auto-logged-out.
2. Stop the backend, log in (works via fallback), restart it — session
   re-verifies through `GET /api/auth/me`; an expired token gets 401 and
   signs you out.

## 6. Protection Against Common Attacks (15 pts)

Covered by demos 1–3 plus: file uploads capped at 10MB per file,
filenames sanitized, uploads isolated per user folder
(`task_<id>/<user_id>/`), and private bucket — leaders open files only
through 1-hour signed URLs issued after an ownership check.

## 7. Security Configuration & Hardening (10 pts)

1. Show `.gitignore` — `.env` files are excluded, `.env.example` kept as
   template.
2. Show there are no default passwords — every account is individually
   registered; professor accounts start `pending` until an admin verifies.
3. Show resigned-admin flow: Users → user → Deactivate Account; the last
   active admin cannot be deactivated or removed.

## 8. Security Testing & Vulnerability Identification (10 pts)

This script IS the evidence. Walk the panel through demos 1–7 in order,
narrating the attack scenario first ("I will try to log in as admin with
a student account...") then showing the control blocking it.

---

*Companion doc: `md/SECURITY_STATUS.md`*
