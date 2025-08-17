import { Router } from 'express';
import { SessionParticipantController } from '../controllers';
import { Session, SessionParticipant, User } from '../models';
import { addParticipantSchema, idParamSchema, participantSchema } from '../types';
import { Validator } from '../validation/Validator';
import { requireAuth } from '../middleware/authHandler';
import { requireSessionAccess } from '../middleware/requireSessionAccess';

const router = Router();
const validator = new Validator();
const ctrl = new SessionParticipantController(SessionParticipant, Session, User);

// /api/sessions/:id/participants
router.post(
  '/:id/participants',
  requireAuth,
  validator.validateParams(idParamSchema),
  validator.validateBody(addParticipantSchema),
  requireSessionAccess({ source: 'params', key: 'id', requireOwner: true }),
  ctrl.add
);

// /api/sessions/:id/participants
router.get(
  '/:id/participants',
  requireAuth,
  validator.validateParams(idParamSchema),
  requireSessionAccess({ source: 'params', key: 'id', requireOwner: true }),
  ctrl.list
);

// /api/sessions/:id/participants/:participantId
router.delete(
  '/:id/participants/:participantId',
  requireAuth,
  validator.validateParams(participantSchema),
  requireSessionAccess({ source: 'params', key: 'id', requireOwner: true }),
  ctrl.remove
);

export default router;
