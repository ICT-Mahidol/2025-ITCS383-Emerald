/**
 * Authentication & Authorization Middleware
 * - authenticate: verify JWT token
 * - authorize:    check user role
 */
const { verifyToken } = require('../utils/jwt');

/**
 * Authenticate middleware - validates JWT from Authorization header
 */
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded;  // { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

/**
 * Authorize middleware factory - restricts access by role
 * @param {...string} roles - allowed roles
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied: insufficient permissions' });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
