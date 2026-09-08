/**
 * Admin session handling.
 *
 * The password is never stored — only its SHA-256 hash, in a Worker secret.
 * The session cookie is an HMAC-signed payload, so it cannot be forged
 * without SESSION_SECRET.
 */

const COOKIE = 'kc_admin';
const TTL_SECONDS = 60 * 60 * 12; // 12 hours

const enc = new TextEncoder();

const toHex = (buf: ArrayBuffer) =>
  [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

export async function sha256Hex(input: string): Promise<string> {
  return toHex(await crypto.subtle.digest('SHA-256', enc.encode(input)));
}

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  return toHex(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}

/** Constant-time compare — avoids leaking match position via timing. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function verifyPassword(
  password: string,
  expectedHash: string,
): Promise<boolean> {
  if (!expectedHash) return false;
  return safeEqual(await sha256Hex(password), expectedHash.toLowerCase().trim());
}

export async function createSessionCookie(secret: string): Promise<string> {
  const expires = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const payload = `admin.${expires}`;
  const sig = await hmac(secret, payload);
  const value = `${payload}.${sig}`;
  return `${COOKIE}=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${TTL_SECONDS}`;
}

export function clearSessionCookie(): string {
  return `${COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

export async function isAuthed(request: Request, secret: string): Promise<boolean> {
  const raw = request.headers.get('Cookie') || '';
  const match = raw.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  if (!match || !secret) return false;

  const parts = match[1].split('.');
  if (parts.length !== 3) return false;
  const [subject, expires, sig] = parts;

  if (subject !== 'admin') return false;
  if (Number(expires) < Math.floor(Date.now() / 1000)) return false;

  return safeEqual(sig, await hmac(secret, `${subject}.${expires}`));
}

export function unauthorized(): Response {
  return Response.json({ error: 'Not signed in' }, { status: 401 });
}
