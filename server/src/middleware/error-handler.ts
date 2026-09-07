import type { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import { AppError } from "../utils/app-error.js";

type DuplicateKeyError = Error & { code?: number; keyValue?: Record<string, unknown> };

export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  let normalized = error;

  if (error instanceof mongoose.Error.CastError) {
    normalized = new AppError(400, "INVALID_IDENTIFIER", "The supplied resource identifier is invalid.");
  } else if ((error as DuplicateKeyError)?.code === 11000) {
    normalized = new AppError(409, "DUPLICATE_RESOURCE", "A resource with this value already exists.");
  }

  const isKnownError = normalized instanceof AppError;
  const statusCode = isKnownError ? normalized.statusCode : 500;
  const code = isKnownError ? normalized.code : "INTERNAL_SERVER_ERROR";
  const message = isKnownError ? normalized.message : "An unexpected server error occurred.";
  const details = isKnownError ? normalized.details : undefined;

  if (!isKnownError && process.env.NODE_ENV !== "test") {
    // Production log contains only server diagnostics; no request payload or secret values.
    console.error(`[${request.requestId ?? "unknown"}]`, error);
  }

  response.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
      requestId: request.requestId,
    },
  });
};
