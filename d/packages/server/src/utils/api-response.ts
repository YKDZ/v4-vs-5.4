import type { ApiResponse } from "@termbase/shared";

export function successResponse<T>(data: T, meta?: ApiResponse<T>["meta"]): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(meta ? { meta } : {}),
  };
}

export function errorResponse(
  code: string,
  message: string,
): ApiResponse<never> {
  return {
    success: false,
    error: {
      code,
      message,
    },
  };
}
