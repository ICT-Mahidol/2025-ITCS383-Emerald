const request = require('supertest');
const bcrypt = require('bcryptjs');
const { createMockSql } = require('../helpers/mockSql');

// Set env vars before requiring server
process.env.ENCRYPTION_KEY = 'aa'.repeat(32);

const { app, setSql } = require('../../server');

let mockSql;

beforeEach(() => {
  mockSql = createMockSql();
  setSql(mockSql);
});

describe('POST /api/register', () => {
  test('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ email: 'test@test.com' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('All fields are required.');
  });

  test('returns 409 when email already exists', async () => {
    mockSql._when('SELECT', [{ id: 1 }]);

    const res = await request(app)
      .post('/api/register')
      .send({
        firstName: 'John', lastName: 'Doe', email: 'existing@test.com',
        phone: '0812345678', address: 'Bangkok', password: 'test123'
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toContain('already exists');
  });

  test('returns 201 on successful registration', async () => {
    mockSql._when('SELECT', []);       // no existing user
    mockSql._when('INSERT', [{ id: 1 }]); // insert success

    const res = await request(app)
      .post('/api/register')
      .send({
        firstName: 'Jane', lastName: 'Doe', email: 'jane@test.com',
        phone: '0898765432', address: 'Chiang Mai', password: 'secure123'
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Account created successfully!');
  });

  test('returns 400 when password is missing', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({
        firstName: 'John', lastName: 'Doe', email: 'test@test.com',
        phone: '0812345678', address: 'Bangkok'
      });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/login', () => {
  test('returns 400 when email or password is missing', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'test@test.com' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Email and password are required.');
  });

  test('returns 401 when email is not found', async () => {
    mockSql._when('SELECT', []);

    const res = await request(app)
      .post('/api/login')
      .send({ email: 'nobody@test.com', password: 'test123' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password.');
  });

  test('returns 401 when password does not match', async () => {
    const hashedPw = bcrypt.hashSync('correctpass', 10);
    const { encrypt } = require('../../lib/crypto');

    mockSql._when('SELECT', [{
      id: 1, first_name: encrypt('John'), last_name: encrypt('Doe'),
      email: 'john@test.com', phone: encrypt('0812345678'),
      address: encrypt('Bangkok'), password: hashedPw, role: 'customer'
    }]);

    const res = await request(app)
      .post('/api/login')
      .send({ email: 'john@test.com', password: 'wrongpass' });

    expect(res.status).toBe(401);
  });

  test('returns 200 with user data on successful login', async () => {
    const hashedPw = bcrypt.hashSync('mypassword', 10);
    const { encrypt } = require('../../lib/crypto');

    mockSql._when('SELECT', [{
      id: 2, first_name: encrypt('Jane'), last_name: encrypt('Smith'),
      email: 'jane@test.com', phone: encrypt('0898765432'),
      address: encrypt('Phuket'), password: hashedPw, role: 'customer'
    }]);

    const res = await request(app)
      .post('/api/login')
      .send({ email: 'jane@test.com', password: 'mypassword' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Login successful!');
    expect(res.body.user.firstName).toBe('Jane');
    expect(res.body.user.lastName).toBe('Smith');
    expect(res.body.user.role).toBe('customer');
  });

  test('login returns the correct role for a manager', async () => {
    const hashedPw = bcrypt.hashSync('admin123', 10);
    const { encrypt } = require('../../lib/crypto');

    mockSql._when('SELECT', [{
      id: 10, first_name: encrypt('Admin'), last_name: encrypt('Manager'),
      email: 'admin@spacehub.co', phone: encrypt('000-000-0000'),
      address: encrypt('HQ'), password: hashedPw, role: 'manager'
    }]);

    const res = await request(app)
      .post('/api/login')
      .send({ email: 'admin@spacehub.co', password: 'admin123' });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('manager');
  });
});
