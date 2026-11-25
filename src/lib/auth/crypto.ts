import crypto from 'node:crypto';
import { SessionData, DEFAULT_DEV_SESSION_SECRET } from './constants';

export function getSessionSecret(): string {
  return process.env.SESSION_SECRET || DEFAULT_DEV_SESSION_SECRET;
}

/**
 * Computes HMAC-SHA-256 over a payload string.
 */
export function computeHmac(payload: string, secret: string = getSessionSecret()): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Signs a SessionData object into a tamper-evident session token:
 * format: `${base64Json}.${hmacHex}`
 */
export function signSessionPayload(data: SessionData, secret: string = getSessionSecret()): string {
  const jsonStr = JSON.stringify(data);
  const base64 = Buffer.from(jsonStr, 'utf-8').toString('base64url');
  const signature = computeHmac(base64, secret);
  return `${base64}.${signature}`;
}

/**
 * Verifies the integrity, signature, and expiry of a session token.
 * Rejects forged, altered, or expired tokens using timing-safe comparison.
 */
export function verifySessionToken(token: string, secret: string = getSessionSecret()): SessionData | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [base64Payload, providedSignature] = parts;
  if (!base64Payload || !providedSignature) return null;

  const expectedSignature = computeHmac(base64Payload, secret);

  // Timing-safe comparison to prevent timing attacks
  const providedBuffer = Buffer.from(providedSignature, 'hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');

  if (providedBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const jsonStr = Buffer.from(base64Payload, 'base64url').toString('utf-8');
    const session = JSON.parse(jsonStr) as SessionData;

    // Check expiration
    if (typeof session.expiresAt === 'number' && Date.now() > session.expiresAt) {
      return null; // Expired token
    }

    // Required fields check
    if (!session.userId || !session.username || !session.role) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}
