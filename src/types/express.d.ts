import type { ISocketManager } from '../types/socket';
import type { SessionAccess } from '../types/auth';
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
			sessionAccess?: SessionAccess;
		}

	}
}
