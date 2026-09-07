import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { AppError } from "../utils/app-error.js";

type RequestSchemas = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

export function validate(schemas: RequestSchemas) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    try {
      for (const key of ["body", "params", "query"] as const) {
        const schema = schemas[key];
        if (!schema) continue;

        const result = schema.safeParse(request[key]);
        if (!result.success) {
          const details = result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          }));
          throw new AppError(400, "VALIDATION_ERROR", "Request validation failed.", details);
        }

        request[key] = result.data as never;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
