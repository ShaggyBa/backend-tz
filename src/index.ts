//* Import modules, adapters
import dotEnv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import type * as express from 'express';
import { createServer } from 'http';
import { app } from './app';
import { SocketManager } from './SocketManager';
import { verifyToken } from './utils/jwt';

// * Define base variables
const configEnv: dotEnv.DotenvConfigOutput = dotEnv.config();
dotenvExpand.expand(configEnv);
const PORT: number = Number(process.env.PORT || 3000);

// * Base server manage functions
async function start(): Promise<void> {
	// * DB connection
	if (process.env.NODE_ENV !== 'production') {
		// await sequelize.sync({ alter: true }); // dev only - если успею разобраться с миграциями, добавлю миграции
	}
	// * Start http server
	const httpServer = createServer(app);


	const socketManager = new SocketManager({
		verifyToken: async (token) => {
			const raw = typeof token === 'string' && token.startsWith('Bearer ') ? token.slice(7) : token;
			const payload = verifyToken(raw);
			return payload ? { userId: payload.userId } : null;
		}
	}
	);

	socketManager.init(httpServer);

	(app as express.Application).locals.socketManager = socketManager;

	const server = httpServer.listen(PORT, () => {
		console.log(`Server listening on http://localhost:${PORT}`);
	});
}

start().catch((err) => {
	console.error('Failed to start', err);
	process.exit(1);
});