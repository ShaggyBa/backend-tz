import type { Optional } from 'sequelize';

// * Sticker attributes
export interface StickerAttributes {
  id: string;
  sessionId: string;
  userId: string;
  text: string;
  x: number;
  y: number;
  color?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}
export type StickerCreationAttributes = Optional<
  StickerAttributes,
  'id' | 'color' | 'createdAt' | 'updatedAt'
>;
