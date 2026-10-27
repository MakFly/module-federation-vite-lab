import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { ApiErrorBody, ApiFailure, ApiSuccess, ResponseMeta } from '@acme/contracts';
import type { AppEnv } from './env.ts';

type Ctx = Context<AppEnv>;

const buildMeta = (c: Ctx): ResponseMeta => ({
  requestId: c.get('requestId'),
  timestamp: new Date().toISOString(),
});

// Same envelope as the API (ApiEnvelope contract from @acme/contracts): the frontends only have one format to read.
export const ApiResponse = {
  ok<T>(c: Ctx, data: T, status: 200 | 201 = 200) {
    const body: ApiSuccess<T> = { success: true, data, meta: buildMeta(c) };
    return c.json(body, status);
  },

  error(c: Ctx, status: ContentfulStatusCode, error: ApiErrorBody) {
    const body: ApiFailure = { success: false, error, meta: buildMeta(c) };
    return c.json(body, status);
  },
};
