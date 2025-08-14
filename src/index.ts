//* Import modules, adapters
import dotEnv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import type * as express from 'express';
import { createServer } from 'http';
import { app } from './app';
import { sequelize } from './db';
import { SocketManager } from './SocketManager';

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


	const socketManager = new SocketManager();

	// TODO вынести в отдельный файл + настроить функционал верификации JWT
	// const socketManager = new SocketManager({
	// 	verifyToken: async (token) => {
	// 		const payload = jwt.verify(token, process.env.JWT_SECRET);
	// 		return { userId: (payload as any).sub || (payload as any).userId };
	// 	}
	// });

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