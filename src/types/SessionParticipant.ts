import { Optional } from "sequelize";

// * SessionParticipant attributes
export interface SessionParticipantAttributes {
	id: number;
	sessionId: number;
	userId: number;
	role?: string | null;
	createdAt?: Date;
	updatedAt?: Date;
}
export type SessionParticipantCreationAttributes =
	Optional<SessionParticipantAttributes, 'id' | 'role' | 'createdAt' | 'updatedAt'>;