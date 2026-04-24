export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiMeta {
  page?: number;
  pageSize?: number;
  total?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiErrorPayload;
  meta?: ApiMeta;
}
