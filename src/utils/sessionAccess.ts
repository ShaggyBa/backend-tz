import { Session, SessionParticipant } from '../models';

export async function checkSessionAccess(userId: string, sessionId: string) {
	const session = await Session.findByPk(sessionId);
	if (!session) return { allowed: false, reason: 'Session not found', session: null };

	if (session.ownerId === userId) {
		return { allowed: true, role: 'owner', session };
	}

	const participant = await SessionParticipant.findOne({ where: { sessionId, userId } });
	if (participant) {
		return { allowed: true, role: participant.role, session };
	}

	return { allowed: false, reason: 'Forbidden', session };
}