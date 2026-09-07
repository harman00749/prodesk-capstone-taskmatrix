import type { NextFunction, Request, Response } from "express";
import type { AiService } from "../services/ai.service.js";
import { sendSuccess } from "../utils/responses.js";

export function createAiController(aiService: AiService) {
  return async function generateTaskSubtasks(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const subtasks = await aiService.generateSubtasks(request.body);
      sendSuccess(response, 200, { subtasks }, "Sub-steps generated successfully.");
    } catch (error) {
      next(error);
    }
  };
}
