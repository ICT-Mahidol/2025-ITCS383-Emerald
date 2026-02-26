const express    = require('express');
const router     = express.Router();
const ctrl       = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');

// POST /api/auth/register
router.post('/register', ctrl.registerRules, ctrl.validate, ctrl.register);

// POST /api/auth/login
router.post('/login', ctrl.loginRules, ctrl.validate, ctrl.login);

// GET /api/auth/profile  (protected)
router.get('/profile', authenticate, ctrl.profile);

module.exports = router;
