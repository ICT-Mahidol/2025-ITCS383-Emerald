/**
 * Inventory Model
 */
const db = require('./db');

const InventoryModel = {
  async getAll() {
    const [rows] = await db.execute('SELECT * FROM inventory ORDER BY category, item_name');
    return rows;
  },

  async findById(id) {
    const [rows] = await db.execute('SELECT * FROM inventory WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async update(id, quantity, updatedBy) {
    await db.execute(
      'UPDATE inventory SET quantity = ?, updated_by = ? WHERE id = ?',
      [quantity, updatedBy, id]
    );
  },

  async create({ itemName, category, quantity, unit, updatedBy }) {
    const [result] = await db.execute(
      'INSERT INTO inventory (item_name, category, quantity, unit, updated_by) VALUES (?, ?, ?, ?, ?)',
      [itemName, category, quantity, unit, updatedBy]
    );
    return result.insertId;
  }
};

module.exports = InventoryModel;
