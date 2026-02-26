/**
 * Operational Cost Model
 */
const db = require('./db');

const CostModel = {
  async create({ description, amount, costDate, recordedBy }) {
    const [result] = await db.execute(
      'INSERT INTO operational_costs (description, amount, cost_date, recorded_by) VALUES (?, ?, ?, ?)',
      [description, amount, costDate, recordedBy]
    );
    return result.insertId;
  },

  async getByMonth(year, month) {
    const [rows] = await db.execute(
      `SELECT * FROM operational_costs
       WHERE YEAR(cost_date) = ? AND MONTH(cost_date) = ?
       ORDER BY cost_date DESC`,
      [year, month]
    );
    return rows;
  },

  async totalByMonth(year, month) {
    const [rows] = await db.execute(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM operational_costs
       WHERE YEAR(cost_date) = ? AND MONTH(cost_date) = ?`,
      [year, month]
    );
    return parseFloat(rows[0].total);
  },

  async getAll(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const [rows] = await db.execute(
      'SELECT * FROM operational_costs ORDER BY cost_date DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return rows;
  }
};

module.exports = CostModel;
