import type { ApiResponse } from '@termbase/shared';

const BASE_URL = '/api/v1';

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    return {
      success: false,
      error: body.error ?? { code: 'HTTP_ERROR', message: response.statusText },
    };
  }

  return response.json();
}

export const apiClient = {
  get<T>(path: string) {
    return request<T>(path);
  },
  post<T>(path: string, body?: unknown) {
    return request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  put<T>(path: string, body?: unknown) {
    return request<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  delete<T>(path: string) {
    return request<T>(path, { method: 'DELETE' });
  },
  async upload<T>(path: string, body: FormData | string, contentType?: string) {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: contentType ? { 'Content-Type': contentType } : undefined,
      body,
    });
    return response.json() as Promise<ApiResponse<T>>;
  },
};
