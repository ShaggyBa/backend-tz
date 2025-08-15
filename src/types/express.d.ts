import type { ISocketManager } from '../types/socket';

declare global {
	namespace Express {
		interface Application {
			locals: {
				socketManager?: ISocketManager;
				[key: string]: unknown;
			};
		}
		interface Request {
			userId?: string;
		}

	}
}
