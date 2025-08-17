import { io } from 'socket.io-client';
import { setTimeout as wait } from 'timers/promises';

const API = 'http://localhost:1234';
const SESSION_ID = 'd6f23e09-b035-46b8-b4cf-cf416bd92c35'; // Та же сессия, что и в test-wc-client-browser.mjs
const EMAIL = 'tester3@example.com';
const PASSWORD = 'secret123';


function headersJson(access) {
	const h = { 'Content-Type': 'application/json' };
	if (access) h['Authorization'] = `Bearer ${access}`;
	return h;
}

function setupEventBuffer(socket, events) {
	const buffers = new Map();
	events.forEach(ev => buffers.set(ev, []));
	events.forEach(ev => {
		socket.on(ev, payload => {
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

async function loginAndGetUser() {
	const resp = await fetch(`${API}/api/auth/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email: EMAIL, password: PASSWORD })
	});

	const bodyText = await resp.text();
	let body;
	try { body = JSON.parse(bodyText); } catch (e) { body = bodyText; }

	if (!resp.ok) {
		throw new Error(`Login failed ${resp.status}: ${bodyText}`);
	}

	let userId;
	if (body && typeof body === 'object') {
		// варианты: { user: { id: '...' } }, { userId: '...' }, { user: { userId: '...' } }, { data: { user: ... } }
		userId = body.user?.id ?? body.user?.userId ?? body.userId ?? body.data?.user?.id ?? body.data?.userId;
	}

	const access = body.accessToken ?? body.token ?? null;

	return { access, userId, raw: body };
}

async function run() {
	console.log('API', API, 'SESSION_ID', SESSION_ID);

	const { access, userId: loginUserId, raw } = await loginAndGetUser();
	console.log('login response (sample):', raw);
	console.log('Got access token (len)', access?.length ?? 0);

	// Если login не вернул userId — попробуем /api/auth/me (если такой есть)
	let userId = loginUserId;
	if (!userId && access) {
		try {
			const me = await (await fetch(`${API}/api/auth/me`, { headers: headersJson(access) })).json();
			userId = me.user?.id ?? me.id ?? me.userId;
			console.log('/api/auth/me ->', me);
		} catch (err) {
			console.warn('No /api/auth/me or failed to fetch it:', err?.message ?? err);
		}
	}

	if (!userId) {
		console.error('Не удалось определить userId после логина.');
		console.error('login raw body:', raw);
		process.exit(2);
	}

	const socket = io(API, { auth: { token: `Bearer ${access}` }, transports: ['websocket'] });

	await new Promise((resolve, reject) => {
		const to = setTimeout(() => reject(new Error('socket connect timeout')), 5000);
		socket.on('connect', () => { clearTimeout(to); resolve(); });
		socket.on('connect_error', (err) => { clearTimeout(to); reject(err); });
	});
	console.log('Socket connected', socket.id);

	const waitForEvent = setupEventBuffer(socket, [
		'joined',
		'stickerCreated', 'stickerUpdated', 'stickerDeleted',
		'participantJoined', 'participantLeft'
	]);

	socket.emit('joinSession', { sessionId: SESSION_ID });
	console.log('joinSession emitted for', SESSION_ID);
	await wait(200);

	// === CREATE sticker ===
	console.log('=> create sticker via REST');
	const resp1 = await fetch(`${API}/api/stickers`, {
		method: 'POST',
		headers: headersJson(access),
		body: JSON.stringify({
			sessionId: SESSION_ID,
			userId: userId,
			text: 'WS test ' + Date.now(),
			x: 1, y: 2, color: 'green'
		})
	});
	const text1 = await resp1.text();
	let json1;
	try { json1 = JSON.parse(text1); } catch (e) { json1 = text1; }
	console.log('REST create status', resp1.status, json1);
	if (resp1.status >= 400 && json1?.error === 'ValidationError' && Array.isArray(json1.issues)) {
		console.error('Validation issues:', json1.issues);
	}
	if (resp1.status < 400) {
		try {
			const ev = await waitForEvent('stickerCreated', 5000);
			console.log('Received stickerCreated', ev);
		} catch (err) { console.error('Error waiting stickerCreated:', err.message || err); }
	} else {
		console.error('Create failed, abort further steps');
	}

	// === UPDATE sticker ===
	console.log('=> update sticker via REST', json1.id);
	const resp2 = await fetch(`${API}/api/stickers/${json1.id}?sessionId=${SESSION_ID}`, {
		method: 'PATCH',
		headers: headersJson(access),
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

	// === DELETE sticker ===
	console.log('=> delete sticker via REST', json1.id);
	const resp3 = await fetch(`${API}/api/stickers/${json1.id}?sessionId=${SESSION_ID}`, {
		method: 'DELETE',
		headers: headersJson(access)
	});
	const json3 = await resp3.json();
	console.log('REST delete status', resp3.status, json3);
	if (resp3.status < 400) {
		try {
			const ev3 = await waitForEvent('stickerDeleted', 5000);
			console.log('Received stickerDeleted', ev3);
		} catch (err) { console.error('Error waiting stickerDeleted:', err); }
	}


	console.log('Finished smoke test (partial).');
	socket.disconnect();
	process.exit(0);
}

run().catch(err => { console.error('Test error', err); process.exit(2); });