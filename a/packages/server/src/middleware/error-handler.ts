import type { Context, ErrorHandler } from 'hono';
import type { StatusCode } from 'hono/utils/http-status';

export const errorHandler: ErrorHandler = (err, c: Context) => {
  console.error(`[ERROR] ${err.message}`, err.stack);

  let status: StatusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';

  if (err instanceof ValidationError) {
    status = 400;
    code = 'VALIDATION_ERROR';
    message = err.message;
  } else if (err instanceof NotFoundError) {
    status = 404;
    code = 'NOT_FOUND';
    message = err.message;
  }

  return c.json(
    {
      success: false,
      error: { code, message },
    },
    status,
  );
};

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}
