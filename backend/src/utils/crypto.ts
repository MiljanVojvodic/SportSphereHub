import crypto from 'crypto';

const PASSWORD_SECRET = 'sportsphere_pwd_2025';
const JWT_SECRET = 'sportsphere_jwt_2025';

export function hashPassword(password: string): string {
  return crypto.createHmac('sha256', PASSWORD_SECRET).update(password).digest('hex');
}

export function comparePassword(plain: string, hashed: string): boolean {
  return hashPassword(plain) === hashed;
}

export function createToken(payload: Record<string, unknown>, expiresInHours = 24): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + expiresInHours * 3600;
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

export function verifyToken(token: string): Record<string, unknown> {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token format');
  const [header, body, sig] = parts;
  const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  if (sig !== expected) throw new Error('Invalid token signature');
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as Record<string, unknown>;
  if (typeof payload.exp === 'number' && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired');
  }
  return payload;
}
