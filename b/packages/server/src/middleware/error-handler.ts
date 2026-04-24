import type { Context } from 'hono';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';
import { errorResponse } from '../utils/response';

export function handleAppError(error: Error, c: Context) {
  if (error instanceof AppError) {
    return new Response(
      JSON.stringify(
        errorResponse({
          code: error.code,
          message: error.message,
        }),
      ),
      {
        status: error.statusCode,
        headers: {
          'content-type': 'application/json; charset=utf-8',
        },
      },
    );
  }

  if (error instanceof ZodError) {
    return c.json(
      errorResponse({
        code: 'VALIDATION_ERROR',
        message: error.issues.map((issue) => issue.message).join('; '),
      }),
      400,
    );
  }

  console.error(error);

  return c.json(
    errorResponse({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Unexpected server error',
    }),
    500,
  );
}
