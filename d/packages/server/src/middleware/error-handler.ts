import type { Context } from "hono";

import { AppError } from "../types/app-error";
import { errorResponse } from "../utils/api-response";

export function handleAppError(error: unknown, c: Context) {
  if (error instanceof AppError) {
    return c.json(errorResponse(error.code, error.message), error.statusCode);
  }

  if (error instanceof Error) {
    return c.json(
      errorResponse("INTERNAL_SERVER_ERROR", error.message),
      500,
    );
  }

  return c.json(errorResponse("INTERNAL_SERVER_ERROR", "Unknown error"), 500);
}
