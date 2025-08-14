import express from 'express';
import UserRoutes from './UserRoutes';
import StickerRoutes from './StickerRoutes';
import SessionRoutes from './SessionRoutes';
import SessionParticipantRoutes from './SessionParticipantRoutes';

export const apiRouter = express.Router();

apiRouter.use('/users', UserRoutes);
apiRouter.use('/stickers', StickerRoutes);
apiRouter.use('/sessions', SessionRoutes);
apiRouter.use('/sessions', SessionParticipantRoutes);