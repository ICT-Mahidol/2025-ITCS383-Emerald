const { requireRole } = require('../../lib/auth');

const mockReq = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  ...overrides
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('lib/auth.js — requireRole', () => {
  let next;

  beforeEach(() => {
    next = jest.fn();
  });

  test('returns 401 when no userId is provided', async () => {
    const sql = jest.fn(() => Promise.resolve([]));
    const middleware = requireRole(sql, 'employee');
    const res = mockRes();

    await middleware(mockReq(), res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required.' });
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 when user is not found in database', async () => {
    const sql = jest.fn(() => Promise.resolve([]));
    const middleware = requireRole(sql, 'employee');
    const res = mockRes();

    await middleware(mockReq({ body: { userId: 999 } }), res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found.' });
  });

  test('returns 403 when user role does not match', async () => {
    const sql = jest.fn(() => Promise.resolve([{ role: 'customer' }]));
    const middleware = requireRole(sql, 'employee');
    const res = mockRes();

    await middleware(mockReq({ body: { userId: 1 } }), res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Access denied. Insufficient permissions.' });
  });

  test('calls next() when user role matches', async () => {
    const sql = jest.fn(() => Promise.resolve([{ role: 'employee' }]));
    const middleware = requireRole(sql, 'employee');
    const req = mockReq({ body: { userId: 1 } });
    const res = mockRes();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.userRole).toBe('employee');
  });

  test('accepts userId from req.params', async () => {
    const sql = jest.fn(() => Promise.resolve([{ role: 'manager' }]));
    const middleware = requireRole(sql, 'manager');
    const req = mockReq({ params: { userId: 5 } });
    const res = mockRes();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('accepts userId from req.query', async () => {
    const sql = jest.fn(() => Promise.resolve([{ role: 'employee' }]));
    const middleware = requireRole(sql, 'employee');
    const req = mockReq({ query: { userId: 3 } });
    const res = mockRes();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('returns 500 when sql throws an error', async () => {
    const sql = jest.fn(() => Promise.reject(new Error('DB error')));
    const middleware = requireRole(sql, 'employee');
    const res = mockRes();
    jest.spyOn(console, 'error').mockImplementation();

    await middleware(mockReq({ body: { userId: 1 } }), res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(next).not.toHaveBeenCalled();
    console.error.mockRestore();
  });

  test('works with multiple allowed roles', async () => {
    const sql = jest.fn(() => Promise.resolve([{ role: 'manager' }]));
    const middleware = requireRole(sql, 'employee', 'manager');
    const req = mockReq({ body: { userId: 1 } });
    const res = mockRes();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.userRole).toBe('manager');
  });

  test('supports getter function for sql parameter', async () => {
    const sqlFn = jest.fn(() => Promise.resolve([{ role: 'employee' }]));
    const getSql = () => sqlFn;
    getSql._isGetter = true;
    const middleware = requireRole(getSql, 'employee');
    const req = mockReq({ body: { userId: 1 } });
    const res = mockRes();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
