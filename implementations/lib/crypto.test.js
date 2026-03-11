const cryptoLib = require('./crypto');
const crypto = require('crypto');

// Helper to encrypt using the old AES-256-CBC method for testing backward compatibility
function encryptOldFormat(text, keyHex) {
    const ALGORITHM = 'aes-256-cbc';
    const IV_LENGTH = 16;
    const key = Buffer.from(keyHex, 'hex');
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

describe('lib/crypto', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    describe('getKey', () => {
        it('should throw an error if ENCRYPTION_KEY is not set', () => {
            delete process.env.ENCRYPTION_KEY;
            expect(() => cryptoLib.encrypt('test')).toThrow('ENCRYPTION_KEY must be a 64-character hex string in .env');
        });

        it('should throw an error if ENCRYPTION_KEY is not 64 characters length', () => {
            process.env.ENCRYPTION_KEY = 'invalidkey';
            expect(() => cryptoLib.encrypt('test')).toThrow('ENCRYPTION_KEY must be a 64-character hex string in .env');
        });
    });

    describe('encrypt & decrypt (GCM)', () => {
        beforeEach(() => {
            // 64 character hex string
            process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
        });

        it('should return falsy value if text is null or undefined', () => {
            expect(cryptoLib.encrypt(undefined)).toBeUndefined();
            expect(cryptoLib.encrypt(null)).toBeNull();
            expect(cryptoLib.encrypt('')).toBe('');
        });

        it('should return falsy value if encryptedText is null or undefined or empty or invalid', () => {
            expect(cryptoLib.decrypt(undefined)).toBeUndefined();
            expect(cryptoLib.decrypt(null)).toBeNull();
            expect(cryptoLib.decrypt('')).toBe('');
            expect(cryptoLib.decrypt('invalidformat')).toBe('invalidformat');
        });

        it('should correctly encrypt and decrypt a string', () => {
            const originalText = 'Hello, secure world!';
            const encrypted = cryptoLib.encrypt(originalText);
            expect(encrypted).not.toBe(originalText);
            expect(encrypted).toContain(':');

            const decrypted = cryptoLib.decrypt(encrypted);
            expect(decrypted).toBe(originalText);
        });

        it('encrypted output should contain 3 parts: iv, authTag, encrypted', () => {
            const encrypted = cryptoLib.encrypt('test');
            const parts = encrypted.split(':');
            expect(parts.length).toBe(3);
        });
    });

    describe('backward compatibility (CBC)', () => {
        beforeEach(() => {
            process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
        });

        it('should correctly decrypt old AES-256-CBC format', () => {
            const originalText = 'Legacy data is safe';
            const oldEncrypted = encryptOldFormat(originalText, process.env.ENCRYPTION_KEY);

            // Verify format 
            expect(oldEncrypted.split(':').length).toBe(2);

            const decrypted = cryptoLib.decrypt(oldEncrypted);
            expect(decrypted).toBe(originalText);
        });
    });
});
