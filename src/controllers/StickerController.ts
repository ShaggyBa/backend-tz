import { Request, Response, NextFunction } from 'express';
import { ModelStatic } from 'sequelize';
import { Sticker } from '../models';
import { StickerCreationAttributes, CreateStickerDTO, UpdateStickerDTO } from '../types';

export class StickerController {
	constructor(private stickerModel: ModelStatic<Sticker>) { }

	// POST /api/stickers
	create = async (req: Request<{}, {}, CreateStickerDTO>, res: Response, next: NextFunction) => {
		try {
			const dto = req.body;
			const payload: StickerCreationAttributes = {
				sessionId: dto.sessionId,
				userId: dto.userId,
				text: dto.text,
				x: dto.x ?? 0,
				y: dto.y ?? 0,
				color: dto.color ?? null
			}
			const sticker = await this.stickerModel.create(payload);
			return res.status(201).json(sticker);
		} catch (err) {
			next(err);
		}
	};

	// GET /api/stickers
	list = async (req: Request<{}, {}, {}, { sessionId?: string }>, res: Response, next: NextFunction) => {
		try {
			const sessionId = req.query.sessionId ? Number(req.query.sessionId) : undefined;
			const where = sessionId ? { sessionId } : undefined;
			const stickers = await this.stickerModel.findAll({ where });
			return res.json(stickers);
		} catch (err) {
			next(err);
		}
	};

	// GET /api/stickers/:id
	getById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
		try {
			const id = Number(req.params.id);
			const sticker = await this.stickerModel.findByPk(id);
			if (!sticker) return res.status(404).json({ error: 'Sticker not found' });
			return res.json(sticker);
		} catch (err) {
			next(err);
		}
	};

	// UPDATE /api/stickers/:id
	update = async (req: Request<{ id: string }, {}, UpdateStickerDTO>, res: Response, next: NextFunction) => {
		try {
			const id = Number(req.params.id);
			const dto = req.body;
			const sticker = await this.stickerModel.findByPk(id);
			if (!sticker) return res.status(404).json({ error: 'Sticker not found' });
			const updated = await sticker.update(dto);
			await sticker.update(updated);
			return res.json(sticker);
		} catch (err) {
			next(err);
		}
	};

	// DELETE /api/stickers/:id
	delete = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
		try {
			const id = Number(req.params.id);
			const sticker = await this.stickerModel.findByPk(id);
			if (!sticker) return res.status(404).json({ error: 'Sticker not found' });
			await sticker.destroy();
			return res.json({ message: 'Deleted' });
		} catch (err) {
			next(err);
		}
	};
}
