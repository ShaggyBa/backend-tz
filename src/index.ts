//* Import modules, adapters
import { createServer } from 'http';
import { app } from './app';
import { sequelize } from './db';
import { Server as IOServer } from 'socket.io';


// * Define base variables
const PORT: number = Number(process.env.PORT || 3000);


// * Base server manage functions
async function start() {
	// * DB connection
	await sequelize.sync();
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