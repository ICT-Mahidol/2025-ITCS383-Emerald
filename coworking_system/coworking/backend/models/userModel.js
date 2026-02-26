/**
 * User Model
 * Database operations for users table
 */
const db = require('./db');
const { encrypt, decrypt } = require('../utils/crypto');

const UserModel = {
  /**
   * Create a new user
   */
  async create({ firstName, lastName, email, password, phone, address, role = 'customer' }) {
    const [result] = await db.execute(
      `INSERT INTO users (first_name, last_name, email, password, phone, address, role)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [firstName, lastName, email, password, encrypt(phone), encrypt(address), role]
    );
    return result.insertId;
  },

  /**
   * Find user by email
   */
  async findByEmail(email) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ? AND is_active = 1 LIMIT 1',
      [email]
    );
    if (!rows.length) return null;
    return decryptUser(rows[0]);
  },

  /**
   * Find user by ID
   */
  async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE id = ? AND is_active = 1 LIMIT 1',
      [id]
    );
    if (!rows.length) return null;
    return decryptUser(rows[0]);
  },

  /**
   * Get all users (manager use)
   */
  async findAll({ role, page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    let query  = 'SELECT * FROM users WHERE is_active = 1';
    const params = [];
    if (role) { query += ' AND role = ?'; params.push(role); }
    query += ` ORDER BY created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;
    const [rows] = await db.execute(query, params);
    return rows.map(decryptUser);
  },

  /**
   * Update user
   */
  async update(id, fields) {
    const allowed = ['first_name','last_name','phone','address','is_active'];
    const sets = [], params = [];
    for (const [k, v] of Object.entries(fields)) {
      if (!allowed.includes(k)) continue;
      if (k === 'phone' || k === 'address') {
        sets.push(`${k} = ?`); params.push(encrypt(v));
      } else {
        sets.push(`${k} = ?`); params.push(v);
      }
    }
    if (!sets.length) return false;
    params.push(id);
    await db.execute(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, params);
    return true;
  },

  /**
   * Delete (soft-delete) user
   */
  async delete(id) {
    await db.execute('UPDATE users SET is_active = 0 WHERE id = ?', [id]);
    return true;
  },

  /**
   * Count users
   */
  async count(role) {
    const params = [];
    let q = 'SELECT COUNT(*) as cnt FROM users WHERE is_active = 1';
    if (role) { q += ' AND role = ?'; params.push(role); }
    const [rows] = await db.execute(q, params);
    return rows[0].cnt;
  }
};

function decryptUser(user) {
  if (!user) return null;
  return {
    ...user,
    phone:   decrypt(user.phone),
    address: decrypt(user.address),
  };
}

module.exports = UserModel;
