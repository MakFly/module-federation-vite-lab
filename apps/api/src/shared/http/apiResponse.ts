import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { ApiErrorBody, ApiFailure, ApiSuccess, Pagination, ResponseMeta } from '@acme/contracts';
import type { Page } from '../domain/page.ts';
import type { AppEnv } from './env.ts';

type Ctx = Context<AppEnv>;
type SuccessStatus = 200 | 201 | 202;

const buildMeta = (c: Ctx, pagination?: Pagination): ResponseMeta => ({
  requestId: c.get('requestId'),
  timestamp: new Date().toISOString(),
  ...(pagination && { pagination }),
});

/**
 * Single point where HTTP responses are built.
 *
 * Success: { success: true,  data,  meta: { requestId, timestamp, pagination? } }
 * Failure: { success: false, error: { code, message, details? }, meta: { requestId, timestamp } }
 *
 * No handler calls `c.json()` directly: the format stays identical across the whole API.
 */
export const ApiResponse = {
  ok<T>(c: Ctx, data: T, status: SuccessStatus = 200) {
    const body: ApiSuccess<T> = { success: true, data, meta: buildMeta(c) };
    return c.json(body, status);
  },

  created<T>(c: Ctx, data: T, location: string) {
    c.header('Location', location);
    return ApiResponse.ok(c, data, 201);
  },

  paginated<T>(c: Ctx, page: Page<T>) {
    const pagination: Pagination = {
      page: page.page,
      pageSize: page.pageSize,
      total: page.total,
      totalPages: Math.max(1, Math.ceil(page.total / page.pageSize)),
    };
    const body: ApiSuccess<T[]> = { success: true, data: page.items, meta: buildMeta(c, pagination) };
    return c.json(body, 200);
  },

  noContent(c: Ctx) {
    return c.body(null, 204);
  },

  error(c: Ctx, status: ContentfulStatusCode, error: ApiErrorBody) {
    const body: ApiFailure = { success: false, error, meta: buildMeta(c) };
    return c.json(body, status);
  },
};
