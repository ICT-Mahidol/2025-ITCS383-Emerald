function startExpiryJob(sql) {
  setInterval(async () => {
    try {
      const expired = await sql`
        UPDATE bookings
        SET status = 'expired'
        WHERE status = 'pending'
          AND expires_at IS NOT NULL
          AND expires_at < NOW()
        RETURNING id
      `;
      if (expired.length > 0) {
        console.log(`Expired ${expired.length} unpaid booking(s)`);
      }
    } catch (err) {
      console.error('Expiry job error:', err.message);
    }
  }, 60000);
}

module.exports = { startExpiryJob };
