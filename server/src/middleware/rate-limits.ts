import { rateLimit } from "express-rate-limit";

function rateLimitHandler(message: string) {
  return (_request: unknown, response: { status: (code: number) => { json: (body: unknown) => void } }) => {
    response.status(429).json({
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message,
      },
    });
  };
}

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: rateLimitHandler("Too many API requests. Please try again later."),
});

export function createAiLimiter(limit = 5) {
  return rateLimit({
    windowMs: 60 * 1000,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: rateLimitHandler("AI request limit reached. Please wait one minute."),
  });
}
