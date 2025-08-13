export class ApiError extends Error {
	public status: number;
	public code?: string;
	public details?: unknown;

	constructor(status = 500, message = 'Internal Server Error', code?: string, details?: unknown) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.code = code;
		this.details = details;
		Error.captureStackTrace?.(this, this.constructor);
	}

	static badRequest(message = 'Bad Request', details?: unknown) {
		return new ApiError(400, message, 'BAD_REQUEST', details);
	}

	static notFound(message = 'Not Found') {
		return new ApiError(404, message, 'NOT_FOUND');
	}

	static unauthorized(message = 'Unauthorized') {
		return new ApiError(401, message, 'UNAUTHORIZED');
	}
}
