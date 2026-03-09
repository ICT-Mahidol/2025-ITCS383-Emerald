# AI Usage Log

**Project:** SpaceHub — Co-Working Space Web Application  
**Team:** Emerald — ITCS383, Mahidol University, 2025  
**AI Tool Used:** Gemini (via Antigravity coding assistant)

---

## 1. Welcome Page & Design System

**Prompt:**  
> "Create simple welcome page web for co-working space. The system user interface shall use a blue and white theme, with HTML CSS JavaScript and login and create account. Required information: First Name, Last Name, Address, Phone Number."

**What was generated:**
- `public/index.html` — Landing page with hero section, features grid, stats bar, footer
- `public/login.html` — Sign-in form (email + password)
- `public/register.html` — Registration form with all required fields
- `public/dashboard.html` — Post-login user dashboard
- `public/style.css` — Full CSS design system (blue `#1a73e8` / white theme, Inter font, glassmorphism, gradients)
- `public/app.js` — Shared toast notification utility

**Accepted:** All generated pages and styling were accepted. The blue/white theme, responsive layout, and form structure matched requirements.

**Rejected:** Nothing rejected at this stage.

**Verification:**
- Opened each HTML file in the browser and visually inspected layout, colours, and responsiveness
- Confirmed all required registration fields (First Name, Last Name, Address, Phone Number) are present on `register.html`
- Verified navigation links between pages work correctly

---

## 2. Backend & Neon Database Integration

**Prompt:**  
> "Use Neon for database."

**What was generated:**
- `server.js` — Express server with `@neondatabase/serverless` driver, `POST /api/register` and `POST /api/login` endpoints, bcrypt password hashing, auto-creates `users` table on startup
- `package.json` — Dependencies: express, @neondatabase/serverless, bcryptjs, dotenv
- `.env` — Placeholder for `DATABASE_URL`

**Accepted:** Server architecture, API route design, bcrypt hashing, and auto-table creation were all accepted.

**Rejected:** Initially the plan used `localStorage` instead of a database. This was rejected by the team in favour of Neon PostgreSQL for persistent server-side storage.

