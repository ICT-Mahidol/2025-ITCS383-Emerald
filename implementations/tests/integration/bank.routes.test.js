const request = require('supertest');

// Set env vars before requiring server
process.env.ENCRYPTION_KEY = 'aa'.repeat(32);

const { app } = require('../../server');

describe('POST /api/bank/transfer', () => {
  test('returns 200 with success response', async () => {
    const res = await request(app)
      .post('/api/bank/transfer')
      .send({ amount: 1000, accountNumber: '1234567890' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  }, 10000);

  test('returns a transactionId starting with TXN', async () => {
    const res = await request(app)
      .post('/api/bank/transfer')
      .send({});

    expect(res.body.transactionId).toMatch(/^TXN/);
  }, 10000);

  test('returns a simulated success message', async () => {
    const res = await request(app)
      .post('/api/bank/transfer')
      .send({});

    expect(res.body.message).toContain('simulated');
  }, 10000);
});
