import { describe, it, expect, jest } from '@jest/globals';
import { SocketManager } from '../SocketManager';
import type { VerifyFn, StickerPayload, ParticipantPayload } from '../types';

describe('SocketManager', () => {
	it('onConnection should verify token and register handlers (joinSession)', async () => {
		const verifyFn = (async () => ({ userId: 'user-123' })) as unknown as VerifyFn;
		const sm = new SocketManager({ verifyToken: verifyFn });

		const handlers: Record<string, Function> = {};
		const fakeSocket: any = {
			id: 'socket-1',
			handshake: { auth: { token: 'tok-1' } },
			data: {},
			join: jest.fn(),
			leave: jest.fn(),
			emit: jest.fn(),
			on: (event: string, cb: Function) => {
				handlers[event] = cb;
			}
		};

		await (sm as any).onConnection(fakeSocket);

		// with token behavior
		expect(fakeSocket.data.userId).toBe('user-123');

		const sessionId = 'sess-1';
		await handlers['joinSession']({ sessionId });

		expect(fakeSocket.join).toHaveBeenCalledWith(`session:${sessionId}`);
		expect(fakeSocket.emit).toHaveBeenCalledWith('joined', { sessionId });
	});

	it('emit helpers should call io.to(room).emit(event, payload)', async () => {
		const sm = new SocketManager();

		const emitMock = jest.fn();
		const toMock = jest.fn().mockReturnValue({ emit: emitMock });

		const allSocketsMock = async () => new Set(['socket-1']);

		const fakeIo: any = {
			to: toMock,
			in: jest.fn().mockReturnValue({ allSockets: allSocketsMock }),
			sockets: { sockets: new Map() }
		};

		(sm as any).io = fakeIo;

		const stickerPayload = {
			id: 'st1',
			sessionId: 'sess-1',
			userId: 'u1',
			text: 'hello',
			x: 0,
			y: 0,
			color: 'red',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		} as unknown as StickerPayload;

		sm.emitToSessionStickerCreated('sess-1', stickerPayload);
		expect(toMock).toHaveBeenCalledWith('session:sess-1');
		expect(emitMock).toHaveBeenCalledWith('stickerCreated', stickerPayload);

		const participantPayload = {
			id: 'p1',
			sessionId: 'sess-1',
			userId: 'u1',
			role: 'guest',
			createdAt: new Date().toISOString()
		} as unknown as ParticipantPayload;

		sm.emitParticipantJoined('sess-1', participantPayload);
		expect(toMock).toHaveBeenCalledWith('session:sess-1');
		expect(emitMock).toHaveBeenCalledWith('participantJoined', participantPayload);

		const updPayload = { id: 'st1', text: 'x' };
		sm.emitToSessionStickerUpdated('sess-1', updPayload as any);
		expect(emitMock).toHaveBeenCalledWith('stickerUpdated', updPayload);

		const delPayload = { id: 'st1' };
		sm.emitToSessionStickerDeleted('sess-1', delPayload);
		expect(emitMock).toHaveBeenCalledWith('stickerDeleted', delPayload);

	});
});
