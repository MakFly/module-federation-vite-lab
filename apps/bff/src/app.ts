import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { createMiddleware } from 'hono/factory';
import { csrf } from 'hono/csrf';
import { logger } from 'hono/logger';
import { requestId } from 'hono/request-id';
import { secureHeaders } from 'hono/secure-headers';
import { CatalogApiClient, type FetchFn } from './clients/catalog-api.client.ts';
import type { Config } from './config.ts';
import { addCartItemHandler } from './handlers/add-cart-item.handler.ts';
import { catalogPageHandler } from './handlers/catalog-page.handler.ts';
import { clearCartHandler } from './handlers/clear-cart.handler.ts';
import { getCartHandler } from './handlers/get-cart.handler.ts';
import { healthHandler } from './handlers/health.handler.ts';
import { productPageHandler } from './handlers/product-page.handler.ts';
import { removeCartItemHandler } from './handlers/remove-cart-item.handler.ts';
import type { AppEnv } from './http/env.ts';
import { errorHandler, notFoundHandler } from './http/errorHandler.ts';
import { sessionMiddleware } from './session/session.middleware.ts';
import { SessionStore } from './session/session.store.ts';

export type BffDeps = {
  config: Config;
  sessions?: SessionStore;
  fetch?: FetchFn; // injectable for tests
};

/**
 * BFF: the only HTTP entry point for the frontends.
 * The frontends call it same-origin (Vite proxy in dev, reverse proxy in prod):
 * no CORS, and the session cookie is first-party.
 */
export function createApp({ config, sessions = new SessionStore(), fetch }: BffDeps) {
  const apiClient = createMiddleware<AppEnv>(async (c, next) => {
    c.set('api', new CatalogApiClient({
      baseUrl: config.apiUrl,
      timeoutMs: config.apiTimeoutMs,
      requestId: c.get('requestId'),
      fetch,
    }));
    await next();
  });

  return new Hono<AppEnv>()
    .use(requestId())
    .use(process.env.NODE_ENV === 'test' ? (_, next) => next() : logger())
    .use(secureHeaders())
    .use(bodyLimit({ maxSize: 8 * 1024 }))
    // Rejects form submissions coming from another site. Cross-site JSON requests
    // trigger a CORS preflight, which the BFF doesn't answer: the browser blocks them.
    .use('/bff/*', csrf({ origin: config.allowedOrigins }))
    .use('/bff/*', sessionMiddleware(sessions, { secure: config.secureCookies }))
    .use('/bff/*', apiClient)
    .get('/bff/health', ...healthHandler)
    .get('/bff/catalog', ...catalogPageHandler)
    .get('/bff/products/:productId', ...productPageHandler)
    .get('/bff/cart', ...getCartHandler)
    .delete('/bff/cart', ...clearCartHandler)
    .post('/bff/cart/items', ...addCartItemHandler)
    .delete('/bff/cart/items/:lineId', ...removeCartItemHandler)
    .notFound(notFoundHandler)
    .onError(errorHandler);
}
