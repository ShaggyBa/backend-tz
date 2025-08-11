//* Import modules, adapters
import { createServer } from 'http';
import { app } from './app';
import { sequelize, umzug } from './db';
import { Server as IOServer } from 'socket.io';
import dotEnv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

// * Define base variables
const configEnv: dotEnv.DotenvConfigOutput = dotEnv.config();
dotenvExpand.expand(configEnv);
const PORT: number = Number(process.env.PORT || 3000);


// * Base server manage functions
async function start(): Promise<void> {
	// * DB connection
	if (process.env.NODE_ENV !== 'production') {
		await sequelize.sync({ alter: true }); // dev only
	}
	// await umzug.up() // TODO: создать модели данных, настроить миграции
	// * Start http server
	const httpServer = createServer(app);

	const server = httpServer.listen(PORT, () => {
		console.log(`Server listening on http://localhost:${PORT}`);
	});
}

start().catch((err) => {
	console.error('Failed to start', err);
	process.exit(1);
});