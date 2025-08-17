import type { Session, SessionParticipant } from '../models';

export type AuthedRequest = import('express').Request & { userId?: string };

export type TokenPayload = {
  userId: string;
};

export type SessionAccess = {
  allowed: boolean;
  role?: string | null;
  session?: Session | null;
  participant?: SessionParticipant | null;
  reason?: string;
};
