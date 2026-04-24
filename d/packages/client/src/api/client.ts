import type { ApiResponse } from "@termbase/shared";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "http://localhost:3000/api/v1";

export class HttpError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly code: string,
  ) {
    super(message);
  }
}

async function parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const contentType = response.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    throw new HttpError("Expected JSON response", response.status, "INVALID_RESPONSE");
  }
  return (await response.json()) as ApiResponse<T>;
}

export async function requestJson<T>(
  path: string,
  init?: RequestInit,
): Promise<{ data: T; meta?: ApiResponse<T>["meta"] }> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const payload = await parseResponse<T>(response);
  if (!response.ok || !payload.success || payload.data === undefined) {
    throw new HttpError(
      payload.error?.message ?? "Request failed",
      response.status,
      payload.error?.code ?? "REQUEST_FAILED",
    );
  }

  return { data: payload.data, meta: payload.meta };
}

export async function requestTbxExport(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/tbx/export`);
  if (!response.ok) {
    throw new HttpError("Failed to export TBX", response.status, "TBX_EXPORT_FAILED");
  }
  return response.text();
}
