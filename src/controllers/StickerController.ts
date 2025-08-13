import { Request, Response, NextFunction } from 'express';
import { ModelStatic, WhereOptions } from 'sequelize';
import { Sticker } from '../models';
import { StickerCreationAttributes, CreateStickerDTO, UpdateStickerDTO, StickerAttributes } from '../types';

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
			};
			const sticker = await this.stickerModel.create(payload);
			return res.status(201).json(sticker);
		} catch (err) {
			return next(err);
		}
	};

	// GET /api/stickers?sessionId=<uuid>&page=1&limit=50
	list = async (
		req: Request<{}, {}, {}, { sessionId?: string; page?: string; limit?: string }>,
		res: Response,
		next: NextFunction
	) => {
		try {
			// заглушка
			const q = (req as any).validatedQuery ?? req.query;
			const sessionId = q.sessionId as string | undefined;
			const page = q.page as string | undefined;
			const limit = q.limit as string | undefined;

			const where = sessionId ? { sessionId } : undefined;

			const pageNum = page ? Math.max(1, Number(page)) : 1;
			const limitNum = limit ? Math.min(100, Math.max(1, Number(limit))) : 100;
			const offset = (pageNum - 1) * limitNum;

			const { rows, count } = await this.stickerModel.findAndCountAll({
				where,
				limit: limitNum,
				offset,
				order: [['createdAt', 'DESC']]
			});

			return res.json({ data: rows, meta: { total: count, page: pageNum, limit: limitNum } });
		} catch (err) {
			return next(err);
		}
	};

	// GET /api/stickers/:id
	getById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
		try {
			const id = req.params.id;
			if (!id) return res.status(400).json({ error: 'Missing id' });
			const sticker = await this.stickerModel.findByPk(id);
			if (!sticker) return res.status(404).json({ error: 'Sticker not found' });
			return res.json(sticker);
		} catch (err) {
			return next(err);
		}
	};

	// UPDATE /api/stickers/:id
	update = async (req: Request<{ id: string }, {}, UpdateStickerDTO>, res: Response, next: NextFunction) => {
		try {
			const id = req.params.id;
			if (!id) return res.status(400).json({ error: 'Missing id' });

			const dto = req.body;
			const sticker = await this.stickerModel.findByPk(id);
			if (!sticker) return res.status(404).json({ error: 'Sticker not found' });

			const updated = await sticker.update(dto as Partial<StickerCreationAttributes>);
			return res.json(updated);
		} catch (err) {
			return next(err);
		}
	};

	// DELETE /api/stickers/:id
	delete = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
		try {
			const id = req.params.id;
			const sticker = await this.stickerModel.findByPk(id);
			if (!sticker) return res.status(404).json({ error: 'Sticker not found' });
			await sticker.destroy();
			return res.json({ message: 'Deleted' });
		} catch (err) {
			next(err);
		}
	};
}
