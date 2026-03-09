# SpaceHub — Co-Working Space Web Application

![CI/CD Pipeline](https://github.com/ICT-Mahidol/2025-ITCS383-Emerald/actions/workflows/workflow.yml/badge.svg)

A full-featured co-working space management system with desk booking, membership management, payment processing, employee operations, and manager analytics. Built with **HTML, CSS, JavaScript**, **Node.js/Express**, and **Neon PostgreSQL**. Deployed automatically via **GitHub Actions + Docker + Render**.

## Features

### Customer Features
- Account Registration & Login — secure sign-up with encrypted PII storage
- Desk Booking — 3-step flow: date selection, time slot picker with availability grid, payment
- Multiple Payment Methods — Credit Card, Bank Transfer, TrueWallet (simulated)
- My Bookings — view, track status, and cancel reservations (1-day-before policy)
- Profile Management — view and update personal information
- Membership Plans — Day, Month, and Year subscriptions

### Employee Features
- Reservation Management — view all reservations by date
- Customer Check-In — verify and check in confirmed bookings
- Equipment Inventory — track and update stock levels
- Expense Recording — log daily operational expenses
- CCTV Monitoring — simulated camera feed dashboard (stub API)

### Manager Features
- Revenue Dashboard — daily/monthly revenue overview with breakdown
- Income Reports — monthly revenue vs. expenses with net profit calculation
- Employee Management — add, view, and remove employee accounts
- Banking API — simulated bank transfer endpoint

### Security & Infrastructure
- bcrypt Password Hashing — salted hashing with 10 rounds
- AES-256-CBC Encryption — customer PII (name, phone, address) encrypted at rest
- Role-Based Access Control — server-side role verification (customer, employee, manager)
- Booking Expiry — unpaid reservations auto-expire after 30 minutes
- Neon PostgreSQL — serverless database with indexed queries
- Docker — containerized with multi-stage Alpine build
- CI/CD — GitHub Actions with ESLint + Jest tests + Docker build

## Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Frontend     | HTML, CSS (BEM), Vanilla JavaScript |
| Backend      | Node.js, Express                    |
| Database     | Neon (Serverless PostgreSQL)        |
| Encryption   | AES-256-CBC (Node.js crypto)        |
| Auth         | bcryptjs (password hashing)         |
| Linter       | ESLint                              |
| Testing      | Jest, Supertest                     |
| Container    | Docker (Alpine)                     |
| Registry     | GitHub Container Registry           |
| CI/CD        | GitHub Actions                      |
| Hosting      | Render                              |

## Project Structure

```
├── .github/workflows/
│   └── workflow.yml                # CI/CD pipeline
├── designs/
│   ├── Emerald_D1_Design.md        # C4 diagrams & design rationale
│   └── diagrams/                   # C4 diagram images
├── implementations/
│   ├── lib/
│   │   ├── crypto.js               # AES-256-CBC encrypt/decrypt helpers
│   │   ├── auth.js                 # Role-based access control middleware
│   │   └── expiry.js               # Background job: expire unpaid bookings
│   ├── public/
│   │   ├── index.html              # Welcome / landing page
│   │   ├── login.html              # Sign in (role-based redirect)
│   │   ├── register.html           # Create account page
│   │   ├── dashboard.html          # Customer dashboard
│   │   ├── profile.html            # User profile page
│   │   ├── booking.html            # 3-step desk booking flow
│   │   ├── my-bookings.html        # View / cancel bookings
│   │   ├── employee-dashboard.html # Employee operations panel
│   │   ├── manager-dashboard.html  # Manager analytics & controls
│   │   ├── style.css               # Blue & white BEM design system
│   │   └── app.js                  # Shared frontend utilities
│   ├── tests/
│   │   ├── helpers/mockSql.js      # Mock PostgreSQL for testing
│   │   ├── unit/                   # Unit tests (crypto, auth, expiry)
│   │   └── integration/            # Integration tests (routes)
│   ├── server.js                   # Express server + all API endpoints
│   ├── Dockerfile                  # Multi-stage Docker build
│   ├── .dockerignore               # Docker build exclusions
│   ├── .eslintrc.json              # ESLint configuration
│   └── package.json
├── Emerald_D3_AILog.md             # AI usage transparency log
└── README.md                       # This file
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- A free [Neon](https://neon.tech) database account
- [Docker](https://www.docker.com/) (optional, for containerized runs)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/ICT-Mahidol/2025-ITCS383-Emerald.git
   cd 2025-ITCS383-Emerald
   ```

2. **Install dependencies**
   ```bash
   cd implementations
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the `implementations/` directory:
   ```
   DATABASE_URL=postgresql://user:password@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require
   PORT=3000
   ENCRYPTION_KEY=<64-character hex string>
   ```

   Generate an encryption key:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open in browser** → [http://localhost:3000](http://localhost:3000)

> All database tables, indexes, seed data (50 desks, equipment inventory), and a default manager account are automatically created on first startup.

### Default Manager Account

| Email              | Password   |
|--------------------|------------|
| `admin@spacehub.co`| `admin123` |

### Run with Docker

```bash
cd implementations

# Build the image
docker build -t 2025-itcs383-emerald .

# Run the container
docker run -p 3000:3000 \
  -e DATABASE_URL="your_neon_connection_string" \
  -e ENCRYPTION_KEY="your_64_char_hex_key" \
  2025-itcs383-emerald
```

### Run Tests

```bash
cd implementations
npm test
```

### Run Linter

```bash
cd implementations
npm run lint
```

## API Endpoints

### Authentication
| Method | Endpoint         | Description              |
|--------|------------------|--------------------------|
| POST   | `/api/register`  | Create a new account     |
| POST   | `/api/login`     | Authenticate a user      |

### Membership
| Method | Endpoint                        | Description                  |
|--------|---------------------------------|------------------------------|
| POST   | `/api/membership/purchase`      | Purchase a membership plan   |
| GET    | `/api/membership/status/:userId`| Check membership status      |

### Booking (Customer)
| Method | Endpoint                            | Description                        |
|--------|-------------------------------------|------------------------------------|
| GET    | `/api/bookings/availability`        | Check desk availability by date    |
| POST   | `/api/bookings`                     | Create a new booking               |
| GET    | `/api/bookings/my/:userId`          | List user's bookings               |
| POST   | `/api/bookings/:bookingId/pay`      | Pay for a pending booking          |
| POST   | `/api/bookings/:bookingId/cancel`   | Cancel a booking (1-day policy)    |

### Employee
| Method | Endpoint                       | Description                    |
|--------|--------------------------------|--------------------------------|
| GET    | `/api/employee/reservations`   | View reservations by date      |
| POST   | `/api/employee/checkin`        | Check in a customer            |
| GET    | `/api/employee/equipment`      | List equipment inventory       |
| PUT    | `/api/employee/equipment/:id`  | Update equipment stock         |
| POST   | `/api/employee/expenses`       | Record an expense              |
| GET    | `/api/employee/expenses`       | List expenses by date          |
| GET    | `/api/employee/cctv`           | Simulated CCTV camera status   |

### Manager
| Method | Endpoint                  | Description                        |
|--------|---------------------------|------------------------------------|
| GET    | `/api/manager/revenue`    | Revenue summary (daily/monthly)    |
| GET    | `/api/manager/report`     | Income report with expenses        |
| GET    | `/api/manager/employees`  | List all employees                 |
| POST   | `/api/manager/employees`  | Add a new employee                 |
| DELETE | `/api/manager/employees/:id` | Remove an employee              |

### Simulated External APIs
| Method | Endpoint             | Description                    |
|--------|----------------------|--------------------------------|
| POST   | `/api/bank/transfer` | Simulated banking transfer API |

## User Roles

| Role       | Access                                                    |
|------------|-----------------------------------------------------------|
| `customer` | Dashboard, Profile, Booking, My Bookings, Membership      |
| `employee` | Reservations, Check-In, Equipment, Expenses, CCTV         |
| `manager`  | Revenue, Income Reports, Employee Management              |

After login, users are automatically redirected to their role-specific dashboard.

## CI/CD Pipeline

The full pipeline is defined in `.github/workflows/workflow.yml`:

```
Push/PR to main → CI (ESLint + Jest tests + Docker build test)
Merge to main   → CI + CD (build → push to GHCR → deploy to Render)
```

| Trigger             | Jobs                                              |
|---------------------|---------------------------------------------------|
| Push / PR to `main` | **CI** — ESLint + Jest tests + Docker image build |
| Push to `main` only | **CD** — Push image to GHCR + deploy to Render   |

### Required Secrets

| Secret                  | Where to get it                              |
|-------------------------|----------------------------------------------|
| `RENDER_DEPLOY_HOOK_URL`| Render dashboard → Settings → Deploy Hook    |

> **Note:** GHCR authentication uses the built-in `GITHUB_TOKEN` — no extra setup needed.

### Render Configuration

- **Runtime:** Docker
- **Auto-Deploy:** Off (controlled by GitHub Actions deploy hook)
- **Environment Variables:**
  - `DATABASE_URL` = your Neon connection string
  - `ENCRYPTION_KEY` = 64-character hex string for AES-256 encryption

## Team

**Emerald** — ITCS383, Mahidol University, 2025
