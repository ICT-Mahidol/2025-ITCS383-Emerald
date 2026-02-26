# 2025-ITCS383-Emerald

# 🏢 CoWork Space — Booking System

A full-stack Co-Working Space Booking System built with **Node.js/Express**, **MySQL**, and **Vanilla HTML/CSS/JavaScript**.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running Locally](#running-locally)
- [Docker Deployment](#docker-deployment)
- [Default Test Accounts](#default-test-accounts)
- [API Documentation](#api-documentation)

---

## ✨ Features

| Feature | Description |
|---|---|
| **User Roles** | Customer, Employee, Manager with role-based dashboards |
| **Membership** | Daily, Monthly, Yearly plans with date validation |
| **Booking System** | Calendar UI, time slots, desk/chair selection, availability check |
| **Payment** | Mock Credit Card, Bank Transfer, TrueWallet |
| **Auto-Expire** | Pending bookings expire after 30 minutes via background scheduler |
| **Cancellation** | 1-day notice policy with automatic refund processing |
| **Employee Dashboard** | Daily bookings, inventory management, CCTV monitoring |
| **Manager Dashboard** | Revenue charts, booking stats, employee management, cost tracking |
| **Security** | JWT auth, bcrypt passwords, AES-256 encryption, Helmet, rate limiting |
| **Scalability** | Connection pooling, DB transactions, pagination, async/await |

---

## 🛠 Tech Stack

**Frontend**
- HTML5, CSS3 (Blue & White theme)
- Vanilla JavaScript (Fetch API)
- Chart.js for revenue visualization
- Responsive design (mobile-friendly)

**Backend**
- Node.js 20 + Express.js
- RESTful API, MVC architecture
- JWT Authentication
- Role-based Authorization middleware
- `node-cron` for background scheduling

**Database**
- MySQL 8.0
- Connection pooling (`mysql2`)
- DB transactions for booking/payment consistency

**Security**
- `bcryptjs` — password hashing
- AES-256-CBC — personal data encryption (phone, address)
- `helmet` — HTTP security headers
- `express-rate-limit` — API rate limiting
- `express-validator` — input validation

---

## 📁 Project Structure

```
coworking/
├── frontend/
│   ├── css/
│   │   └── style.css           # Blue & white theme
│   ├── js/
│   │   ├── api.js              # API fetch wrapper
│   │   └── ui.js               # Toast, modal, formatting utilities
│   ├── pages/
│   │   ├── login.html          # Login & Register
│   │   ├── customer.html       # Customer dashboard
│   │   ├── employee.html       # Employee dashboard
│   │   └── manager.html        # Manager dashboard
│   └── index.html              # Landing page
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── employeeController.js
│   │   ├── managerController.js
│   │   ├── membershipController.js
│   │   └── paymentController.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── bookingService.js
│   │   └── paymentService.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── employeeRoutes.js
│   │   ├── managerRoutes.js
│   │   ├── membershipRoutes.js
│   │   └── paymentRoutes.js
│   ├── models/
│   │   ├── db.js               # MySQL connection pool
│   │   ├── userModel.js
│   │   ├── bookingModel.js
│   │   ├── membershipModel.js
│   │   ├── paymentModel.js
│   │   ├── inventoryModel.js
│   │   └── costModel.js
│   ├── middlewares/
│   │   ├── auth.js             # JWT authenticate + authorize
│   │   └── validate.js         # express-validator middleware
│   ├── utils/
│   │   ├── crypto.js           # AES-256 encrypt/decrypt
│   │   ├── jwt.js              # JWT sign/verify
│   │   ├── scheduler.js        # node-cron booking expiry
│   │   └── seed.js             # Database seeder
│   └── server.js               # Express app entry point
├── database/
│   ├── schema.sql              # Full database schema
│   └── seed.sql                # Static seed data
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── .github/
│   └── workflows/ci.yml        # GitHub Actions CI/CD
├── .env                        # Environment variables
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Installation

### Prerequisites

- Node.js 18+ ([download](https://nodejs.org))
- MySQL 8.0+ ([download](https://dev.mysql.com/downloads/))

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-org/coworking-booking.git
cd coworking-booking

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your database credentials

# 4. Set up the database
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql

# 5. Seed default accounts
node backend/utils/seed.js

# 6. Start the server
npm start
```

---

## ⚙️ Environment Variables

Copy `.env` and update the values:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=coworking_db
DB_POOL_SIZE=10

# JWT (change in production!)
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# AES Encryption (must be exactly 32 characters)
AES_SECRET_KEY=your_32_character_aes_key_here!!

# Booking auto-expire (minutes)
BOOKING_EXPIRE_MINUTES=30

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

---

## 🗄️ Database Setup

```bash
# Create database and tables
mysql -u root -p < database/schema.sql

# Insert static seed data (spaces, inventory, CCTV)
mysql -u root -p < database/seed.sql

# Create default user accounts
node backend/utils/seed.js
```

---

## ▶️ Running Locally

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Open your browser at: **http://localhost:3000**

---

## 🐳 Docker Deployment

```bash
# Build and start all services
cd docker
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

---

## 👤 Default Test Accounts

After running `node backend/utils/seed.js`:

| Role | Email | Password |
|------|-------|----------|
| **Manager** | manager@cowork.com | Manager@123 |
| **Employee** | employee@cowork.com | Employee@123 |
| **Customer** | customer@cowork.com | Customer@123 |

---

## 📖 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication

All protected routes require:
```
Authorization: Bearer <JWT_TOKEN>
```

---

### Auth Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register new customer |
| POST | `/auth/login` | No | Login and get JWT |
| GET | `/auth/profile` | Yes | Get current user profile |

**POST /auth/register**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Password@123",
  "phone": "0812345678",
  "address": "123 Main St, Bangkok"
}
```

**POST /auth/login**
```json
{ "email": "john@example.com", "password": "Password@123" }
```

---

### Membership Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/memberships` | Customer | Purchase membership |
| GET | `/memberships/active` | Any | Get active membership |
| GET | `/memberships/history` | Any | Get membership history |

**POST /memberships**
```json
{ "type": "monthly" }
// type: "daily" | "monthly" | "yearly"
```

---

### Booking Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/bookings/availability` | Any | Check desk availability |
| POST | `/bookings` | Customer | Create booking |
| GET | `/bookings/my` | Any | Get my bookings |
| GET | `/bookings/:id` | Any | Get booking by ID |
| DELETE | `/bookings/:id/cancel` | Any | Cancel booking |
| GET | `/bookings/daily` | Employee+ | Get bookings by date |
| GET | `/bookings/all` | Manager | Get all bookings |

**POST /bookings**
```json
{
  "bookingDate": "2024-12-25",
  "timeSlot": "morning",
  "numDesks": 2,
  "numChairs": 2,
  "spaceId": 1
}
// timeSlot: "morning" | "afternoon" | "evening" | "custom"
// For custom: add "startTime": "09:00:00", "endTime": "15:00:00"
```

**GET /bookings/availability**
```
?spaceId=1&bookingDate=2024-12-25&timeSlot=morning
```

---

### Payment Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/payments` | Customer | Process payment |
| GET | `/payments/history` | Any | Get payment history |

**POST /payments — Credit Card**
```json
{
  "bookingId": 1,
  "method": "credit_card",
  "cardNumber": "4111111111111111",
  "cardHolder": "JOHN DOE",
  "expiry": "12/26",
  "cvv": "123"
}
```

**POST /payments — Bank Transfer**
```json
{
  "bookingId": 1,
  "method": "bank_transfer",
  "bankCode": "SCB",
  "accountNumber": "1234567890",
  "accountName": "John Doe"
}
```

**POST /payments — TrueWallet**
```json
{
  "bookingId": 1,
  "method": "truewallet",
  "phone": "0812345678"
}
```

---

### Employee Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/employee/inventory` | Employee+ | Get all inventory |
| PUT | `/employee/inventory/:id` | Employee+ | Update stock quantity |
| POST | `/employee/inventory` | Employee+ | Add inventory item |
| GET | `/employee/cctv` | Employee+ | Get CCTV feeds |

---

### Manager Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/manager/revenue` | Manager | Get revenue stats |
| GET | `/manager/costs` | Manager | Get operational costs |
| POST | `/manager/costs` | Manager | Record cost |
| GET | `/manager/employees` | Manager | List employees |
| POST | `/manager/employees` | Manager | Add employee |
| PUT | `/manager/employees/:id` | Manager | Update employee |
| DELETE | `/manager/employees/:id` | Manager | Delete employee |

**GET /manager/revenue**
```
?year=2024&month=12
```

---

### Mock Payment Rules

| Method | Success Condition |
|--------|-------------------|
| Credit Card | Card number must start with `4` |
| Bank Transfer | Always succeeds |
| TrueWallet | Phone must be exactly 10 digits |

---

## 🔒 Security Notes

- Passwords are hashed with **bcrypt** (12 rounds)
- Phone and address are encrypted with **AES-256-CBC**
- All API routes use **JWT Bearer token** authentication
- Role-based access enforced on every protected route
- **Helmet** sets secure HTTP headers
- **Rate limiter**: 100 requests per 15 minutes per IP
- SQL injection prevented via **parameterized queries**
- Input validation via **express-validator**

---

## 📊 Scalability Notes

- MySQL **connection pool** (configurable via `DB_POOL_SIZE`)
- **DB transactions** for booking + payment atomicity
- **Pagination** on all list endpoints
- Background **cron job** for booking expiration (every minute)
- Layered MVC architecture for maintainability
- Designed to support **1,000 concurrent users** and **1 million members**
