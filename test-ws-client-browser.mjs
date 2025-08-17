(() => {
	const s = document.createElement('script');
	s.src = '/socket.io/socket.io.js';
	s.onload = () => console.log('socket.io client loaded from /socket.io/socket.io.js');
	s.onerror = () => console.warn('socket.io client not found at /socket.io/socket.io.js');
	document.head.appendChild(s);
})();

(async () => {
	const API = 'http://localhost:1234';
	const EMAIL = 'tester2@example.com';
	const PASSWORD = 'secret123';
	const SESSION_ID = 'd6f23e09-b035-46b8-b4cf-cf416bd92c35'; // Та же сессия, что и в test-wc.mjs

	// login and get access token
	const r = await fetch(`${API}/api/auth/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email: EMAIL, password: PASSWORD })
	});
	const body = await r.json();
	console.log('login:', body);
	const ACCESS = body.accessToken;

	if (typeof io === 'undefined') {
		console.error('io is not defined — socket.io client не загружен. Попробуй /socket.io/socket.io.js');
		return;
	}

	// connect socket with token
	const socket = io(API, { auth: { token: `Bearer ${ACCESS}` }, transports: ['websocket'] });

	socket.on('connect', () => {
		console.log('ws connected', socket.id);
		socket.emit('joinSession', { sessionId: SESSION_ID });
	});

	socket.on('joined', m => console.log('joined', m));
	socket.on('stickerCreated', p => console.log('stickerCreated', p));
	socket.on('stickerUpdated', p => console.log('stickerUpdated', p));
	socket.on('stickerDeleted', p => console.log('stickerDeleted', p));
	socket.on('participantJoined', p => console.log('participantJoined', p));
	socket.on('participantLeft', p => console.log('participantLeft', p));
	socket.on('connect_error', err => console.error('connect_error', err));

	// Helpers (call from console)
	window.apiCreateSticker = async (text = 'from-console') => {
		const resp = await fetch(`${API}/api/stickers`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ACCESS}` },
			body: JSON.stringify({ sessionId: SESSION_ID, userId: body.user.id, text, x: 1, y: 2, color: 'yellow' })
		});
		console.log('create', await resp.json());
	};

	window.apiUpdateSticker = async (id, patch = { text: 'updated from console' }) => {
		const resp = await fetch(`${API}/api/stickers/${id}?sessionId=${SESSION_ID}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ACCESS}` },
			body: JSON.stringify(patch)
		});
		console.log('update', await resp.json());
	};

	window.apiDeleteSticker = async (id) => {
		const resp = await fetch(`${API}/api/stickers/${id}?sessionId=${SESSION_ID}`, {
			method: 'DELETE',
			headers: { 'Authorization': `Bearer ${ACCESS}` }
		});
		console.log('delete', await resp.json());
	};

	window.apiAddParticipant = async (userId, role = 'guest') => {
		const resp = await fetch(`${API}/api/sessions/${SESSION_ID}/participants`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ACCESS}` },
			body: JSON.stringify({ userId, role })
		});
		console.log('add participant', await resp.json());
	};

	window.apiRemoveParticipant = async (participantId) => {
		const resp = await fetch(`${API}/api/sessions/${SESSION_ID}/participants/${participantId}`, {
			method: 'DELETE',
			headers: { 'Authorization': `Bearer ${ACCESS}` }
		});
		console.log('remove participant', await resp.json());
	};

	console.log('Helpers loaded: apiCreateSticker, apiUpdateSticker(id), apiDeleteSticker(id), apiAddParticipant(userId), apiRemoveParticipant(participantId)');
})();