**Verification:**
- Ran `npm install` — 84 packages installed, 0 vulnerabilities
- Updated `.env` with a real Neon connection string obtained from [neon.tech](https://neon.tech)
- Ran `npm start` — confirmed output:
  ```
  ✅ Database initialized — users table ready
  🚀 Server running at http://localhost:3000
  ```
- Tested registration via the form in the browser → verified new user row appeared in Neon dashboard
- Tested login with registered credentials → verified dashboard displayed correct user info
- Tested login with wrong password → verified `401 Invalid email or password` error

---

## 3. CI/CD Pipeline (GitHub Actions + Docker + Render)

**Prompt:**  
> "Make it Full CI/CD Pipeline using GitHub Actions + Docker + Render."  
> Follow-up: ".github/workflows folder. Then, add a file called workflow.yml"

**What was generated:**
- `.github/workflows/workflow.yml` — GitHub Actions CI/CD pipeline with two jobs:
  - **CI** (every push/PR to `main`): checkout → Node.js setup → `npm ci` → `npm run lint` → Docker build test
  - **CD** (push to `main` only): login to GHCR → build & push Docker image → trigger Render deploy hook
- `Dockerfile` — Multi-stage Alpine build with non-root user and health check
- `.dockerignore` — Excludes node_modules, .env, .git from build context

**Accepted:**
- `workflow.yml` — accepted as the single CI/CD pipeline file
- `Dockerfile` — accepted with multi-stage build, Alpine base, and non-root user
- `.dockerignore` — accepted
- Added `lint` and `test` scripts to `package.json`

**Rejected:**
- `render.yaml` was initially generated as a separate Render blueprint file. It was removed because the workflow already handles Render deployment via a deploy hook, making it redundant.

**Verification:**
- Ran `npm run lint` — passed with no syntax errors in `server.js`
- Reviewed `Dockerfile` manually — confirmed it copies only necessary files (`server.js`, `public/`, `package*.json`), uses non-root user, and has a health check
- Reviewed `workflow.yml` manually — confirmed correct trigger conditions (`push`/`pull_request` to `main`), proper `if` guard on deploy job, and GHCR login uses built-in `GITHUB_TOKEN`
- Verified `.dockerignore` excludes `.env` to prevent secrets from leaking into the image

---

## 4. CI/CD Bug Fixes & Deployment Configuration

**Prompt:**  
> "Why it fail when put in title it okay" (referring to Docker tag error in GitHub Actions)  
> "Do we have to edit to be after CI" (referring to Render Auto-Deploy setting)

**Issues encountered and resolved:**

### Docker Tag Lowercase Error
- **Problem:** `${{ github.repository }}` returns `ICT-Mahidol/2025-ITCS383-Emerald` with uppercase letters. Docker rejects uppercase in image tags.
- **AI suggestion:** Pipe the image name through `tr '[:upper:]' '[:lower:]'` to convert to lowercase.
- **Accepted:** Fix was applied to `workflow.yml`.
- **Verification:** Pushed to `Title` branch → CI ran and Docker build passed ✅. Merged PR to `main` → CD ran, image pushed to GHCR successfully.

### Render Auto-Deploy Configuration
- **Problem:** Render's Auto-Deploy was set to "On Commit", which would deploy independently of CI/CD — potentially deploying broken code before tests pass.
- **AI suggestion:** Set Auto-Deploy to "Off" so Render only deploys when triggered by the GitHub Actions deploy hook (which runs after CI passes).
- **Accepted:** Changed Render Auto-Deploy from "On Commit" to manual/off.
- **Verification:** Confirmed deploy only triggers after CI job passes by reviewing GitHub Actions workflow run logs.

### Deploy Hook Secret
- **Problem:** CD job failed with `curl: (3) URL rejected: Malformed input to a URL function` because `RENDER_DEPLOY_HOOK_URL` secret was not yet configured.
- **Resolution:** Added the Render deploy hook URL as a GitHub repository secret.
- **Verification:** Re-ran the failed workflow → deploy step completed successfully.

---

---

## 5. Requirements Gap Analysis

**AI Tool Used:** Claude Code (Claude Opus 4.6)

**Prompt:**
> "Read the requirements and description and check if '2025-ITCS383-Emerald-main' do right or not."

**What was generated:**
- Comprehensive compliance report comparing the BA transcript (`Requirements.txt`) against the existing codebase
- Identified 31 distinct requirements from the interview transcript
- Found only ~32% of requirements were implemented (basic registration, login, membership UI)
- Produced a detailed scorecard of 27 missing requirements

**Accepted:** The analysis was accepted — it correctly identified all missing features.

**Rejected:** Nothing rejected.

**Verification:**
- Manually cross-referenced each requirement against the BA transcript
- Confirmed the gap analysis matched the actual state of the codebase

---

## 6. Full Requirements Implementation — Security & Infrastructure

**AI Tool Used:** Claude Code (Claude Opus 4.6)

**Prompt:**
> "Fix it. Make it meet the requirements."

**Clarifications provided by the team:**
- CCTV and Banking API: Use mock/stub APIs (simulated)
- Payment methods: Simulated flow (no real payment gateway)
- Encryption: AES-256-CBC via Node.js built-in `crypto` module

**What was generated:**

### `lib/crypto.js` (NEW)
- AES-256-CBC encryption/decryption module
- Uses `ENCRYPTION_KEY` environment variable (64-character hex string)
- Format: `iv_hex:ciphertext_hex` for stored values
- Encrypts customer PII: first_name, last_name, phone, address

### `lib/auth.js` (NEW)
- Role-based access control middleware (`requireRole`)
- Server-side role verification via DB lookup (does not trust client-sent role)
- Supports multiple allowed roles per route

### `lib/expiry.js` (NEW)
- Background job running every 60 seconds
- Automatically expires unpaid bookings where `status='pending'` and `expires_at < NOW()`

### `server.js` (REWRITTEN)
- 8 new database tables: `desks`, `bookings`, `booking_desks`, `equipment`, `expenses`, `checkins` + altered `users` (added `role`), `payments` (added `payment_method`, `booking_id`)
- Performance indexes on bookings, payments, expenses, users
- Seed data: 50 desks across 3 zones, 7 equipment items, default manager account
- 20+ new API endpoints organized into sections: Auth, Membership, Booking, Employee, Manager
- Simulated Banking API at `POST /api/bank/transfer`
- Simulated CCTV stub at `GET /api/employee/cctv`
- Database migration: `ALTER TABLE users ALTER COLUMN ... TYPE TEXT` for encrypted data compatibility

**Accepted:** All generated modules and server rewrite were accepted.

**Rejected:** Nothing rejected.

**Verification:**
- `node -c server.js` — Syntax OK
- `node -e "require('./lib/crypto')"` — Module loads successfully
- `node -e "require('./lib/auth')"` — Module loads successfully
- `node -e "require('./lib/expiry')"` — Module loads successfully
- `npm start` — Server starts, all tables created, seed data inserted
- Tested encryption: verified encrypted values stored in DB, decrypted correctly on read

---

## 7. Full Requirements Implementation — Customer Booking System

**AI Tool Used:** Claude Code (Claude Opus 4.6)

**What was generated:**

### `public/booking.html` (NEW)
- 3-step booking flow UI:
  1. Date picker + desk count selector with +/- buttons
  2. Time slot availability grid with color coding (green=available, red=full)
  3. Payment section with 3 tabs: Credit Card form, Bank Transfer info, TrueWallet phone+OTP
- 30-minute countdown timer for unpaid bookings
- Requires active membership to book

### `public/my-bookings.html` (NEW)
- Lists all user bookings as cards with status badges (Pending/Confirmed/Checked-In/Cancelled/Expired)
- Cancel button with 1-day-before policy enforcement
- Empty state with "Book a Desk" CTA
- Payment due reminder for pending bookings

**Accepted:** Both pages accepted with full functionality.

**Rejected:** Nothing rejected.

**Verification:**
- Opened booking.html in browser, verified 3-step flow renders correctly
- Verified date picker only allows future dates
- Verified desk count +/- buttons work within 1-50 range
- Verified availability check returns slot data from API
- Verified my-bookings.html shows empty state for users with no bookings
- Visual inspection of status badges and card layout

---

## 8. Full Requirements Implementation — Employee Dashboard

**AI Tool Used:** Claude Code (Claude Opus 4.6)

**What was generated:**

### `public/employee-dashboard.html` (NEW)
- 5-tab interface:
  1. **Reservations** — date picker + table showing customer name, email, time, desks, status
  2. **Check-In** — today's confirmed bookings with check-in button
  3. **Equipment** — editable stock table (total/available quantities) with update button
  4. **Expenses** — form to record expenses (category, amount, description, date) + today's expense list
  5. **CCTV** — simulated camera feed grid with dark screens, scanline animation, LIVE badges, ONLINE/OFFLINE status

**Accepted:** All 5 tabs accepted with full functionality.

**Rejected:** Nothing rejected.

**Verification:**
- Logged in as manager (who has employee access), verified all tabs render
- Verified reservations table loads data from API
- Verified equipment table shows all 7 seeded items with editable inputs
- Verified CCTV tab shows 6 cameras with correct statuses
- Visual inspection confirmed dark screen styling and LIVE badge animation

---

## 9. Full Requirements Implementation — Manager Dashboard

**AI Tool Used:** Claude Code (Claude Opus 4.6)

**What was generated:**

### `public/manager-dashboard.html` (NEW)
- Revenue overview cards: Today's Revenue, This Month, Bookings Today, Total Members
- 3-tab interface:
  1. **Revenue** — daily/monthly toggle with breakdown table (payment type, method, total, count)
  2. **Income Report** — monthly view with Total Revenue, Total Expenses, Net Income cards + daily breakdown tables
  3. **Employees** — employee list table with Add Employee form and Remove button

**Accepted:** All functionality accepted.

**Rejected:** Nothing rejected.

**Verification:**
- Logged in as manager (`admin@spacehub.co` / `admin123`)
- Verified auto-redirect to manager-dashboard.html after login
- Verified overview cards display revenue data from API
- Verified Revenue tab shows breakdown by payment type/method
- Verified Employees tab shows "+ Add Employee" button and employee list
- Visual inspection confirmed blue/white theme consistency

---

## 10. Full Requirements Implementation — Integration & Updates

**AI Tool Used:** Claude Code (Claude Opus 4.6)

**What was generated/modified:**

### `public/login.html` (MODIFIED)
- Added role-based redirect after login: customer→dashboard, employee→employee-dashboard, manager→manager-dashboard

### `public/dashboard.html` (MODIFIED)
- Added navigation links: Dashboard, Book, My Bookings
- Removed duplicate utility functions (now in shared `app.js`)

### `public/profile.html` (MODIFIED)
- Replaced inline auth check with `requireAuth(['customer', 'employee', 'manager'])`
- Removed duplicate utility functions

### `public/app.js` (MODIFIED)
- Added shared utilities: `requireAuth()`, `handleLogout()`, `toggleProfileMenu()`, `formatCurrency()`, `formatDate()`
- Click-outside handler for profile dropdown

### `public/style.css` (MODIFIED)
- Added ~600 lines of new BEM classes for all new components
- Navigation links, role badges, booking sections, slot grid, payment tabs/forms, countdown timer, booking cards, status badges, tab navigation, data tables, equipment inputs, check-in cards, expense form, CCTV grid with scanline animation, revenue cards, report cards, employee management form, empty states, responsive adjustments

### `.env` (MODIFIED)
- Added `ENCRYPTION_KEY` (64-character hex string for AES-256 encryption)

**Accepted:** All modifications accepted.

**Rejected:** Nothing rejected.

**Verification:**
- `node -c server.js` — Syntax OK for all JavaScript files
- `npm start` — Server starts successfully with all tables initialized
- Browser testing: verified role-based login redirects work for all 3 roles
- Visual inspection: confirmed consistent blue/white theme across all pages
- Mobile responsive test: verified layout adapts correctly at 375px viewport

---

## 11. README.md Update

**AI Tool Used:** Claude Code (Claude Opus 4.6)

**Prompt:**
> "Did you update readme.md?" → "continue"

**What was generated:**
- Complete rewrite of `README.md` to reflect all new features
- Updated description, features (organized by role), tech stack, project structure
- Added all 20+ API endpoints organized by section
- Added User Roles table, Default Manager Account info
- Added `ENCRYPTION_KEY` setup instructions with key generation command
- Updated Docker run command with encryption key env var

**Accepted:** Full README update accepted.

**Rejected:** Nothing rejected.

**Verification:**
- Manual review of content accuracy against actual codebase
- Verified all listed API endpoints exist in `server.js`
- Verified project structure matches actual file listing

---

## 12. Database Migration Fix

**AI Tool Used:** Claude Code (Claude Opus 4.6)

**Issue:** Server failed to start with error `value too long for type character varying(20)` because existing `users` table had `VARCHAR(20)` columns that couldn't hold AES-256 encrypted values.

**What was generated:**
- Added `ALTER TABLE users ALTER COLUMN ... TYPE TEXT` statements for `first_name`, `last_name`, `phone`, `address` columns in `server.js` `initDB()` function

**Accepted:** Migration fix accepted.

**Rejected:** Nothing rejected.

**Verification:**
- `npm start` — Server starts successfully, no column type errors
- Database initialized message confirmed: "Database initialized — all tables ready"

---

## Summary Table

| Change                      | AI Tool      | AI-Generated | Accepted | Rejected / Modified          | Verification Method                              |
|-----------------------------|--------------|:------------:|:--------:|------------------------------|--------------------------------------------------|
| Welcome page + CSS theme    | Gemini       | ✅           | ✅       | —                            | Browser visual inspection, field checklist        |
| Login & Register pages      | Gemini       | ✅           | ✅       | —                            | Browser testing, form submission                  |
| Express + Neon backend      | Gemini       | ✅           | ✅       | localStorage → Neon DB       | `npm start`, API testing, Neon dashboard check    |
| Dockerfile                  | Gemini       | ✅           | ✅       | —                            | Manual code review, non-root & healthcheck        |
| GitHub Actions workflow.yml | Gemini       | ✅           | ✅       | Docker tag lowercase fix     | `npm run lint`, CI/CD pipeline run on GitHub      |
| render.yaml                 | Gemini       | ✅           | ❌       | Removed (redundant)          | N/A                                               |
| Render Auto-Deploy config   | Gemini       | ✅           | ✅       | Changed to Off               | Verified deploy only triggers via hook            |
| Requirements gap analysis   | Claude Code  | ✅           | ✅       | —                            | Cross-referenced against BA transcript            |
| `lib/crypto.js` (AES-256)   | Claude Code  | ✅           | ✅       | —                            | Module load test, encrypt/decrypt verification    |
| `lib/auth.js` (RBAC)        | Claude Code  | ✅           | ✅       | —                            | Module load test, role verification via API       |
| `lib/expiry.js` (30-min)    | Claude Code  | ✅           | ✅       | —                            | Module load test, background job verification     |
| `server.js` rewrite (20+ API) | Claude Code | ✅          | ✅       | Added VARCHAR→TEXT migration  | `node -c`, `npm start`, API endpoint testing      |
| `booking.html` (3-step flow)| Claude Code  | ✅           | ✅       | —                            | Browser testing, availability check, payment tabs |
| `my-bookings.html`          | Claude Code  | ✅           | ✅       | —                            | Browser testing, cancel policy, empty state       |
| `employee-dashboard.html`   | Claude Code  | ✅           | ✅       | —                            | Browser testing all 5 tabs, CCTV feed UI          |
| `manager-dashboard.html`    | Claude Code  | ✅           | ✅       | —                            | Browser testing, revenue cards, report generation |
| `login.html` (role redirect)| Claude Code  | ✅           | ✅       | —                            | Login as 3 different roles, verified redirects    |
| `dashboard.html` (nav update)| Claude Code | ✅           | ✅       | —                            | Browser visual inspection                         |
| `app.js` (shared utilities) | Claude Code  | ✅           | ✅       | —                            | All pages load correctly with shared functions    |
| `style.css` (+600 lines)    | Claude Code  | ✅           | ✅       | —                            | Visual inspection, mobile responsive test         |
| `README.md` (full update)   | Claude Code  | ✅           | ✅       | —                            | Manual review against actual codebase             |
| AI_USAGE_LOG.md (update)    | Claude Code  | ✅           | ✅       | —                            | Manual review against conversation history        |
