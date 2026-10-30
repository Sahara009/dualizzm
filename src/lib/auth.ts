import crypto from 'node:crypto';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export const COOKIE = 'dz_admin';
const WEEK = 60 * 60 * 24 * 7;

// На боевом сайте без своего AUTH_SECRET (32+ символа) вход в админку закрыт:
// иначе подпись сессии делалась бы общеизвестным ключом и её можно было бы подделать.
const secret = () => {
  const s = process.env.AUTH_SECRET;
  if (s && s.length >= 32) return new TextEncoder().encode(s);
  if (process.env.NODE_ENV !== 'production') return new TextEncoder().encode('dev-only-secret-change-me-dev-only-secret');
  return null;
};

export const authConfigured = () => secret() !== null;

export async function createSession(): Promise<string> {
  const key = secret();
  if (!key) throw new Error('AUTH_SECRET не задан');
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${WEEK}s`)
    .sign(key);
}

export async function verifySession(token: string | undefined): Promise<boolean> {
  const key = secret();
  if (!token || !key) return false;
  try {
    await jwtVerify(token, key);
    return true;
  } catch {
    return false;
  }
}

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return verifySession(jar.get(COOKIE)?.value);
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: WEEK,
};

export function passwordMatches(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = crypto.createHash('sha256').update(input).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

// Простой лимит попыток входа: 6 за 10 минут с одного адреса.
const attempts = new Map<string, number[]>();
export function tooManyAttempts(key: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now);
  attempts.set(key, recent);
  return recent.length > 6;
}
