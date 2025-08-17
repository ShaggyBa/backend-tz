import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import 'dotenv/config';
import { TokenPayload } from '../types';
import { StringValue } from 'ms';

const JWT_SECRET: Secret = (process.env.JWT_SECRET ?? 'dev-secret') as Secret;

const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES ?? '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES ?? '7d';

export function signAccessToken(payload: TokenPayload): string {
  const opts: SignOptions = { expiresIn: ACCESS_EXPIRES as StringValue };
  return jwt.sign(payload as jwt.JwtPayload, JWT_SECRET, opts);
}

export function signRefreshToken(payload: TokenPayload): string {
  const opts: SignOptions = { expiresIn: REFRESH_EXPIRES as StringValue };
  return jwt.sign(payload as jwt.JwtPayload, JWT_SECRET, opts);
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (err) {
    return null;
  }
}
