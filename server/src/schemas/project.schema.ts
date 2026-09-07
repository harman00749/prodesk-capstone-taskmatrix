import { z } from "zod";

export const createProjectSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    key: z.string().trim().min(2).max(10).regex(/^[A-Za-z][A-Za-z0-9]*$/, "Use letters and numbers only.").transform((value) => value.toUpperCase()),
    description: z.string().trim().max(500).default(""),
  })
  .strict();

export const updateProjectSchema = createProjectSchema
  .partial()
  .refine((body) => Object.keys(body).length > 0, "At least one project field is required.");
