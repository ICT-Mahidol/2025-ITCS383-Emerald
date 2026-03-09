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

describe('GET /api/employee/cctv', () => {
  test('returns 401 when no userId is provided', async () => {
    const res = await request(app).get('/api/employee/cctv');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authentication required.');
  });

  test('returns 403 when user is a customer', async () => {
    mockSql._when('SELECT', [{ role: 'customer' }]);

    const res = await request(app)
      .get('/api/employee/cctv?userId=1');

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Access denied');
  });

  test('returns 200 with camera data when user is an employee', async () => {
    mockSql._when('SELECT', [{ role: 'employee' }]);

    const res = await request(app)
      .get('/api/employee/cctv?userId=1');

    expect(res.status).toBe(200);
    expect(res.body.cameras).toHaveLength(6);
    expect(res.body.cameras[0]).toHaveProperty('name');
    expect(res.body.cameras[0]).toHaveProperty('status');
  });

  test('returns 200 when user is a manager (managers have employee access)', async () => {
    mockSql._when('SELECT', [{ role: 'manager' }]);

    const res = await request(app)
      .get('/api/employee/cctv?userId=1');

    expect(res.status).toBe(200);
    expect(res.body.cameras).toHaveLength(6);
  });
});
