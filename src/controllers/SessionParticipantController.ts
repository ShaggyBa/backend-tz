import { Request, Response, NextFunction } from 'express';
import { ModelStatic } from 'sequelize';
import { Session, SessionParticipant } from '../models';
import {
	SessionParticipantCreationAttributes,
	AddParticipantDTO,
	ParticipantPayload,
	SessionParticipantAttributes
} from '../types';
import { getRuntimeSocketManager } from '../utils/getRuntimeSocketManager';

export class SessionParticipantController {
	constructor(
		private participantModel: ModelStatic<SessionParticipant>,
		private sessionModel: ModelStatic<Session>
	) { }



	// POST /api/sessions/:id/participants
	add = async (req: Request<{ id: string }, {}, AddParticipantDTO>, res: Response, next: NextFunction) => {
		try {
			const sessionId = req.params.id;
			const dto = req.body;

			const session = await this.sessionModel.findByPk(sessionId);
			if (!session) return res.status(404).json({ error: 'Session not found' });

			const existing = await this.participantModel.findOne({ where: { sessionId, userId: dto.userId } });
			if (existing) {
				return res.status(409).json({ error: 'Participant already exists', participant: existing });
			}
			const created = await this.participantModel.create({ sessionId, userId: dto.userId, role: dto.role ?? 'guest' } as SessionParticipantCreationAttributes);

			const payload: ParticipantPayload = {
				id: created.id,
				sessionId: created.sessionId,
				userId: created.userId,
				role: created.role ?? null,
				createdAt: created.createdAt?.toISOString()
			};
			const runtimeBus = getRuntimeSocketManager(req);
			runtimeBus.emitParticipantJoined(sessionId, payload);
			return res.status(201).json(created);
		} catch (err) {
			return next(err);
		}
	};

	// GET /api/sessions/:id/participants
	list = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
		try {
			const sessionId = req.params.id;
			const participants = await this.participantModel.findAll({
				where: { sessionId },
				order: [['createdAt', 'ASC']]
			});
			return res.json(participants);
		} catch (err) {
			return next(err);
		}
	};

	// DELETE /api/sessions/:id/participants/:participantId
	remove = async (req: Request<{ id: string; participantId: string }>, res: Response, next: NextFunction) => {
		try {
			const participantId = req.params.participantId;
			const p = await this.participantModel.findByPk(participantId);
			if (!p) return res.status(404).json({ error: 'Participant not found' });

			const data = p.toJSON() as SessionParticipantAttributes;
			const sessionId = data.sessionId;

			await p.destroy();

			const runtimeBus = getRuntimeSocketManager(req);
			runtimeBus.emitParticipantLeft(sessionId, { id: data.id, sessionId: data.sessionId, userId: data.userId });

			return res.json({ message: 'Removed' });
		} catch (err) {
			return next(err);
		}
	};
}
