/**
 * Input Validation Middleware
 * Uses express-validator to validate request bodies
 */
const { validationResult } = require('express-validator');

/**
 * Middleware that checks validation results and returns errors
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors:  errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
}

module.exports = { validate };
