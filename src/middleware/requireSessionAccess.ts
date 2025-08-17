import type { RequestHandler } from 'express';
import { Session, SessionParticipant } from '../models';
import { RequireSessionAccessOptions } from '../types';

export const requireSessionAccess = (opts: RequireSessionAccessOptions = {}): RequestHandler => {
  const { source = 'params', key, requireSessionId = true, requireOwner = false } = opts;

  const defaultKey = source === 'params' ? 'id' : 'sessionId';
  const usedKey = key ?? defaultKey;

  return async (req, res, next) => {
    try {
      const userId = (req as any).userId as string | undefined;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const container: Record<string, any> =
        source === 'params' ? req.params : source === 'body' ? req.body : req.query;

      const sessionIdRaw = container?.[usedKey];
      if (!sessionIdRaw) {
        if (requireSessionId) return res.status(400).json({ error: 'Missing sessionId' });
        (req as any).sessionAccess = {
          allowed: false,
          owner: false,
          session: null,
          reason: 'Missing sessionId',
        };
        return next();
      }

      const sessionId = String(sessionIdRaw);

      const session = await Session.findByPk(sessionId);
      if (!session) {
        (req as any).sessionAccess = {
          allowed: false,
          owner: false,
          session: null,
          reason: 'Session not found',
        };
        return res.status(404).json({ error: 'Session not found' });
      }
      if (session.ownerId === userId) {
        (req as any).sessionAccess = { allowed: true, owner: true, session, participant: null };
        return next();
      }

      if (requireOwner) {
        (req as any).sessionAccess = {
          allowed: false,
          owner: false,
          session,
          reason: 'Only owner allowed',
        };
        return res.status(403).json({ error: 'Only owner allowed' });
      }

      const participant = await SessionParticipant.findOne({ where: { sessionId, userId } });
      if (!participant) {
        (req as any).sessionAccess = { allowed: false, owner: false, session, reason: 'Forbidden' };
        return res.status(403).json({ error: 'Forbidden' });
      }

      (req as any).sessionAccess = { allowed: true, owner: false, session, participant };
      return next();
    } catch (err) {
      return next(err);
    }
  };
};
