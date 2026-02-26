/**
 * Membership Model
 */
const db = require('./db');

const MembershipModel = {
  /**
   * Create membership
   */
  async create({ userId, type, startDate, endDate }) {
    const [result] = await db.execute(
      `INSERT INTO memberships (user_id, type, start_date, end_date) VALUES (?, ?, ?, ?)`,
      [userId, type, startDate, endDate]
    );
    return result.insertId;
  },

  /**
   * Get active membership for user
   */
  async getActive(userId) {
    const [rows] = await db.execute(
      `SELECT * FROM memberships
       WHERE user_id = ? AND is_active = 1 AND end_date >= CURDATE()
       ORDER BY end_date DESC LIMIT 1`,
      [userId]
    );
    return rows[0] || null;
  },

  /**
   * Get all memberships for user
   */
  async getByUser(userId) {
    const [rows] = await db.execute(
      'SELECT * FROM memberships WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  },

  /**
   * Deactivate membership
   */
  async deactivate(id) {
    await db.execute('UPDATE memberships SET is_active = 0 WHERE id = ?', [id]);
  }
};

module.exports = MembershipModel;
