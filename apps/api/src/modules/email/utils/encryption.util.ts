import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionUtil {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits

  private get encryptionKey(): Buffer {
    const key = process.env.EMAIL_ENCRYPTION_KEY;
    if (!key) {
      throw new Error(
        'EMAIL_ENCRYPTION_KEY environment variable is not set. Generate one with: openssl rand -hex 32',
      );
    }
    if (key.length !== 64) {
      throw new Error(
        'EMAIL_ENCRYPTION_KEY must be 64 hex characters (32 bytes). Generate one with: openssl rand -hex 32',
      );
    }
    return Buffer.from(key, 'hex');
  }

  /**
   * Encrypts text using AES-256-GCM
   * @param text Plain text to encrypt
   * @returns Encrypted string in format: iv:authTag:encrypted
   */
  encrypt(text: string): string {
    try {
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipheriv(
        this.algorithm,
        this.encryptionKey,
        iv,
      );

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const authTag = cipher.getAuthTag().toString('hex');

      return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypts text encrypted with AES-256-GCM
   * @param encryptedData Encrypted string in format: iv:authTag:encrypted
   * @returns Decrypted plain text
   */
  decrypt(encryptedData: string): string {
    try {
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const [ivHex, authTagHex, encrypted] = parts;

      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.encryptionKey,
        Buffer.from(ivHex, 'hex'),
      );

      decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Encrypts a JSON object
   * @param obj Object to encrypt
   * @returns Encrypted string
   */
  encryptObject(obj: Record<string, any>): string {
    return this.encrypt(JSON.stringify(obj));
  }

  /**
   * Decrypts a JSON object
   * @param encryptedData Encrypted string
   * @returns Decrypted object
   */
  decryptObject<T = Record<string, any>>(encryptedData: string): T {
    const decrypted = this.decrypt(encryptedData);
    return JSON.parse(decrypted) as T;
  }
}
