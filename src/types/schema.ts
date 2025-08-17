import { z } from 'zod';

// * User schema
export const createUserSchema = z.object({
  email: z.email(),
  name: z.string().optional(),
  password: z.string().min(6),
});
export type CreateUserDTO = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  email: z.email().optional(),
  name: z.string().optional(),
  password: z.string().min(6).optional(),
});
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;

// * Session schema
export const createSessionSchema = z.object({
  name: z.string().min(1),
});
export type CreateSessionDTO = z.infer<typeof createSessionSchema>;

export const updateSessionSchema = z.object({
  name: z.string().min(1).optional(),
});
export type UpdateSessionDTO = z.infer<typeof updateSessionSchema>;

// * SessionParticipant schema
export const addParticipantSchema = z.object({
  email: z.email(),
  role: z.string().optional(),
});
export type AddParticipantDTO = z.infer<typeof addParticipantSchema>;

// * Sticker schema
export const createStickerSchema = z.object({
  text: z.string().min(1),
  x: z.number().optional(),
  y: z.number().optional(),
  color: z.string().nullable().optional(),
});
export type CreateStickerDTO = z.infer<typeof createStickerSchema>;

export const updateStickerSchema = z.object({
  text: z.string().min(1).optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  color: z.string().nullable().optional(),
});
export type UpdateStickerDTO = z.infer<typeof updateStickerSchema>;

export const idParamSchema = z.object({ id: z.uuid() });
export const sessionQuerySchema = z.object({
  sessionId: z.uuid().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});
export const participantSchema = z.object({ id: z.uuid(), participantId: z.uuid() });
