/**
 * Booking Service
 * Business logic for creating and managing bookings
 */
const BookingModel    = require('../models/bookingModel');
const MembershipModel = require('../models/membershipModel');
const db              = require('../models/db');
require('dotenv').config();

// Pricing per desk per hour
const PRICE_PER_DESK_HOUR = 50; // THB

// Time slot presets
const TIME_SLOTS = {
  morning:   { start: '08:00:00', end: '12:00:00' },
  afternoon: { start: '13:00:00', end: '17:00:00' },
  evening:   { start: '18:00:00', end: '22:00:00' },
};

const BookingService = {
  /**
   * Create a new booking (with availability check)
   */
  async create({ userId, spaceId = 1, bookingDate, timeSlot, startTime, endTime, numDesks, numChairs }) {
    // 1. Validate membership
    const membership = await MembershipModel.getActive(userId);
    if (!membership) throw { status: 403, message: 'Active membership required to book' };

    // 2. Resolve times
    let resolvedStart = startTime;
    let resolvedEnd   = endTime;
    if (timeSlot !== 'custom') {
      const preset = TIME_SLOTS[timeSlot];
      if (!preset) throw { status: 400, message: 'Invalid time slot' };
      resolvedStart = preset.start;
      resolvedEnd   = preset.end;
    }

    // 3. Check availability (use DB transaction)
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // Lock rows for update
      const [spaceRows] = await conn.execute(
        'SELECT total_desks FROM spaces WHERE id = ? FOR UPDATE',
        [spaceId]
      );
      if (!spaceRows.length) throw { status: 404, message: 'Space not found' };
      const totalDesks = spaceRows[0].total_desks;

      const [bookedRows] = await conn.execute(
        `SELECT COALESCE(SUM(num_desks), 0) as total
         FROM bookings
         WHERE space_id = ? AND booking_date = ?
           AND status IN ('pending','paid')
           AND start_time < ? AND end_time > ?`,
        [spaceId, bookingDate, resolvedEnd, resolvedStart]
      );
      const bookedDesks = parseInt(bookedRows[0].total);
      if (bookedDesks + numDesks > totalDesks) {
        await conn.rollback();
        throw { status: 409, message: `Not enough desks available. Available: ${totalDesks - bookedDesks}` };
      }

      // 4. Calculate price
      const [h1, m1] = resolvedStart.split(':').map(Number);
      const [h2, m2] = resolvedEnd.split(':').map(Number);
      const hours      = ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60;
      const totalPrice = hours * numDesks * PRICE_PER_DESK_HOUR;

      // 5. Set expiry
      const expireMinutes = parseInt(process.env.BOOKING_EXPIRE_MINUTES) || 30;
      const expiresAt = new Date(Date.now() + expireMinutes * 60 * 1000)
        .toISOString().slice(0, 19).replace('T', ' ');

      // 6. Insert booking
      const [result] = await conn.execute(
        `INSERT INTO bookings
           (user_id, space_id, booking_date, time_slot, start_time, end_time, num_desks, num_chairs, total_price, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, spaceId, bookingDate, timeSlot, resolvedStart, resolvedEnd, numDesks, numChairs, totalPrice, expiresAt]
      );

      await conn.commit();
      return { bookingId: result.insertId, totalPrice, expiresAt };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  /**
   * Cancel a booking
   */
  async cancel(bookingId, userId, role) {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) throw { status: 404, message: 'Booking not found' };
    if (role === 'customer' && booking.user_id !== userId)
      throw { status: 403, message: 'Not your booking' };
    if (!['pending','paid'].includes(booking.status))
      throw { status: 400, message: 'Cannot cancel this booking' };

    // Policy: must be at least 1 day before
    const today = new Date(); today.setHours(0,0,0,0);
    const bDate  = new Date(booking.booking_date);
    const diff   = (bDate - today) / (1000 * 60 * 60 * 24);
    if (diff < 1) throw { status: 400, message: 'Cancellation requires at least 1 day notice' };

    await BookingModel.updateStatus(bookingId, 'cancelled');
    return { refundEligible: booking.status === 'paid', amount: booking.total_price };
  },

  /**
   * Get available desks for a slot
   */
  async checkAvailability(spaceId, bookingDate, timeSlot, startTime, endTime) {
    let resolvedStart = startTime;
    let resolvedEnd   = endTime;
    if (timeSlot && timeSlot !== 'custom') {
      const preset = TIME_SLOTS[timeSlot];
      resolvedStart = preset.start;
      resolvedEnd   = preset.end;
    }
    const [spaceRows] = await db.execute('SELECT total_desks FROM spaces WHERE id = ?', [spaceId]);
    const totalDesks  = spaceRows[0]?.total_desks || 0;
    const booked      = await BookingModel.countBookedDesks(spaceId, bookingDate, resolvedStart, resolvedEnd);
    return { totalDesks, bookedDesks: booked, availableDesks: totalDesks - booked };
  }
};

module.exports = BookingService;
