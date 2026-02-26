/**
 * Payment Model
 */
const db = require('./db');

const PaymentModel = {
  /**
   * Create payment record
   */
  async create({ bookingId, userId, amount, method, status = 'pending', transactionRef }) {
    const [result] = await db.execute(
      `INSERT INTO payments (booking_id, user_id, amount, method, status, transaction_ref)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [bookingId, userId, amount, method, status, transactionRef || null]
    );
    return result.insertId;
  },

  /**
   * Find payment by ID
   */
  async findById(id) {
    const [rows] = await db.execute('SELECT * FROM payments WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  /**
   * Find payment by booking ID
   */
  async findByBooking(bookingId) {
    const [rows] = await db.execute(
      'SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at DESC LIMIT 1',
      [bookingId]
    );
    return rows[0] || null;
  },

  /**
   * Update payment status
   */
  async updateStatus(id, status, transactionRef = null) {
    await db.execute(
      'UPDATE payments SET status = ?, transaction_ref = COALESCE(?, transaction_ref) WHERE id = ?',
      [status, transactionRef, id]
    );
  },

  /**
   * Record refund
   */
  async recordRefund(id, refundAmount) {
    await db.execute(
      `UPDATE payments SET status = 'refunded', refund_amount = ?, refund_at = NOW() WHERE id = ?`,
      [refundAmount, id]
    );
  },

  /**
   * Get payment history for user
   */
  async getByUser(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [rows] = await db.query(
      `SELECT p.*, b.booking_date, b.time_slot
       FROM payments p
       JOIN bookings b ON b.id = p.booking_id
       WHERE p.user_id = ${db.escape(userId)}
       ORDER BY p.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`
    );
    return rows;
  }
};

module.exports = PaymentModel;
