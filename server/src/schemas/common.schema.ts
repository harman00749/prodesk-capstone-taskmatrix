import { z } from "zod";

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Must be a valid MongoDB ObjectId.");

export const idParamsSchema = z.object({
  id: objectIdSchema,
});

export const taskIdParamsSchema = z.object({
  taskId: objectIdSchema,
});

export const projectIdParamsSchema = z.object({
  projectId: objectIdSchema,
});
