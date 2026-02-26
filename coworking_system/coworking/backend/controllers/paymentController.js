/**
 * Payment Controller
 */
const { body }       = require('express-validator');
const { validate }   = require('../middlewares/validate');
const PaymentService = require('../services/paymentService');
const PaymentModel   = require('../models/paymentModel');

const PaymentController = {
  payRules: [
    body('bookingId').isInt({ min: 1 }).withMessage('Valid booking ID required'),
    body('method').isIn(['credit_card','bank_transfer','truewallet']).withMessage('Invalid payment method'),
  ],

  async pay(req, res) {
    try {
      const { bookingId, method, ...paymentDetails } = req.body;
      const result = await PaymentService.processPayment({
        bookingId, userId: req.user.id, method, paymentDetails
      });
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  async getHistory(req, res) {
    try {
      const page  = parseInt(req.query.page)  || 1;
      const limit = parseInt(req.query.limit) || 10;
      const payments = await PaymentModel.getByUser(req.user.id, page, limit);
      res.json({ success: true, payments });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  validate
};

module.exports = PaymentController;
