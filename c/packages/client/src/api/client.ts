import type { ApiResponse } from '@termbase/shared';

const BASE = '/api/v1';

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(BASE + path, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
  });
  const body = (await res.json()) as ApiResponse<T>;
  if (!body.success) {
    throw new ApiError(res.status, body.error?.code ?? 'UNKNOWN', body.error?.message ?? 'Request failed');
  }
  return body;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'POST', body: data != null ? JSON.stringify(data) : undefined }),
  put: <T>(path: string, data: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(data) }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  rawText: async (path: string) => {
    const res = await fetch(BASE + path);
    if (!res.ok) throw new ApiError(res.status, 'HTTP_ERROR', res.statusText);
    return res.text();
  },
  postXml: async (path: string, xml: string) => {
    const res = await fetch(BASE + path, {
      method: 'POST',
      headers: { 'content-type': 'application/xml' },
      body: xml,
    });
    const body = (await res.json()) as ApiResponse<unknown>;
    if (!body.success) {
      throw new ApiError(res.status, body.error?.code ?? 'UNKNOWN', body.error?.message ?? 'Request failed');
    }
    return body;
  },
};
