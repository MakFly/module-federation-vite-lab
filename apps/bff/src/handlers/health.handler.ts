import { ApiResponse } from '../http/apiResponse.ts';
import { factory } from '../http/env.ts';

// GET /bff/health: status of the BFF and its dependencies (readiness).
export const healthHandler = factory.createHandlers(async (c) => {
  const apiUp = await c.var.api.health();
  return ApiResponse.ok(c, { bff: 'ok', api: apiUp ? 'ok' : 'down' }, 200);
});
