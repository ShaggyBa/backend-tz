import type { RequestHandler } from 'express';
import { verifyToken } from '../utils/jwt';
import { AuthedRequest } from '../types';

export const requireAuth: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Authorization header missing' });

  const [scheme, token] = header.split(' ');
  if (!token || scheme.toLowerCase() !== 'bearer')
    return res.status(401).json({ error: 'Invalid auth header' });

  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });
  (req as AuthedRequest).userId = payload.userId;
  return next();
};
