describe('lib/expiry.js — startExpiryJob', () => {
  let startExpiryJob;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.resetModules();
    ({ startExpiryJob } = require('../../lib/expiry'));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('calls sql to update expired bookings on each interval tick', () => {
    const mockSql = jest.fn(() => Promise.resolve([]));
    startExpiryJob(mockSql);

    jest.advanceTimersByTime(60000);

    expect(mockSql).toHaveBeenCalled();
  });

  test('logs count when bookings are expired', async () => {
    const mockSql = jest.fn(() => Promise.resolve([{ id: 1 }, { id: 2 }]));
    startExpiryJob(mockSql);

    jest.advanceTimersByTime(60000);
    // Allow the promise to resolve
    await Promise.resolve();

    expect(console.log).toHaveBeenCalledWith('Expired 2 unpaid booking(s)');
  });

  test('handles sql errors gracefully without crashing', async () => {
    const mockSql = jest.fn(() => Promise.reject(new Error('DB error')));
    startExpiryJob(mockSql);

    jest.advanceTimersByTime(60000);
    await Promise.resolve();

    expect(console.error).toHaveBeenCalledWith('Expiry job error:', 'DB error');
  });

  test('does not log when no bookings are expired', async () => {
    const mockSql = jest.fn(() => Promise.resolve([]));
    startExpiryJob(mockSql);

    jest.advanceTimersByTime(60000);
    await Promise.resolve();

    expect(console.log).not.toHaveBeenCalled();
  });
});
