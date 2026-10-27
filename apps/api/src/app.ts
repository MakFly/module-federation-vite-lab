import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { logger } from 'hono/logger';
import { requestId } from 'hono/request-id';
import { secureHeaders } from 'hono/secure-headers';
import { timeout } from 'hono/timeout';
import { createContainer, type Container } from './container.ts';
import { cartRoutes } from './modules/cart/http/cart.routes.ts';
import { catalogRoutes } from './modules/catalog/http/catalog.routes.ts';
import { ApiResponse } from './shared/http/apiResponse.ts';
import type { AppEnv } from './shared/http/env.ts';
import { errorHandler, notFoundHandler } from './shared/http/errorHandler.ts';

// No CORS: the API is internal, only the BFF calls it (server to server).
export function createApp(container: Container = createContainer()) {
  return new Hono<AppEnv>()
    // Reuses the X-Request-Id sent by the BFF: a single request can be followed across the logs of both services.
    .use(requestId())
    .use(process.env.NODE_ENV === 'test' ? (_, next) => next() : logger())
    .use(secureHeaders())
    .use(bodyLimit({ maxSize: 16 * 1024 }))
    .use('/api/*', timeout(5000))
    .get('/health', (c) => ApiResponse.ok(c, { status: 'ok', uptimeSeconds: Math.round(process.uptime()) }))
    .route('/api/v1/tenants', catalogRoutes(container.catalog))
    .route('/api/v1/tenants', cartRoutes(container.cart))
    .notFound(notFoundHandler)
    .onError(errorHandler);
}
