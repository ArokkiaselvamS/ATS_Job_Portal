import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 16;

function getMasterKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'default-dev-secret-change-in-production';
  return scryptSync(secret, 'aescion-salt', KEY_LENGTH);
}

export function encrypt(text: string): string {
  try {
    const key = getMasterKey();
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, key, iv);
    
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    
    // Combine: salt + iv + tag + encrypted
    const result = Buffer.concat([iv, tag, encrypted]);
    return result.toString('base64');
  } catch (error) {
    throw new Error('Encryption failed');
  }
}

export function decrypt(encryptedData: string): string {
  try {
    const key = getMasterKey();
    const combined = Buffer.from(encryptedData, 'base64');
    
    const iv = combined.subarray(0, IV_LENGTH);
    const tag = combined.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const encrypted = combined.subarray(IV_LENGTH + TAG_LENGTH);
    
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (error) {
    throw new Error('Decryption failed');
  }
}

export function maskCredentials(credentials: string): string {
  if (!credentials) return '';
  if (credentials.length <= 8) return '********';
  return credentials.slice(0, 4) + '*'.repeat(credentials.length - 8) + credentials.slice(-4);
}