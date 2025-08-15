import http from 'http';
import { Server as IOServer, Socket } from 'socket.io';
import type { StickerPayload, ParticipantPayload, VerifyFn } from './types';
import "dotenv/config";

export class SocketManager {
	private io?: IOServer;
	constructor(private options: { verifyToken?: VerifyFn } = {}) { }

	init(server: http.Server) {
		this.io = new IOServer(server, {
			cors: { origin: '*' }
		});

		this.io.on('connection', (socket) => this.onConnection(socket));
	}

	private async onConnection(socket: Socket) {
		const handshake = socket.handshake;

		console.log('Socket connected:', socket.id, handshake);

		const token = socket.handshake.auth?.token as string | undefined;
		if (token && this.options.verifyToken) {
			try {
				const decoded = await this.options.verifyToken(token);
				if (decoded?.userId) socket.data.userId = decoded.userId;
			} catch (err) {
				console.warn('socket token verify failed', err);
			}
		}

		socket.on('joinSession', (payload: { sessionId: string }) => {
			const { sessionId } = payload || {};
			if (!sessionId) return;
			const room = `session:${sessionId}`;
			socket.join(room);
			socket.emit('joined', { sessionId });
		});

		socket.on('leaveSession', (payload: { sessionId: string }) => {
			const { sessionId } = payload || {};
			if (!sessionId) return;
			const room = `session:${sessionId}`;
			socket.leave(room);
		});

		socket.on('disconnect', (reason) => {
			console.log('Socket disconnected:', socket.id, reason);
		});
	}

	// * helpers
	emitToSessionStickerCreated(sessionId: string, payload: StickerPayload) {
		this.io?.to(`session:${sessionId}`).emit('stickerCreated', payload);
	}

	emitToSessionStickerUpdated(sessionId: string, payload: StickerPayload) {
		this.io?.to(`session:${sessionId}`).emit('stickerUpdated', payload);
	}

	emitToSessionStickerDeleted(sessionId: string, payload: { id: string }) {
		this.io?.to(`session:${sessionId}`).emit('stickerDeleted', payload);
	}

	emitParticipantJoined(sessionId: string, payload: ParticipantPayload) {
		this.io?.to(`session:${sessionId}`).emit('participantJoined', payload);
	}

	emitParticipantLeft(sessionId: string, payload: ParticipantPayload) {
		this.io?.to(`session:${sessionId}`).emit('participantLeft', payload);
	}
}
