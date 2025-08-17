import type { Optional } from 'sequelize';

// * Session attributes
export interface SessionAttributes {
  id: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
  ownerId: string;
}
export type SessionCreationAttributes = Optional<
  SessionAttributes,
  'id' | 'createdAt' | 'updatedAt'
>;

type Source = 'params' | 'body' | 'query';

export type RequireSessionAccessOptions = {
  source?: Source;
  key?: string;
  requireSessionId?: boolean;
  requireOwner?: boolean; // true — только владелец; false — owner OR participant
};
