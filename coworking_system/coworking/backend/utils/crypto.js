/**
 * AES-256-CBC Encryption/Decryption Utility
 * Used for encrypting sensitive personal data (phone, address)
 */
const crypto = require('crypto');
require('dotenv').config();

const ALGORITHM = 'aes-256-cbc';
const SECRET    = process.env.AES_SECRET_KEY || 'coworking_aes_key_32chars_2024!!';
const KEY       = crypto.scryptSync(SECRET, 'salt', 32);

/**
 * Encrypt plaintext string
 * @param {string} text - plaintext to encrypt
 * @returns {string} - "iv:encrypted" hex string
 */
function encrypt(text) {
  if (!text) return '';
  const iv         = crypto.randomBytes(16);
  const cipher     = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted  = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypt encrypted string
 * @param {string} encryptedText - "iv:encrypted" hex string
 * @returns {string} - plaintext
 */
function decrypt(encryptedText) {
  if (!encryptedText || !encryptedText.includes(':')) return encryptedText || '';
  try {
    const [ivHex, encHex] = encryptedText.split(':');
    const iv              = Buffer.from(ivHex, 'hex');
    const encBuf          = Buffer.from(encHex, 'hex');
    const decipher        = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    const decrypted       = Buffer.concat([decipher.update(encBuf), decipher.final()]);
    return decrypted.toString('utf8');
  } catch {
    return encryptedText;
  }
}

module.exports = { encrypt, decrypt };
