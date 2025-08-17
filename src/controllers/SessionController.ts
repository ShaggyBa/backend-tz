import { NextFunction, Request, Response } from 'express';
import { ModelStatic } from 'sequelize';
import { Session, SessionParticipant } from '../models';
import { CreateSessionDTO, SessionCreationAttributes, UpdateSessionDTO } from '../types';

export class SessionController {
	constructor(
		private sessionModel: ModelStatic<Session>,
		private participantModel: ModelStatic<SessionParticipant>
	) { }

	// POST /api/sessions
	create = async (req: Request<{}, {}, CreateSessionDTO>, res: Response, next: NextFunction) => {
		try {
			const dto = req.body;
			const userId = (req as any).userId as string | undefined;
			if (!userId) return res.status(401).json({ error: 'Unauthorized' });

			const payload: SessionCreationAttributes = { name: dto.name, ownerId: userId };
			const session = await this.sessionModel.create(payload);
			return res.status(201).json(session);
		} catch (err) {
			return next(err);
		}
	};

	// GET /api/sessions
	list = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const userId = (req as any).userId as string | undefined;
			if (!userId) return res.status(401).json({ error: 'Unauthorized' });

			const owned = await this.sessionModel.findAll({ where: { ownerId: userId } });

			const parts = await this.participantModel.findAll({ where: { userId } });
			const participantSessionIds = parts.map((p) => p.sessionId);

			const participantSessions = participantSessionIds.length
				? await this.sessionModel.findAll({ where: { id: participantSessionIds } })
				: [];

			const map = new Map<string, Session>();
			owned.forEach((s) => map.set((s as any).id, s));
			participantSessions.forEach((s) => map.set((s as any).id, s));

			return res.json(Array.from(map.values()));
		} catch (err) {
			return next(err);
		}
	};

	// GET /api/sessions/:id
	getById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
		try {
			const userId = (req as any).userId as string | undefined;
			if (!userId) return res.status(401).json({ error: 'Unauthorized' });

			const id = req.params.id;
			if (!id) return res.status(400).json({ error: 'Missing id' });

			const session = await this.sessionModel.findByPk(id);
			if (!session) return res.status(404).json({ error: 'Session not found' });

			return res.json(session);
		} catch (err) {
			return next(err);
		}
	};

	// UPDATE /api/sessions/:id
	update = async (req: Request<{ id: string }, {}, UpdateSessionDTO>, res: Response, next: NextFunction) => {
		try {
			const userId = (req as any).userId as string | undefined;
			if (!userId) return res.status(401).json({ error: 'Unauthorized' });

			const id = req.params.id;
			const dto = req.body;
			const session = await this.sessionModel.findByPk(id);
			if (!session) return res.status(404).json({ error: 'Session not found' });

			if (session.ownerId !== userId) return res.status(403).json({ error: 'Forbidden' });

			const updated = await session.update({ name: dto.name ?? session.name });
			return res.json(updated);
		} catch (err) {
			return next(err);
		}
	};

	// DELETE /api/sessions/:id
	delete = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
		try {
			const userId = (req as any).userId as string | undefined;
			if (!userId) return res.status(401).json({ error: 'Unauthorized' });

			const id = req.params.id;
			const session = await this.sessionModel.findByPk(id);
			if (!session) return res.status(404).json({ error: 'Session not found' });

			if (session.ownerId !== userId) return res.status(403).json({ error: 'Forbidden' });

			await session.destroy();
			return res.json({ message: 'Deleted' });
		} catch (err) {
			return next(err);
		}
	};
}
