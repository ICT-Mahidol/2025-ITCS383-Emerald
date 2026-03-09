/**
 * Mock for the postgres tagged-template sql function.
 * Allows tests to register responses for specific query patterns.
 */
function createMockSql() {
  const responses = [];
  let defaultResponse = [];
  let callLog = [];

  // The mock sql acts as a tagged template literal function
  const sql = (strings, ...values) => {
    const query = Array.isArray(strings) ? strings.join('?').trim() : String(strings);
    callLog.push({ query, values });

    // Check registered patterns (LIFO — last registered wins)
    for (let i = responses.length - 1; i >= 0; i--) {
      const { pattern, handler } = responses[i];
      if (query.includes(pattern)) {
        if (typeof handler === 'function') {
          return Promise.resolve(handler(values));
        }
        return Promise.resolve(handler);
      }
    }
    return Promise.resolve(defaultResponse);
  };

  // Register a response for queries containing a pattern
  sql._when = (pattern, response) => {
    responses.push({ pattern, handler: response });
    return sql;
  };

  sql._setDefault = (response) => {
    defaultResponse = response;
    return sql;
  };

  sql._reset = () => {
    responses.length = 0;
    callLog.length = 0;
    defaultResponse = [];
  };

  sql._getCalls = () => callLog;

  return sql;
}

module.exports = { createMockSql };
