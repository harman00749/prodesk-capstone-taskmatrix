import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  MONGODB_URI: z.string().min(1).optional(),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:5173"),
  GEMINI_API_KEY: z.string().min(10).optional(),
  GEMINI_MODEL: z.string().min(1).default("gemini-3.8-flash"),
});

export type Environment = z.infer<typeof envSchema>;

export function getEnv(): Environment {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const summary = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ");
    throw new Error(`Invalid environment configuration: ${summary}`);
  }

  return result.data;
}
