/**
 * Employee Controller
 * Inventory management and CCTV monitoring
 */
const { body }         = require('express-validator');
const { validate }     = require('../middlewares/validate');
const InventoryModel   = require('../models/inventoryModel');
const db               = require('../models/db');

const EmployeeController = {
  async getInventory(req, res) {
    try {
      const items = await InventoryModel.getAll();
      res.json({ success: true, items });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async updateInventory(req, res) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      await InventoryModel.update(id, quantity, req.user.id);
      res.json({ success: true, message: 'Inventory updated' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async addInventory(req, res) {
    try {
      const { itemName, category, quantity, unit } = req.body;
      const id = await InventoryModel.create({ itemName, category, quantity, unit, updatedBy: req.user.id });
      res.status(201).json({ success: true, id });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Mock CCTV feed
  async getCCTV(req, res) {
    try {
      const [cameras] = await db.execute('SELECT * FROM cctv_cameras WHERE is_active = 1');
      // Add mock stream data
      const feeds = cameras.map(cam => ({
        ...cam,
        mockFrame: `https://picsum.photos/seed/${cam.id}/640/360`,
        status: 'online',
        lastUpdate: new Date().toISOString()
      }));
      res.json({ success: true, feeds });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  validate
};

module.exports = EmployeeController;
