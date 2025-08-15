import { Router } from 'express';
import { SessionParticipantController } from '../controllers';
import { Session, SessionParticipant } from '../models';
import { addParticipantSchema, idParamSchema, participantSchema } from '../types';
import { Validator } from '../validation/Validator';
import { requireAuth } from '../middleware/authHandler';

const router = Router();
const validator = new Validator();
const ctrl = new SessionParticipantController(SessionParticipant, Session);

// /api/sessions/:id/participants
router.post('/:id/participants', requireAuth, validator.validateParams(idParamSchema), validator.validateBody(addParticipantSchema), ctrl.add);

// /api/sessions/:id/participants
router.get('/:id/participants', requireAuth, validator.validateParams(idParamSchema), ctrl.list);

// /api/sessions/:id/participants/:participantId
router.delete('/:id/participants/:participantId', requireAuth, validator.validateParams(participantSchema), ctrl.remove);

export default router;
