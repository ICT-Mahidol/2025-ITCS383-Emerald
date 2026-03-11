function requireRole(sqlOrGetter, ...roles) {
  return async (req, res, next) => {
    try {
      const sql = sqlOrGetter._isGetter ? sqlOrGetter() : sqlOrGetter;
      const userId = req.body.userId || req.params.userId || req.query.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required.' });
      }
      const users = await sql`SELECT role FROM users WHERE id = ${userId}`;
      if (users.length === 0) {
        return res.status(401).json({ error: 'User not found.' });
      }
      if (!roles.includes(users[0].role)) {
        return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
      }
      req.userRole = users[0].role;
      next();
    } catch (err) {
      console.error('Auth middleware error:', err);
      res.status(500).json({ error: 'Server error.' });
    }
  };
}

module.exports = { requireRole };
