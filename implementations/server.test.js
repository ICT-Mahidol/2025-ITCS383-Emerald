const request = require('supertest');
const bcrypt = require('bcryptjs');

// Mock external dependencies before importing server.js
const mockSql = jest.fn((strings, ...values) => {
    return Promise.resolve([]);
});

jest.mock('postgres', () => {
    return jest.fn(() => mockSql);
});

jest.mock('./lib/crypto', () => ({
    encrypt: jest.fn(text => `enc:${text}`),
    decrypt: jest.fn(text => text.replace('enc:', ''))
}));

jest.mock('./lib/expiry', () => ({
    startExpiryJob: jest.fn()
}));

const { app } = require('./server');

describe('server.js API Routes - Core Business Logic Testing', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockSql.mockResolvedValue([]); // Default to empty results
    });

    describe('Authentication & Registration (`POST /api/register`)', () => {
        it('should reject registration if required fields (e.g., email, password) are missing', async () => {
            // Input: Incomplete user data (missing last name, email, etc.)
            // Reasoning: Validates the request payload before touching the database to prevent poor data integrity.
            // Expected Result: 400 Bad Request with specific error message.
            const res = await request(app)
                .post('/api/register')
                .send({ firstName: 'Test' });

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('All fields are required.');
        });

        it('should successfully register a user and encrypt sensitive data', async () => {
            // Input: Complete and mathematically valid user registration data.
            // Reasoning: Tests the happy-path registration flow, verifying DB checks pass and inserts are triggered.
            // Expected Result: 201 Created, and the SQL execution should be invoked correctly.
            mockSql.mockResolvedValueOnce([]); // Mock email uniqueness check (0 rows = email available)

            const res = await request(app)
                .post('/api/register')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john@example.com',
                    phone: '1234567890',
                    address: '123 Main St',
                    password: 'testPassword123'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.message).toBe('Account created successfully!');

            // Verify that the SQL query was called multiple times (1 for uniqueness check, 1 for record insert)
            expect(mockSql).toHaveBeenCalledTimes(2);
        });

        it('should reject registration if the email already exists in the database', async () => {
            // Input: Email string that already maps to an existing user record.
            // Reasoning: Tests collision handling logic. We shouldn't overwrite existing accounts or throw 500 DB constraint errors.
            // Expected Result: 409 Conflict to cleanly prevent duplicate accounts.
            mockSql.mockResolvedValueOnce([{ id: 1 }]); // Mock email uniqueness check (1 row = email taken)

            const res = await request(app)
                .post('/api/register')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john@example.com',
                    phone: '1234567890',
                    address: '123 Main St',
                    password: 'testPassword123'
                });

            expect(res.statusCode).toBe(409);
            expect(res.body.error).toBe('An account with this email already exists.');
        });
    });

    describe('Membership System (`POST /api/membership`)', () => {
        it('should reject membership creation with invalid duration boundaries', async () => {
            // Input: Invalid mapping type 'decade'.
            // Reasoning: Tests input sanitization. Our schema only supports day, month, and year.
            // Expected Result: 400 Bad Request highlighting the mismatch.
            const res = await request(app)
                .post('/api/membership')
                .send({ userId: 1, type: 'decade', duration: 1 });

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('Type must be day, month, or year.');
        });

        it('should prevent purchasing a membership if the user already has an active one', async () => {
            // Input: Valid membership request for a user who already has a status='active' DB entry.
            // Reasoning: Core logic constraint mapping: users shouldn't double-pay or hold duplicate concurrent memberships.
            // Expected Result: 409 Conflict indicating existing active state.
            mockSql.mockResolvedValueOnce([{ id: 10 }]); // Mock finding an existing active membership

            const res = await request(app)
                .post('/api/membership')
                .send({ userId: 1, type: 'month', duration: 1 });

            expect(res.statusCode).toBe(409);
            expect(res.body.error).toBe('You already have an active or pending membership.');
        });

        it('should successfully create a membership in pending_payment state', async () => {
            // Input: Valid request for a 2-month mapping.
            // Reasoning: Core workflow mapping that tests state transitioning from 'No Membership' -> 'Pending Payment'.
            // Expected Result: 201 Created with pending_payment status. Payment is completed separately on the payment page.

            mockSql
                .mockResolvedValueOnce([]) // No active membership found
                .mockResolvedValueOnce([]) // Nested CAST(...) call for Postgres interval
                .mockResolvedValueOnce([{ id: 5, status: 'pending_payment' }]); // Insert membership return mock

            const res = await request(app)
                .post('/api/membership')
                .send({ userId: 2, type: 'month', duration: 2 });

            expect(res.statusCode).toBe(201);
            expect(res.body.message).toBe('Membership created. Please complete payment.');

            // Logic requires 3 chained DB hits: Check existence -> Nested Cast -> Insert membership (pending_payment).
            expect(mockSql).toHaveBeenCalledTimes(3);
        });
    });

    describe('Desk Booking System (`POST /api/bookings`)', () => {
        it('should reject booking if user does not possess an active membership clearance level', async () => {
            // Input: Valid payload structure, but simulated user is missing an active membership in the DB mapping.
            // Reasoning: Primary business rule enforcement: no pay, no booking capabilities.
            // Expected Result: 400 Bad Request, explicit membership blocker message.
            mockSql.mockResolvedValueOnce([]); // Mock membership check (0 rows = no active membership)

            const res = await request(app)
                .post('/api/bookings')
                .send({ userId: 1, date: '2026-10-10', startTime: '10:00', endTime: '12:00', numDesks: 1 });

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('Active membership required to book.');
        });

        it('should reject booking if requested number of desks exceeds available inventory at that specific time slot', async () => {
            // Input: User with active membership asks for 1 desk, but DB shows all 50 desks are mapped overlapping their timestamp.
            // Reasoning: Inventory conflict collision avoidance logic.
            // Expected Result: 400 Bad Request preventing overbooking constraints.

            mockSql
                .mockResolvedValueOnce([{ id: 1 }]) // Has active membership
                .mockResolvedValueOnce([{ desk_id: 1 }, { desk_id: 2 }]) // Mock intersecting bookings finding desks
                .mockResolvedValueOnce([]); // Available desks lookup returns an empty array (0 desks available)

            const res = await request(app)
                .post('/api/bookings')
                .send({ userId: 1, date: '2026-10-10', startTime: '10:00', endTime: '12:00', numDesks: 1 });

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toContain('Not enough desks available');
        });

        it('should successfully instantiate a booking in a pending state and allocate exact desk IDs', async () => {
            // Input: Valid request + 1 available desk in mapped inventory.
            // Reasoning: Full Happy Path for the booking pipeline, locking an entity in a 'pending' state until transaction finalizing.
            // Expected Result: 201 Created, returning an ephemeral warning notifying expiration if not paid.

            mockSql
                .mockResolvedValueOnce([{ id: 1 }]) // Validation: Has active membership
                .mockResolvedValueOnce([]) // Validation: 0 intersecting booked desks
                .mockResolvedValueOnce([{ id: 5, label: 'Desk 5' }]) // Validation: Returns 1 available desk
                .mockResolvedValueOnce([{ id: 100, status: 'pending' }]) // State Change: Booking insertion
                .mockResolvedValueOnce([]); // Association: Booking-Desk layout mapping 

            const res = await request(app)
                .post('/api/bookings')
                .send({ userId: 1, date: '2026-10-10', startTime: '10:00', endTime: '12:00', numDesks: 1 });

            expect(res.statusCode).toBe(201);
            expect(res.body.message).toContain('Please complete payment within 30 minutes');
            expect(res.body.booking.desks).toContain('Desk 5');
        });
    });

});
