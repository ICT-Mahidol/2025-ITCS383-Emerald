const request = require('supertest');

// Set env vars before requiring server
process.env.ENCRYPTION_KEY = 'aa'.repeat(32);

const { app } = require('../../server');

describe('Static API Routes', () => {
  describe('GET /api/pricing', () => {
    test('returns 200 with pricing object', async () => {
      const res = await request(app).get('/api/pricing');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ day: 15, month: 299, year: 2999 });
    });
  });

  describe('GET /api/timeslots', () => {
    test('returns 200 with array of 6 time slots', async () => {
      const res = await request(app).get('/api/timeslots');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(6);
    });

    test('each slot has label, startTime, endTime properties', async () => {
      const res = await request(app).get('/api/timeslots');
      res.body.forEach(slot => {
        expect(slot).toHaveProperty('label');
        expect(slot).toHaveProperty('startTime');
        expect(slot).toHaveProperty('endTime');
      });
    });
  });
});
