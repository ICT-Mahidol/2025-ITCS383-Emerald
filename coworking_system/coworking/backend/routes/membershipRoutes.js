const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/membershipController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);

// POST /api/memberships
router.post('/', authorize('customer'), ctrl.createRules, ctrl.validate, ctrl.create);

// GET /api/memberships/active
router.get('/active', ctrl.getActive);

// GET /api/memberships/history
router.get('/history', ctrl.getHistory);

module.exports = router;
