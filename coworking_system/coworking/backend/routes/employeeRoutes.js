const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/employeeController');
const bookingCtrl = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate, authorize('employee','manager'));

// GET /api/employee/daily
router.get('/daily', bookingCtrl.getByDate);

// GET /api/employee/inventory
router.get('/inventory', ctrl.getInventory);

// PUT /api/employee/inventory/:id
router.put('/inventory/:id', ctrl.updateInventory);

// POST /api/employee/inventory
router.post('/inventory', ctrl.addInventory);

// GET /api/employee/cctv
router.get('/cctv', ctrl.getCCTV);

module.exports = router;
