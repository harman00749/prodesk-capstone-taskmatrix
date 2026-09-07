import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

export function requestId(request: Request, response: Response, next: NextFunction): void {
  const incomingId = request.header("x-request-id");
  request.requestId = incomingId?.slice(0, 100) || randomUUID();
  response.setHeader("x-request-id", request.requestId);
  next();
}
