import { Request, Response, NextFunction } from 'express';
import { ModelStatic } from 'sequelize';
import { Session, SessionParticipant, User } from '../models';
import {
  SessionParticipantCreationAttributes,
  AddParticipantDTO,
  ParticipantPayload,
  SessionParticipantAttributes,
} from '../types';
import { getRuntimeSocketManager } from '../utils/getRuntimeSocketManager';

export class SessionParticipantController {
  constructor(
    private participantModel: ModelStatic<SessionParticipant>,
    private sessionModel: ModelStatic<Session>,
    private userModel: ModelStatic<User>
  ) {}

  // POST /api/sessions/:id/participants
  add = async (
    req: Request<{ id: string }, {}, AddParticipantDTO>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const sessionId = req.params.id;
      const dto = req.body;

      const userId = (req as any).userId as string | undefined;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const email = dto.email;
      if (!email) return res.status(400).json({ error: 'email required' });

      const session = await this.sessionModel.findByPk(sessionId);
      if (!session) return res.status(404).json({ error: 'Session not found' });

      if (session.ownerId !== userId)
        return res.status(403).json({ error: 'Only owner can add participants' });

      const user = await this.userModel.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const existing = await this.participantModel.findOne({
        where: { sessionId, userId: user.id },
      });
      if (existing) {
        return res.status(409).json({ error: 'Participant already exists', participant: existing });
      }

      const created = await this.participantModel.create({
        sessionId,
        userId: user.id,
        role: dto.role ?? 'guest',
      } as SessionParticipantCreationAttributes);

      const payload: ParticipantPayload = {
        id: created.id,
        sessionId: created.sessionId,
        userId: created.userId,
        role: created.role ?? null,
        createdAt: created.createdAt?.toISOString(),
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
      const userId = (req as any).userId as string | undefined;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const sessionId = req.params.id;

      const session = await this.sessionModel.findByPk(sessionId);
      if (!session) return res.status(404).json({ error: 'Session not found' });

      if (session.ownerId !== userId) {
        const participant = await this.participantModel.findOne({ where: { sessionId, userId } });
        if (!participant) return res.status(403).json({ error: 'Forbidden' });
      }

      const participants = await this.participantModel.findAll({
        where: { sessionId },
        order: [['createdAt', 'ASC']],
      });
      return res.json(participants);
    } catch (err) {
      return next(err);
    }
  };

  // DELETE /api/sessions/:id/participants/:participantId
  remove = async (
    req: Request<{ id: string; participantId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = (req as any).userId as string | undefined;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const sessionId = req.params.id;

      const participantId = req.params.participantId;
      const session = await this.sessionModel.findByPk(sessionId);
      if (!session) return res.status(404).json({ error: 'Session not found' });

      let p = await this.participantModel.findByPk(participantId);

      if (!p) {
        p = await this.participantModel.findOne({
          where: { sessionId, userId: participantId } as any,
        });
      }

      if (!p) return res.status(404).json({ error: 'Participant not found' });

      if (session.ownerId !== userId && p.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const data = p.toJSON() as SessionParticipantAttributes;

      await p.destroy();

      const runtimeBus = getRuntimeSocketManager(req);
      runtimeBus.emitParticipantLeft(sessionId, {
        id: data.id,
        sessionId: data.sessionId,
        userId: data.userId,
      });

      return res.json({ message: 'Removed' });
    } catch (err) {
      return next(err);
    }
  };
}
