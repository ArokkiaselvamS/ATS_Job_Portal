"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.maskCredentials = maskCredentials;
const crypto_1 = require("crypto");
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 16;
function getMasterKey() {
    const secret = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'default-dev-secret-change-in-production';
    return (0, crypto_1.scryptSync)(secret, 'aescion-salt', KEY_LENGTH);
}
function encrypt(text) {
    try {
        const key = getMasterKey();
        const iv = (0, crypto_1.randomBytes)(IV_LENGTH);
        const cipher = (0, crypto_1.createCipheriv)(ALGORITHM, key, iv);
        const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
        const tag = cipher.getAuthTag();
        // Combine: salt + iv + tag + encrypted
        const result = Buffer.concat([iv, tag, encrypted]);
        return result.toString('base64');
    }
    catch (error) {
        throw new Error('Encryption failed');
    }
}
function decrypt(encryptedData) {
    try {
        const key = getMasterKey();
        const combined = Buffer.from(encryptedData, 'base64');
        const iv = combined.subarray(0, IV_LENGTH);
        const tag = combined.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
        const encrypted = combined.subarray(IV_LENGTH + TAG_LENGTH);
        const decipher = (0, crypto_1.createDecipheriv)(ALGORITHM, key, iv);
        decipher.setAuthTag(tag);
        const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
        return decrypted.toString('utf8');
    }
    catch (error) {
        throw new Error('Decryption failed');
    }
}
function maskCredentials(credentials) {
    if (!credentials)
        return '';
    if (credentials.length <= 8)
        return '********';
    return credentials.slice(0, 4) + '*'.repeat(credentials.length - 8) + credentials.slice(-4);
}
