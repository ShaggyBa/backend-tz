import type { Optional } from 'sequelize';

// * SessionParticipant attributes
export interface SessionParticipantAttributes {
  id: string;
  sessionId: string;
  userId: string;
  role?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}
export type SessionParticipantCreationAttributes = Optional<
  SessionParticipantAttributes,
  'id' | 'role' | 'createdAt' | 'updatedAt'
>;
