import { Router } from "express";
import { createAiController } from "../controllers/ai.controller.js";
import { createAiLimiter } from "../middleware/rate-limits.js";
import { validate } from "../middleware/validate.js";
import { aiSubtasksSchema } from "../schemas/task.schema.js";
import type { AiService } from "../services/ai.service.js";

export function createAiRouter(aiService: AiService, limit = 5): Router {
  const router = Router();
  router.post(
    "/tasks/substeps",
    createAiLimiter(limit),
    validate({ body: aiSubtasksSchema }),
    createAiController(aiService),
  );
  return router;
}
