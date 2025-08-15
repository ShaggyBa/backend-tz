import { Router } from 'express';
import { Sticker } from '../models';
import { StickerController } from '../controllers';
import { Validator } from '../validation/Validator';
import { createStickerSchema, updateStickerSchema, sessionQuerySchema } from '../types';
import { requireAuth } from '../middleware/authHandler';

const router = Router();
const validator = new Validator();
const ctrl = new StickerController(Sticker);

// /api/stickers
router.post('/', requireAuth, validator.validateBody(createStickerSchema), ctrl.create);

// /api/stickers?sessionId
router.get('/', requireAuth, validator.validateQuery(sessionQuerySchema), ctrl.list);

// /api/stickers/:id
router.get('/:id', requireAuth, ctrl.getById);

// /api/stickers/:id
router.patch('/:id', requireAuth, validator.validateBody(updateStickerSchema), ctrl.update);

// /api/stickers/:id
router.delete('/:id', requireAuth, ctrl.delete);

export default router;