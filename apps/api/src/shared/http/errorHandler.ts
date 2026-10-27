import type { ErrorHandler, NotFoundHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { DomainError, type DomainErrorKind } from '../domain/errors.ts';
import { ApiResponse } from './apiResponse.ts';
import type { AppEnv } from './env.ts';

// The only place where domain vocabulary is translated into HTTP statuses.
const statusByKind: Record<DomainErrorKind, ContentfulStatusCode> = {
  validation: 400,
  not_found: 404,
  conflict: 409,
  business_rule: 422,
};

export const errorHandler: ErrorHandler<AppEnv> = (error, c) => {
  if (error instanceof DomainError) {
    return ApiResponse.error(c, statusByKind[error.kind], {
      code: error.code,
      message: error.message,
      ...(error.details && { details: error.details }),
    });
  }

  // Errors thrown by Hono itself: malformed JSON, body too large, timeout…
  if (error instanceof HTTPException) {
    return ApiResponse.error(c, error.status, {
      code: error.status === 408 || error.status === 504 ? 'TIMEOUT' : 'BAD_REQUEST',
      message: error.message || 'Requête refusée',
    });
  }

  // Unexpected: the trace goes to the logs with the correlation id, the client receives nothing sensitive.
  console.error(`[${c.get('requestId')}] Unhandled error on ${c.req.method} ${c.req.path}`, error);
  return ApiResponse.error(c, 500, { code: 'INTERNAL_ERROR', message: 'Erreur interne du serveur' });
};

export const notFoundHandler: NotFoundHandler<AppEnv> = (c) =>
  ApiResponse.error(c, 404, {
    code: 'ROUTE_NOT_FOUND',
    message: `Route ${c.req.method} ${c.req.path} introuvable`,
  });
