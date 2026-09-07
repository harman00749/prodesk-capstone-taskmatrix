import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "./app.js";
import type { AiService } from "./services/ai.service.js";

describe("TaskMatrix API hardening", () => {
  beforeEach(() => {
    process.env.NODE_ENV = "test";
    process.env.CLIENT_ORIGIN = "http://localhost:5173";
  });

  it("returns the standardized success envelope from health", async () => {
    const app = createApp();
    const response = await request(app).get("/api/v1/health");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.service).toBe("taskmatrix-api");
    expect(response.headers["x-request-id"]).toBeTypeOf("string");
  });

  it("rejects malformed AI payloads before calling the provider", async () => {
    const aiService: AiService = { generateSubtasks: vi.fn() };
    const app = createApp({ aiService });
    const response = await request(app)
      .post("/api/v1/ai/tasks/substeps")
      .send({ taskTitle: "" });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Request validation failed." },
    });
    expect(response.body.error.details[0].field).toBe("taskTitle");
    expect(aiService.generateSubtasks).not.toHaveBeenCalled();
  });

  it("returns validated AI sub-steps from the server-side service", async () => {
    const aiService: AiService = {
      generateSubtasks: vi.fn().mockResolvedValue([
        "Define the authentication contract",
        "Build the login form",
        "Validate credentials",
        "Issue a secure session",
        "Test failure states",
      ]),
    };
    const app = createApp({ aiService });
    const response = await request(app)
      .post("/api/v1/ai/tasks/substeps")
      .send({ taskTitle: "Build user authentication", count: 5 });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.subtasks).toHaveLength(5);
  });

  it("returns a standardized 500 without leaking internal errors", async () => {
    const aiService: AiService = {
      generateSubtasks: vi.fn().mockRejectedValue(new Error("secret provider detail")),
    };
    const app = createApp({ aiService });
    const response = await request(app)
      .post("/api/v1/ai/tasks/substeps")
      .send({ taskTitle: "Build user authentication" });

    expect(response.status).toBe(500);
    expect(response.body.error.code).toBe("INTERNAL_SERVER_ERROR");
    expect(JSON.stringify(response.body)).not.toContain("secret provider detail");
  });

  it("rate-limits repeated AI requests with a 429 JSON envelope", async () => {
    const aiService: AiService = {
      generateSubtasks: vi.fn().mockResolvedValue(["One", "Two", "Three"]),
    };
    const app = createApp({ aiService, aiRateLimit: 2 });
    const body = { taskTitle: "Plan responsive navigation", count: 3 };

    await request(app).post("/api/v1/ai/tasks/substeps").send(body);
    await request(app).post("/api/v1/ai/tasks/substeps").send(body);
    const response = await request(app).post("/api/v1/ai/tasks/substeps").send(body);

    expect(response.status).toBe(429);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "AI request limit reached. Please wait one minute.",
      },
    });
  });

  it("validates task payloads before attempting a database write", async () => {
    const app = createApp();
    const response = await request(app)
      .post("/api/v1/projects/507f1f77bcf86cd799439011/tasks")
      .send({ title: "x", priority: "impossible" });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns a standardized 404 for unknown routes", async () => {
    const app = createApp();
    const response = await request(app).get("/api/v1/not-a-route");

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("ROUTE_NOT_FOUND");
  });
});
