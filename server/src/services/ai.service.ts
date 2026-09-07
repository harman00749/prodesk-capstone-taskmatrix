import { GoogleGenAI } from "@google/genai";
import { getEnv } from "../config/env.js";
import { aiOutputSchema, type AiSubtasksInput } from "../schemas/task.schema.js";
import { AppError } from "../utils/app-error.js";

export interface AiService {
  generateSubtasks(input: AiSubtasksInput): Promise<string[]>;
}

function buildPrompt(input: AiSubtasksInput): string {
  return [
    "You are an agile planning assistant inside TaskMatrix.",
    `Break the task into exactly ${input.count} concise, actionable engineering sub-steps.`,
    "Each sub-step must start with a verb, be specific, and stay under 100 characters.",
    "Do not include markdown, commentary, dangerous commands, credentials, or claims that work is complete.",
    `Task title: ${input.taskTitle}`,
    `Task description: ${input.taskDescription || "No description supplied."}`,
    'Return only JSON in this shape: {"subtasks":["step one","step two"]}',
  ].join("\n");
}

export class GeminiAiService implements AiService {
  async generateSubtasks(input: AiSubtasksInput): Promise<string[]> {
    const { GEMINI_API_KEY, GEMINI_MODEL } = getEnv();

    if (!GEMINI_API_KEY) {
      throw new AppError(
        503,
        "AI_NOT_CONFIGURED",
        "AI suggestions are unavailable until GEMINI_API_KEY is configured on the server.",
      );
    }

    try {
      const client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const result = await client.models.generateContent({
        model: GEMINI_MODEL,
        contents: buildPrompt(input),
        config: {
          responseMimeType: "application/json",
          responseJsonSchema: {
            type: "object",
            properties: {
              subtasks: {
                type: "array",
                minItems: input.count,
                maxItems: input.count,
                items: { type: "string", minLength: 2, maxLength: 140 },
              },
            },
            required: ["subtasks"],
            additionalProperties: false,
          },
          thinkingConfig: { thinkingBudget: 0 },
          temperature: 0.3,
          maxOutputTokens: 1_000,
        },
      });

      if (!result.text) {
        throw new AppError(502, "AI_EMPTY_RESPONSE", "The AI provider returned an empty response.");
      }

      const parsed = aiOutputSchema.safeParse(JSON.parse(result.text));
      if (!parsed.success) {
        throw new AppError(502, "AI_INVALID_RESPONSE", "The AI provider returned an invalid response.");
      }

      return parsed.data.subtasks.slice(0, input.count);
    } catch (error) {
      if (error instanceof AppError) throw error;

      if (error instanceof SyntaxError) {
        throw new AppError(502, "AI_INVALID_RESPONSE", "The AI provider returned malformed JSON.");
      }

      throw new AppError(502, "AI_PROVIDER_ERROR", "The AI provider could not generate suggestions.");
    }
  }
}
