/**
 * Manager Controller
 * Revenue, stats, employee management, operational costs
 */
const { body }   = require('express-validator');
const { validate } = require('../middlewares/validate');
const BookingModel = require('../models/bookingModel');
const CostModel    = require('../models/costModel');
const UserModel    = require('../models/userModel');
const bcrypt       = require('bcryptjs');
const { encrypt }  = require('../utils/crypto');

const ManagerController = {
  // ---- Revenue ----
  async getRevenue(req, res) {
    try {
      const now   = new Date();
      const year  = parseInt(req.query.year)  || now.getFullYear();
      const month = parseInt(req.query.month) || now.getMonth() + 1;
      const today = now.toISOString().slice(0, 10);

      const [dailyRev, monthlyRev, chartData, stats, costs] = await Promise.all([
        BookingModel.revenueByDay(today),
        BookingModel.revenueByMonth(year, month),
        BookingModel.revenueChart(year, month),
        BookingModel.bookingStats(),
        CostModel.totalByMonth(year, month),
      ]);

      res.json({
        success: true,
        dailyRevenue:   dailyRev,
        monthlyRevenue: monthlyRev,
        netRevenue:     monthlyRev - costs,
        totalCosts:     costs,
        chartData,
        bookingStats:   stats,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // ---- Operational Costs ----
  async addCost(req, res) {
    try {
      const { description, amount, costDate } = req.body;
      const id = await CostModel.create({ description, amount, costDate, recordedBy: req.user.id });
      res.status(201).json({ success: true, id });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getCosts(req, res) {
    try {
      const now   = new Date();
      const year  = parseInt(req.query.year)  || now.getFullYear();
      const month = parseInt(req.query.month) || now.getMonth() + 1;
      const costs = await CostModel.getByMonth(year, month);
      res.json({ success: true, costs });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // ---- Employee Management ----
  async getEmployees(req, res) {
    try {
      const employees = await UserModel.findAll({ role: 'employee' });
      const safe = employees.map(({ password: _, ...u }) => u);
      res.json({ success: true, employees: safe });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async addEmployee(req, res) {
    try {
      const { firstName, lastName, email, password, phone, address } = req.body;
      const existing = await UserModel.findByEmail(email);
      if (existing) return res.status(409).json({ success: false, message: 'Email already exists' });
      const hashed = await bcrypt.hash(password, 12);
      const id = await UserModel.create({ firstName, lastName, email, password: hashed, phone, address, role: 'employee' });
      res.status(201).json({ success: true, id });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  async updateEmployee(req, res) {
    try {
      const { id } = req.params;
      const fields = {};
      if (req.body.firstName) fields.first_name = req.body.firstName;
      if (req.body.lastName)  fields.last_name  = req.body.lastName;
      if (req.body.phone)     fields.phone      = req.body.phone;
      if (req.body.address)   fields.address    = req.body.address;
      await UserModel.update(id, fields);
      res.json({ success: true, message: 'Employee updated' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async deleteEmployee(req, res) {
    try {
      await UserModel.delete(req.params.id);
      res.json({ success: true, message: 'Employee removed' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  validate
};

module.exports = ManagerController;
