export type AuthedRequest = import('express').Request & { userId?: string };

export type TokenPayload = {
	userId: string;
};
