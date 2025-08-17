import { Request, Response, NextFunction } from 'express';
import { ModelStatic } from 'sequelize';
import { Session, Sticker } from '../models';
import {
  StickerCreationAttributes,
  CreateStickerDTO,
  UpdateStickerDTO,
  ISocketManager,
  nullBus,
} from '../types';
import { checkSessionAccess } from '../utils/sessionAccess';

export class StickerController {
  constructor(
    private stickerModel: ModelStatic<Sticker>,
    private sessionModel: ModelStatic<Session>
  ) {}

  // POST /api/stickers:sessionId
  create = async (
    req: Request<{ id: string }, {}, CreateStickerDTO>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = (req as any).userId as string | undefined;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const sessionId = req.params.id;
      const { text, x, y, color } = req.body;

      const session = await this.sessionModel.findByPk(sessionId);
      if (!session) return res.status(404).json({ error: 'Session not found' });

      const payload: StickerCreationAttributes = {
        sessionId,
        userId,
        text,
        x: x ?? 0,
        y: y ?? 0,
        color: color ?? null,
      };

      if (userId !== req.userId) return res.status(403).json({ error: 'User mismatch' });

      const sticker = await this.stickerModel.create(payload);

      const appLocals = (req.app as unknown as { locals?: Record<string, unknown> }).locals ?? {};
      const runtimeSocketManager =
        (appLocals.socketManager as ISocketManager | undefined) ?? nullBus;

      runtimeSocketManager.emitToSessionStickerCreated(sticker.sessionId, sticker.toJSON());

      return res.status(201).json(sticker);
    } catch (err) {
      return next(err);
    }
  };

  // GET /api/stickers?sessionId=<uuid>&page=1&limit=50
  list = async (
    req: Request<{}, {}, {}, { sessionId?: string; page?: string; limit?: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });

      const q = (req as any).validatedQuery ?? req.query;
      const sessionId = q.sessionId as string | undefined;

      if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });

      const page = q.page as string | undefined;
      const limit = q.limit as string | undefined;

      const where = sessionId ? { sessionId } : undefined;

      const pageNum = page ? Math.max(1, Number(page)) : 1;
      const limitNum = limit ? Math.min(100, Math.max(1, Number(limit))) : 100;
      const offset = (pageNum - 1) * limitNum;

      const { rows, count } = await this.stickerModel.findAndCountAll({
        where,
        limit: limitNum,
        offset,
        order: [['createdAt', 'DESC']],
      });

      return res.json({ data: rows, meta: { total: count, page: pageNum, limit: limitNum } });
    } catch (err) {
      return next(err);
    }
  };

  // GET api/stickers/?sessionId=<uuid>:id
  getById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });

      const id = req.params.id;
      if (!id) return res.status(400).json({ error: 'Missing id' });

      const q = (req as any).validatedQuery ?? req.query;
      const sessionId = q.sessionId as string | undefined;
      if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });

      const sticker = await this.stickerModel.findByPk(id);
      if (!sticker) return res.status(404).json({ error: 'Sticker not found' });

      const access = await checkSessionAccess(req.userId, sticker.sessionId);
      if (!access.allowed) return res.status(403).json({ error: access.reason });

      return res.json(sticker);
    } catch (err) {
      return next(err);
    }
  };

  // UPDATE api/stickers/?sessionId=<uuid>:id
  update = async (
    req: Request<{ id: string }, {}, UpdateStickerDTO>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });

      const id = req.params.id;
      if (!id) return res.status(400).json({ error: 'Missing id' });

      const dto = req.body as UpdateStickerDTO;
      const sticker = await this.stickerModel.findByPk(id);
      if (!sticker) return res.status(404).json({ error: 'Sticker not found' });

      const q = (req as any).validatedQuery ?? req.query;
      const sessionId = q.sessionId as string | undefined;
      if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });

      const updated = await sticker.update(dto as Partial<StickerCreationAttributes>);

      const appLocals = (req.app as unknown as { locals?: Record<string, unknown> }).locals ?? {};
      const runtimeSocketManager =
        (appLocals.socketManager as ISocketManager | undefined) ?? nullBus;

      runtimeSocketManager.emitToSessionStickerUpdated(updated.sessionId, updated.toJSON());

      return res.json(updated);
    } catch (err) {
      return next(err);
    }
  };

  // DELETE api/stickers/?sessionId=<uuid>:id
  delete = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });

      const id = req.params.id;

      if (!id) return res.status(400).json({ error: 'Missing id' });

      const sticker = await this.stickerModel.findByPk(id);
      if (!sticker) return res.status(404).json({ error: 'Sticker not found' });

      const q = (req as any).validatedQuery ?? req.query;
      const sessionId = q.sessionId as string | undefined;
      if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });

      const payload = { id: sticker.id };
      await sticker.destroy();

      const appLocals = (req.app as unknown as { locals?: Record<string, unknown> }).locals ?? {};
      const runtimeSocketManager =
        (appLocals.socketManager as ISocketManager | undefined) ?? nullBus;

      runtimeSocketManager.emitToSessionStickerDeleted(sessionId, payload);

      return res.json({ message: 'Deleted' });
    } catch (err) {
      next(err);
    }
  };
}
