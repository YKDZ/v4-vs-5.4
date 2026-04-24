import type { Context, ErrorHandler } from 'hono';
import { ZodError } from 'zod';

export class HttpError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: unknown) {
    super(message);
  }
}

export function okJson<T>(c: Context, data: T, meta?: Record<string, unknown>, status = 200) {
  return c.json({ success: true, data, ...(meta ? { meta } : {}) }, status as 200);
}

export const onError: ErrorHandler = (err, c) => {
  if (err instanceof HttpError) {
    return c.json(
      { success: false, error: { code: err.code, message: err.message, details: err.details } },
      err.status as 400,
    );
  }
  if (err instanceof ZodError) {
    return c.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: err.flatten() } },
      400,
    );
  }
  // eslint-disable-next-line no-console
  console.error('[unhandled]', err);
  return c.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: err instanceof Error ? err.message : 'Unknown error',
      },
    },
    500,
  );
};
