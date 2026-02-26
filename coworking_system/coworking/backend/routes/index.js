/**
 * Main Router - Aggregates all route modules
 */
const express = require('express');
const router  = express.Router();

router.use('/auth',       require('./authRoutes'));
router.use('/memberships',require('./membershipRoutes'));
router.use('/bookings',   require('./bookingRoutes'));
router.use('/payments',   require('./paymentRoutes'));
router.use('/employee',   require('./employeeRoutes'));
router.use('/manager',    require('./managerRoutes'));

module.exports = router;
