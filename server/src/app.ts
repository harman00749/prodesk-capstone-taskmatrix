import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import { getEnv } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFound } from "./middleware/not-found.js";
import { apiLimiter } from "./middleware/rate-limits.js";
import { requestId } from "./middleware/request-id.js";
import { createAiRouter } from "./routes/ai.routes.js";
import { projectRouter } from "./routes/project.routes.js";
import { taskRouter } from "./routes/task.routes.js";
import { GeminiAiService, type AiService } from "./services/ai.service.js";
import { sendSuccess } from "./utils/responses.js";

type AppOptions = {
  aiService?: AiService;
  aiRateLimit?: number;
};

export function createApp(options: AppOptions = {}): Express {
  const app = express();
  const { CLIENT_ORIGIN } = getEnv();
  const aiService = options.aiService ?? new GeminiAiService();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(
    cors({
      origin: CLIENT_ORIGIN.split(",").map((origin) => origin.trim()),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "100kb" }));
  app.use(requestId);
  app.use("/api/v1", apiLimiter);

  app.get("/api/v1/health", (_request, response) => {
    sendSuccess(response, 200, {
      service: "taskmatrix-api",
      database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/api/v1/projects", projectRouter);
  app.use("/api/v1/tasks", taskRouter);
  app.use("/api/v1/ai", createAiRouter(aiService, options.aiRateLimit));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
