import { io } from 'socket.io-client';
import { setTimeout as wait } from 'timers/promises';

const API = 'http://localhost:1234';
const SESSION_ID = '2d3b626a-a6e7-4dba-9d56-578030699e3b';
const USER_ID = 'a8b560aa-4169-4989-96ad-bc0aeefcf427';
const ACCESS = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhOGI1NjBhYS00MTY5LTQ5ODktOTZhZC1iYzBhZWVmY2Y0MjciLCJpYXQiOjE3NTU0MjIwODYsImV4cCI6MTc1NTQyMzg4Nn0.vbyXea8VKan11AViTlXgcMKYUorpfrdczAsrU4m5vCQ";
function headersJson() {
	const h = { 'Content-Type': 'application/json' };
	if (ACCESS && ACCESS !== '<PASTE_ACCESS_TOKEN_HERE>') h['Authorization'] = `Bearer ${ACCESS}`;
	return h;
}

function setupEventBuffer(socket, events) {
	const buffers = new Map();
	events.forEach(ev => buffers.set(ev, []));
	events.forEach(ev => {
		socket.on(ev, payload => {
			console.log('[socket event]', ev, payload);
			buffers.get(ev).push(payload);
		});
	});
	return async (ev, timeout = 5000) => {
		const start = Date.now();
		while (Date.now() - start < timeout) {
			if (buffers.get(ev).length > 0) return buffers.get(ev).shift();
			await wait(50);
		}
		throw new Error(`Timeout waiting event "${ev}"`);
	};
}

async function run() {
	console.log('Connecting to', API);
	if (!ACCESS || ACCESS === '<PASTE_ACCESS_TOKEN_HERE>') {
		console.warn('ACCESS_TOKEN not provided. Export ACCESS_TOKEN env or paste into script.');
	}

	// подключаемся с передачей токена в auth
	const socket = io(API, ACCESS && ACCESS !== '<PASTE_ACCESS_TOKEN_HERE>'
		? { auth: { token: `Bearer ${ACCESS}` }, transports: ['websocket'] }
		: { transports: ['websocket'] }
	);

	// ждём подключения
	await new Promise((resolve, reject) => {
		const to = setTimeout(() => reject(new Error('socket connect timeout')), 5000);
		socket.on('connect', () => { clearTimeout(to); resolve(); });
		socket.on('connect_error', (err) => { clearTimeout(to); reject(err); });
	});
	console.log('Socket connected', socket.id);

	// Подписываемся заранее на все события
	const waitForEvent = setupEventBuffer(socket, [
		'stickerCreated', 'stickerUpdated', 'stickerDeleted',
		'participantJoined', 'participantLeft', 'joined'
	]);

	// join room
	socket.emit('joinSession', { sessionId: SESSION_ID });
	console.log('joinSession emitted for', SESSION_ID);
	// короткая пауза чтобы сервер обработал join
	await wait(200);

	// === CREATE sticker ===
	console.log('=> create sticker via REST');
	const resp1 = await fetch(`${API}/api/stickers`, {
		method: 'POST',
		headers: headersJson(),
		body: JSON.stringify({
			sessionId: SESSION_ID,
			userId: USER_ID,
			text: 'WS test ' + Date.now(),
			x: 1, y: 2, color: 'green'
		})
	});
	const json1 = await resp1.json();
	console.log('REST create status', resp1.status, json1);
	if (resp1.status >= 400) {
		console.error('Create failed, aborting further steps');
	} else {
		try {
			const ev = await waitForEvent('stickerCreated', 5000);
			console.log('Received stickerCreated', ev);
		} catch (err) { console.error('Error waiting stickerCreated:', err); }
	}

	await wait(300);

	// === UPDATE sticker ===
	if (json1?.id) {
		console.log('=> update sticker via REST', json1.id);
		const resp2 = await fetch(`${API}/api/stickers/${json1.id}`, {
			method: 'PATCH',
			headers: headersJson(),
			body: JSON.stringify({ text: 'WS updated ' + Date.now() })
		});
		const json2 = await resp2.json();
		console.log('REST update status', resp2.status, json2);
		if (resp2.status < 400) {
			try {
				const ev2 = await waitForEvent('stickerUpdated', 5000);
				console.log('Received stickerUpdated', ev2);
			} catch (err) { console.error('Error waiting stickerUpdated:', err); }
		}
	} else {
		console.warn('No sticker id from create — skipping update/delete.');
	}

	await wait(300);

	// === ADD participant ===
	console.log('=> add participant via REST');
	const addResp = await fetch(`${API}/api/sessions/${SESSION_ID}/participants`, {
		method: 'POST',
		headers: headersJson(),
		body: JSON.stringify({ userId: USER_ID, role: 'guest' })
	});
	const addJson = await addResp.json();
	console.log('REST add participant status', addResp.status, addJson);
	if (addResp.status < 400) {
		try {
			const pj = await waitForEvent('participantJoined', 5000);
			console.log('Received participantJoined', pj);
		} catch (err) { console.error('Error waiting participantJoined:', err); }
	}

	await wait(300);

	// === REMOVE participant ===
	if (addJson?.id) {
		console.log('=> remove participant via REST', addJson.id);
		const remResp = await fetch(`${API}/api/sessions/${SESSION_ID}/participants/${addJson.id}`, {
			method: 'DELETE',
			headers: headersJson()
		});
		const remJson = await remResp.json();
		console.log('REST remove participant status', remResp.status, remJson);
		if (remResp.status < 400) {
			try {
				const pl = await waitForEvent('participantLeft', 5000);
				console.log('Received participantLeft', pl);
			} catch (err) { console.error('Error waiting participantLeft:', err); }
		}
	}

	await wait(300);

	// === DELETE sticker ===
	if (json1?.id) {
		console.log('=> delete sticker via REST', json1.id);
		const delResp = await fetch(`${API}/api/stickers/${json1.id}`, {
			method: 'DELETE',
			headers: headersJson()
		});
		const delJson = await delResp.json();
		console.log('REST delete status', delResp.status, delJson);
		if (delResp.status < 400) {
			try {
				const d = await waitForEvent('stickerDeleted', 5000);
				console.log('Received stickerDeleted', d);
			} catch (err) { console.error('Error waiting stickerDeleted:', err); }
		}
	}

	console.log('Done - disconnecting');
	socket.disconnect();
	process.exit(0);
}

run().catch(err => { console.error('Test error', err); process.exit(2); });