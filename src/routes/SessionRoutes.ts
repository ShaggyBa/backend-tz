// src/routes/sessions.ts
import { Router } from 'express';
import { SessionController } from '../controllers';
import { Session, SessionParticipant } from '../models'; // <-- добавить SessionParticipant
import { createSessionSchema, idParamSchema, updateSessionSchema } from '../types';
import { Validator } from '../validation/Validator';
import { requireAuth } from '../middleware/authHandler';
import { requireSessionAccess } from '../middleware/requireSessionAccess';

const router = Router();
const validator = new Validator();
const ctrl = new SessionController(Session, SessionParticipant);

// api/sessions
router.post('/', requireAuth, validator.validateBody(createSessionSchema), ctrl.create);

// api/sessions
router.get('/', requireAuth, ctrl.list);

// api/sessions/:id
router.get(
  '/:id',
  requireAuth,
  validator.validateParams(idParamSchema),
  requireSessionAccess({ source: 'params', key: 'id', requireOwner: false }),
  ctrl.getById
);

// api/sessions/:id
router.patch(
  '/:id',
  requireAuth,
  validator.validateParams(idParamSchema),
  requireSessionAccess({ source: 'params', key: 'id', requireOwner: true }),
  validator.validateBody(updateSessionSchema),
  ctrl.update
);

// api/sessions/:id
router.delete(
  '/:id',
  requireAuth,
  validator.validateParams(idParamSchema),
  requireSessionAccess({ source: 'params', key: 'id', requireOwner: true }),
  ctrl.delete
);

export default router;
