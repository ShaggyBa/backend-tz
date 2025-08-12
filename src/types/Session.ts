import { Optional } from "sequelize";

// * Session attributes
export interface SessionAttributes {
	id: number;
	name: string;
	createdAt?: Date;
	updatedAt?: Date;
}
export type SessionCreationAttributes = Optional<SessionAttributes, 'id' | 'createdAt' | 'updatedAt'>;
