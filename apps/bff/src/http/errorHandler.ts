import type { ErrorHandler, NotFoundHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ApiResponse } from './apiResponse.ts';
import type { AppEnv } from './env.ts';
import { BffError } from './errors.ts';

export const errorHandler: ErrorHandler<AppEnv> = (error, c) => {
  if (error instanceof BffError) {
    if (error.retryAfter) c.header('Retry-After', error.retryAfter);
    return ApiResponse.error(c, error.status, {
      code: error.code,
      message: error.message,
      ...(error.details && { details: error.details }),
    });
  }

  // csrf(), bodyLimit() and malformed JSON raise HTTPException.
  if (error instanceof HTTPException) {
    return ApiResponse.error(c, error.status, {
      code: error.status === 403 ? 'FORBIDDEN' : 'BAD_REQUEST',
      message: error.message || 'Requête refusée',
    });
  }

  console.error(`[${c.get('requestId')}] Unhandled error on ${c.req.method} ${c.req.path}`, error);
  return ApiResponse.error(c, 500, { code: 'INTERNAL_ERROR', message: 'Erreur interne du serveur' });
};

export const notFoundHandler: NotFoundHandler<AppEnv> = (c) =>
  ApiResponse.error(c, 404, { code: 'ROUTE_NOT_FOUND', message: `Route ${c.req.method} ${c.req.path} introuvable` });
