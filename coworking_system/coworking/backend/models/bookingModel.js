/**
 * Booking Model
 */
const db = require('./db');

const BookingModel = {
  /**
   * Create booking
   */
  async create({ userId, spaceId = 1, bookingDate, timeSlot, startTime, endTime, numDesks, numChairs, totalPrice, expiresAt }) {
    const [result] = await db.execute(
      `INSERT INTO bookings
         (user_id, space_id, booking_date, time_slot, start_time, end_time, num_desks, num_chairs, total_price, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, spaceId, bookingDate, timeSlot, startTime, endTime, numDesks, numChairs, totalPrice, expiresAt]
    );
    return result.insertId;
  },

  /**
   * Find booking by ID
   */
  async findById(id) {
    const [rows] = await db.execute(
      `SELECT b.*, u.first_name, u.last_name, u.email
       FROM bookings b
       JOIN users u ON u.id = b.user_id
       WHERE b.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Get bookings by user
   */
  async getByUser(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [rows] = await db.query(
      `SELECT * FROM bookings WHERE user_id = ${db.escape(userId)}
       ORDER BY created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`
    );
    return rows;
  },

  /**
   * Get bookings by date (for employees/managers)
   */
  async getByDate(date) {
    const [rows] = await db.execute(
      `SELECT b.*, u.first_name, u.last_name, u.email
       FROM bookings b
       JOIN users u ON u.id = b.user_id
       WHERE b.booking_date = ?
       ORDER BY b.start_time ASC`,
      [date]
    );
    return rows;
  },

  /**
   * Check availability: count booked desks for a slot
   */
  async countBookedDesks(spaceId, bookingDate, startTime, endTime, excludeId = null) {
    let query = `
      SELECT COALESCE(SUM(num_desks), 0) as total
      FROM bookings
      WHERE space_id = ?
        AND booking_date = ?
        AND status IN ('pending','paid')
        AND start_time < ?
        AND end_time > ?`;
    const params = [spaceId, bookingDate, endTime, startTime];
    if (excludeId) { query += ' AND id != ?'; params.push(excludeId); }
    const [rows] = await db.execute(query, params);
    return parseInt(rows[0].total);
  },

  /**
   * Update booking status
   */
  async updateStatus(id, status) {
    await db.execute('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
  },

  /**
   * Expire pending bookings past their expiry time
   */
  async expirePending() {
    const [result] = await db.execute(
      `UPDATE bookings SET status = 'expired'
       WHERE status = 'pending' AND expires_at < NOW()`
    );
    return result.affectedRows;
  },

  /**
   * Get all bookings (paginated) for manager
   */
  async getAll({ page = 1, limit = 20, status, startDate, endDate } = {}) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT b.*, u.first_name, u.last_name, u.email
      FROM bookings b
      JOIN users u ON u.id = b.user_id
      WHERE 1=1`;
    const params = [];
    if (status)    { query += ' AND b.status = ?';       params.push(status); }
    if (startDate) { query += ' AND b.booking_date >= ?'; params.push(startDate); }
    if (endDate)   { query += ' AND b.booking_date <= ?'; params.push(endDate); }
    query += ` ORDER BY b.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;
    const [rows] = await db.execute(query, params);
    return rows;
  },

  /**
   * Revenue statistics
   */
  async revenueByDay(date) {
    const [rows] = await db.execute(
      `SELECT COALESCE(SUM(p.amount), 0) as revenue
       FROM payments p
       JOIN bookings b ON b.id = p.booking_id
       WHERE p.status = 'success' AND DATE(p.created_at) = ?`,
      [date]
    );
    return parseFloat(rows[0].revenue);
  },

  async revenueByMonth(year, month) {
    const [rows] = await db.execute(
      `SELECT COALESCE(SUM(p.amount), 0) as revenue
       FROM payments p
       WHERE p.status = 'success'
         AND YEAR(p.created_at) = ? AND MONTH(p.created_at) = ?`,
      [year, month]
    );
    return parseFloat(rows[0].revenue);
  },

  async revenueChart(year, month) {
    const [rows] = await db.execute(
      `SELECT DATE(p.created_at) as day, COALESCE(SUM(p.amount), 0) as revenue
       FROM payments p
       WHERE p.status = 'success'
         AND YEAR(p.created_at) = ? AND MONTH(p.created_at) = ?
       GROUP BY DATE(p.created_at)
       ORDER BY day ASC`,
      [year, month]
    );
    return rows;
  },

  async bookingStats() {
    const [rows] = await db.execute(
      `SELECT status, COUNT(*) as cnt FROM bookings GROUP BY status`
    );
    return rows;
  }
};

module.exports = BookingModel;
