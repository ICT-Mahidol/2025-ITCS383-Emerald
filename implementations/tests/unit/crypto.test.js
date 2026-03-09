const TEST_KEY = 'aa'.repeat(32); // 64 hex chars = valid 256-bit key

let encrypt, decrypt;

beforeEach(() => {
  process.env.ENCRYPTION_KEY = TEST_KEY;
  // Re-require to pick up fresh env
  jest.resetModules();
  ({ encrypt, decrypt } = require('../../lib/crypto'));
});

afterEach(() => {
  delete process.env.ENCRYPTION_KEY;
});

describe('lib/crypto.js', () => {
  describe('encrypt / decrypt roundtrip', () => {
    test('encrypts and decrypts a simple string', () => {
      const original = 'Hello World';
      const encrypted = encrypt(original);
      expect(encrypted).not.toBe(original);
      expect(encrypted).toContain(':');
      expect(decrypt(encrypted)).toBe(original);
    });

    test('produces different ciphertext each time (random IV)', () => {
      const text = 'same input';
      const enc1 = encrypt(text);
      const enc2 = encrypt(text);
      expect(enc1).not.toBe(enc2);
      expect(decrypt(enc1)).toBe(text);
      expect(decrypt(enc2)).toBe(text);
    });

    test('handles special characters and unicode', () => {
      const text = 'สวัสดี 🌍 café \n\t "quotes"';
      const encrypted = encrypt(text);
      expect(decrypt(encrypted)).toBe(text);
    });

    test('handles long strings', () => {
      const text = 'A'.repeat(10000);
      const encrypted = encrypt(text);
      expect(decrypt(encrypted)).toBe(text);
    });
  });

  describe('edge cases', () => {
    test('encrypt(null) returns null', () => {
      expect(encrypt(null)).toBeNull();
    });

    test('encrypt(undefined) returns undefined', () => {
      expect(encrypt(undefined)).toBeUndefined();
    });

    test("encrypt('') returns empty string", () => {
      expect(encrypt('')).toBe('');
    });

    test('decrypt(null) returns null', () => {
      expect(decrypt(null)).toBeNull();
    });

    test('decrypt(text without colon) returns text unchanged', () => {
      expect(decrypt('plaintext')).toBe('plaintext');
    });
  });

  describe('key validation', () => {
    test('throws if ENCRYPTION_KEY is missing', () => {
      delete process.env.ENCRYPTION_KEY;
      jest.resetModules();
      const { encrypt: enc } = require('../../lib/crypto');
      expect(() => enc('test')).toThrow('ENCRYPTION_KEY');
    });
  });
});
