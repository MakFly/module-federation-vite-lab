// Envelope common to all HTTP responses (API and BFF).
// A client always reads `success` before reading `data` or `error`.

export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ResponseMeta = {
  requestId: string;
  timestamp: string;
  pagination?: Pagination;
};

export type ApiErrorDetail = { field: string; message: string };

export type ApiErrorBody = {
  code: string;
  message: string;
  details?: ApiErrorDetail[];
};

export type ApiSuccess<T> = { success: true; data: T; meta: ResponseMeta };
export type ApiFailure = { success: false; error: ApiErrorBody; meta: ResponseMeta };
export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;
