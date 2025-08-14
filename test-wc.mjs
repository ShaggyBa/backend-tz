import { io } from 'socket.io-client';
import { setTimeout as wait } from 'timers/promises';

const API = 'http://localhost:1234';
const SESSION_ID = '2d3b626a-a6e7-4dba-9d56-578030699e3b';
const USER_ID = 'f9f63712-d329-4c61-a90f-2cfcdd2cd830';

async function run() {
	console.log('Connecting to', API);
	const socket = io(API, { transports: ['websocket'] });

	await new Promise((resolve, reject) => {
		const to = setTimeout(() => reject(new Error('socket connect timeout')), 5000);
		socket.on('connect', () => { clearTimeout(to); resolve(); });
		socket.on('connect_error', (err) => { clearTimeout(to); reject(err); });
	});
	console.log('Socket connected', socket.id);

	socket.emit('joinSession', { sessionId: SESSION_ID });
	console.log('Joined session (joinSession sent)');

	const eventPromise = new Promise((resolve) => {
		socket.on('stickerCreated', (payload) => resolve(payload));
	});

	const resp = await fetch(`${API}/api/stickers`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			sessionId: SESSION_ID,
			userId: USER_ID,
			text: 'WS test ' + Date.now(),
			x: 1, y: 2, color: 'green'
		})
	});

	const json = await resp.json();
	console.log('REST create status', resp.status, json);

	const payload = await Promise.race([eventPromise, wait(5000).then(() => { throw new Error('event timeout'); })]);
	console.log('Received socket event:', payload);

	socket.disconnect();
	process.exit(0);
}

run().catch(err => { console.error(err); process.exit(2); });
