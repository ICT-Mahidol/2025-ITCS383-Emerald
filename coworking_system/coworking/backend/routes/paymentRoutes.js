const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);

// POST /api/payments
router.post('/', authorize('customer'), ctrl.payRules, ctrl.validate, ctrl.pay);

// GET /api/payments/history
router.get('/history', ctrl.getHistory);

module.exports = router;
