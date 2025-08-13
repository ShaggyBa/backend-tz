import { Optional } from "sequelize";

// * User attributes 
export interface UserAttributes {
	id: string;
	email: string;
	name?: string | null;
	passwordHash: string;
	jwtToken?: string | null;
	createdAt?: Date;
	updatedAt?: Date;
}
export type UserCreationAttributes = Optional<UserAttributes, 'id' | 'name' | 'jwtToken' | 'createdAt' | 'updatedAt'>;
