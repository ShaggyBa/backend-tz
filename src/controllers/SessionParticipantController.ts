import { Request, Response, NextFunction } from 'express';
import { ModelStatic } from 'sequelize';
import { Session, SessionParticipant } from '../models';
import { SessionParticipantCreationAttributes, AddParticipantDTO } from '../types/';

export class SessionParticipantController {
	constructor(
		private participantModel: ModelStatic<SessionParticipant>,
		private sessionModel: ModelStatic<Session>
	) { }

	// POST /api/sessions/:id/participants
	add = async (req: Request<{ id: string }, {}, AddParticipantDTO>, res: Response, next: NextFunction) => {
		try {
			const sessionId = Number(req.params.id);
			const dto = req.body;

			const session = await this.sessionModel.findByPk(sessionId);
			if (!session) return res.status(404).json({ error: 'Session not found' });

			const payload: SessionParticipantCreationAttributes = {
				sessionId, userId: dto.userId, role: dto.role ?? 'guest'
			}
			const created = await this.participantModel.create(payload);

			res.status(201).json(created);
		} catch (err) {
			next(err);
		}
	};

	// GET /api/sessions/:id/participants
	list = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
		try {
			const sessionId = Number(req.params.id);
			const participants = await this.participantModel.findAll({ where: { sessionId } });
			res.json(participants);
		} catch (err) {
			next(err);
		}
	};

	// DELETE /api/sessions/:id/participants/:participantId
	remove = async (req: Request<{ id: string; participantId: string }>, res: Response, next: NextFunction) => {
		try {
			const participantId = Number(req.params.participantId);
			const p = await this.participantModel.findByPk(participantId);
			if (!p) return res.status(404).json({ error: 'Participant not found' });
			await p.destroy();
			res.json({ message: 'Removed' });
		} catch (err) {
			next(err);
		}
	};
}
