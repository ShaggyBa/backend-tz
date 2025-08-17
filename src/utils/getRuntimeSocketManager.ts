import type { Request as ExpressRequest } from 'express';
import { ISocketManager, nullBus } from '../types';

export function getRuntimeSocketManager(req: ExpressRequest): ISocketManager {
  return (req.app.locals.socketManager as ISocketManager | undefined) ?? nullBus;
}
