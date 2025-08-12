import { Optional } from "sequelize";

// * Sticker attributes
export interface StickerAttributes {
	id: number;
	sessionId: number;
	userId: number;
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