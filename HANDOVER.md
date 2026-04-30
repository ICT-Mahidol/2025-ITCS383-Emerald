# HANDOVER.md — SpaceHub Co-Working Space Management System

**Received from:** Group Emerald  
**Received by:** Group Bughair  
**Date:** 25 March 2026  
**Repository:** https://github.com/ICT-Mahidol/2025-ITCS383-Emerald

---

## D2.1: Features of the Received Project

SpaceHub is a full-featured co-working space management system with three distinct user roles: Customer, Employee, and Manager.

### Customer Features

| Feature | Description |
|---|---|
| Account Registration & Login | Secure sign-up with encrypted PII (name, phone, address stored with AES-256-GCM) |
| Membership Plans | Subscribe to Day (฿15), Month (฿299), or Year (฿2,999) plans |
| Desk Booking | 3-step flow: select date → choose time slot → payment |
| Time Slot Availability | View real-time desk availability across 6 time slots (08:00–18:00) |
| Payment Methods | Credit Card, Bank Transfer (via Banking API), TrueWallet (simulated) |
| My Bookings | View, track status, and cancel existing reservations |
| Booking Expiry | Unpaid bookings auto-expire after 30 minutes with live countdown |
| Cancellation Policy | Confirmed bookings require at least 1 day notice before booking date |
| Profile Management | View and update personal information |

### Employee Features

| Feature | Description |
|---|---|
| Reservation Management | View all reservations filtered by date |
| Customer Check-In | Verify and check in confirmed bookings |
| Equipment Inventory | Track and update stock levels (desks, chairs, extension cords, peripherals) |
| Expense Recording | Log daily operational expenses |
| CCTV Monitoring | Simulated security camera feed dashboard |

### Manager Features

| Feature | Description |
|---|---|
| Revenue Dashboard | Daily and monthly revenue overview with payment method breakdown |
| Income Reports | Monthly revenue vs. expenses with net profit calculation |
| Employee Management | Add, view, update, and remove employee accounts |
| Daily Summary | Real-time stats: reservations, income, expenses, net income, member count |
| Banking API | Simulated bank transfer endpoint |

---

## 2. Design Verification

### C4 Diagram vs. Actual Implementation

#### Level 1: Context Diagram — ✅ Consistent

The design shows 3 actors (Customer, Employee, Manager) and 2 external systems (Payment System, CCTV). The implementation confirms all 3 roles exist with separate dashboards (`dashboard.html`, `employee-dashboard.html`, `manager-dashboard.html`). The Banking API (`POST /api/bank/transfer`) and CCTV endpoint (`GET /api/employee/cctv`) are both implemented as described.

#### Level 2: Container Diagram — ✅ Consistent

The design specifies 3 containers: Web Application (HTML/CSS/JS), API (Node.js/Express), and Database (PostgreSQL via Neon). The implementation matches exactly — static files served from `public/`, all business logic in `server.js`, and Neon PostgreSQL connected via `DATABASE_URL` environment variable.

One minor discrepancy: the design document states **AES-256-CBC** encryption for PII, but the actual implementation uses **AES-256-GCM** (in `lib/crypto.js`). GCM is a more secure authenticated encryption mode, so this is an improvement over the design, not a regression.

#### Level 3: Component Diagram — ✅ Mostly Consistent

| Component | Design | Implementation | Status |
|---|---|---|---|
| Create Account | Register with PII encryption | `POST /api/register` with AES-256-GCM | ✅ |
| Authentication | bcrypt login + role redirect | `POST /api/login` | ✅ |
| Membership Subscription | Day/Month/Year plans | `POST /api/membership` | ✅ |
| Booking System | Availability + 30-min expiry + 1-day cancel | `POST /api/bookings` + expiry job in `lib/expiry.js` | ✅ |
| Payment Service | Credit, Bank Transfer, TrueWallet | `POST /api/bookings/:id/pay` | ✅ |
| Inventory Management | Equipment stock tracking | `GET/PUT /api/employee/equipment` | ✅ |
| Generate Report | Revenue + expense aggregation | `GET /api/manager/revenue`, `GET /api/manager/report` | ✅ |
| Security System (CCTV) | Camera feed monitoring | `GET /api/employee/cctv` (stub/simulated) | ✅ |

#### Use Case Diagram — ✅ Consistent

All use cases shown in the diagram are implemented. The `requireRole` middleware in `lib/auth.js` enforces role-based access control server-side, consistent with the design showing role separation.

### Updated C4 Note

The Level 3 Component Diagram should be updated to reflect:
- Encryption algorithm is **AES-256-GCM** (not AES-256-CBC as stated in the Container Diagram rationale)
- `lib/expiry.js` is a background job component not shown in the original diagram — it handles the 30-minute booking expiry rule

---

## D3: Reflections on Receiving the Handover

