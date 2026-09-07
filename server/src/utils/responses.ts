import type { Response } from "express";

export function sendSuccess<T>(
  response: Response,
  statusCode: number,
  data: T,
  message?: string,
): Response {
  return response.status(statusCode).json({
    success: true,
    ...(message ? { message } : {}),
    data,
  });
}
