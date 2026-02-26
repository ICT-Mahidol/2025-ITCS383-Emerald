/**
 * Membership Controller
 */
const { body }          = require('express-validator');
const { validate }      = require('../middlewares/validate');
const MembershipModel   = require('../models/membershipModel');

// Membership durations in days
const DURATIONS = { daily: 1, monthly: 30, yearly: 365 };

const MembershipController = {
  createRules: [
    body('type').isIn(['daily','monthly','yearly']).withMessage('Invalid membership type'),
  ],

  async create(req, res) {
    try {
      const { type } = req.body;
      const userId   = req.user.id;

      const startDate = new Date();
      const endDate   = new Date();
      endDate.setDate(endDate.getDate() + DURATIONS[type]);

      const id = await MembershipModel.create({
        userId, type,
        startDate: startDate.toISOString().slice(0, 10),
        endDate:   endDate.toISOString().slice(0, 10),
      });
      res.status(201).json({ success: true, membershipId: id, startDate, endDate });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  async getActive(req, res) {
    try {
      const membership = await MembershipModel.getActive(req.user.id);
      res.json({ success: true, membership });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getHistory(req, res) {
    try {
      const memberships = await MembershipModel.getByUser(req.user.id);
      res.json({ success: true, memberships });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  validate
};

module.exports = MembershipController;