### a. Technologies Used

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Frontend     | HTML, CSS , JavaScript <img width="2880" height="1864" alt="image" src="https://github.com/user-attachments/assets/23a817f7-75dc-4356-b659-297782ff63d5" />|
| Backend      | Node.js 20, Express                 <img width="1378" height="748" alt="image" src="https://github.com/user-attachments/assets/ecaab725-bd21-4995-9569-bed891bddd0a" />|
| Database     | Neon (Serverless PostgreSQL)        <img width="1356" height="498" alt="image" src="https://github.com/user-attachments/assets/852988b8-890e-4a1e-8b05-898b7c51ddde" />|
| Encryption   | AES-256-GCM (Node.js crypto)        <img width="2880" height="1864" alt="image" src="https://github.com/user-attachments/assets/bcca2c1b-05fb-45ee-9295-5ee999a2ad62" />|
| Auth         | bcryptjs (password hashing)         <img width="1342" height="282" alt="image" src="https://github.com/user-attachments/assets/b2c4a3bd-7691-48de-9553-aa446e588abc" />|
| Testing      | Jest, Supertest                     <img width="1062" height="242" alt="image" src="https://github.com/user-attachments/assets/d066b0fd-5375-4fb9-b541-0409009c0f27" />|
| Code Quality | SonarCloud                          <img width="2880" height="1864" alt="image" src="https://github.com/user-attachments/assets/c26549c5-94be-441e-b5fb-6a478541a9be" />|
| Container    | Docker (Alpine)                     <img width="2880" height="1864" alt="image" src="https://github.com/user-attachments/assets/7c0b4d9d-e09b-4286-af1e-c82f51931dd4" />|
| Registry     | GitHub Container Registry           <img width="2880" height="1864" alt="image" src="https://github.com/user-attachments/assets/ec91a98c-03fe-4fba-9c8c-e486a2469a12" />|
| CI/CD        | GitHub Actions                      |
| Hosting      | Render                              |


### b. Required Information to Successfully Hand Over the Project

The following information was necessary to set up and run the project:

**Environment Variables (must be provided by the original team)**

| Variable | Description | How to Obtain |
|---|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string | Create free account at neon.tech |
| `ENCRYPTION_KEY` | 64-character hex string for AES-256-GCM | Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `PORT` | Server port (default: 3000) | Set to any available port |

**Default Credentials**

| Role | Email | Password |
|---|---|---|
| Manager | `admin@spacehub.co` | `admin123` |
| Employee | Must be created by Manager via dashboard | — |
| Customer | Register via `/register.html` | — |

**Setup Steps Required**
1. Create a Neon PostgreSQL database (free tier sufficient)
2. Copy connection string from Neon dashboard
3. Generate ENCRYPTION_KEY using Node.js crypto
4. Create `.env` file in `implementations/` with the above values
5. Run `npm install` then `npm start`
6. All tables and seed data are created automatically on first startup

---

### c. Code Quality: SonarQube Cloud

##### Original SonarQube result
<img width="1438" height="811" alt="sonar_summary" src="https://github.com/user-attachments/assets/acdf632f-0a2c-4740-b180-c346e2004405" />
<img width="1438" height="811" alt="sonar_issues" src="https://github.com/user-attachments/assets/6544abb9-280d-4ea9-bdbe-4c086c206d63" />

##### Handover SonarQube result (latest)
<img width="1440" height="812" alt="Screenshot 2569-03-25 at 22 32 17" src="https://github.com/user-attachments/assets/1b71ab4a-baa5-4f9d-a530-49a16ac645bc" />
<img width="1440" height="812" alt="Screenshot 2569-03-25 at 22 32 25" src="https://github.com/user-attachments/assets/34206f44-5c72-4c97-a86e-0b08d7eb80a8" />


#### 1. Quality Gate

| Status |
|--------|
| **Passed** ✅ |

The project successfully passed the Quality Gate, meeting all required conditions set by the Sonar way quality profile.


#### 2. Security

| Metric | Value | Rating |
|--------|-------|--------|
| Open Issues | 0 | **A** |

No security vulnerabilities were detected. The project achieved the highest possible security rating (A).


#### 3. Reliability

| Metric | Value | Rating |
|--------|-------|--------|
| Open Issues | 0 | **A** |

No reliability issues (bugs) were found. The project achieved the highest possible reliability rating (A).

---

#### 4. Maintainability

| Metric | Value | Rating |
|--------|-------|--------|
| Open Issues | 14 | **A** |

Although 14 maintainability issues were identified, the project still achieved an A rating, indicating that the technical debt ratio remains within acceptable thresholds. All 14 issues are classified as **Code Smells** of **Minor** severity with an estimated remediation effort of **54 minutes** in total.

The issues are concentrated in `public/app.js` and are of the same type:

- **Prefer `globalThis` over `window`** — flagged across multiple lines (L10, L11, L19, L24, L32, and others)
  - Severity: Minor
  - Effort: 2 minutes each
  - Category: Consistency / Portability (ES2020)

These issues suggest that the codebase uses the browser-specific `window` global object in contexts where the more modern and environment-agnostic `globalThis` is preferred.


#### 5. Coverage

| Metric | Value |
|--------|-------|
| Coverage | 74.4% |
| Lines to Cover | 469 |
| Conditions Set | None |

Test coverage was successfully reported to SonarQube. The project covers 74.4% of the codebase, which meets the quality gate coverage threshold.


#### 6. Duplications

| Metric | Value |
|--------|-------|
| Duplication | 0.0% |
| Lines Analyzed | 6,900 |
| Conditions Set | None |

No code duplication was detected across the analyzed codebase.


#### 7. Security Hotspots

| Count |
|-------|
| 2 |

Two security hotspots were identified. These are not confirmed vulnerabilities but areas that require manual review to determine whether they pose an actual security risk.


#### 8. Summary

| Category | Result | Rating |
|----------|--------|--------|
| Quality Gate | Passed | ✅ |
| Security | 0 issues | **A** |
| Reliability | 0 issues | **A** |
| Maintainability | 14 issues (Minor) | **A** |
| Coverage | 74.4% | — |
| Duplications | 0.0% | — |
| Security Hotspots | 2 (review required) | — |

Overall, the handover codebase demonstrates a **good code quality**. It successfully passes the Quality Gate with 74.4% test coverage, zero security vulnerabilities, and zero reliability bugs. The only issues present are 14 minor maintainability code smells, all of which are low effort to resolve. The two security hotspots should be reviewed manually to confirm whether any action is required.
