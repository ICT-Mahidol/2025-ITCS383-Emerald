/**
 * Database Connection Pool
 * Uses mysql2 with connection pooling for scalability
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               parseInt(process.env.DB_PORT) || 3306,
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'coworking_db',
  waitForConnections: true,
  connectionLimit:    parseInt(process.env.DB_POOL_SIZE) || 10,
  queueLimit:         0,
  charset:            'utf8mb4',
  timezone:           '+00:00',
});

// Test connection on startup
pool.getConnection()
  .then(conn => {
    console.log('[DB] MySQL connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('[DB] MySQL connection failed:', err.message);
  });

module.exports = pool;
