/**
 * Booking Controller
 */
const { body, query } = require('express-validator');
const { validate }    = require('../middlewares/validate');
const BookingService  = require('../services/bookingService');
const BookingModel    = require('../models/bookingModel');
const PaymentService  = require('../services/paymentService');

const BookingController = {
  createRules: [
    body('bookingDate').isDate().withMessage('Valid booking date required'),
    body('timeSlot').isIn(['morning','afternoon','evening','custom']).withMessage('Invalid time slot'),
    body('numDesks').isInt({ min: 1 }).withMessage('At least 1 desk required'),
    body('numChairs').isInt({ min: 1 }).withMessage('At least 1 chair required'),
  ],

  async create(req, res) {
    try {
      const result = await BookingService.create({ userId: req.user.id, ...req.body });
      res.status(201).json({ success: true, ...result });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  async getMyBookings(req, res) {
    try {
      const page  = parseInt(req.query.page)  || 1;
      const limit = parseInt(req.query.limit) || 10;
      const bookings = await BookingModel.getByUser(req.user.id, page, limit);
      res.json({ success: true, bookings });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getById(req, res) {
    try {
      const booking = await BookingModel.findById(req.params.id);
      if (!booking) return res.status(404).json({ success: false, message: 'Not found' });
      if (req.user.role === 'customer' && booking.user_id !== req.user.id)
        return res.status(403).json({ success: false, message: 'Access denied' });
      res.json({ success: true, booking });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async cancel(req, res) {
    try {
      const result = await BookingService.cancel(req.params.id, req.user.id, req.user.role);
      // Process refund if paid
      if (result.refundEligible) {
        await PaymentService.processRefund(req.params.id, req.user.id).catch(() => {});
      }
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  async checkAvailability(req, res) {
    try {
      const { spaceId = 1, bookingDate, timeSlot, startTime, endTime } = req.query;
      const result = await BookingService.checkAvailability(spaceId, bookingDate, timeSlot, startTime, endTime);
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Employee: get bookings by date
  async getByDate(req, res) {
    try {
      const date = req.query.date || new Date().toISOString().slice(0, 10);
      const bookings = await BookingModel.getByDate(date);
      res.json({ success: true, bookings });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Manager: get all bookings
  async getAll(req, res) {
    try {
      const { page = 1, limit = 20, status, startDate, endDate } = req.query;
      const bookings = await BookingModel.getAll({ page: +page, limit: +limit, status, startDate, endDate });
      res.json({ success: true, bookings });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  validate
};

module.exports = BookingController;
