import crypto from 'crypto';

// The key must be exactly 32 bytes (256 bits) for aes-256-cbc.
// We fallback to a hashed version of the DATABASE_URL or a generic string if a dedicated encryption key is missing.
// It is recommended to add CHAT_ENCRYPTION_KEY to your .env file.
const getEncryptionKey = (): Buffer => {
  const secret = process.env.CHAT_ENCRYPTION_KEY || process.env.DATABASE_URL || 'default-secret-fallback-do-not-use-in-prod';
  return crypto.createHash('sha256').update(String(secret)).digest();
};

const ENCRYPTION_KEY = getEncryptionKey(); // Must be 256 bits (32 bytes)
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypts a string using AES-256-CBC.
 * Returns a hex string formatted as "iv:encryptedData".
 */
export function encrypt(text: string): string {
  if (!text) return text;

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);

  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypts an AES-256-CBC encrypted string formatted as "iv:encryptedData".
 * Falls back gracefully to returning the original string if it's not encrypted
 * (useful for migrating legacy unencrypted data).
 */
export function decrypt(text: string): string {
  if (!text) return text;

  try {
    const textParts = text.split(':');

    // If it doesn't match the iv:data format, assume it's unencrypted legacy data.
    if (textParts.length !== 2) return text;

    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = Buffer.from(textParts[1], 'hex');

    // Verify IV length to prevent cipher initialization errors
    if (iv.length !== IV_LENGTH) return text;

    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);

    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  } catch (error) {
    // If decryption fails (e.g. bad key, corrupted data), return a fallback message
    // rather than throwing and breaking the whole chat feed.
    console.error('Decryption failed for a message block.');
    return '[Message corrupted or encrypted with a different key]';
  }
}
