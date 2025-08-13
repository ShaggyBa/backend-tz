import { z, ZodSchema } from 'zod';
import { Request, Response, NextFunction, RequestHandler } from 'express';

export class Validator {
	validateBody<T extends ZodSchema>(schema: T): RequestHandler {
		return (req: Request, res: Response, next: NextFunction) => {
			const result = schema.safeParse(req.body);
			console.log("validation", result, req.body)
			if (!result.success) {
				return next(result.error);
			}
			req.body = result.data as unknown as Request['body'];
			return next();
		};
	}

	validateParams<T extends ZodSchema>(schema: T): RequestHandler {
		return (req, res, next) => {
			const result = schema.safeParse(req.params);
			if (!result.success) return next(result.error);
			req.params = result.data as unknown as Request['params'];
			return next();
		};
	}

	validateQuery<T extends ZodSchema>(schema: T): RequestHandler {
		return (req: Request, _res: Response, next: NextFunction) => {
			const result = schema.safeParse(req.query);
			if (!result.success) return next(result.error);

			// заглушка
			(req as any).validatedQuery = result.data;

			return next();
		};
	}
}
