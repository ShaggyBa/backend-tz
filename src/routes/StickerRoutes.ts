import { Router } from 'express';
import { Session, Sticker } from '../models';
import { StickerController } from '../controllers';
import { Validator } from '../validation/Validator';
import {
	createStickerSchema,
	updateStickerSchema,
	sessionQuerySchema,
	idParamSchema,
} from '../types';
import { requireAuth } from '../middleware/authHandler';
import { requireSessionAccess } from '../middleware/requireSessionAccess';

const router = Router();
const validator = new Validator();
const ctrl = new StickerController(Sticker, Session);

// /api/stickers:id
router.post(
	'/:id',
	requireAuth,
	validator.validateParams(idParamSchema),
	validator.validateBody(createStickerSchema),
	requireSessionAccess({ source: 'params', key: 'id', requireOwner: false }),
	ctrl.create
);

// /api/stickers?sessionId=<uuid>&page=1&limit=50
router.get(
	'/',
	requireAuth,
	validator.validateQuery(sessionQuerySchema),
	requireSessionAccess({ source: 'query', key: 'sessionId', requireOwner: false }),
	ctrl.list
);

// /api/stickers/?sessionId=<uuid>:id
router.get(
	'/:id',
	requireAuth,
	validator.validateParams(idParamSchema),
	validator.validateQuery(sessionQuerySchema),
	requireSessionAccess({ source: 'query', key: 'sessionId', requireOwner: false }),
	ctrl.getById
);

// /api/stickers/?sessionId=<uuid>:id
router.patch(
	'/:id',
	requireAuth,
	validator.validateParams(idParamSchema),
	validator.validateQuery(sessionQuerySchema),
	validator.validateBody(updateStickerSchema),
	requireSessionAccess({ source: 'query', key: 'sessionId', requireOwner: false }),
	ctrl.update
);

// /api/stickers/?sessionId=<uuid>:id
router.delete(
	'/:id',
	requireAuth,
	validator.validateParams(idParamSchema),
	validator.validateQuery(sessionQuerySchema),
	requireSessionAccess({ source: 'query', key: 'sessionId', requireOwner: false }),
	ctrl.delete
);

export default router;
