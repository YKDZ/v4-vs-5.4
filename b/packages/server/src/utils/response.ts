import type { ApiError, ApiResponse, PaginationMeta } from '@termbase/shared';

export function successResponse<T>(data: T, meta?: PaginationMeta): ApiResponse<T> {
  return {
    success: true,
    data,
    meta,
  };
}

export function errorResponse(error: ApiError): ApiResponse<never> {
  return {
    success: false,
    error,
  };
}
