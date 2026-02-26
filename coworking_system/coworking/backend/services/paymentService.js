/**
 * Payment Service
 * Handles mock payment processing for credit card, bank transfer, TrueWallet
 */
const { v4: uuidv4 }  = require('uuid');
const PaymentModel    = require('../models/paymentModel');
const BookingModel    = require('../models/bookingModel');
const db              = require('../models/db');

// ============================================================
// Mock payment processors
// ============================================================

async function processCreditCard({ amount, cardNumber, cardHolder, expiry, cvv }) {
  // Simulate processing delay
  await sleep(300);
  // Mock: cards starting with 4 succeed, others fail
  if (!cardNumber || !String(cardNumber).startsWith('4')) {
    return { success: false, ref: null, message: 'Card declined' };
  }
  return { success: true, ref: 'CC-' + uuidv4().slice(0, 8).toUpperCase(), message: 'Approved' };
}

async function processBankTransfer({ amount, bankCode, accountNumber, accountName }) {
  await sleep(500);
  // Mock: all bank transfers succeed
  return { success: true, ref: 'BT-' + uuidv4().slice(0, 8).toUpperCase(), message: 'Transfer confirmed' };
}

async function processTrueWallet({ amount, phone }) {
  await sleep(200);
  // Mock: phone must be 10 digits
  if (!phone || !/^\d{10}$/.test(String(phone))) {
    return { success: false, ref: null, message: 'Invalid TrueWallet phone number' };
  }
  return { success: true, ref: 'TW-' + uuidv4().slice(0, 8).toUpperCase(), message: 'TrueWallet payment successful' };
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ============================================================

const PaymentService = {
  /**
   * Process payment for a booking
   */
  async processPayment({ bookingId, userId, method, paymentDetails }) {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) throw { status: 404, message: 'Booking not found' };
    if (booking.user_id !== userId) throw { status: 403, message: 'Not your booking' };
    if (booking.status !== 'pending') throw { status: 400, message: 'Booking is not pending payment' };

    // Check not expired
    if (new Date(booking.expires_at) < new Date()) {
      await BookingModel.updateStatus(bookingId, 'expired');
      throw { status: 400, message: 'Booking has expired' };
    }

    // Create pending payment record
    const paymentId = await PaymentModel.create({
      bookingId, userId,
      amount: booking.total_price,
      method, status: 'pending'
    });

    // Process via mock gateway
    let result;
    switch (method) {
      case 'credit_card':    result = await processCreditCard(paymentDetails);   break;
      case 'bank_transfer':  result = await processBankTransfer(paymentDetails); break;
      case 'truewallet':     result = await processTrueWallet(paymentDetails);   break;
      default: throw { status: 400, message: 'Invalid payment method' };
    }

    if (result.success) {
      // Use DB transaction to update payment + booking atomically
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();
        await conn.execute(
          `UPDATE payments SET status = 'success', transaction_ref = ? WHERE id = ?`,
          [result.ref, paymentId]
        );
        await conn.execute(
          `UPDATE bookings SET status = 'paid' WHERE id = ?`,
          [bookingId]
        );
        await conn.commit();
      } catch (e) {
        await conn.rollback();
        throw e;
      } finally {
        conn.release();
      }
      return { success: true, transactionRef: result.ref, message: result.message };
    } else {
      await PaymentModel.updateStatus(paymentId, 'failed');
      throw { status: 402, message: result.message || 'Payment failed' };
    }
  },

  /**
   * Process refund for a cancelled paid booking
   */
  async processRefund(bookingId, userId) {
    const payment = await PaymentModel.findByBooking(bookingId);
    if (!payment || payment.status !== 'success')
      throw { status: 400, message: 'No successful payment found for this booking' };

    const refundAmount = parseFloat(payment.amount);
    await PaymentModel.recordRefund(payment.id, refundAmount);
    return { refundAmount, message: 'Refund processed successfully' };
  }
};

module.exports = PaymentService;
