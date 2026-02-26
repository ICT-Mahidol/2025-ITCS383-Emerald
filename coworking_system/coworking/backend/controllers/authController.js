/**
 * Auth Controller
 */
const { body }   = require('express-validator');
const { validate } = require('../middlewares/validate');
const AuthService  = require('../services/authService');

const AuthController = {
  // Validation rules
  registerRules: [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
  ],

  loginRules: [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],

  async register(req, res) {
    try {
      const userId = await AuthService.register(req.body);
      res.status(201).json({ success: true, message: 'Registration successful', userId });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  async login(req, res) {
    try {
      const data = await AuthService.login(req.body.email, req.body.password);
      res.json({ success: true, ...data });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  async profile(req, res) {
    try {
      const user = await AuthService.getProfile(req.user.id);
      res.json({ success: true, user });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  validate
};

module.exports = AuthController;
