import { Optional } from "sequelize";

// * Session attributes
export interface SessionAttributes {
	id: string;
	name: string;
	createdAt?: Date;
	updatedAt?: Date;
	ownerId: string;
}
export type SessionCreationAttributes = Optional<SessionAttributes, 'id' | 'createdAt' | 'updatedAt'>;
