// src/routes/sessions.ts
import { Router } from 'express';
import { SessionController } from '../controllers';
import { Session, SessionParticipant } from '../models'; // <-- добавить SessionParticipant
import { createSessionSchema, idParamSchema, updateSessionSchema } from '../types';
import { Validator } from '../validation/Validator';

const router = Router();
const validator = new Validator();
const ctrl = new SessionController(Session, SessionParticipant);

// api/sessions
router.post('/', validator.validateBody(createSessionSchema), ctrl.create);

// api/sessions
router.get('/', ctrl.list);

// api/sessions/:id
router.get('/:id', validator.validateParams(idParamSchema), ctrl.getById);

// api/sessions/:id
router.patch('/:id', validator.validateParams(idParamSchema), validator.validateBody(updateSessionSchema), ctrl.update);

// api/sessions/:id
router.delete('/:id', validator.validateParams(idParamSchema), ctrl.delete);

export default router;
