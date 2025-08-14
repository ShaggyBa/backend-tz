import { Router } from 'express';
import { Sticker } from '../models';
import { StickerController } from '../controllers';
import { Validator } from '../validation/Validator';
import { createStickerSchema, updateStickerSchema, sessionQuerySchema } from '../types';

const router = Router();
const validator = new Validator();
const ctrl = new StickerController(Sticker);

// /api/stickers
router.post('/', validator.validateBody(createStickerSchema), ctrl.create);

// /api/stickers?sessionId
router.get('/', validator.validateQuery(sessionQuerySchema), ctrl.list);

// /api/stickers/:id
router.get('/:id', ctrl.getById);

// /api/stickers/:id
router.patch('/:id', validator.validateBody(updateStickerSchema), ctrl.update);

// /api/stickers/:id
router.delete('/:id', ctrl.delete);

export default router;