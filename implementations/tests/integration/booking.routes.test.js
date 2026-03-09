const request = require('supertest');
const { createMockSql } = require('../helpers/mockSql');

// Set env vars before requiring server
process.env.ENCRYPTION_KEY = 'aa'.repeat(32);

const { app, setSql } = require('../../server');

let mockSql;

beforeEach(() => {
  mockSql = createMockSql();
  setSql(mockSql);
});

describe('GET /api/bookings/availability', () => {
  test('returns 400 when date is missing', async () => {
    const res = await request(app).get('/api/bookings/availability');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Date is required.');
  });

  test('returns 200 with slot availability data', async () => {
    mockSql._when('COUNT', [{ booked_count: '5' }]);

    const res = await request(app)
      .get('/api/bookings/availability?date=2026-04-01');

    expect(res.status).toBe(200);
    expect(res.body.date).toBe('2026-04-01');
    expect(Array.isArray(res.body.slots)).toBe(true);
    expect(res.body.slots).toHaveLength(6);
    res.body.slots.forEach(slot => {
      expect(slot).toHaveProperty('totalDesks', 50);
      expect(slot).toHaveProperty('availableDesks');
      expect(slot).toHaveProperty('bookedDesks');
    });
  });
});

describe('POST /api/bookings', () => {
  test('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({ userId: 1 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('All booking fields are required.');
  });

  test('returns 400 when user has no active membership', async () => {
    mockSql._when('SELECT', []);  // no active membership

    const res = await request(app)
      .post('/api/bookings')
      .send({
        userId: 1, date: '2026-04-01', startTime: '08:00',
        endTime: '10:00', numDesks: 1
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('membership');
  });
});

describe('POST /api/bookings/:bookingId/cancel', () => {
  test('returns 404 when booking is not found', async () => {
    mockSql._when('SELECT', []);

    const res = await request(app)
      .post('/api/bookings/999/cancel')
      .send({ userId: 1 });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Booking not found.');
  });

  test('returns 400 when booking is already cancelled', async () => {
    mockSql._when('SELECT', [{ id: 1, status: 'cancelled', booking_date: '2026-05-01', user_id: 1 }]);

    const res = await request(app)
      .post('/api/bookings/1/cancel')
      .send({ userId: 1 });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('already cancelled');
  });

  test('returns 400 when cancelling less than 1 day before', async () => {
    const today = new Date().toISOString().split('T')[0];
    mockSql._when('SELECT', [{ id: 1, status: 'confirmed', booking_date: today, user_id: 1 }]);

    const res = await request(app)
      .post('/api/bookings/1/cancel')
      .send({ userId: 1 });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Cannot cancel');
  });

  test('returns 200 on successful cancellation of future booking', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    mockSql._when('SELECT', [{ id: 1, status: 'confirmed', booking_date: futureDateStr, user_id: 1 }]);
    mockSql._when('UPDATE', []);

    const res = await request(app)
      .post('/api/bookings/1/cancel')
      .send({ userId: 1 });

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('cancelled');
    expect(res.body.refundEligible).toBe(true);
  });
});
