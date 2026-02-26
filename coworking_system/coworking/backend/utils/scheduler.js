/**
 * Background Scheduler
 * Runs every minute to expire unpaid bookings after 30 minutes
 */
const cron         = require('node-cron');
const BookingModel = require('../models/bookingModel');

function startScheduler() {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const expired = await BookingModel.expirePending();
      if (expired > 0) {
        console.log(`[Scheduler] Expired ${expired} pending booking(s)`);
      }
    } catch (err) {
      console.error('[Scheduler] Error expiring bookings:', err.message);
    }
  });
  console.log('[Scheduler] Booking expiration scheduler started');
}

module.exports = { startScheduler };
