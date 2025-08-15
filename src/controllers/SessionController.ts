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
			const userId = req.userId;
			if (!userId)
				return res.status(401).json({ error: 'Unauthorized' });
			const payload: SessionCreationAttributes = { name: dto.name, ownerId: userId };
			const session = await this.sessionModel.create(payload);
			return res.status(201).json(session);
		} catch (err) {
			next(err);
		}
	};

	// GET /api/sessions
	list = async (_req: Request, res: Response, next: NextFunction) => {
		try {
			const sessions = await this.sessionModel.findAll({ include: [{ model: this.participantModel }] });
			return res.json(sessions);
		} catch (err) {
			next(err);
		}
	};

	// GET /api/sessions/:id
	getById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
		try {
			const id = req.params.id;
			const session = await this.sessionModel.findByPk(id, { include: [{ model: this.participantModel }] });
			if (!session) return res.status(404).json({ error: 'Session not found' });
			return res.json(session);
		} catch (err) {
			next(err);
		}
	};

	// UPDATE /api/sessions/:id
	update = async (req: Request<{ id: string }, {}, UpdateSessionDTO>, res: Response, next: NextFunction) => {
		try {
			const id = req.params.id;
			const dto = req.body;
			const session = await this.sessionModel.findByPk(id);
			if (!session) return res.status(404).json({ error: 'Session not found' });
			const updated = await session.update({ name: dto.name ?? session.name });
			return res.json(updated);
		} catch (err) {
			next(err);
		}
	};

	// DELETE /api/sessions/:id
	delete = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
		try {
			const id = req.params.id;
			const session = await this.sessionModel.findByPk(id);
			if (!session) return res.status(404).json({ error: 'Session not found' });
			await session.destroy();
			return res.json({ message: 'Deleted' });
		} catch (err) {
			next(err);
		}
	};
}
