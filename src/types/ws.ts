import { Server, Socket } from 'socket.io';
import { SessionAttributes } from './Session';
import { SessionParticipantAttributes } from './SessionParticipant';
import { StickerAttributes } from './Sticker';

export interface ParticipantPayload {
	id: string;
	sessionId?: string;
	userId: string;
	role?: string | null;
	createdAt?: string;
}

export interface StickerPayload {
	id: string;
	sessionId: string;
	userId: string;
	text: string;
	x: number;
	y: number;
	color?: string | null;
	createdAt?: string;
	updatedAt?: string;
}

export type VerifyFn = (token: string) => Promise<{ userId: string } | null> | { userId: string } | null;

export interface ISocketManager {
	init(server: import('http').Server): void;
	emitToSessionStickerCreated(sessionId: string, payload: unknown): void;
	emitToSessionStickerUpdated(sessionId: string, payload: unknown): void;
	emitToSessionStickerDeleted(sessionId: string, payload: unknown): void;
	emitParticipantJoined(sessionId: string, payload: unknown): void;
	emitParticipantLeft(sessionId: string, payload: unknown): void;
	io?: Server;
}

export const nullBus: ISocketManager = {
	init: () => { },
	emitToSessionStickerCreated: () => { },
	emitToSessionStickerUpdated: () => { },
	emitToSessionStickerDeleted: () => { },
	emitParticipantJoined: () => { },
	emitParticipantLeft: () => { },
	io: undefined,
};