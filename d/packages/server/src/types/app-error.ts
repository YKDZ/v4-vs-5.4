import type { ContentfulStatusCode } from "hono/utils/http-status";

export class AppError extends Error {
  readonly code: string;
  readonly statusCode: ContentfulStatusCode;

  constructor(code: string, message: string, statusCode: ContentfulStatusCode = 400) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}
