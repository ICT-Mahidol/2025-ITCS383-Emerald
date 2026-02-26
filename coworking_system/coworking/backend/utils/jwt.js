/**
 * JWT Utility
 * Sign and verify JSON Web Tokens
 */
const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET  = process.env.JWT_SECRET     || 'coworking_super_secret_jwt_key_2024';
const EXPIRES = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Sign a JWT token
 * @param {object} payload - data to encode
 * @returns {string} signed JWT
 */
function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES });
}

/**
 * Verify a JWT token
 * @param {string} token
 * @returns {object} decoded payload
 */
function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { signToken, verifyToken };
