import cookie from 'cookie';
import "dotenv/config";
import http from 'http';
import { DefaultEventsMap, Server as IOServer, } from 'socket.io';
import type { ParticipantPayload, SocketData, SocketManagerOptions, StickerPayload, TSocket } from './types';
import { verifyToken } from './utils/jwt';

export class SocketManager {
	private io?: IOServer<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>;
	constructor(private options: SocketManagerOptions = {}) { }

	init(server: http.Server) {
		this.io = new IOServer(server, {
			cors: { origin: '*' }
		});

		this.io.use(async (socket: TSocket, next) => {
			try {
				const authTokenRaw = socket.handshake.auth?.token as string | undefined;
				let token: string | undefined;

				if (authTokenRaw) {
					token = authTokenRaw.startsWith('Bearer ')
						? authTokenRaw.split(' ')[1]
						: authTokenRaw;
				} else {
					const cookieHeader = socket.handshake.headers.cookie;
					if (cookieHeader) {
						const parsed = cookie.parse(cookieHeader);
						token = parsed.refreshToken;
					}
				}

				if (!token) {
					return next(new Error('Auth token missing'));
				}

				// options.verifyToken может быть sync/async — используем её если предоставлена
				const result = this.options.verifyToken ? await this.options.verifyToken(token) : null;
				if (result && result.userId) {
					socket.data = socket.data ?? {};
					socket.data.userId = result.userId;
				} else {
					return next(new Error('Invalid token'));
				}

				return next();
			} catch (err) {
				return next(err as Error);
			}
		});

		this.io.on('connection', (socket) => this.onConnection(socket as TSocket));
	}

	private async onConnection(socket: TSocket) {
		socket.data = socket.data ?? {};

		const handshake = socket.handshake;
		console.log('Socket connected:', socket.id, socket.data?.userId);

		const raw = handshake?.auth?.token as string | undefined;
		const token = typeof raw === 'string' ? raw.replace(/^Bearer\s+/i, '') : undefined;

		if (token && this.options.verifyToken) {
			try {
				const decoded = await this.options.verifyToken(token);
				if (decoded && decoded.userId) {
					socket.data.userId = decoded.userId;
				}
			} catch (err) {
				console.warn('socket token verify failed', err);
				socket.disconnect();
				return;
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

		socket.on('reauth', async (payload: { token?: string }, cb?: (err?: string | null, ok?: { ok: true } | null) => void) => {
			try {
				const rawTok = payload?.token ?? '';
				const rawToken = typeof rawTok === 'string' ? rawTok.replace(/^Bearer\s+/i, '') : undefined;
				if (!rawToken) {
					return cb?.('token_missing', null);
				}

				const decoded = verifyToken(rawToken);
				if (!decoded || !decoded.userId) {
					return cb?.('invalid_token', null);
				}

				socket.data = socket.data ?? {};
				socket.data.userId = decoded.userId;
				return cb?.(null, { ok: true });
			} catch (err) {
				console.warn('reauth error', err);
				return cb?.('error', null);
			}
		});

		socket.on('disconnect', (reason) => {
			console.log('Socket disconnected:', socket.id, reason);
		});
	}

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

	async close(): Promise<void> {
		return new Promise((resolve) => {
			if (!this.io) return resolve();
			this.io.close(() => resolve());
		});
	}
}
