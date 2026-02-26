const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/managerController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate, authorize('manager'));

// GET /api/manager/revenue
router.get('/revenue', ctrl.getRevenue);

// GET /api/manager/costs
router.get('/costs', ctrl.getCosts);

// POST /api/manager/costs
router.post('/costs', ctrl.addCost);

// GET /api/manager/employees
router.get('/employees', ctrl.getEmployees);

// POST /api/manager/employees
router.post('/employees', ctrl.addEmployee);

// PUT /api/manager/employees/:id
router.put('/employees/:id', ctrl.updateEmployee);

// DELETE /api/manager/employees/:id
router.delete('/employees/:id', ctrl.deleteEmployee);

module.exports = router;
