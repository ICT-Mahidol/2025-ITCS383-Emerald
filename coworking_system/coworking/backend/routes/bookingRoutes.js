const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);

// GET /api/bookings/availability
router.get('/availability', ctrl.checkAvailability);

// GET /api/bookings/daily  (employee+)
router.get('/daily', authorize('employee','manager'), ctrl.getByDate);

// GET /api/bookings/all  (manager)
router.get('/all', authorize('manager'), ctrl.getAll);

// GET /api/bookings/my
router.get('/my', ctrl.getMyBookings);

// POST /api/bookings
router.post('/', authorize('customer'), ctrl.createRules, ctrl.validate, ctrl.create);

// GET /api/bookings/:id
router.get('/:id', ctrl.getById);

// DELETE /api/bookings/:id/cancel
router.delete('/:id/cancel', ctrl.cancel);

module.exports = router;
