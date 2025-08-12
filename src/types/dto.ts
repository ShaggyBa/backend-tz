// * UserController
export interface CreateUserDTO {
	email: string;
	name?: string;
	password?: string; // TODO использовать хеш
}

export interface UpdateUserDTO {
	email?: string;
	name?: string;
	password?: string;
	jwtToken?: string | null;
}


// * SessionController
export interface CreateSessionDTO {
	name: string;
}

export interface UpdateSessionDTO {
	name?: string;
}


// * SessionParticipantController
export interface AddParticipantDTO {
	userId: number;
	role?: string;
}


// * StickerController
export interface CreateStickerDTO {
	sessionId: number;
	userId: number;
	text: string;
	x?: number;
	y?: number;
	color?: string | null;
}

export interface UpdateStickerDTO {
	text?: string;
	x?: number;
	y?: number;
	color?: string | null;
}