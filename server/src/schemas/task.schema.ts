import { z } from "zod";

const subtaskSchema = z.object({
  title: z.string().trim().min(2).max(140),
  completed: z.boolean().default(false),
});

const taskFields = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2_000).default(""),
  status: z.enum(["todo", "in-progress", "done"]).default("todo"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  assigneeName: z.string().trim().min(2).max(80).default("Unassigned"),
  dueDate: z.iso.datetime({ offset: true }).nullable().default(null),
  subtasks: z.array(subtaskSchema).max(20).default([]),
});

export const createTaskSchema = taskFields.strict();

export const updateTaskSchema = taskFields
  .partial()
  .strict()
  .refine((body) => Object.keys(body).length > 0, "At least one task field is required.");

export const taskQuerySchema = z.object({
  status: z.enum(["todo", "in-progress", "done"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
});

export const aiSubtasksSchema = z
  .object({
    taskTitle: z.string().trim().min(3, "Task title must contain at least 3 characters.").max(120),
    taskDescription: z.string().trim().max(1_000).default(""),
    count: z.coerce.number().int().min(3).max(8).default(5),
  })
  .strict();

export const aiOutputSchema = z.object({
  subtasks: z.array(z.string().trim().min(2).max(140)).min(3).max(8),
});

export type AiSubtasksInput = z.infer<typeof aiSubtasksSchema>;
