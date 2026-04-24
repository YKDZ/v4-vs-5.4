import type { ApiResponse } from '@termbase/shared';

export class ApiClientError extends Error {
  constructor(message: string, public readonly code = 'API_ERROR') {
    super(message);
  }
}

async function parseJson<T>(response: Response): Promise<ApiResponse<T>> {
  const payload = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !payload.success || payload.error) {
    throw new ApiClientError(payload.error?.message ?? 'Unexpected API error', payload.error?.code);
  }

  return payload;
}

export async function apiRequest<T>(path: string, init?: RequestInit) {
  const response = await fetch(path, {
    headers: {
      ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...init?.headers,
    },
    ...init,
  });

  return parseJson<T>(response);
}

export async function apiDownload(path: string) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new ApiClientError('Download failed');
  }

  return response.text();
}
