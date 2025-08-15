import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';
import { StickerController } from '../controllers';
import { nullBus } from '../types';

describe('StickerController (unit)', () => {
	let mockModel: any;
	let controller: StickerController;
	let res: Response;
	let next: NextFunction;

	beforeEach(() => {
		mockModel = {
			create: jest.fn(),
			findAll: jest.fn(),
			findByPk: jest.fn(),
		};

		controller = new StickerController(mockModel);

		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis(),
		} as unknown as Response;

		next = jest.fn() as unknown as NextFunction;
	});

	it('create => should create sticker, call emit on socketManager and return 201', async () => {
		const createdSticker = {
			id: 's1',
			sessionId: 'session-1',
			userId: 'user-1',
			text: 'Hello world',
			x: 10,
			y: 20,
			color: 'blue',
			toJSON() { return this; }
		};

		mockModel.create.mockResolvedValue(createdSticker);

		// mock socket manager placed in app.locals
		const mockSocketManager = { emitToSessionStickerCreated: jest.fn() };

		const req = {
			body: {
				sessionId: 'session-1',
				userId: 'user-1',
				text: 'Hello world',
				x: 10,
				y: 20,
				color: 'blue'
			},
			app: {
				locals: {
					socketManager: mockSocketManager
				}
			}
		} as unknown as Request<{ sessionId?: string }, any, any>;

		await controller.create(req, res, next);

		expect(mockModel.create).toHaveBeenCalledWith({
			sessionId: 'session-1',
			userId: 'user-1',
			text: 'Hello world',
			x: 10,
			y: 20,
			color: 'blue'
		});

		expect(mockSocketManager.emitToSessionStickerCreated).toHaveBeenCalledTimes(1);
		const callArgs = (mockSocketManager.emitToSessionStickerCreated as jest.Mock).mock.calls[0];
		expect(callArgs[0]).toBe('session-1');
		expect(callArgs[1]).toMatchObject({
			id: 's1',
			sessionId: 'session-1',
			userId: 'user-1',
			text: 'Hello world'
		});

		expect((res.status as jest.Mock).mock.calls[0][0]).toBe(201);
		expect((res.json as jest.Mock).mock.calls[0][0]).toEqual(createdSticker);
	});

	it('update => if not found should return 404', async () => {
		mockModel.findByPk.mockResolvedValue(null);

		const req = {
			params: { id: 'missing-id' },
			body: { text: 'new' },
			app: { locals: { socketManager: nullBus } }
		} as unknown as Request<{ id: string }, any, any>;

		await controller.update(req, res, next);

		expect((res.status as jest.Mock).mock.calls[0][0]).toBe(404);
		expect((res.json as jest.Mock).mock.calls[0][0]).toEqual({ error: 'Sticker not found' });
	});

	it('delete => if found should destroy and emit', async () => {
		const existing: any = {
			id: 's-delete',
			sessionId: 'session-2',
			userId: 'user-2',
			toJSON() { return this; },
			destroy: jest.fn().mockResolvedValue(undefined as never),
		};

		mockModel.findByPk.mockResolvedValue(existing);

		const mockSocketManager = { emitToSessionStickerDeleted: jest.fn() };

		const req = {
			params: { id: 's-delete' },
			app: { locals: { socketManager: mockSocketManager } }
		} as unknown as Request<{ id: string }, any, any>;

		await controller.delete(req, res, next);

		expect(existing.destroy).toHaveBeenCalled();
		expect((mockSocketManager.emitToSessionStickerDeleted as jest.Mock).mock.calls[0][0]).toBe('session-2');

		const deletedPayload = (mockSocketManager.emitToSessionStickerDeleted as jest.Mock).mock.calls[0][1];
		expect(deletedPayload).toHaveProperty('id', 's-delete');

		expect((res.json as jest.Mock).mock.calls[0][0]).toEqual({ message: 'Deleted' });
	});
});