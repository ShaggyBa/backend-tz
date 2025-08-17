import { NextFunction, Request, Response } from 'express';
import { UniqueConstraintError, ValidationError } from 'sequelize';
import { ZodError } from 'zod';
import { ApiError } from './errors';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  // * Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'ValidationError',
      issues: err.issues,
    });
  }

  // * Custom
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      error: err.message,
      code: err.code,
      details: err.details ?? undefined,
    });
  }

  // * Sequelize errors
  if (err instanceof UniqueConstraintError) {
    return res.status(409).json({
      error: 'Conflict',
      message: err.message,
      fields: err.fields,
    });
  }

  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: 'SequelizeValidationError',
      message: err.message,
      errors: err.errors,
    });
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({ error: 'Internal Server Error' });
}
