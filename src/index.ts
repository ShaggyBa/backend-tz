//* Import modules, adapters
import { createServer } from 'http';
import { app } from './app';
import { sequelize } from './db/index';
import { Server as IOServer } from 'socket.io';
import dotEnv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import { Sticker } from './models/index';

// * Define base variables
const configEnv: dotEnv.DotenvConfigOutput = dotEnv.config();
dotenvExpand.expand(configEnv);
const PORT: number = Number(process.env.PORT || 3000);

// * Base server manage functions
async function start(): Promise<void> {
	// * DB connection
	if (process.env.NODE_ENV !== 'production') {
		await sequelize.sync({ alter: true }); // dev only - если успею разобраться с миграциями, добавлю миграции
	}
	// * Start http server
	const httpServer = createServer(app);


	const io = new IOServer(httpServer, { cors: { origin: '*' } });

	io.on('connection', (socket) => {
		console.log('WS connected:', socket.id);

		socket.on('createSticker', async (data) => {
			// пример сохранения стикера
			const sticker = await Sticker.create(data);
			io.emit('stickerCreated', sticker); // всем клиентам
		});

		socket.on('disconnect', () => {
			console.log('WS disconnected:', socket.id);
		});
	});

	const server = httpServer.listen(PORT, () => {
		console.log(`Server listening on http://localhost:${PORT}`);
	});
}

start().catch((err) => {
	console.error('Failed to start', err);
	process.exit(1);
});