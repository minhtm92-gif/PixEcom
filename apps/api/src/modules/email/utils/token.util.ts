import * as crypto from 'crypto';

/**
 * Generates a secure random token and its hash
 * @returns Object containing the plain token and its SHA-256 hash
 */
export function generateToken(): { token: string; hash: string } {
  const token = crypto.randomBytes(32).toString('hex');
  const hash = hashToken(token);
  return { token, hash };
}

/**
 * Hashes a token using SHA-256
 * @param token Plain text token
 * @returns SHA-256 hash of the token
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Verifies a token against a stored hash
 * @param token Plain text token
 * @param hash Stored hash to compare against
 * @returns True if token matches hash
 */
export function verifyToken(token: string, hash: string): boolean {
  const computedHash = hashToken(token);
  return crypto.timingSafeEqual(
    Buffer.from(computedHash),
    Buffer.from(hash),
  );
}

/**
 * Generates a recovery token for abandoned cart emails
 * @returns Object containing token and hash
 */
export function generateRecoveryToken(): { token: string; hash: string } {
  return generateToken();
}

/**
 * Generates an unsubscribe token for email subscriptions
 * @returns Object containing token and hash
 */
export function generateUnsubscribeToken(): { token: string; hash: string } {
  return generateToken();
}
